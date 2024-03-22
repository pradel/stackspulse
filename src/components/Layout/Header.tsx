"use client";
import { appConfig } from "@/appConfig";
import { type Protocol, protocolsInfo } from "@/lib/protocols";
import {
  Container,
  DropdownMenu,
  IconButton,
  Link,
  Separator,
} from "@radix-ui/themes";
import {
  IconBrandGithub,
  IconBrandX,
  IconChevronDown,
} from "@tabler/icons-react";
import Image from "next/image";
import NextLink from "next/link";
import { IconLogo } from "../icons/IconLogo";

export const Header = () => {
  return (
    <header>
      <Container size="2" className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-5">
            <NextLink href="/">
              <IconLogo height={22} />
            </NextLink>
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
          <div className="flex items-center gap-5">
            <IconButton size="2" color="gray" variant="ghost" asChild>
              <a href={appConfig.github} target="_blank" rel="noreferrer">
                <IconBrandGithub size={16} />
              </a>
            </IconButton>
            <IconButton size="2" color="gray" variant="ghost" asChild>
              <a href={appConfig.twitter} target="_blank" rel="noreferrer">
                <IconBrandX size={16} />
              </a>
            </IconButton>
          </div>
        </div>
      </Container>
      <Separator size="4" />
    </header>
  );
};
