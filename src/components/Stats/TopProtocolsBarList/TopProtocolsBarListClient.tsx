import { BarList } from "@/components/ui/BarList";
import { Card, TabNav, Text } from "@radix-ui/themes";

interface TopProtocolsBarListClientProps {
  data: {
    name: string;
    value: number;
    href: string;
  }[];
}

export const TopProtocolsBarListClient = ({
  data,
}: TopProtocolsBarListClientProps) => {
  return (
    <Card size="2" className="mt-5">
      <div className="flex justify-between items-center -mt-2">
        <Text as="div" size="2" weight="medium" color="gray" highContrast>
          Top Stacks protocols
        </Text>
        <TabNav.Root size="2">
          <TabNav.Link asChild>
            <button type="button">7d</button>
          </TabNav.Link>
          <TabNav.Link asChild>
            <button type="button">30d</button>
          </TabNav.Link>
          <TabNav.Link active asChild>
            <button type="button">all</button>
          </TabNav.Link>
        </TabNav.Root>
      </div>

      <div className="mt-4 flex justify-between">
        <Text as="p" size="1" color="gray" weight="medium">
          protocol
        </Text>
        <Text as="p" size="1" color="gray" weight="medium">
          users
        </Text>
      </div>

      <BarList className="mt-2" data={data} />
    </Card>
  );
};
