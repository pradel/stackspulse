CREATE TABLE "deposit" (
	"tx_id" text,
	"chain_id" bigint,
	"event_index" integer,
	"contract_id" text NOT NULL,
	"stacker" text NOT NULL,
	"stx_amount" bigint,
	"ststx_amount" bigint NOT NULL,
	"referrer" text,
	"pool" text,
	"block_height" bigint NOT NULL,
	"block_time" bigint NOT NULL,
	CONSTRAINT "deposit_pkey" PRIMARY KEY("tx_id","chain_id","event_index")
);
--> statement-breakpoint
CREATE TABLE "withdraw" (
	"tx_id" text,
	"chain_id" bigint,
	"event_index" integer,
	"contract_id" text NOT NULL,
	"action" text NOT NULL,
	"stacker" text NOT NULL,
	"nft_id" bigint,
	"ststx_amount" bigint NOT NULL,
	"stx_amount" bigint,
	"block_height" bigint NOT NULL,
	"block_time" bigint NOT NULL,
	CONSTRAINT "withdraw_pkey" PRIMARY KEY("tx_id","chain_id","event_index")
);
