/*
  Warnings:

  - A unique constraint covering the columns `[agentId,channel,externalId]` on the table `Conversation` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Conversation_channel_externalId_key";

-- CreateIndex
CREATE UNIQUE INDEX "Conversation_agentId_channel_externalId_key" ON "Conversation"("agentId", "channel", "externalId");
