CREATE TABLE "swap" (
	"tx_id" text,
	"chain_id" bigint,
	"event_index" integer,
	"contract_id" text NOT NULL,
	"action" text NOT NULL,
	"user" text NOT NULL,
	"ststx_amount" bigint NOT NULL,
	"ststxbtc_amount" bigint NOT NULL,
	"block_height" bigint NOT NULL,
	"block_time" bigint NOT NULL,
	CONSTRAINT "swap_pkey" PRIMARY KEY("tx_id","chain_id","event_index")
);
--> statement-breakpoint
ALTER TABLE "deposit" ADD COLUMN "token" text NOT NULL;--> statement-breakpoint
ALTER TABLE "deposit" ADD COLUMN "underlying_amount" bigint;--> statement-breakpoint
ALTER TABLE "deposit" ADD COLUMN "token_amount" bigint NOT NULL;--> statement-breakpoint
ALTER TABLE "withdraw" ADD COLUMN "token" text NOT NULL;--> statement-breakpoint
ALTER TABLE "withdraw" ADD COLUMN "token_amount" bigint NOT NULL;--> statement-breakpoint
ALTER TABLE "withdraw" ADD COLUMN "underlying_amount" bigint;--> statement-breakpoint
ALTER TABLE "withdraw" ADD COLUMN "underlying_user_amount" bigint;--> statement-breakpoint
ALTER TABLE "withdraw" ADD COLUMN "fee_amount" bigint;--> statement-breakpoint
ALTER TABLE "deposit" DROP COLUMN "stx_amount";--> statement-breakpoint
ALTER TABLE "deposit" DROP COLUMN "ststx_amount";--> statement-breakpoint
ALTER TABLE "withdraw" DROP COLUMN "ststx_amount";--> statement-breakpoint
ALTER TABLE "withdraw" DROP COLUMN "stx_amount";