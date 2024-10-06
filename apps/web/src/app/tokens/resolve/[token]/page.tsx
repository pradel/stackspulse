import { env } from "@/env";
import type { TokensResolveRouteResponse } from "@/lib/api";
import { notFound, redirect } from "next/navigation";

export const dynamic = "force-dynamic";

interface PageProps {
  params: { token: string };
}

export default async function ProtocolPage({ params }: PageProps) {
  const data: TokensResolveRouteResponse = await fetch(
    `${env.NEXT_PUBLIC_API_URL}/api/tokens/resolve?id=${params.token}`,
  ).then((res) => res.json());

  if (data.contract_address) {
    redirect(`/tokens/${data.contract_address}`);
  }

  notFound();
}
