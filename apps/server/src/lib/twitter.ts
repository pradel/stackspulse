import { EUploadMimeType, TwitterApi } from "twitter-api-v2";
import { env } from "~/env";

const twitterClient = new TwitterApi({
  appKey: env.TWITTER_API_KEY,
  appSecret: env.TWITTER_API_SECRET_KEY,
  accessToken: env.TWITTER_ACCESS_TOKEN,
  accessSecret: env.TWITTER_ACCESS_TOKEN_SECRET,
});

export const sendTweet = async ({
  message,
  images,
}: {
  message: string;
  images?: string[];
}) => {
  if (env.TWITTER_API_KEY === "dev") {
    console.log("Debug Send Tweet:\n", message);
    return;
  }

  const mediaIds = images
    ? await Promise.all(
        images.map(async (image) => {
          const img = await fetch(image).then((res) => res.arrayBuffer());
          return twitterClient.v1.uploadMedia(Buffer.from(img), {
            mimeType: EUploadMimeType.Png,
          });
        }),
      )
    : [];

  const data = await twitterClient.v2.tweet({
    text: message,
    media: { media_ids: mediaIds },
  });

  return data.data.id;
};
