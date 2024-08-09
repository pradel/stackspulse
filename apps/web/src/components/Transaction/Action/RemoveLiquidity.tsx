import type { SelectTransactionActionRemoveLiquidityWithTokens } from "@/db/transactions";
import { Text } from "@radix-ui/themes";

interface TransactionActionRemoveLiquidityProps {
  transaction: SelectTransactionActionRemoveLiquidityWithTokens;
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
