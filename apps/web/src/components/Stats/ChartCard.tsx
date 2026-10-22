import { Card, Inset, Separator, Text } from "@radix-ui/themes";

interface ChartCardProps {
  title: string;
  description: string;
  /** Controls shown next to the title, such as a token switch. */
  actions?: React.ReactNode;
  children: React.ReactNode;
}

export const ChartCard = ({ title, description, actions, children }: ChartCardProps) => {
  return (
    <Card size="2" className="mt-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Text as="div" size="2" weight="medium" color="gray" highContrast>
            {title}
          </Text>
          <Text className="mt-1" as="div" size="1" color="gray">
            {description}
          </Text>
        </div>
        {actions}
      </div>
      <Inset py="current" side="bottom">
        <Separator size="4" />
      </Inset>
      {children}
    </Card>
  );
};
