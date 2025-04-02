/*
  Warnings:

  - Added the required column `sender` to the `Swap` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Swap" ADD COLUMN     "sender" TEXT NOT NULL;
