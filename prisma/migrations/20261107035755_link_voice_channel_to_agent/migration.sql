/*
  Warnings:

  - Added the required column `agentId` to the `VoiceChannel` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "VoiceChannel" ADD COLUMN     "agentId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "VoiceChannel_agentId_idx" ON "VoiceChannel"("agentId");

-- AddForeignKey
ALTER TABLE "VoiceChannel" ADD CONSTRAINT "VoiceChannel_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
