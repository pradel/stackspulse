import type { SelectTransactionAction } from "@/db/transactions";
import { env } from "@/env";
import type { Action } from "@/lib/actions";
import type { Protocol } from "@/lib/protocols";
import { useSuspenseQuery } from "@tanstack/react-query";

// TODO setup https://tanstack.com/query/latest/docs/framework/react/guides/suspense#suspense-on-the-server-with-streaming

export const useGetTransactions = (
  params: {
    protocol?: Protocol;
    action?: Action;
  } = {},
) => {
  return useSuspenseQuery<SelectTransactionAction[]>({
    queryKey: ["get-transactions", params.protocol, params.action],
    queryFn: async () => {
      const url = new URL(`${env.NEXT_PUBLIC_BASE_URL}/api/transactions`);
      if (params.protocol) {
        url.searchParams.append("protocol", params.protocol);
      }
      if (params.action) {
        url.searchParams.append("action", params.action);
      }
      const res = await fetch(url);
      return res.json();
    },
  });
};
