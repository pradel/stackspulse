import { prisma } from "~/lib/prisma";
import { getOrCreateToken } from "~/lib/token";

interface PoolCreatedEvent {
  "token-x": string;
  "token-y": string;
}

export const handlePoolCreated = async (event: PoolCreatedEvent) => {
  const [token0, token1] = await Promise.all([
    getOrCreateToken(event["token-x"]),
    getOrCreateToken(event["token-y"]),
  ]);

  await prisma.pool.create({
    data: {
      id: "TODO",
      token0Id: token0.id,
      token1Id: token1.id,
      txCount: 0,
    },
  });
};
