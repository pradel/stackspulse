"use client";

import { BarListSkeleton } from "@/components/ui/BarList";
import type { ProtocolUsersRouteQuery } from "@/lib/api";
import { Card, TabNav, Text } from "@radix-ui/themes";
import { Suspense, useState } from "react";
import { TopProtocolsBarListQuery } from "./TopProtocolsBarListQuery";

export const TopProtocolsBarList = () => {
  const [dateFilter, setDateFilter] =
    useState<ProtocolUsersRouteQuery["date"]>("all");
  const [modeFilter, setModeFilter] =
    useState<ProtocolUsersRouteQuery["mode"]>("nested");

  return (
    <Card size="2" className="mt-5">
      <div className="-mt-2 flex items-center justify-between">
        <div>
          <Text as="div" size="2" weight="medium" color="gray" highContrast>
            Top Stacks protocols
          </Text>
          <Text as="div" size="1" color="gray" className="mt-1">
            {modeFilter === "nested"
              ? "Unique addresses that have interacted with the protocol contracts"
              : "Unique addresses that have interacted with the protocol directly"}
          </Text>
        </div>

        <div className="flex flex-col justify-end items-end gap-1">
          <TabNav.Root size="2">
            <TabNav.Link asChild active={dateFilter === "7d"}>
              <button type="button" onClick={() => setDateFilter("7d")}>
                7d
              </button>
            </TabNav.Link>
            <TabNav.Link asChild active={dateFilter === "30d"}>
              <button type="button" onClick={() => setDateFilter("30d")}>
                30d
              </button>
            </TabNav.Link>
            <TabNav.Link asChild active={dateFilter === "all"}>
              <button type="button" onClick={() => setDateFilter("all")}>
                all
              </button>
            </TabNav.Link>
          </TabNav.Root>
          <TabNav.Root size="1">
            <TabNav.Link asChild active={modeFilter === "nested"}>
              <button type="button" onClick={() => setModeFilter("nested")}>
                nested
              </button>
            </TabNav.Link>
            <TabNav.Link asChild active={modeFilter === "direct"}>
              <button type="button" onClick={() => setModeFilter("direct")}>
                direct
              </button>
            </TabNav.Link>
          </TabNav.Root>
        </div>
      </div>

      <div className="mt-4 flex justify-between">
        <Text as="p" size="1" color="gray" weight="medium">
          protocol
        </Text>
        <Text as="p" size="1" color="gray" weight="medium">
          users
        </Text>
      </div>

      <Suspense
        fallback={
          <BarListSkeleton
            className="mt-2"
            data={[
              {
                name: "alex",
                value: 3415,
              },
              {
                name: "velar",
                value: 2169,
              },
              {
                name: "stackingdao",
                value: 1432,
              },
              {
                name: "bitflow",
                value: 1358,
              },
              {
                name: "stackswap",
                value: 352,
              },
              {
                name: "arkadiko",
                value: 283,
              },
            ]}
          />
        }
      >
        <TopProtocolsBarListQuery
          dateFilter={dateFilter}
          modeFilter={modeFilter}
        />
      </Suspense>
    </Card>
  );
};
