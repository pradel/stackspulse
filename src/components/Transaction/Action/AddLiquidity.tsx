import type { SelectTransactionActionAddLiquidityWithTokens } from "@/db/transactions";
import { Text } from "@radix-ui/themes";

interface TransactionActionAddLiquidityProps {
  transaction: SelectTransactionActionAddLiquidityWithTokens;
}

export const TransactionActionAddLiquidity = ({
  transaction,
}: TransactionActionAddLiquidityProps) => {
  return (
    <>
      <Text color="gray">Add liquidity to</Text> {transaction.tokenX.symbol}-
      {transaction.tokenY.symbol}
    </>
  );
};
