import { getWidthsFromValues } from "@/components/ui/BarList";
import { db } from "@/db/db";
import { transactionTable } from "@/db/schema";
import { env } from "@/env";
import { cn } from "@/lib/cn";
import { protocolsInfo } from "@/lib/protocols";
import { countDistinct, gt } from "drizzle-orm";
import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";
import { z } from "zod";

export const dynamic = "force-dynamic";

const size = {
  width: 1012,
  height: 506,
};

const schema = z.object({
  title: z.string().min(1).max(50),
});

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  console.log(url.searchParams);
  const params = schema.safeParse({
    title: url.searchParams.get("title"),
  });

  if (!params.success) {
    return Response.json(
      { success: false, message: "Invalid parameters" },
      { status: 400 },
    );
  }
  // Last 7 days
  const dateBegin = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const query = db
    .select({
      protocol: transactionTable.protocol,
      uniqueSenders: countDistinct(transactionTable.sender),
    })
    .from(transactionTable)
    .where(gt(transactionTable.timestamp, dateBegin))
    .groupBy(transactionTable.protocol);
  const stats = await query;

  const data = stats.map((stat) => ({
    name: protocolsInfo[stat.protocol].name,
    value: stat.uniqueSenders,
  }));

  const widths = getWidthsFromValues(data.map((item) => item.value));
  const orange = "#f76b15";
  const rowHeight = "h-[80px]";
  const rowGap = "24px";

  return new ImageResponse(
    <div
      style={{
        fontSize: 40,
        width: "100%",
        height: "100%",
        display: "flex",
        padding: "60px",
        alignItems: "flex-start",
        justifyContent: "flex-start",
        background: `url("${env.NEXT_PUBLIC_BASE_URL}/api/weekly-bg.png")`,
        backgroundSize: "cover",
        backgroundPosition: "center center",
        backgroundRepeat: "no-repeat",
        color: "white",
      }}
    >
      <div tw="flex flex-col justify-between w-full h-full">
        <div tw="flex justify-end -mt-6">{params.data.title}</div>

        <div tw="flex justify-between" style={{ gap: "40px" }}>
          <div tw="flex flex-1 flex-col" style={{ gap: rowGap }}>
            {data.map((item, idx) => (
              <div
                key={item.name}
                tw={cn("flex items-center rounded-md pl-6", rowHeight)}
                style={{
                  width: `${widths[idx]}%`,
                  background: orange,
                }}
              >
                {item.name}
              </div>
            ))}
          </div>

          <div tw="flex min-w-min text-right flex-col" style={{ gap: rowGap }}>
            {data.map((item) => (
              <div
                key={item.name}
                tw={cn("flex justify-end items-center", rowHeight)}
              >
                {item.value.toLocaleString("en-US")}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>,
    {
      ...size,
    },
  );
}
