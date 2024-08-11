"use client";

import { useGetTransactions } from "@/hooks/api/useGetTransactions";
import type { Protocol } from "@/lib/protocols";
import { Heading, Separator } from "@radix-ui/themes";
import { Fragment } from "react";
import { TransactionRow } from "../Transaction/TransactionRow";

interface ProtocolTransactionsProps {
  protocol: Protocol;
}

export const ProtocolTransactions = ({
  protocol,
}: ProtocolTransactionsProps) => {
  const { data: transactions } = useGetTransactions({
    protocol,
  });

  return (
    <div className="mt-10">
      <Heading as="h2" size="3" color="gray" highContrast>
        Transactions
      </Heading>
      <div className="mt-4 md:space-y-4">
        {transactions.map((transaction) => (
          <Fragment key={transaction.tx_id}>
            <TransactionRow transaction={transaction} />
            <Separator className="md:hidden" my="4" size="4" />
          </Fragment>
        ))}
      </div>
    </div>
  );
};
