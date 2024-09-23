import type { TransactionsRouteResponse } from "@/lib/api";
import { Button, IconButton, Text, Tooltip } from "@radix-ui/themes";
import { IconExternalLink } from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";
import { TimeAgo } from "../Shared/TimeAgo";
import { TransactionActionAlex } from "./Action/Alex";
import { DefaultTransactionAction } from "./Action/DefaultTransactionAction";
import { TransactionActionStackingDAO } from "./Action/StackingDAO";
import { TransactionActionVelar } from "./Action/Velar";

interface TransactionRowProps {
  transaction: TransactionsRouteResponse[number];
}

export const TransactionRow = ({ transaction }: TransactionRowProps) => {
  const timestamp = new Date(transaction.block_time * 1000);

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
            href={`https://explorer.hiro.so/address/${transaction.sender_address}?chain=mainnet`}
            target="_blank"
            // Force the width to avoid content pushed on the right
            className="w-[108px]"
            rel="noreferrer"
          >
            {transaction.sender_address.slice(0, 5)}...
            {transaction.sender_address.slice(-5)}
          </a>
        </Button>
      </div>

      <Tooltip
        content={`Block ${
          transaction.block_height
        } - ${timestamp.toUTCString()}${transaction.tx_status === "success" ? "" : " (failed)"}`}
        suppressHydrationWarning
      >
        <Text
          className="order-3 md:order-4"
          size="2"
          color={transaction.tx_status === "success" ? "gray" : "red"}
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
          href={`https://explorer.hiro.so/txid/${transaction.tx_id}?chain=mainnet`}
          target="_blank"
          rel="noreferrer"
          aria-label="View in Explorer"
        >
          <IconExternalLink size={16} />
        </a>
      </IconButton>

      <Text className="order-5 truncate md:order-3 md:flex-1" as="div" size="2">
        {transaction.protocol === "stackingdao" ? (
          <TransactionActionStackingDAO transaction={transaction} />
        ) : transaction.protocol === "alex" ? (
          <TransactionActionAlex transaction={transaction} />
        ) : transaction.protocol === "velar" ? (
          <TransactionActionVelar transaction={transaction} />
        ) : (
          <DefaultTransactionAction transaction={transaction} />
        )}
      </Text>
    </div>
  );
};
