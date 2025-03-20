import { fetchCallReadOnlyFunction } from "@stacks/transactions";
import { prisma } from "./prisma";

export const getOrCreateToken = async (tokenAddress: string) => {
  const token = await prisma.token.findUnique({
    where: { id: tokenAddress },
  });

  if (token) return token;

  const [contractAddress, contractName] = tokenAddress.split(".");

  const symbolResult = await fetchCallReadOnlyFunction({
    contractAddress,
    contractName,
    functionName: "get-symbol",
    functionArgs: [],
    senderAddress: "SP2X0TZ59D5SZ8ACQ6YMCHHNR2ZN51Z32E2CJ173",
  });
  if (symbolResult.type !== "ok" || symbolResult.value.type !== "ascii") {
    throw new Error("Failed to fetch symbol");
  }
  const symbol = symbolResult.value.value;

  const nameResult = await fetchCallReadOnlyFunction({
    contractAddress,
    contractName,
    functionName: "get-name",
    functionArgs: [],
    senderAddress: "SP2X0TZ59D5SZ8ACQ6YMCHHNR2ZN51Z32E2CJ173",
  });
  if (nameResult.type !== "ok" || nameResult.value.type !== "ascii") {
    throw new Error("Failed to fetch name");
  }
  const name = nameResult.value.value;

  const decimalsResult = await fetchCallReadOnlyFunction({
    contractAddress,
    contractName,
    functionName: "get-decimals",
    functionArgs: [],
    senderAddress: "SP2X0TZ59D5SZ8ACQ6YMCHHNR2ZN51Z32E2CJ173",
  });
  if (decimalsResult.type !== "ok" || decimalsResult.value.type !== "uint") {
    throw new Error("Failed to fetch decimals");
  }
  const decimals = Number(decimalsResult.value.value);

  const newToken = await prisma.token.create({
    data: {
      id: tokenAddress,
      symbol,
      name,
      decimals,
      txCount: 0,
      poolCount: 0,
    },
  });

  return newToken;
};
