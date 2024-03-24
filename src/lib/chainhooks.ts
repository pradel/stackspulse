export interface ChainhookPayload {
  apply: {
    timestamp: number;
    block_identifier: {
      hash: string;
      index: number;
    };
    transactions: {
      metadata: {
        sender: string;
        success: boolean;
        kind: {
          data: {
            contract_identifier: string;
            method: string;
          };
        };
        receipt: {
          events: ChainhookReceiptEvent[];
        };
      };
      transaction_identifier: {
        hash: string;
      };
      operations: {
        account: {
          address: string;
        };
        amount:
          | {
              value: number;
              currency: {
                decimals: number;
                symbol: "STX";
              };
            }
          | {
              value: number;
              currency: {
                decimals: number;
                symbol: "TOKEN";
                metadata: {
                  asset_class_identifier: string;
                  standard: "SIP10";
                };
              };
            };
      }[];
    }[];
  }[];
}

type ChainhookReceiptEvent =
  | ChainhookReceiptEventSTXTransferEvent
  | ChainhookReceiptEventFTTransferEvent
  | ChainhookReceiptEventFTMintEvent
  | ChainhookReceiptEventSmartContractEvent;

export interface ChainhookReceiptEventSTXTransferEvent {
  data: {
    amount: string;
    recipient: string;
    sender: string;
  };
  position: {
    index: number;
  };
  type: "STXTransferEvent";
}

export interface ChainhookReceiptEventFTTransferEvent {
  data: {
    amount: string;
    asset_identifier: string;
    recipient: string;
    sender: string;
  };
  position: {
    index: number;
  };
  type: "FTTransferEvent";
}

export interface ChainhookReceiptEventFTMintEvent {
  data: {
    amount: string;
    asset_identifier: string;
    recipient: string;
  };
  position: {
    index: number;
  };
  type: "FTMintEvent";
}

export interface ChainhookReceiptEventSmartContractEvent {
  data: unknown;
  position: {
    index: number;
  };
  type: "SmartContractEvent";
}
