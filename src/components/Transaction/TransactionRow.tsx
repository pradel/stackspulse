import type { SelectTransactionAction } from "@/db/transactions";
import { Button, IconButton, Text, Tooltip } from "@radix-ui/themes";
import { IconExternalLink } from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";
import { TimeAgo } from "../Shared/TimeAgo";
import { TransactionActionAddLiquidity } from "./Action/AddLiquidity";
import { TransactionActionRemoveLiquidity } from "./Action/RemoveLiquidity";
import { TransactionActionStackingDAO } from "./Action/StackingDAO";
import { TransactionActionSwap } from "./Action/Swap";

interface TransactionRowProps {
  transaction: SelectTransactionAction;
}

export const TransactionRow = ({ transaction }: TransactionRowProps) => {
  const timestamp = new Date(transaction.timestamp);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <IconButton
        className="order-1"
        size="1"
        variant="ghost"
        color="gray"
        radius="full"
        asChild
      >
        <Link href={`/protocols/${transaction.protocol}`}>
          <Image
            className="rounded-full"
            src={`/protocols/${transaction.protocol}.png`}
            alt={`${transaction.protocol} logo`}
            width={20}
            height={20}
          />
        </Link>
      </IconButton>

      <div className="order-2 flex-1 md:flex-none">
        <Button variant="soft" size="1" color="gray" asChild>
          <a
            href={`https://explorer.hiro.so/address/${transaction.sender}`}
            target="_blank"
            // Force the width to avoid content pushed on the right
            className="w-[108px]"
            rel="noreferrer"
          >
            {transaction.sender.slice(0, 5)}...
            {transaction.sender.slice(-5)}
          </a>
        </Button>
      </div>

      <Tooltip
        content={`Block ${
          transaction.blockHeight
        } - ${timestamp.toUTCString()}`}
        suppressHydrationWarning
      >
        <Text
          className="order-3 md:order-4"
          size="2"
          color="gray"
          suppressHydrationWarning
        >
          <TimeAgo date={timestamp} /> ago
        </Text>
      </Tooltip>

      <IconButton
        className="order-4 md:order-5"
        size="1"
        color="gray"
        variant="ghost"
        asChild
      >
        <a
          href={`https://explorer.hiro.so/txid/${transaction.txId}`}
          target="_blank"
          rel="noreferrer"
          aria-label="View in Explorer"
        >
          <IconExternalLink size={16} />
        </a>
      </IconButton>

      <Text className="order-5 md:order-3 md:flex-1" as="div" size="2">
        {transaction.action === "swap" ? (
          <TransactionActionSwap transaction={transaction} />
        ) : null}
        {transaction.action === "add-liquidity" ? (
          <TransactionActionAddLiquidity transaction={transaction} />
        ) : null}
        {transaction.action === "remove-liquidity" ? (
          <TransactionActionRemoveLiquidity transaction={transaction} />
        ) : null}
        {transaction.action === "stackingdao-deposit" ||
        transaction.action === "stackingdao-withdraw" ? (
          <TransactionActionStackingDAO transaction={transaction} />
        ) : null}
      </Text>
    </div>
  );
};
