import { SelectTransactionActionSwap } from "@/db/transactions";
import { displayPrice } from "@/lib/currencies";
import { Text } from "@radix-ui/themes";

interface TransactionActionSwapProps {
  transaction: SelectTransactionActionSwap;
}

export const TransactionActionSwap = ({
  transaction,
}: TransactionActionSwapProps) => {
  return (
    <>
      <Text color="gray">Swap</Text>{" "}
      {displayPrice(transaction.data.inAmount, transaction.inToken.decimals)}{" "}
      {transaction.inToken.symbol} <Text color="gray">for</Text>{" "}
      {displayPrice(transaction.data.outAmount, transaction.outToken.decimals)}{" "}
      {transaction.outToken.symbol}
    </>
  );
};
