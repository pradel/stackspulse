import type { SelectTransactionActionStackingDAODeposit } from "@/db/transactions";
import { displayPrice } from "@/lib/currencies";
import { Text } from "@radix-ui/themes";

interface TransactionActionStackingDAODepositProps {
  transaction: SelectTransactionActionStackingDAODeposit;
}

export const TransactionActionStackingDAODeposit = ({
  transaction,
}: TransactionActionStackingDAODepositProps) => {
  console.log(transaction);
  return (
    <>
      <Text color="gray">Deposit</Text>{" "}
      {displayPrice(transaction.data.outAmount, transaction.outToken.decimals)}{" "}
      {transaction.inToken.symbol} <Text color="gray">for</Text>{" "}
      {displayPrice(transaction.data.inAmount, transaction.inToken.decimals)}{" "}
      {transaction.outToken.symbol}
    </>
  );
};
