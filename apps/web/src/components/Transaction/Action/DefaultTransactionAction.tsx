import type { TransactionsRouteResponse } from "@/lib/api";
import { Text } from "@radix-ui/themes";

interface DefaultTransactionActionProps {
  transaction: TransactionsRouteResponse[number];
}

export const DefaultTransactionAction = ({
  transaction,
}: DefaultTransactionActionProps) => {
  return (
    <>
      <Text color="gray">Call</Text> {transaction.contract_call.function_name}
    </>
  );
};
