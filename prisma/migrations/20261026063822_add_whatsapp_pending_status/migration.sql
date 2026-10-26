-- CreateTable
CREATE TABLE "WhatsAppPendingStatus" (
    "id" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "timestamp" BIGINT NOT NULL,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),

    CONSTRAINT "WhatsAppPendingStatus_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WhatsAppPendingStatus_externalId_processedAt_idx" ON "WhatsAppPendingStatus"("externalId", "processedAt");

-- CreateIndex
CREATE INDEX "WhatsAppPendingStatus_createdAt_idx" ON "WhatsAppPendingStatus"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "WhatsAppPendingStatus_externalId_status_timestamp_key" ON "WhatsAppPendingStatus"("externalId", "status", "timestamp");
