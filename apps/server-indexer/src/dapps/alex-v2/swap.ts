import { prisma } from "~/lib/prisma";
import { getOrCreateToken } from "~/lib/token";

interface SwapEvent {
  action: "swap-x-for-y" | "swap-y-for-x";
  "token-x": string;
  "token-y": string;
  dx: number;
  dy: number;
  data: {
    "pool-id": number;
  };
}

// Example: https://explorer.hiro.so/txid/0x13fc43f33cf8c921edbc49971d6196c45c5cc8767b5206e2b13d3f0e131bacd7?chain=mainnet
export const handleSwap = {
  trigger: ({
    contract_identifier,
    value,
  }: {
    contract_identifier: string;
    value: Record<string, unknown>;
  }) => {
    return (
      contract_identifier ===
        "SP102V8P0F7JX67ARQ77WEA3D3CFB5XW39REDT0AM.amm-pool-v2-01" &&
      value.object === "pool" &&
      (value.action === "swap-x-for-y" || value.action === "swap-y-for-x")
    );
  },
  handler: async (event: SwapEvent) => {
    const [token0, token1] = await Promise.all([
      getOrCreateToken(event["token-x"]),
      getOrCreateToken(event["token-y"]),
    ]);

    const pool = await prisma.pool.findUniqueOrThrow({
      where: {
        id: `alex-v2-${event.data["pool-id"]}`,
      },
    });

    await prisma.pool.update({
      where: {
        id: pool.id,
      },
      data: {
        txCount: {
          increment: 1,
        },
      },
    });

    await prisma.swap.create({
      data: {
        id: `TODO-${event.data["pool-id"]}`,
        amount0: event.action === "swap-x-for-y" ? event.dx : event.dy,
        amount1: event.action === "swap-x-for-y" ? event.dy : event.dx,
        token0Id: token0.id,
        token1Id: token1.id,
        poolId: pool.id,
        txIndex: event.txIndex,
      },
    });
  },
};
