import { fetchApi, type StackingDAOActivityResponse } from "@/lib/api";
import { Heading, Text } from "@radix-ui/themes";
import { ActivityList } from "./ActivityList";

export const Activity = async () => {
  const activity = await fetchApi<StackingDAOActivityResponse>("/stackingdao/activity?limit=25");

  return (
    <div className="mt-10">
      <Heading as="h2" size="3" color="gray" highContrast>
        Activity
      </Heading>
      {activity.items.length === 0 ? (
        <Text className="mt-4" as="p" size="2" color="gray">
          No deposits, withdrawals or swaps indexed yet.
        </Text>
      ) : (
        <ActivityList items={activity.items} />
      )}
    </div>
  );
};
