/*
  Warnings:

  - You are about to drop the `Swap` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Swap" DROP CONSTRAINT "Swap_pool_id_fkey";

-- DropForeignKey
ALTER TABLE "Swap" DROP CONSTRAINT "Swap_token0_id_fkey";

-- DropForeignKey
ALTER TABLE "Swap" DROP CONSTRAINT "Swap_token1_id_fkey";

-- DropTable
DROP TABLE "Swap";

-- CreateTable
CREATE TABLE "Trade" (
    "id" TEXT NOT NULL,
    "pool_id" TEXT NOT NULL,
    "token0_id" TEXT NOT NULL,
    "token1_id" TEXT NOT NULL,
    "sender" TEXT NOT NULL,
    "amount_in" BIGINT NOT NULL,
    "amount_out" BIGINT NOT NULL,
    "tx_index" INTEGER NOT NULL,

    CONSTRAINT "Trade_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Trade" ADD CONSTRAINT "Trade_pool_id_fkey" FOREIGN KEY ("pool_id") REFERENCES "Pool"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trade" ADD CONSTRAINT "Trade_token0_id_fkey" FOREIGN KEY ("token0_id") REFERENCES "Token"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trade" ADD CONSTRAINT "Trade_token1_id_fkey" FOREIGN KEY ("token1_id") REFERENCES "Token"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
