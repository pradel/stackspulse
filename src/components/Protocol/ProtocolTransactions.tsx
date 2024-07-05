"use client";

import { useGetTransactions } from "@/hooks/api/useGetTransactions";
import type { Protocol } from "@/lib/protocols";
import { Separator } from "@radix-ui/themes";
import { Fragment } from "react";
import { TransactionRow } from "../Transaction/TransactionRow";

interface ProtocolTransactionsProps {
  protocol: Protocol;
}

export const ProtocolTransactions = ({
  protocol,
}: ProtocolTransactionsProps) => {
  const { data } = useGetTransactions({
    protocol,
  });

  return data.map((transaction) => (
    <Fragment key={transaction.txId}>
      <TransactionRow key={transaction.txId} transaction={transaction} />
      <Separator className="md:hidden" my="4" size="4" />
    </Fragment>
  ));
};
