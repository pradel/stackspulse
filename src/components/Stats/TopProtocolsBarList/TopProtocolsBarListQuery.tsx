import type { ProtocolUsersRouteQuery } from "@/app/api/protocols/users/route";
import { BarList } from "@/components/ui/BarList";
import { useGetProtocolsUsers } from "@/hooks/api/useGetProtocolsUsers";
import { protocolsInfo } from "@/lib/protocols";

interface TopProtocolsBarListClientProps {
  dateFilter: ProtocolUsersRouteQuery["date"];
}

export const TopProtocolsBarListQuery = ({
  dateFilter,
}: TopProtocolsBarListClientProps) => {
  const { data: stats } = useGetProtocolsUsers({
    date: dateFilter,
    limit: 6,
  });

  const formattedData = stats.map((d) => ({
    name: protocolsInfo[d.protocol].name,
    value: d.uniqueSenders,
    href: `/protocols/${d.protocol}`,
  }));

  return <BarList className="mt-2" data={formattedData} />;
};
