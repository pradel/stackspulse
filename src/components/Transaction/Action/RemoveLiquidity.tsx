import type { SelectTransactionActionRemoveLiquidity } from "@/db/transactions";
import { Text } from "@radix-ui/themes";

interface TransactionActionRemoveLiquidityProps {
  transaction: SelectTransactionActionRemoveLiquidity;
}

export const TransactionActionRemoveLiquidity = ({
  transaction,
}: TransactionActionRemoveLiquidityProps) => {
  return (
    <>
      <Text color="gray">Remove liquidity from</Text>{" "}
      {transaction.tokenX.symbol}-{transaction.tokenY.symbol}
    </>
  );
};
