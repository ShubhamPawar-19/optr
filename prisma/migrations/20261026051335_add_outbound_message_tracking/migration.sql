-- CreateEnum
CREATE TYPE "OutboundMessageStatus" AS ENUM ('PENDING', 'SENT', 'DELIVERED', 'READ', 'FAILED', 'UNKNOWN');

-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "deliveredAt" TIMESTAMP(3),
ADD COLUMN     "outboundError" TEXT,
ADD COLUMN     "outboundStatus" "OutboundMessageStatus",
ADD COLUMN     "readAt" TIMESTAMP(3),
ADD COLUMN     "sentAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Message_outboundStatus_createdAt_idx" ON "Message"("outboundStatus", "createdAt");
