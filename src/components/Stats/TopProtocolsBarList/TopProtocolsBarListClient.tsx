import { BarList } from "@/components/ui/BarList";
import { Card, Inset, Separator, Text } from "@radix-ui/themes";

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
      <div className="flex justify-between">
        <Text as="div" size="2" weight="medium" color="gray" highContrast>
          Top Stacks protocols
        </Text>
        <Text
          className="mt-1 uppercase"
          as="div"
          size="1"
          color="gray"
          weight="medium"
        >
          Users
        </Text>
      </div>
      <Inset py="current" side="x">
        <Separator size="4" />
      </Inset>
      <BarList data={data} />
    </Card>
  );
};
