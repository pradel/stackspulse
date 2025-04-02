import type { Predicate } from "@hirosystems/chainhook-client";
import { env } from "~/env";
import { consola } from "./consola";

export const getChainhooks = async (): Promise<Predicate[]> => {
  const chainhooks = await fetch(
    `https://api.platform.hiro.so/v1/ext/${env.HIRO_API_KEY}/chainhooks`,
    {
      method: "GET",
    },
  ).then((res) => res.json());
  return chainhooks;
};

export const createChainhook = async (
  predicate: unknown,
): Promise<{
  status: string;
  chainhookUuid: string;
}> => {
  const response: {
    status: string;
    chainhookUuid: string;
  } = await fetch(
    `https://api.platform.hiro.so/v1/ext/${env.HIRO_API_KEY}/chainhooks`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(predicate),
    },
  ).then((res) => res.json());
  if (response.status !== "success") {
    consola.error("Chainhook creation failed", response);
    throw new Error("Chainhook creation failed");
  }
  return response;
};
