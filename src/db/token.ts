import { callReadOnlyFunction, cvToValue } from "@stacks/transactions";
import { eq } from "drizzle-orm";
import { db } from "./db";
import { tokenTable } from "./schema";

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
      return token;
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
