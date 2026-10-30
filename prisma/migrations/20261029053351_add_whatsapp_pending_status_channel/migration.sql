/*
  Warnings:

  - A unique constraint covering the columns `[phoneNumberId,externalId,status,timestamp]` on the table `WhatsAppPendingStatus` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "WhatsAppPendingStatus_externalId_processedAt_idx";

-- DropIndex
DROP INDEX "WhatsAppPendingStatus_externalId_status_timestamp_key";

-- AlterTable
ALTER TABLE "WhatsAppPendingStatus" ADD COLUMN     "phoneNumberId" TEXT;

-- CreateIndex
CREATE INDEX "WhatsAppPendingStatus_phoneNumberId_externalId_processedAt_idx" ON "WhatsAppPendingStatus"("phoneNumberId", "externalId", "processedAt");

-- CreateIndex
CREATE UNIQUE INDEX "WhatsAppPendingStatus_phoneNumberId_externalId_status_times_key" ON "WhatsAppPendingStatus"("phoneNumberId", "externalId", "status", "timestamp");
