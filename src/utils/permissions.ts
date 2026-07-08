import { SessionUser } from "../context/AuthContext";
import { FixedDepositModel } from "../models/FixedDepositModel";

/** The one privileged account. Everyone else only sees their own deposits. */
export const ADMIN_USERNAME = "admin";

const normalize = (value?: string | null) => (value ?? "").trim().toLowerCase();

export const isAdmin = (user: SessionUser | null) =>
  normalize(user?.username) === ADMIN_USERNAME;

/**
 * Deposits are owned by `depositorName`, which is a display name rather than a
 * foreign key — records say "Rahul" while the login user is named
 * "Rahul Prakash". Match against the username, the full name, and the first
 * name so all three spellings resolve to the same person.
 */
export const depositorAliases = (user: SessionUser | null): Set<string> => {
  const fullName = normalize(user?.name);
  const aliases = [normalize(user?.username), fullName, fullName.split(/\s+/)[0]];
  return new Set(aliases.filter(Boolean));
};

export const ownsDeposit = (
  deposit: FixedDepositModel,
  user: SessionUser | null
) => depositorAliases(user).has(normalize(deposit.depositorName));

/** Admin sees everything; everyone else sees only deposits in their name. */
export const filterDepositsForUser = (
  deposits: FixedDepositModel[],
  user: SessionUser | null
) => (isAdmin(user) ? deposits : deposits.filter((d) => ownsDeposit(d, user)));

/**
 * The exact `depositorName` string this user's records already use, so a newly
 * added deposit is scoped to them and does not vanish from their own list.
 * Falls back to their display name when they have no deposits yet.
 */
export const depositorNameForUser = (
  user: SessionUser | null,
  deposits: FixedDepositModel[]
) => {
  const existing = deposits.find((deposit) => ownsDeposit(deposit, user));
  return existing?.depositorName ?? user?.name ?? user?.username ?? "";
};
