import { prisma } from "~/lib/prisma";

interface PoolCreatedEvent {
  "token-x": string;
  "token-y": string;
}

export const handlePoolCreated = async (event: PoolCreatedEvent) => {
  await prisma.pool.create({
    data: {
      id: "TODO",
      token0Id: event["token-x"],
      token1Id: event["token-y"],
      txCount: 0,
    },
  });
};
