import { type Protocol, protocolsInfo } from "@/lib/protocols";
import { Heading, IconButton, Text } from "@radix-ui/themes";
import { IconBrandX, IconWorld } from "@tabler/icons-react";
import Image from "next/image";

interface ProtocolInfoProps {
  protocol: Protocol;
}

export const ProtocolInfo = ({ protocol }: ProtocolInfoProps) => {
  const protocolInfo = protocolsInfo[protocol];

  return (
    <div className="flex items-start gap-5">
      <Image
        className="rounded-full"
        src={`/protocols/${protocol}.png`}
        alt={`${protocol} logo`}
        width={50}
        height={50}
        priority
      />
      <div>
        <Heading as="h1" size="5" color="gray" highContrast>
          {protocolInfo.name}
        </Heading>
        <Text className="mt-1" as="p" size="2" color="gray">
          {protocolInfo.description}
        </Text>
        <div className="mt-2 space-x-2">
          <IconButton size="1" variant="ghost" color="gray" asChild>
            <a href={protocolInfo.website} target="_blank" rel="noreferrer">
              <IconWorld size={14} />
            </a>
          </IconButton>
          <IconButton size="1" variant="ghost" color="gray" asChild>
            <a href={protocolInfo.x} target="_blank" rel="noreferrer">
              <IconBrandX size={14} />
            </a>
          </IconButton>
        </div>
      </div>
    </div>
  );
};
