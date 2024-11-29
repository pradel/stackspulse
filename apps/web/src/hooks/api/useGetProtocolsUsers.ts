import { env } from "@/env";
import type {
  ProtocolUsersRouteQuery,
  ProtocolUsersRouteResponse,
} from "@/lib/api";
import { useSuspenseQuery } from "@tanstack/react-query";

export const useGetProtocolsUsers = ({
  mode,
  date,
  limit,
}: ProtocolUsersRouteQuery) => {
  return useSuspenseQuery<ProtocolUsersRouteResponse>({
    queryKey: ["get-protocols-users", mode, date, limit],
    queryFn: async () => {
      const url = new URL(`${env.NEXT_PUBLIC_API_URL}/api/protocols/users`);
      url.searchParams.set("date", date);
      if (mode) {
        url.searchParams.set("mode", mode);
      }
      if (limit) {
        url.searchParams.set("limit", limit.toString());
      }
      const res = await fetch(url);
      return res.json();
    },
  });
};
