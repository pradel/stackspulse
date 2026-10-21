import { stackingDaoLogSchema } from "./event-schemas.ts";

export const CHAIN_ID = 1n;

/**
 * Contracts printing stSTX deposits and withdrawals. The core contracts were
 * upgraded in place (`core-v1` … `core-v6`, then `core-stx-v1`, `core-stx-v2`);
 * `ststx-nft-helper-v1` redeems `core-v1` withdrawal NFTs on its own. The
 * `core-btc` / `core-ststxbtc` / `core-stbtc` contracts mint other tokens and
 * are not indexed.
 */
export const STACKINGDAO_CONTRACTS = {
  CORE_V1: "SP4SZE494VC2YC5JYG7AYFQ44F5Q4PYV7DVMDPBG.stacking-dao-core-v1",
  CORE_V2: "SP4SZE494VC2YC5JYG7AYFQ44F5Q4PYV7DVMDPBG.stacking-dao-core-v2",
  CORE_V3: "SP4SZE494VC2YC5JYG7AYFQ44F5Q4PYV7DVMDPBG.stacking-dao-core-v3",
  CORE_V4: "SP4SZE494VC2YC5JYG7AYFQ44F5Q4PYV7DVMDPBG.stacking-dao-core-v4",
  CORE_V5: "SP4SZE494VC2YC5JYG7AYFQ44F5Q4PYV7DVMDPBG.stacking-dao-core-v5",
  CORE_V6: "SP4SZE494VC2YC5JYG7AYFQ44F5Q4PYV7DVMDPBG.stacking-dao-core-v6",
  CORE_STX_V1: "SP4SZE494VC2YC5JYG7AYFQ44F5Q4PYV7DVMDPBG.stacking-dao-core-stx-v1",
  CORE_STX_V2: "SP4SZE494VC2YC5JYG7AYFQ44F5Q4PYV7DVMDPBG.stacking-dao-core-stx-v2",
  STSTX_NFT_HELPER_V1: "SP4SZE494VC2YC5JYG7AYFQ44F5Q4PYV7DVMDPBG.ststx-nft-helper-v1",
} as const;

/** Deployment block of each contract. */
export const STACKINGDAO_START_BLOCKS: Record<string, number> = {
  [STACKINGDAO_CONTRACTS.CORE_V1]: 132118,
  [STACKINGDAO_CONTRACTS.CORE_V2]: 147394,
  [STACKINGDAO_CONTRACTS.CORE_V3]: 180551,
  [STACKINGDAO_CONTRACTS.CORE_V4]: 489238,
  [STACKINGDAO_CONTRACTS.CORE_V5]: 1491546,
  [STACKINGDAO_CONTRACTS.CORE_V6]: 2197089,
  [STACKINGDAO_CONTRACTS.CORE_STX_V1]: 8666708,
  [STACKINGDAO_CONTRACTS.CORE_STX_V2]: 8712018,
  [STACKINGDAO_CONTRACTS.STSTX_NFT_HELPER_V1]: 1558722,
};

/**
 * Every print is parsed with `stackingDaoLogSchema`; prints it does not match
 * (e.g. the `core-stx` admin `set-*` actions) are logged and skipped by the
 * indexer (`onInvalid: "skip"`).
 */
const ststxContract = (id: string) => ({
  id,
  startBlock: STACKINGDAO_START_BLOCKS[id],
  print: stackingDaoLogSchema,
  onInvalid: "skip" as const,
});

/** `defineIndexer` contract definitions, keyed by contract name. */
export const STACKINGDAO_INDEXER_CONTRACTS = {
  stackingDaoCoreV1: ststxContract(STACKINGDAO_CONTRACTS.CORE_V1),
  stackingDaoCoreV2: ststxContract(STACKINGDAO_CONTRACTS.CORE_V2),
  stackingDaoCoreV3: ststxContract(STACKINGDAO_CONTRACTS.CORE_V3),
  stackingDaoCoreV4: ststxContract(STACKINGDAO_CONTRACTS.CORE_V4),
  stackingDaoCoreV5: ststxContract(STACKINGDAO_CONTRACTS.CORE_V5),
  stackingDaoCoreV6: ststxContract(STACKINGDAO_CONTRACTS.CORE_V6),
  stackingDaoCoreStxV1: ststxContract(STACKINGDAO_CONTRACTS.CORE_STX_V1),
  stackingDaoCoreStxV2: ststxContract(STACKINGDAO_CONTRACTS.CORE_STX_V2),
  stackingDaoStstxNftHelperV1: ststxContract(STACKINGDAO_CONTRACTS.STSTX_NFT_HELPER_V1),
};
