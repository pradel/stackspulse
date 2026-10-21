"use client";

import { TimeAgo } from "@/components/Shared/TimeAgo";
import type { StackingDAOActivityItem } from "@/lib/api";
import { displayPrice } from "@/lib/currencies";
import { stackingDAOTokens } from "@/lib/stackingdao";
import { Button, IconButton, Separator, Text, Tooltip } from "@radix-ui/themes";
import { IconExternalLink } from "@tabler/icons-react";
import { Fragment } from "react";

const ActivityDescription = ({ item }: { item: StackingDAOActivityItem }) => {
  if (item.kind === "swap") {
    const ststx = `${displayPrice(item.ststxAmount, 6)} stSTX`;
    const ststxbtc = `${displayPrice(item.ststxbtcAmount, 6)} stSTXbtc`;
    return item.action === "swap-ststx-for-ststxbtc" ? (
      <>
        <Text color="gray">Swap</Text> {ststx} <Text color="gray">for</Text> {ststxbtc}
      </>
    ) : (
      <>
        <Text color="gray">Swap</Text> {ststxbtc} <Text color="gray">for</Text> {ststx}
      </>
    );
  }

  const { name, underlying, decimals } = stackingDAOTokens[item.token];
  const token = `${displayPrice(item.tokenAmount, decimals)} ${name}`;
  const asset =
    item.underlyingAmount === null
      ? null
      : `${displayPrice(item.underlyingAmount, decimals)} ${underlying}`;

  if (item.kind === "deposit") {
    return asset === null ? (
      <>
        <Text color="gray">Deposit for</Text> {token}
      </>
    ) : (
      <>
        <Text color="gray">Deposit</Text> {asset} <Text color="gray">for</Text> {token}
      </>
    );
  }

  const label = {
    "init-withdraw": "Request withdrawal of",
    "cancel-withdraw": "Cancel withdrawal of",
    withdraw: "Withdraw",
    "withdraw-idle": "Instant withdraw",
  }[item.action];
  const paysOut = item.action === "withdraw" || item.action === "withdraw-idle";

  return (
    <>
      <Text color="gray">{label}</Text> {token}
      {paysOut && asset !== null ? (
        <>
          {" "}
          <Text color="gray">for</Text> {asset}
        </>
      ) : null}
    </>
  );
};

export const ActivityList = ({ items }: { items: StackingDAOActivityItem[] }) => {
  return (
    <div className="mt-4 md:space-y-4">
      {items.map((item) => {
        const timestamp = new Date(item.blockTime * 1000);
        return (
          <Fragment key={`${item.txId}:${item.eventIndex}`}>
            <div className="flex flex-wrap items-center gap-3">
              <div className="order-1 flex-1 md:flex-none">
                <Button variant="soft" size="1" color="gray" asChild>
                  <a
                    href={`https://explorer.hiro.so/address/${item.address}?chain=mainnet`}
                    target="_blank"
                    // Force the width to avoid content pushed on the right
                    className="w-[108px]"
                    rel="noreferrer"
                  >
                    {item.address.slice(0, 5)}...{item.address.slice(-5)}
                  </a>
                </Button>
              </div>

              <Tooltip
                content={`Block ${item.blockHeight} - ${timestamp.toUTCString()}`}
                suppressHydrationWarning
              >
                <Text className="order-2 md:order-3" size="2" color="gray" suppressHydrationWarning>
                  <TimeAgo date={timestamp} /> ago
                </Text>
              </Tooltip>

              <IconButton
                className="order-3 md:order-4"
                size="1"
                color="gray"
                variant="ghost"
                asChild
              >
                <a
                  href={`https://explorer.hiro.so/txid/${item.txId}?chain=mainnet`}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="View in Explorer"
                >
                  <IconExternalLink size={16} />
                </a>
              </IconButton>

              <Text className="order-4 truncate md:order-2 md:flex-1" as="div" size="2">
                <ActivityDescription item={item} />
              </Text>
            </div>
            <Separator className="md:hidden" my="4" size="4" />
          </Fragment>
        );
      })}
    </div>
  );
};
