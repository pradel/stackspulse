import type {
  ProtocolUsersRouteQuery,
  ProtocolUsersRouteResponse,
} from "@/app/api/protocols/users/route";
import { env } from "@/env";
import { useSuspenseQuery } from "@tanstack/react-query";

export const useGetProtocolsUsers = ({
  date,
  limit,
}: ProtocolUsersRouteQuery) => {
  return useSuspenseQuery<ProtocolUsersRouteResponse>({
    queryKey: ["get-protocols-users", date, limit],
    queryFn: async () => {
      const url = new URL(`${env.NEXT_PUBLIC_BASE_URL}/api/protocols/users`);
      url.searchParams.set("date", date);
      if (limit) {
        url.searchParams.set("limit", limit.toString());
      }
      const res = await fetch(url);
      return res.json();
    },
  });
};
