"use client";
import { Container, DropdownMenu, Link, Separator } from "@radix-ui/themes";
import NextLink from "next/link";
import { IconChevronDown } from "@tabler/icons-react";
import Image from "next/image";
import { Protocol, protocolsInfo } from "@/lib/protocols";

export const Header = () => {
  return (
    <header>
      <Container size="2" className="px-4 py-5">
        <div className="flex items-center gap-5">
          <Link color="gray" size="2" asChild>
            <NextLink href="/">Home</NextLink>
          </Link>

          <DropdownMenu.Root>
            <DropdownMenu.Trigger>
              <Link color="gray" size="2" className="flex items-center gap-2">
                Protocols
                <IconChevronDown size={14} />
              </Link>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content sideOffset={10} color="gray">
              {Object.keys(protocolsInfo).map((key) => {
                const protocol = protocolsInfo[key as Protocol];
                return (
                  <DropdownMenu.Item asChild key={key}>
                    <NextLink
                      className="flex items-center justify-start gap-3"
                      href={`/protocols/${key}`}
                    >
                      <Image
                        className="rounded-full"
                        src={`/protocols/${key}.png`}
                        alt={`${protocol.name} logo`}
                        width={20}
                        height={20}
                      />
                      {protocol.name}
                    </NextLink>
                  </DropdownMenu.Item>
                );
              })}
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        </div>
      </Container>
      <Separator size="4" />
    </header>
  );
};
