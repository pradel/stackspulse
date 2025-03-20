import { fetchCallReadOnlyFunction } from "@stacks/transactions";
import { prisma } from "./prisma";

export const getOrCreateToken = async (tokenAddress: string) => {
  const token = await prisma.token.findUnique({
    where: { id: tokenAddress },
  });

  if (token) return token;

  // TODO call function to get decimals
  const decimals = 8;
  const [contractAddress, contractName] = tokenAddress.split(".");
  const decimalsResult = await fetchCallReadOnlyFunction({
    contractAddress,
    contractName,
    functionName: "get-decimals",
    functionArgs: [],
    senderAddress: "SP2X0TZ59D5SZ8ACQ6YMCHHNR2ZN51Z32E2CJ173",
  });
  console.log("decimalsResult", decimalsResult);

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
