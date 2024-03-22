import { env } from "@/env";
import { TwitterApi } from "twitter-api-v2";

const twitterClient = new TwitterApi({
  appKey: env.TWITTER_API_KEY,
  appSecret: env.TWITTER_API_SECRET_KEY,
  accessToken: env.TWITTER_ACCESS_TOKEN,
  accessSecret: env.TWITTER_ACCESS_TOKEN_SECRET,
});

export const sendTweet = async (tweet: string) => {
  if (env.TWITTER_API_KEY === "dev") {
    console.log("Debug Send Tweet: ", tweet);
    return;
  }

  await twitterClient.v2.tweet(tweet);
};
