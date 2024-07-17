import type {
  SelectTransactionActionStackingDAODepositWithTokens,
  SelectTransactionActionStackingDAOWithdrawWithTokens,
} from "@/db/transactions";
import { displayPrice } from "@/lib/currencies";
import { Text } from "@radix-ui/themes";

interface TransactionActionStackingDAOProps {
  transaction:
    | SelectTransactionActionStackingDAODepositWithTokens
    | SelectTransactionActionStackingDAOWithdrawWithTokens;
}

export const TransactionActionStackingDAO = ({
  transaction,
}: TransactionActionStackingDAOProps) => {
  return (
    <>
      <Text color="gray">
        {transaction.action === "stackingdao-deposit" ? "Deposit" : "Withdraw"}
      </Text>{" "}
      {displayPrice(transaction.data.outAmount, transaction.outToken.decimals)}{" "}
      {transaction.outToken.symbol} <Text color="gray">for</Text>{" "}
      {displayPrice(transaction.data.inAmount, transaction.inToken.decimals)}{" "}
      {transaction.inToken.symbol}
    </>
  );
};
