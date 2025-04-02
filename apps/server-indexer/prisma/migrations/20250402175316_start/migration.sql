/*
  Warnings:

  - The primary key for the `Block` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `height` on the `Block` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - You are about to alter the column `block_height` on the `Transaction` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - Added the required column `contract_call_contract_id` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `contract_call_function_name` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dapp_id` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `index` to the `Transaction` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_block_height_fkey";

-- AlterTable
ALTER TABLE "Block" DROP CONSTRAINT "Block_pkey",
ALTER COLUMN "height" SET DATA TYPE INTEGER,
ADD CONSTRAINT "Block_pkey" PRIMARY KEY ("height");

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "contract_call_contract_id" TEXT NOT NULL,
ADD COLUMN     "contract_call_function_name" TEXT NOT NULL,
ADD COLUMN     "dapp_id" TEXT NOT NULL,
ADD COLUMN     "index" SMALLINT NOT NULL,
ALTER COLUMN "block_height" SET DATA TYPE INTEGER;

-- CreateTable
CREATE TABLE "Dapp" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Dapp_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_block_height_fkey" FOREIGN KEY ("block_height") REFERENCES "Block"("height") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_dapp_id_fkey" FOREIGN KEY ("dapp_id") REFERENCES "Dapp"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
