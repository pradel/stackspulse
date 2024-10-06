import { env } from "@/env";
import { stacksTokensApi } from "@/lib/stacks";
import { notFound } from "next/navigation";
import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "About Protocol";
export const size = {
  width: 1012,
  height: 506,
};

export const contentType = "image/png";

interface PageProps {
  params: { token: string };
}

export default async function Image({ params }: PageProps) {
  const tokenInfo = await stacksTokensApi
    .getFtMetadata(params.token)
    .catch((error) => {
      if (error.status === 404) {
        return null;
      }
      throw error;
    });
  if (!tokenInfo) {
    notFound();
  }

  return new ImageResponse(
    <div
      style={{
        fontSize: 60,
        width: "100%",
        height: "100%",
        display: "flex",
        padding: "60px",
        alignItems: "center",
        justifyContent: "flex-start",
        background: `url("${env.NEXT_PUBLIC_BASE_URL}/og/protocol-background.png")`,
        backgroundSize: "cover",
        backgroundPosition: "center center",
        backgroundRepeat: "no-repeat",
        color: "white",
      }}
    >
      <div tw="flex items-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          tw="mr-4"
          src={tokenInfo.image_thumbnail_uri || tokenInfo.image_uri}
          alt={alt}
          height={100}
          width={100}
          style={{
            borderRadius: "50%",
            border: "2px solid white",
          }}
        />
        {tokenInfo.symbol}
      </div>
    </div>,
    {
      ...size,
    },
  );
}
