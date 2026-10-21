import { stackingDaoLogSchema } from "./event-schemas.ts";

export const CHAIN_ID = 1n;

export const STACKINGDAO_CONTRACTS = {
  CORE_V1: "SP4SZE494VC2YC5JYG7AYFQ44F5Q4PYV7DVMDPBG.stacking-dao-core-v1",
  CORE_V2: "SP4SZE494VC2YC5JYG7AYFQ44F5Q4PYV7DVMDPBG.stacking-dao-core-v2",
  CORE_V3: "SP4SZE494VC2YC5JYG7AYFQ44F5Q4PYV7DVMDPBG.stacking-dao-core-v3",
  CORE_V4: "SP4SZE494VC2YC5JYG7AYFQ44F5Q4PYV7DVMDPBG.stacking-dao-core-v4",
  CORE_V5: "SP4SZE494VC2YC5JYG7AYFQ44F5Q4PYV7DVMDPBG.stacking-dao-core-v5",
  CORE_V6: "SP4SZE494VC2YC5JYG7AYFQ44F5Q4PYV7DVMDPBG.stacking-dao-core-v6",
} as const;

export const STACKINGDAO_START_BLOCKS: Record<string, number> = {
  [STACKINGDAO_CONTRACTS.CORE_V1]: 132118,
  [STACKINGDAO_CONTRACTS.CORE_V2]: 147394,
  [STACKINGDAO_CONTRACTS.CORE_V3]: 180551,
  [STACKINGDAO_CONTRACTS.CORE_V4]: 489238,
  [STACKINGDAO_CONTRACTS.CORE_V5]: 1491546,
  [STACKINGDAO_CONTRACTS.CORE_V6]: 2197089,
};

/**
 * Every core print is parsed with `stackingDaoLogSchema`; prints it does not
 * match are logged and skipped by the indexer (`onInvalid: "skip"`).
 */
const coreContract = (id: string) => ({
  id,
  startBlock: STACKINGDAO_START_BLOCKS[id],
  print: stackingDaoLogSchema,
  onInvalid: "skip" as const,
});

/** `defineIndexer` contract definitions, keyed by contract name. */
export const STACKINGDAO_INDEXER_CONTRACTS = {
  stackingDaoCoreV1: coreContract(STACKINGDAO_CONTRACTS.CORE_V1),
  stackingDaoCoreV2: coreContract(STACKINGDAO_CONTRACTS.CORE_V2),
  stackingDaoCoreV3: coreContract(STACKINGDAO_CONTRACTS.CORE_V3),
  stackingDaoCoreV4: coreContract(STACKINGDAO_CONTRACTS.CORE_V4),
  stackingDaoCoreV5: coreContract(STACKINGDAO_CONTRACTS.CORE_V5),
  stackingDaoCoreV6: coreContract(STACKINGDAO_CONTRACTS.CORE_V6),
};
