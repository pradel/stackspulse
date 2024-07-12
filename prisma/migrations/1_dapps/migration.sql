-- CreateTable
CREATE TABLE "dapps" (
    "id" TEXT NOT NULL,
    "contracts" TEXT[],

    CONSTRAINT "dapps_pkey" PRIMARY KEY ("id")
);
