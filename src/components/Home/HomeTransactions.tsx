"use client";

import { useGetTransactions } from "@/hooks/api/useGetTransactions";
import { Heading, Separator } from "@radix-ui/themes";
import { Fragment } from "react";
import { TransactionRow } from "../Transaction/TransactionRow";

export const HomeTransactions = () => {
  const { data: transactions } = useGetTransactions();

  return (
    <div className="mt-10">
      <Heading as="h2" size="3" color="gray" highContrast>
        Transactions
      </Heading>
      <div className="mt-4 md:space-y-4">
        {transactions.map((transaction) => (
          <Fragment key={transaction.txId}>
            <TransactionRow key={transaction.txId} transaction={transaction} />
            <Separator className="md:hidden" my="4" size="4" />
          </Fragment>
        ))}
      </div>
    </div>
  );
};
