/*
  Warnings:

  - A unique constraint covering the columns `[agentId,eventId]` on the table `AgentRun` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "AgentRun_agentId_eventId_key" ON "AgentRun"("agentId", "eventId");
