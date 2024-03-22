import { env } from "@/env";
import { type Protocol, protocolsInfo } from "@/lib/protocols";
import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "About Protocol";
export const size = {
  width: 1012,
  height: 506,
};

export const contentType = "image/png";

interface PageProps {
  params: { protocol: string };
}

export default async function Image({ params }: PageProps) {
  const protocol = params.protocol as Protocol;

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
        <img
          tw="mr-4"
          src={`${env.NEXT_PUBLIC_BASE_URL}/protocols/${protocol}.png`}
          alt={alt}
          height={100}
          width={100}
          style={{
            borderRadius: "50%",
            border: "2px solid white",
          }}
        />
        {protocolsInfo[protocol].name}
      </div>
    </div>,
    {
      ...size,
    },
  );
}
