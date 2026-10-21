import type { Schema } from "effect";

import {
  coreBtcPrintSchema,
  coreStbtcPrintSchema,
  coreStstxbtcPrintSchema,
  ststxPrintSchema,
  swapPrintSchema,
} from "./event-schemas.ts";

export const CHAIN_ID = 1n;

/**
 * Contracts printing StackingDAO token flows. Each token's core contract was
 * upgraded in place:
 * - stSTX: `core-v1` … `core-v6`, then `core-stx-v1`, `core-stx-v2`;
 *   `ststx-nft-helper-v1` redeems `core-v1` withdrawal NFTs on its own.
 * - stSTXbtc: `core-btc-v1` … `core-btc-v3`, then `core-ststxbtc-v1`, `core-ststxbtc-v2`.
 * - stBTC: `core-stbtc-v1`.
 * - stSTX ⇄ stSTXbtc swaps: `swap-ststx-ststxbtc-v4`, `-v5`. The v1 / v2 swaps
 *   print nothing and are not indexed.
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
  CORE_BTC_V1: "SP4SZE494VC2YC5JYG7AYFQ44F5Q4PYV7DVMDPBG.stacking-dao-core-btc-v1",
  CORE_BTC_V2: "SP4SZE494VC2YC5JYG7AYFQ44F5Q4PYV7DVMDPBG.stacking-dao-core-btc-v2",
  CORE_BTC_V3: "SP4SZE494VC2YC5JYG7AYFQ44F5Q4PYV7DVMDPBG.stacking-dao-core-btc-v3",
  CORE_STSTXBTC_V1: "SP4SZE494VC2YC5JYG7AYFQ44F5Q4PYV7DVMDPBG.stacking-dao-core-ststxbtc-v1",
  CORE_STSTXBTC_V2: "SP4SZE494VC2YC5JYG7AYFQ44F5Q4PYV7DVMDPBG.stacking-dao-core-ststxbtc-v2",
  CORE_STBTC_V1: "SP4SZE494VC2YC5JYG7AYFQ44F5Q4PYV7DVMDPBG.stacking-dao-core-stbtc-v1",
  SWAP_STSTX_STSTXBTC_V4: "SP4SZE494VC2YC5JYG7AYFQ44F5Q4PYV7DVMDPBG.swap-ststx-ststxbtc-v4",
  SWAP_STSTX_STSTXBTC_V5: "SP4SZE494VC2YC5JYG7AYFQ44F5Q4PYV7DVMDPBG.swap-ststx-ststxbtc-v5",
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
  [STACKINGDAO_CONTRACTS.CORE_BTC_V1]: 489250,
  [STACKINGDAO_CONTRACTS.CORE_BTC_V2]: 1491527,
  [STACKINGDAO_CONTRACTS.CORE_BTC_V3]: 2197089,
  [STACKINGDAO_CONTRACTS.CORE_STSTXBTC_V1]: 8666710,
  [STACKINGDAO_CONTRACTS.CORE_STSTXBTC_V2]: 8712020,
  [STACKINGDAO_CONTRACTS.CORE_STBTC_V1]: 8666706,
  [STACKINGDAO_CONTRACTS.SWAP_STSTX_STSTXBTC_V4]: 8712023,
  [STACKINGDAO_CONTRACTS.SWAP_STSTX_STSTXBTC_V5]: 8846476,
};

/**
 * Every print is parsed with the contract family's schema; prints it does not
 * match (e.g. the admin `set-*` actions) are logged and skipped by the indexer
 * (`onInvalid: "skip"`).
 */
const stackingDaoContract = <TPrint extends Schema.Decoder<unknown>>(
  id: string,
  print: TPrint,
) => ({
  id,
  startBlock: STACKINGDAO_START_BLOCKS[id],
  print,
  onInvalid: "skip" as const,
});

/** `defineIndexer` contract definitions, keyed by contract name. */
export const STACKINGDAO_INDEXER_CONTRACTS = {
  stackingDaoCoreV1: stackingDaoContract(STACKINGDAO_CONTRACTS.CORE_V1, ststxPrintSchema),
  stackingDaoCoreV2: stackingDaoContract(STACKINGDAO_CONTRACTS.CORE_V2, ststxPrintSchema),
  stackingDaoCoreV3: stackingDaoContract(STACKINGDAO_CONTRACTS.CORE_V3, ststxPrintSchema),
  stackingDaoCoreV4: stackingDaoContract(STACKINGDAO_CONTRACTS.CORE_V4, ststxPrintSchema),
  stackingDaoCoreV5: stackingDaoContract(STACKINGDAO_CONTRACTS.CORE_V5, ststxPrintSchema),
  stackingDaoCoreV6: stackingDaoContract(STACKINGDAO_CONTRACTS.CORE_V6, ststxPrintSchema),
  stackingDaoCoreStxV1: stackingDaoContract(STACKINGDAO_CONTRACTS.CORE_STX_V1, ststxPrintSchema),
  stackingDaoCoreStxV2: stackingDaoContract(STACKINGDAO_CONTRACTS.CORE_STX_V2, ststxPrintSchema),
  stackingDaoStstxNftHelperV1: stackingDaoContract(
    STACKINGDAO_CONTRACTS.STSTX_NFT_HELPER_V1,
    ststxPrintSchema,
  ),
  stackingDaoCoreBtcV1: stackingDaoContract(STACKINGDAO_CONTRACTS.CORE_BTC_V1, coreBtcPrintSchema),
  stackingDaoCoreBtcV2: stackingDaoContract(STACKINGDAO_CONTRACTS.CORE_BTC_V2, coreBtcPrintSchema),
  stackingDaoCoreBtcV3: stackingDaoContract(STACKINGDAO_CONTRACTS.CORE_BTC_V3, coreBtcPrintSchema),
  stackingDaoCoreStstxbtcV1: stackingDaoContract(
    STACKINGDAO_CONTRACTS.CORE_STSTXBTC_V1,
    coreStstxbtcPrintSchema,
  ),
  stackingDaoCoreStstxbtcV2: stackingDaoContract(
    STACKINGDAO_CONTRACTS.CORE_STSTXBTC_V2,
    coreStstxbtcPrintSchema,
  ),
  stackingDaoCoreStbtcV1: stackingDaoContract(
    STACKINGDAO_CONTRACTS.CORE_STBTC_V1,
    coreStbtcPrintSchema,
  ),
  stackingDaoSwapStstxStstxbtcV4: stackingDaoContract(
    STACKINGDAO_CONTRACTS.SWAP_STSTX_STSTXBTC_V4,
    swapPrintSchema,
  ),
  stackingDaoSwapStstxStstxbtcV5: stackingDaoContract(
    STACKINGDAO_CONTRACTS.SWAP_STSTX_STSTXBTC_V5,
    swapPrintSchema,
  ),
};
