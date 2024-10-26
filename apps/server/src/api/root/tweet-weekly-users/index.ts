import { protocolsInfo } from "@stackspulse/protocols";
import type { ProtocolUsersRouteResponse } from "~/api/protocols/users";
import { env } from "~/env";
import { sendTweet } from "~/lib/twitter";

/**
 * Keep the DB up to date with the latest protocols
 */
export default defineEventHandler(async () => {
  const apiParams = new URLSearchParams();
  apiParams.append("noCache", "true");
  apiParams.append("date", "7d");
  apiParams.append("limit", "5");

  const stats: ProtocolUsersRouteResponse = await fetch(
    `${env.API_URL}/api/protocols/users?${apiParams.toString()}`,
  ).then((res) => res.json());

  const data = stats.map((stat) => ({
    name: protocolsInfo[stat.protocol_name].name,
    value: stat.unique_senders,
  }));

  const params = new URLSearchParams();
  params.append("title", "Last 7 Days Unique Users");
  params.append("data", JSON.stringify(data));

  const imageUrl = `${
    env.WEB_URL
  }/api/images/weekly-users?${params.toString()}`;

  let message = "📈 Last 7 days unique users:\n\n";
  for (const stat of stats) {
    message += `\n- @${protocolsInfo[stat.protocol_name].x.replace(
      "https://twitter.com/",
      "",
    )}: ${stat.unique_senders.toLocaleString("en-US")} users`;
  }

  const tweetId = await sendTweet({ message, images: [imageUrl] });

  return { ok: true, tweetId };
});
