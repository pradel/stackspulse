import { consola } from "~/lib/consola";
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
// Example: https://explorer.hiro.so/txid/0x4e43f10dfd1bc243eccd454afb96e9f027fe2afb665c63fc0e4c00c050c07284?chain=mainnet
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
  handler: async (event: {
    tx_id: string;
    tx_index: number;
    data: {
      contract_identifier: string;
      value: PoolCreatedEvent;
    };
  }) => {
    const [token0, token1] = await Promise.all([
      getOrCreateToken(event.data.value["token-x"]),
      getOrCreateToken(event.data.value["token-y"]),
    ]);

    const poolId = `alex-v2-${event.data.value.data["pool-id"]}`;
    await prisma.pool.create({
      data: {
        id: poolId,
        token0Id: token0.id,
        token1Id: token1.id,
        txCount: 0,
      },
    });

    consola.debug(`Created pool ${poolId}`);
  },
};
