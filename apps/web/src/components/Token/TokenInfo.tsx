import type { FtMetadataResponse } from "@hirosystems/token-metadata-api-client";
import { Heading, Text } from "@radix-ui/themes";
import Image from "next/image";

interface TokenInfoProps {
  tokenInfo: FtMetadataResponse;
}

export const TokenInfo = ({ tokenInfo }: TokenInfoProps) => {
  return (
    <div className="flex items-start gap-5">
      <Image
        className="rounded-full"
        src={tokenInfo.image_thumbnail_uri}
        alt={`${tokenInfo.name} logo`}
        width={50}
        height={50}
        priority
      />
      <div>
        <Heading as="h1" size="5" color="gray" highContrast>
          {tokenInfo.symbol} - {tokenInfo.name}
        </Heading>
        <Text className="mt-1" as="p" size="2" color="gray">
          {tokenInfo.description}
        </Text>
      </div>
    </div>
  );
};
