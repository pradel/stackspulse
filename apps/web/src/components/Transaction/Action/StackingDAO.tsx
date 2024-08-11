import type { TransactionsRouteResponse } from "@/lib/api";
import { displayPrice } from "@/lib/currencies";
import { Text } from "@radix-ui/themes";
import { DefaultTransactionAction } from "./DefaultTransactionAction";

interface TransactionActionStackingDAOProps {
  transaction: TransactionsRouteResponse[number];
}

export const TransactionActionStackingDAO = ({
  transaction,
}: TransactionActionStackingDAOProps) => {
  if (
    transaction.contract_call.function_name === "deposit" &&
    transaction.tx_status === "success"
  ) {
    const stxAmount =
      transaction.events.find((event) => event.event_type === "stx_asset")
        ?.asset.amount || "0";
    return (
      <>
        <Text color="gray">Deposit</Text> {displayPrice(stxAmount, 6)} STX
      </>
    );
  }

  if (
    transaction.contract_call.function_name === "withdraw" &&
    transaction.tx_status === "success"
  ) {
    const stxAmount =
      transaction.events.find((event) => event.event_type === "stx_asset")
        ?.asset.amount || "0";
    return (
      <>
        <Text color="gray">Withdraw</Text> {displayPrice(stxAmount, 6)} STX
      </>
    );
  }

  return <DefaultTransactionAction transaction={transaction} />;
};
