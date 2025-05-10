"use client";

import { appConfig } from "@/appConfig";
import { Container, IconButton, Link, Text } from "@radix-ui/themes";
import { IconBrandGithub, IconBrandX } from "@tabler/icons-react";

export const Footer = () => {
  return (
    <footer>
      <Container size="2" className="px-4 py-10">
        <div className="flex items-center justify-between">
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
          <Text as="p" size="1" color="gray">
            Build by{" "}
            <Link href="https://www.leopradel.com/" target="_blank">
              @leopradel
            </Link>
          </Text>
        </div>
      </Container>
    </footer>
  );
};
