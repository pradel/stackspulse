"use client";

import type { ProtocolUsersRouteQuery } from "@/app/api/protocols/users/route";
import { BarListSkeleton } from "@/components/ui/BarList";
import { Card, TabNav, Text } from "@radix-ui/themes";
import { Suspense, useState } from "react";
import { TopProtocolsBarListQuery } from "./TopProtocolsBarListQuery";

export const TopProtocolsBarList = () => {
  const [dateFilter, setDateFilter] =
    useState<ProtocolUsersRouteQuery["date"]>("all");

  return (
    <Card size="2" className="mt-5">
      <div className="-mt-2 flex items-center justify-between">
        <Text as="div" size="2" weight="medium" color="gray" highContrast>
          Top Stacks protocols
        </Text>
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
        <TopProtocolsBarListQuery dateFilter={dateFilter} />
      </Suspense>
    </Card>
  );
};
