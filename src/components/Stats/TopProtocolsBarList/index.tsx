"use client";

import type { ProtocolUsersRouteQuery } from "@/app/api/protocols/users/route";
import { Card, TabNav, Text } from "@radix-ui/themes";
import { useState } from "react";
import { TopProtocolsBarListClient } from "./TopProtocolsBarListClient";

export const TopProtocolsBarList = () => {
  const [dateFilter, setDateFilter] =
    useState<ProtocolUsersRouteQuery["date"]>("all");

  return (
    <Card size="2" className="mt-5">
      <div className="flex justify-between items-center -mt-2">
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

      <TopProtocolsBarListClient dateFilter={dateFilter} />
    </Card>
  );
};
