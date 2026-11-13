-- CreateEnum
CREATE TYPE "VoiceToolExecutionStatus" AS ENUM ('PENDING', 'RUNNING', 'SUCCEEDED', 'FAILED');

-- CreateTable
CREATE TABLE "VoiceToolExecution" (
    "id" TEXT NOT NULL,
    "callId" TEXT NOT NULL,
    "providerToolCallId" TEXT NOT NULL,
    "toolName" TEXT NOT NULL,
    "status" "VoiceToolExecutionStatus" NOT NULL DEFAULT 'PENDING',
    "input" JSONB NOT NULL,
    "output" JSONB,
    "error" TEXT,
    "durationMs" INTEGER,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VoiceToolExecution_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "VoiceToolExecution_callId_createdAt_idx" ON "VoiceToolExecution"("callId", "createdAt");

-- CreateIndex
CREATE INDEX "VoiceToolExecution_status_createdAt_idx" ON "VoiceToolExecution"("status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "VoiceToolExecution_callId_providerToolCallId_key" ON "VoiceToolExecution"("callId", "providerToolCallId");

-- AddForeignKey
ALTER TABLE "VoiceToolExecution" ADD CONSTRAINT "VoiceToolExecution_callId_fkey" FOREIGN KEY ("callId") REFERENCES "Call"("id") ON DELETE CASCADE ON UPDATE CASCADE;
