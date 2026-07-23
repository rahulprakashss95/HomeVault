-- ---------------------------------------------------------------- --
-- 2026-07-23 — government_documents -> government_records
--               bank_documents       -> bank_records
--
-- The module these two back was renamed "Documents" -> "Records": it holds
-- structured details (ID numbers, account numbers, IFSC codes) rather than
-- files. `schema.sql` already names the new tables, but it only ever creates
-- `if not exists` — on a database that already has the old ones it would create
-- two *empty* new tables beside the populated old ones and the app would come up
-- blank. Run this first; then re-running schema.sql is a no-op as usual.
--
-- What this does NOT touch:
--   - the `documents` Storage bucket. There the word is right (it really is
--     files) and it is shared with ornaments/properties/vehicles. Object paths
--     are `{familyId}/{id}.{ext}` — no table name — so nothing in Storage
--     depends on the names being changed here.
--   - the `documents` module key or the `governmentDocuments`/`bankDocuments`
--     feature keys. Those are persisted in every member's `moduleAccess`;
--     renaming them would revoke access. Only their labels moved.
--
-- Safe to re-run: it does nothing once the tables already carry the new names.
-- ---------------------------------------------------------------- --

do $$
declare
  pair record;
  pol  record;
begin
  for pair in
    select *
      from (values
        ('government_documents', 'government_records'),
        ('bank_documents',       'bank_records')
      ) as t (old_name, new_name)
  loop
    -- Already renamed (or never existed) — nothing to do.
    continue when to_regclass('public.' || pair.old_name) is null;

    -- Both present means a schema.sql run created the new table empty before
    -- this migration ran. Merging them is a judgement call, not a script's.
    if to_regclass('public.' || pair.new_name) is not null then
      raise exception
        'Both % and % exist. Move the rows across and drop the empty one by hand.',
        pair.old_name, pair.new_name;
    end if;

    execute format('alter table %I rename to %I;', pair.old_name, pair.new_name);

    -- The index keeps its old name through a table rename; schema.sql would
    -- then create a second one under the new name.
    execute format(
      'alter index if exists %I rename to %I;',
      pair.old_name || '_family_id_idx', pair.new_name || '_family_id_idx'
    );

    -- Policies follow the table but keep their old names too, and schema.sql
    -- drops policies by the *new* name — so without this the old ones would
    -- survive alongside the recreated ones as duplicate permissive policies.
    for pol in
      select policyname
        from pg_policies
       where schemaname = 'public'
         and tablename = pair.new_name
         and policyname like pair.old_name || '%'
    loop
      execute format(
        'alter policy %I on %I rename to %I;',
        pol.policyname,
        pair.new_name,
        pair.new_name || right(pol.policyname, -length(pair.old_name))
      );
    end loop;
  end loop;
end $$;
