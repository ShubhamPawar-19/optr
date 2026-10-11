-- CreateEnum
CREATE TYPE "AgentStepStatus" AS ENUM ('SUCCEEDED', 'FAILED');

-- AlterTable
ALTER TABLE "AgentStep" ADD COLUMN     "durationMs" INTEGER,
ADD COLUMN     "error" TEXT,
ADD COLUMN     "status" "AgentStepStatus" NOT NULL DEFAULT 'SUCCEEDED';

-- CreateIndex
CREATE INDEX "AgentStep_status_idx" ON "AgentStep"("status");
