import { consola } from "~/lib/consola";
import { prisma } from "~/lib/prisma";
import { getOrCreateToken } from "~/lib/token";

interface SwapEvent {
  action: "swap-x-for-y" | "swap-y-for-x";
  data: {
    "balance-x": number;
    "balance-y": number;
    "pool-id": number;
  };
  dx: number;
  dy: number;
  "fee-rebate": number;
  fee: number;
  object: "pool";
  sender: string;
  "token-x": string;
  "token-y": string;
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
  handler: async (event: {
    tx_id: string;
    tx_index: number;
    data: {
      contract_identifier: string;
      value: SwapEvent;
    };
  }) => {
    const [token0, token1] = await Promise.all([
      getOrCreateToken(event.data.value["token-x"]),
      getOrCreateToken(event.data.value["token-y"]),
    ]);

    const pool = await prisma.pool.findUniqueOrThrow({
      where: {
        id: `alex-v2-${event.data.value.data["pool-id"]}`,
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

    const swapId = `${event.tx_id}-${event.tx_index}`;
    const amount0 =
      event.data.value.action === "swap-x-for-y"
        ? BigInt(event.data.value.dx)
        : BigInt(event.data.value.dy);
    const amount1 =
      event.data.value.action === "swap-x-for-y"
        ? BigInt(event.data.value.dy)
        : BigInt(event.data.value.dx);
    const swapData = {
      id: swapId,
      amount0,
      amount1,
      token0Id: token0.id,
      token1Id: token1.id,
      poolId: pool.id,
      txIndex: event.tx_index,
    };
    await prisma.swap.upsert({
      where: {
        id: swapId,
      },
      create: swapData,
      update: swapData,
    });

    consola.debug(`Created swap ${swapId}`);
  },
};
