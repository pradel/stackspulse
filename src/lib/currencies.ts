import { tokenTable } from "@/db/schema";
import { db } from "../db/db";
import { eq } from "drizzle-orm";
import { callReadOnlyFunction, cvToValue } from "@stacks/transactions";

export const displayPrice = (
  price: bigint | string,
  decimals: number
): string => {
  const priceNumber = Number(price) / Math.pow(10, decimals);
  // For accounts < 1 (eg: BTC) we want to display 6 decimal places
  // otherwise we want to display 2 decimal places
  const maximumFractionDigits = priceNumber < 1 ? 6 : 2;
  return priceNumber.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits,
    notation: "compact",
  });
};

/**
 * Get a token from the database or insert it if it doesn't exist.
 */
export const getOrInsertToken = async (tokenId: string) => {
  const tokens = await db
    .select()
    .from(tokenTable)
    .where(eq(tokenTable.id, tokenId));
  let token = tokens[0];
  if (!token) {
    // Special case for STX
    if (tokenId === "STX") {
      token = {
        id: "STX",
        symbol: "STX",
        decimals: 6,
      };
      await db.insert(tokenTable).values(token);
      return;
    }

    const smartContract = tokenId.split("::")[0];
    const [contractAddress, contractName] = smartContract.split(".");
    const resultDecimals = await callReadOnlyFunction({
      contractAddress,
      contractName,
      functionName: "get-decimals",
      functionArgs: [],
      network: "mainnet",
      senderAddress: "SP2EVYKET55QH40RAZE5PVZ363QX0X6BSRP4C7H0W",
    });

    const resultSymbol = await callReadOnlyFunction({
      contractAddress,
      contractName,
      functionName: "get-symbol",
      functionArgs: [],
      network: "mainnet",
      senderAddress: "SP2EVYKET55QH40RAZE5PVZ363QX0X6BSRP4C7H0W",
    });

    token = {
      id: tokenId,
      symbol: cvToValue(resultSymbol).value,
      decimals: Number(cvToValue(resultDecimals).value),
    };
    await db.insert(tokenTable).values(token);
  }
  return token;
};
