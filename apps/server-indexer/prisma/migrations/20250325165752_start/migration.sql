/*
  Warnings:

  - You are about to drop the column `timestamp` on the `Transaction` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "timestamp";

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_block_height_fkey" FOREIGN KEY ("block_height") REFERENCES "Block"("height") ON DELETE RESTRICT ON UPDATE CASCADE;
