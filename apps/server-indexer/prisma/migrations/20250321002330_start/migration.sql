-- CreateTable
CREATE TABLE "Swap" (
    "id" TEXT NOT NULL,
    "pool_id" TEXT NOT NULL,
    "token0_id" TEXT NOT NULL,
    "token1_id" TEXT NOT NULL,
    "amount0" BIGINT NOT NULL,
    "amount1" BIGINT NOT NULL,
    "tx_index" INTEGER NOT NULL,

    CONSTRAINT "Swap_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Swap" ADD CONSTRAINT "Swap_pool_id_fkey" FOREIGN KEY ("pool_id") REFERENCES "Pool"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Swap" ADD CONSTRAINT "Swap_token0_id_fkey" FOREIGN KEY ("token0_id") REFERENCES "Token"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Swap" ADD CONSTRAINT "Swap_token1_id_fkey" FOREIGN KEY ("token1_id") REFERENCES "Token"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
