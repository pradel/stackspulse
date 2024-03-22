import { getWidthsFromValues } from "@/components/ui/BarList";
import { env } from "@/env";
import { cn } from "@/lib/cn";
import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";
import { z } from "zod";

export const runtime = "edge";
export const dynamic = "force-dynamic";

const size = {
  width: 1012,
  height: 506,
};

const schema = z.object({
  title: z.string().min(1).max(50),
  data: z.array(
    z.object({
      name: z.string().min(1).max(50),
      value: z.number().int().min(0),
    }),
  ),
});

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const searchParamsData = JSON.parse(url.searchParams.get("data") || "[]");
  const params = schema.safeParse({
    title: url.searchParams.get("title"),
    data: searchParamsData,
  });

  if (!params.success) {
    return Response.json(
      { success: false, message: "Invalid parameters" },
      { status: 400 },
    );
  }

  const title = params.data.title;
  const data = params.data.data;
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
        <div tw="flex justify-end -mt-6">{title}</div>

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
