import { Button, Callout } from "@radix-ui/themes";
import { IconInfoCircle } from "@tabler/icons-react";

export const StackingDAORef = () => {
  return (
    <Callout.Root className="mt-5" color="gray" variant="soft">
      <Callout.Icon>
        <IconInfoCircle size={14} />
      </Callout.Icon>
      <Callout.Text>
        Deposit STX for stSTX via Stacking DAO to earn ~6.35% APY on your STX.
      </Callout.Text>
      <div>
        <Button variant="outline" asChild>
          <a
            href="https://app.stackingdao.com/stack?referral=SP3VCX5NFQ8VCHFS9M6N40ZJNVTRT4HZ62WFH5C4Q"
            target="_blank"
            rel="noreferrer"
          >
            Deposit STX - referral link
          </a>
        </Button>
      </div>
    </Callout.Root>
  );
};
