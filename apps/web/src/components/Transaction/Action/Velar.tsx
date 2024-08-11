import type { TransactionsRouteResponse } from "@/lib/api";
import type { TransactionEventSmartContractLog } from "@stacks/stacks-blockchain-api-types";
import { cvToJSON, hexToCV } from "@stacks/transactions";
import { DefaultTransactionAction } from "./DefaultTransactionAction";
import { DefaultTransactionSwap } from "./DefaultTransactionSwap";

interface TransactionActionVelarProps {
  transaction: TransactionsRouteResponse[number];
}

export const TransactionActionVelar = ({
  transaction,
}: TransactionActionVelarProps) => {
  if (
    transaction.contract_call.function_name ===
      "swap-exact-tokens-for-tokens" &&
    transaction.tx_status === "success"
  ) {
    const eventLog = transaction.events.find(
      (event) =>
        event.event_type === "smart_contract_log" &&
        event.contract_log.contract_id ===
          "SP1Y5YSTAHZ88XYK1VPDH24GY0HPX5J4JECTMY4A1.univ2-core",
    ) as TransactionEventSmartContractLog;
    if (eventLog) {
      const data = cvToJSON(hexToCV(eventLog.contract_log.value.hex)).value;

      return (
        <DefaultTransactionSwap
          tokenX={data["token-in"].value}
          tokenXAmount={data["amt-in"].value}
          tokenY={data["token-out"].value}
          tokenYAmount={data["amt-out"].value}
        />
      );
    }
  }

  return <DefaultTransactionAction transaction={transaction} />;
};
