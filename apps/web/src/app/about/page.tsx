import { appConfig } from "@/appConfig";
import { Container, Heading, Link, Text } from "@radix-ui/themes";
import type { Metadata } from "next";

export const metadata: Metadata = {
  alternates: {
    canonical: "/about",
  },
};

export default async function AboutPage() {
  return (
    <Container size="2" className="px-4 pt-10">
      <Heading as="h1" size="5">
        stackpulse
      </Heading>

      <div className="mt-5 space-y-2">
        <Text as="p" size="3" color="gray">
          This project aims to provide a real-time view of Stacks DeFi ecosystem
          by aggregating public blockchain data and making it accessible through
          a easy to use interface.
        </Text>
        <Text as="p" size="3" color="gray">
          Give us a star on{" "}
          <Link href={appConfig.github} target="_blank">
            GitHub
          </Link>{" "}
          if you like the project.
        </Text>
        <Text as="p" size="3" color="gray">
          Want to contribute or have a feature request? Open an issue on{" "}
          <Link href={appConfig.github} target="_blank">
            GitHub
          </Link>
          .
        </Text>
      </div>

      <div className="mt-5 space-y-2">
        <Heading as="h2" size="4">
          Data
        </Heading>
        <Text as="p" size="3" color="gray">
          Data is extracted from a self-hosted Stacks blockchain node and
          aggregated using PostgreSQL.
        </Text>
        <Text as="p" size="3" color="gray">
          Token prices and volume is provided by{" "}
          <Link href="https://coingecko.com/" target="_blank">
            CoinGecko
          </Link>
          .
        </Text>
      </div>

      <div className="mt-10">
        <Heading as="h2" size="4">
          Open Stats
        </Heading>
        <iframe
          title="Fathom Analytics"
          className="mt-5 h-[800px] w-full"
          src="https://app.usefathom.com/share/lbvapcku/stackspulse"
        />
      </div>
    </Container>
  );
}
