"use client";

import { useGetTransactions } from "@/hooks/api/useGetTransactions";
import { type Action, actionInfo, protocolsActions } from "@/lib/actions";
import type { Protocol } from "@/lib/protocols";
import { Button, Heading, Separator } from "@radix-ui/themes";
import { Fragment, useState } from "react";
import { TransactionRow } from "../Transaction/TransactionRow";

interface ProtocolTransactionsProps {
  protocol: Protocol;
}

export const ProtocolTransactions = ({
  protocol,
}: ProtocolTransactionsProps) => {
  const [filterAction, setFilterAction] = useState<Action | null>(null);
  const { data } = useGetTransactions({
    protocol,
    action: filterAction ?? undefined,
  });

  const protocolActions = protocolsActions[protocol];

  return (
    <div className="mt-10">
      <Heading as="h2" size="3" color="gray" highContrast>
        Transactions
      </Heading>
      <div className="mt-2 flex items-center gap-5">
        <Button
          size="1"
          color="gray"
          radius="full"
          variant={filterAction ? "ghost" : "soft"}
          highContrast={!filterAction}
          onClick={() => setFilterAction(null)}
        >
          All
        </Button>
        {protocolActions.map((action) => {
          const Icon = actionInfo[action].icon;
          return (
            <Button
              key={action}
              size="1"
              color="gray"
              radius="full"
              variant={filterAction === action ? "soft" : "ghost"}
              highContrast={filterAction === action}
              onClick={() => setFilterAction(action)}
            >
              {Icon ? <Icon size={14} /> : null}
              {actionInfo[action].label}
            </Button>
          );
        })}
      </div>
      <div className="mt-4 md:space-y-4">
        {data.map((transaction) => (
          <Fragment key={transaction.txId}>
            <TransactionRow key={transaction.txId} transaction={transaction} />
            <Separator className="md:hidden" my="4" size="4" />
          </Fragment>
        ))}
      </div>
    </div>
  );
};
