-- CreateTable
CREATE TABLE "Token" (
    "id" TEXT NOT NULL,
    "decimals" INTEGER NOT NULL,
    "tx_count" BIGINT NOT NULL,
    "pool_count" INTEGER NOT NULL,

    CONSTRAINT "Token_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pool" (
    "id" TEXT NOT NULL,
    "token0_id" TEXT NOT NULL,
    "token1_id" TEXT NOT NULL,
    "tx_count" BIGINT NOT NULL,

    CONSTRAINT "Pool_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Pool" ADD CONSTRAINT "Pool_token0_id_fkey" FOREIGN KEY ("token0_id") REFERENCES "Token"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pool" ADD CONSTRAINT "Pool_token1_id_fkey" FOREIGN KEY ("token1_id") REFERENCES "Token"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
