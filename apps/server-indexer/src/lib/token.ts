import { prisma } from "./prisma";

export const getOrCreateToken = async (tokenAddress: string) => {
  const token = await prisma.token.findUnique({
    where: { id: tokenAddress },
  });

  if (token) return token;

  // TODO call function to get decimals
  const decimals = 8;

  const newToken = await prisma.token.create({
    data: {
      id: tokenAddress,
      decimals,
      txCount: 0,
      poolCount: 0,
    },
  });

  return newToken;
};
