import { env } from "@/env";
import { protocolsInfo } from "@/lib/protocols";
import { sendTweet } from "@/lib/twitter";
import type { ProtocolUsersRouteResponse } from "../../protocols/users/route";

export const dynamic = "force-dynamic";

/**
 * Send a tweet with the top 5 protocols by unique users in the last 7 days
 */
export async function GET() {
  const stats: ProtocolUsersRouteResponse = await fetch(
    `${env.NEXT_PUBLIC_BASE_URL}/api/protocols/users?date=7d&limit=5`,
  ).then((res) => res.json());

  const data = stats.map((stat) => ({
    name: protocolsInfo[stat.protocol_name].name,
    value: stat.unique_senders,
  }));

  const params = new URLSearchParams();
  params.append("title", "Last 7 Days Unique Users");
  params.append("data", JSON.stringify(data));

  const imageUrl = `${
    env.NEXT_PUBLIC_BASE_URL
  }/api/images/weekly-users?${params.toString()}`;

  let message = "📈 Last 7 days unique users:\n\n";
  for (const stat of stats) {
    message += `\n- @${protocolsInfo[stat.protocol_name].x.replace(
      "https://twitter.com/",
      "",
    )}: ${stat.unique_senders.toLocaleString("en-US")} users`;
  }

  const tweetId = await sendTweet({ message, images: [imageUrl] });

  return Response.json({ ok: true, tweetId });
}
