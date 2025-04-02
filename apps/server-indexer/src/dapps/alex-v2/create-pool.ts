import { consola } from "~/lib/consola";
import { prisma } from "~/lib/prisma";
import { getOrCreateToken } from "~/lib/token";
import type { Operation } from "~/routes/api/chainhook/webhook.post";

interface PoolCreatedEvent {
  action: "created";
  data: {
    "balance-x": number;
    "balance-y": number;
    "end-block": number;
    "fee-rate-x": number;
    "fee-rate-y": number;
    "fee-rebate": number;
    "pool-id": number;
    "pool-owner": string;
    "start-block": number;
    "threshold-x": number;
    "threshold-y": number;
    "total-supply": number;
  };
  factor: number;
  object: "pool";
  "token-x": string;
  "token-y": string;
}
// Some blocks that can be tested 155991, 155995, 780604
// Example: https://explorer.hiro.so/txid/0x4e43f10dfd1bc243eccd454afb96e9f027fe2afb665c63fc0e4c00c050c07284?chain=mainnet
/**
 * Contracts:
 * - SP102V8P0F7JX67ARQ77WEA3D3CFB5XW39REDT0AM.amm-registry-v2-01 => 152429
 */
export const handlePoolCreated: Operation<PoolCreatedEvent> = {
  trigger: ({ contract_identifier, value }) => {
    return (
      contract_identifier ===
        "SP102V8P0F7JX67ARQ77WEA3D3CFB5XW39REDT0AM.amm-registry-v2-01" &&
      value.object === "pool" &&
      value.action === "created"
    );
  },
  handler: async (event) => {
    const [token0, token1] = await Promise.all([
      getOrCreateToken(event.data.value["token-x"]),
      getOrCreateToken(event.data.value["token-y"]),
    ]);

    const poolId = `alex-v2-${event.data.value.data["pool-id"]}`;
    const poolData = {
      id: poolId,
      token0Id: token0.id,
      token1Id: token1.id,
      txCount: 0,
    };
    await prisma.pool.upsert({
      where: {
        id: poolId,
      },
      create: poolData,
      update: poolData,
    });

    consola.debug(`Created pool ${poolId}`);
  },
};
