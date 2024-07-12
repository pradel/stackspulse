-- CreateTable
CREATE TABLE "dapps" (
    "id" TEXT NOT NULL,
    "contracts" TEXT[],

    CONSTRAINT "dapps_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX dapps_contracts_index ON dapps USING gin (contracts);
