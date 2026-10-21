import { defineIndexer } from "stacksindex/effect";

import { STACKINGDAO_INDEXER_CONTRACTS } from "./protocols/stackingdao/contracts.ts";

export const indexer = defineIndexer({ contracts: STACKINGDAO_INDEXER_CONTRACTS });
