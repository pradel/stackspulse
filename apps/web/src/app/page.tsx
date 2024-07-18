import { HomeStats } from "@/components/Home/HomeStats";
import { HomeTransactions } from "@/components/Home/HomeTransactions";
import { TopProtocolsBarList } from "@/components/Stats/TopProtocolsBarList";
import { Container, Heading } from "@radix-ui/themes";
import { Suspense } from "react";

export const dynamic = "force-dynamic";
// TODO
// Cache the page for 60 seconds
// export const revalidate = 60;

export default async function HomePage() {
  return (
    <Container size="2" className="px-4 pt-10">
      <div>
        <Heading as="h1" size="4">
          stackpulse
        </Heading>
        <Heading as="h2" size="2" color="gray" weight="regular">
          Real-time on-chain Stats for Stacks DeFi.
        </Heading>
      </div>

      <Suspense>
        <HomeStats />
      </Suspense>

      <TopProtocolsBarList />

      <Suspense>
        <HomeTransactions />
      </Suspense>
    </Container>
  );
}
