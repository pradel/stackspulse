import { protocolsInfo } from "@stackspulse/protocols";
import type { ProtocolUsersRouteResponse } from "~/api/protocols/users";
import { env } from "~/env";
import { sendTweet } from "~/lib/twitter";

/**
 * Send a tweet with the top 5 protocols by unique users in the last 7 days
 */
export default defineEventHandler(async () => {
  const apiParams = new URLSearchParams();
  apiParams.append("noCache", "true");
  apiParams.append("mode", "nested");
  apiParams.append("date", "7d");
  apiParams.append("limit", "5");

  // Get stats with nested mode
  console.log("Getting stats with nested mode...", apiParams.toString());
  const statsNested: ProtocolUsersRouteResponse = await fetch(
    `${env.API_URL}/api/protocols/users?${apiParams.toString()}`,
  ).then((res) => res.json());

  const dataNested = statsNested.map((stat) => ({
    name: protocolsInfo[stat.protocol_name].name,
    value: stat.unique_senders,
  }));

  // Get stats with direct mode
  apiParams.set("mode", "direct");
  console.log("Getting stats with direct mode...", apiParams.toString());
  const statsDirect: ProtocolUsersRouteResponse = await fetch(
    `${env.API_URL}/api/protocols/users?${apiParams.toString()}`,
  ).then((res) => res.json());

  const dataDirect = statsDirect.map((stat) => ({
    name: protocolsInfo[stat.protocol_name].name,
    value: stat.unique_senders,
  }));

  // Generate nested tweet
  const params = new URLSearchParams();
  params.append("title", "Last 7 Days Unique Users");
  params.append("data", JSON.stringify(dataNested));

  const imageUrlNested = `${
    env.WEB_URL
  }/api/images/weekly-users?${params.toString()}`;

  let messageNested = "📈 Last 7 days unique users:\n\n";
  for (const stat of statsNested) {
    messageNested += `\n- @${protocolsInfo[stat.protocol_name].x.replace(
      "https://twitter.com/",
      "",
    )}: ${stat.unique_senders.toLocaleString("en-US")} users`;
  }

  const nestedTweetId = await sendTweet({
    message: messageNested,
    images: [imageUrlNested],
  });
  console.log("Nested tweet id:", nestedTweetId);

  // Generate direct tweet
  params.set("title", "Last 7 Days Direct Unique Users");
  params.set("data", JSON.stringify(dataDirect));

  const imageUrlDirect = `${
    env.WEB_URL
  }/api/images/weekly-users?${params.toString()}`;

  let messageDirect =
    "📈 Last 7 days unique users that interacted directly with the protocol:\n\n";
  for (const stat of statsDirect) {
    messageDirect += `\n- @${protocolsInfo[stat.protocol_name].x.replace(
      "https://twitter.com/",
      "",
    )}: ${stat.unique_senders.toLocaleString("en-US")} users`;
  }

  const directTweetId = await sendTweet({
    message: messageDirect,
    images: [imageUrlDirect],
    in_reply_to_tweet_id: nestedTweetId,
  });
  console.log("Direct tweet id:", directTweetId);

  return { ok: true, nestedTweetId, directTweetId };
});
