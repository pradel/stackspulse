import { db } from "@/db/db";
import { transactionTable } from "@/db/schema";
import { protocolsInfo } from "@/lib/protocols";
import { countDistinct } from "drizzle-orm";
import { TopProtocolsBarListClient } from "./TopProtocolsBarListClient";

const getData = async () => {
  const query = db
    .select({
      protocol: transactionTable.protocol,
      uniqueSenders: countDistinct(transactionTable.sender),
    })
    .from(transactionTable)
    .groupBy(transactionTable.protocol);

  const stats = await query;
  return stats;
};

export const TopProtocolsBarList = async () => {
  const stats = await getData();

  const formattedData = stats
    .map((d) => ({
      name: protocolsInfo[d.protocol].name,
      value: d.uniqueSenders,
      href: `/protocols/${d.protocol}`,
    }))
    .sort((a, b) => b.value - a.value);

  return <TopProtocolsBarListClient data={formattedData} />;
};
