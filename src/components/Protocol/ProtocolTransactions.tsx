"use client";

import { useGetTransactions } from "@/hooks/api/useGetTransactions";
import type { Action } from "@/lib/actions";
import type { Protocol } from "@/lib/protocols";
import { Separator } from "@radix-ui/themes";
import { Fragment } from "react";
import { TransactionRow } from "../Transaction/TransactionRow";

interface ProtocolTransactionsProps {
  protocol: Protocol;
  action?: Action;
}

export const ProtocolTransactions = ({
  protocol,
  action,
}: ProtocolTransactionsProps) => {
  const { data } = useGetTransactions({
    protocol,
    action,
  });

  return data.map((transaction) => (
    <Fragment key={transaction.txId}>
      <TransactionRow key={transaction.txId} transaction={transaction} />
      <Separator className="md:hidden" my="4" size="4" />
    </Fragment>
  ));
};
