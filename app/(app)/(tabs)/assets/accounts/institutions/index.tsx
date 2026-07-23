import LedgerClientListScreen from "../../../../../../src/screens/LedgerClientListScreen";

/**
 * The same contacts directory the Ledger shows, reached from Accounts. One list,
 * two doors: banks, financiers and the people you lend to are all just the other
 * party to a record, and keeping two of them was the confusing part. The route
 * keeps its `institutions` path so existing links and the header button still
 * resolve.
 */
export default function AccountContactsRoute() {
  return <LedgerClientListScreen basePath="/assets/accounts/institutions" />;
}
