import { BarList } from "@/components/ui/BarList";
import { useGetProtocolsUsers } from "@/hooks/api/useGetProtocolsUsers";
import type { ProtocolUsersRouteQuery } from "@/lib/api";
import { protocolsInfo } from "@stackspulse/protocols";

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
    name: protocolsInfo[d.protocol_name].name,
    value: d.unique_senders,
    href: `/protocols/${d.protocol_name}`,
  }));

  return <BarList className="mt-2" data={formattedData} />;
};
