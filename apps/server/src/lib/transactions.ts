import type { TransactionStatus } from "@stacks/stacks-blockchain-api-types";

// https://github.com/hirosystems/stacks-blockchain-api/blob/ef31cb417d727e3a6771ad9d6ec9f826da6ea21a/src/datastore/common.ts#L120
export enum DbTxStatus {
  Pending = 0,
  Success = 1,
  AbortByResponse = -1,
  AbortByPostCondition = -2,
  /** Replaced by a transaction with the same nonce, but a higher fee. */
  DroppedReplaceByFee = -10,
  /** Replaced by a transaction with the same nonce but in the canonical fork. */
  DroppedReplaceAcrossFork = -11,
  /** The transaction is too expensive to include in a block. */
  DroppedTooExpensive = -12,
  /** Transaction was dropped because it became stale. */
  DroppedStaleGarbageCollect = -13,
  /** Dropped by the API (even though the Stacks node hadn't dropped it) because it exceeded maximum mempool age */
  DroppedApiGarbageCollect = -14,
  /** Transaction is problematic (e.g. a DDoS vector) and should be dropped. */
  DroppedProblematic = -15,
}

// https://github.com/hirosystems/stacks-blockchain-api/blob/ef31cb417d727e3a6771ad9d6ec9f826da6ea21a/src/api/controllers/db-controller.ts#L151
export function getTxStatusString(txStatus: DbTxStatus): TransactionStatus {
  switch (txStatus) {
    case DbTxStatus.Pending:
      return "pending" as TransactionStatus;
    case DbTxStatus.Success:
      return "success";
    case DbTxStatus.AbortByResponse:
      return "abort_by_response";
    case DbTxStatus.AbortByPostCondition:
      return "abort_by_post_condition";
    case DbTxStatus.DroppedReplaceByFee:
      return "dropped_replace_by_fee" as TransactionStatus;
    case DbTxStatus.DroppedReplaceAcrossFork:
      return "dropped_replace_across_fork" as TransactionStatus;
    case DbTxStatus.DroppedTooExpensive:
      return "dropped_too_expensive" as TransactionStatus;
    case DbTxStatus.DroppedProblematic:
      return "dropped_problematic" as TransactionStatus;
    case DbTxStatus.DroppedStaleGarbageCollect:
    case DbTxStatus.DroppedApiGarbageCollect:
      return "dropped_stale_garbage_collect" as TransactionStatus;
    default:
      throw new Error(`Unexpected DbTxStatus: ${txStatus}`);
  }
}

export function parseDbTx(dbTx: {
  protocol: string;
  tx_id: Buffer;
  status: number;
  sender_address: string;
  contract_call_contract_id: string;
  contract_call_function_name: string;
  block_height: number;
  block_time: number;
}) {
  return {
    ...dbTx,
    tx_id: `0x${dbTx.tx_id.toString("hex")}`,
    tx_status: getTxStatusString(dbTx.status),
    sender_address: dbTx.sender_address,
    contract_call_contract_id: dbTx.contract_call_contract_id,
    contract_call_function_name: dbTx.contract_call_function_name,
    block_height: dbTx.block_height,
    block_time: dbTx.block_time,
  };
}
