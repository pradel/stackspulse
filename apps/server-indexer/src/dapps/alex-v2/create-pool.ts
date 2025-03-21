import { prisma } from "~/lib/prisma";
import { getOrCreateToken } from "~/lib/token";

interface PoolCreatedEvent {
  "token-x": string;
  "token-y": string;
  data: {
    "pool-id": number;
  };
}

// Some blocks that can be tested 155991, 155995
export const handlePoolCreated = {
  trigger: ({
    contract_identifier,
    value,
  }: {
    contract_identifier: string;
    value: Record<string, unknown>;
  }) => {
    return (
      contract_identifier ===
        "SP102V8P0F7JX67ARQ77WEA3D3CFB5XW39REDT0AM.amm-registry-v2-01" &&
      value.object === "pool" &&
      value.action === "created"
    );
  },
  handler: async (event: PoolCreatedEvent) => {
    const [token0, token1] = await Promise.all([
      getOrCreateToken(event["token-x"]),
      getOrCreateToken(event["token-y"]),
    ]);

    await prisma.pool.create({
      data: {
        id: `alex-v2-${event.data["pool-id"]}`,
        token0Id: token0.id,
        token1Id: token1.id,
        txCount: 0,
      },
    });
  },
};
