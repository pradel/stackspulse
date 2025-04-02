-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "block_height" BIGINT NOT NULL,
    "timestamp" BIGINT NOT NULL,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);
