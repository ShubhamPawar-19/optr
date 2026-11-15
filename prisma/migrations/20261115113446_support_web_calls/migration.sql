/*
  Warnings:

  - A unique constraint covering the columns `[provider,providerAgentId]` on the table `VoiceChannel` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Call" ADD COLUMN     "callType" TEXT NOT NULL DEFAULT 'PHONE',
ALTER COLUMN "direction" DROP NOT NULL;

-- AlterTable
ALTER TABLE "VoiceChannel" ALTER COLUMN "phoneNumber" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "VoiceChannel_provider_providerAgentId_key" ON "VoiceChannel"("provider", "providerAgentId");
