import moment from "moment";
import { LedgerClientModel } from "../models/LedgerModel";
import {
  AccountModel,
  ACCOUNT_SECTIONS,
  accountSection,
  isLiability,
  isMaturingAccount,
} from "../models/AccountModel";

export const DATE_FORMAT = "DD-MMM-YYYY";

/**
 * `maturityDate` is either "" (none set) or DD-MMM-YYYY: it comes from a real
 * `date` column via `dateToApp` in `database/query.ts`, which can't produce
 * anything else. The old "0"/0 shapes were Firestore-era and are gone.
 */
export const parseMaturity = (maturityDate: string) => {
  if (!maturityDate) {
    return null;
  }
  const parsed = moment(maturityDate, DATE_FORMAT, true);
  return parsed.isValid() ? parsed : null;
};

/**
 * The other party to an account, for display: the directory name for its
 * `contactId` — a bank for a balance, a person for a loan, one list either way —
 * else the free-text `institution` carried by older rows, else a dash.
 *
 * Resolving the name here rather than storing it means renaming a contact
 * updates every account at once, and a deleted one reads as its institution or
 * "—" rather than a stale name.
 */
export const accountInstitution = (
  account: AccountModel,
  contacts: LedgerClientModel[]
): string => {
  const contact = (contacts ?? []).find((c) => c.id === account.contactId);
  return contact?.name || account.institution || "—";
};

/**
 * Soonest maturity first; items with no maturity date sort to the end.
 * Partitioning first avoids comparing against unparseable dates. Generic so it
 * serves both the account list and any maturity-ordered view.
 */
export const sortByMaturity = <T extends { maturityDate: string }>(
  items: T[]
): T[] => {
  const dated: T[] = [];
  const undated: T[] = [];

  for (const item of items) {
    (parseMaturity(item.maturityDate) ? dated : undated).push(item);
  }

  dated.sort(
    (a, b) =>
      parseMaturity(a.maturityDate)!.valueOf() -
      parseMaturity(b.maturityDate)!.valueOf()
  );

  return [...dated, ...undated];
};

/* ------------------------------------------------------------------ *
 * Recurring Deposits
 *
 * An RD is a fixed monthly instalment paid over a set number of months. We
 * track it as a schedule of instalments the user marks paid one by one; the
 * balance net worth counts is the total paid so far.
 * ------------------------------------------------------------------ */

export type RdInstalment = {
  index: number;
  /** Due date (start + index months), DATE_FORMAT, or "" if no start set. */
  due: string;
  amount: number;
  paid: boolean;
};

/** The per-month instalment amount (`principal` doubles as this for RDs). */
export const rdMonthly = (account: AccountModel): number =>
  Number(account.principal) || 0;

/** Tenure in months, clamped to a non-negative integer. */
export const rdMonthCount = (account: AccountModel): number =>
  Math.max(0, Math.floor(Number(account.months) || 0));

/** How many instalments are marked paid. */
export const rdPaidCount = (account: AccountModel): number =>
  (account.payments ?? []).filter(Boolean).length;

/** Total paid so far — the figure net worth counts for an RD. */
export const rdPaidTotal = (account: AccountModel): number =>
  rdPaidCount(account) * rdMonthly(account);

/** The full instalment schedule, one row per month. */
export const rdSchedule = (account: AccountModel): RdInstalment[] => {
  const count = rdMonthCount(account);
  const amount = rdMonthly(account);
  const start = moment(account.startDate, DATE_FORMAT, true);
  const paid = account.payments ?? [];
  return Array.from({ length: count }, (_, index) => ({
    index,
    due: start.isValid()
      ? start.clone().add(index, "months").format(DATE_FORMAT)
      : "",
    amount,
    paid: !!paid[index],
  }));
};

/**
 * A fresh `payments` array with instalment `index` set to `paid`, sized to the
 * current tenure (padding/truncating any stale array). Callers persist this
 * alongside a recomputed balance.
 */
export const rdWithPayment = (
  account: AccountModel,
  index: number,
  paid: boolean
): boolean[] => {
  const count = rdMonthCount(account);
  const existing = account.payments ?? [];
  const next = Array.from({ length: count }, (_, i) => !!existing[i]);
  if (index >= 0 && index < count) {
    next[index] = paid;
  }
  return next;
};

export type LabelledTotal = { label: string; value: number };

export type AccountTotals = {
  /**
   * `assets - liabilities` — the net figure net worth counts. Named `balance`
   * because that is what it was before borrowing existed and every consumer
   * wants the net number; for the gross figure use `assets`.
   */
  balance: number;
  /** Everything held or owed *to* you: balances, deposits, cash, money lent. */
  assets: number;
  /** Money owed by you, as a positive magnitude. */
  liabilities: number;
  /** Interest across the deposit-like accounts (Fixed/Recurring). */
  interest: number;
  accountCount: number;
  /** Largest single asset balance; liabilities are not candidates. */
  largest: number;
  /**
   * Balance grouped by section for the overview. Values stay positive in every
   * section — a "Borrowed ₹50,000" row means you owe fifty thousand, and the
   * section name is what says which way it points.
   */
  balanceBySection: LabelledTotal[];
};

/** Roll a list of accounts up into the totals the Assets overview shows. */
export const buildAccountTotals = (accounts: AccountModel[]): AccountTotals => {
  const bySection: Record<string, number> = {};
  let assets = 0;
  let liabilities = 0;
  let interest = 0;
  let largest = 0;

  for (const account of accounts) {
    const value = Number(account.balance) || 0;
    // Balances are stored positive whichever way they point; the type decides
    // which side of the sheet the number lands on.
    if (isLiability(account.accountType)) {
      liabilities += value;
    } else {
      assets += value;
      largest = Math.max(largest, value);
    }
    if (isMaturingAccount(account.accountType)) {
      interest += Number(account.interest) || 0;
    }
    const section = accountSection(account.accountType);
    bySection[section] = (bySection[section] ?? 0) + value;
  }

  return {
    balance: assets - liabilities,
    assets,
    liabilities,
    interest,
    accountCount: accounts.length,
    largest,
    // Fixed section order, empty sections dropped.
    balanceBySection: ACCOUNT_SECTIONS.filter(
      (section) => bySection[section] !== undefined
    ).map((section) => ({ label: section, value: bySection[section] })),
  };
};
