import type { TransactionsRouteResponse } from "@/lib/api";
import { cvToJSON, hexToCV } from "@stacks/transactions";
import { DefaultTransactionAction } from "./DefaultTransactionAction";
import { DefaultTransactionSwap } from "./DefaultTransactionSwap";

interface TransactionActionAlexProps {
  transaction: TransactionsRouteResponse[number];
}

export const TransactionActionAlex = ({
  transaction,
}: TransactionActionAlexProps) => {
  if (
    transaction.contract_call.function_name === "swap-helper" &&
    transaction.tx_status === "success"
  ) {
    const eventLog = transaction.events.find(
      (event) => event.event_type === "smart_contract_log",
    );
    if (
      eventLog &&
      eventLog.contract_log.contract_id ===
        "SP102V8P0F7JX67ARQ77WEA3D3CFB5XW39REDT0AM.amm-pool-v2-01"
    ) {
      const data = cvToJSON(hexToCV(eventLog.contract_log.value.hex)).value;

      return (
        <DefaultTransactionSwap
          tokenX={data["token-x"].value}
          tokenXAmount={data.dx.value}
          tokenY={data["token-y"].value}
          tokenYAmount={data.dy.value}
        />
      );
    }
  }

  return <DefaultTransactionAction transaction={transaction} />;
};
