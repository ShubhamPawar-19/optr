/*
  Warnings:

  - A unique constraint covering the columns `[businessId,id]` on the table `Contact` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('NEW', 'QUALIFYING', 'QUALIFIED', 'CONVERTED', 'LOST');

-- CreateEnum
CREATE TYPE "LeadSource" AS ENUM ('WHATSAPP', 'VOICE', 'MANUAL');

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "LeadStatus" NOT NULL DEFAULT 'NEW',
    "source" "LeadSource" NOT NULL,
    "qualificationData" JSONB,
    "convertedAt" TIMESTAMP(3),
    "lostAt" TIMESTAMP(3),
    "lostReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeadConversation" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LeadConversation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Lead_businessId_status_idx" ON "Lead"("businessId", "status");

-- CreateIndex
CREATE INDEX "Lead_contactId_idx" ON "Lead"("contactId");

-- CreateIndex
CREATE INDEX "Lead_businessId_createdAt_idx" ON "Lead"("businessId", "createdAt");

-- CreateIndex
CREATE INDEX "LeadConversation_conversationId_idx" ON "LeadConversation"("conversationId");

-- CreateIndex
CREATE UNIQUE INDEX "LeadConversation_leadId_conversationId_key" ON "LeadConversation"("leadId", "conversationId");

-- CreateIndex
CREATE UNIQUE INDEX "Contact_businessId_id_key" ON "Contact"("businessId", "id");

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_businessId_contactId_fkey" FOREIGN KEY ("businessId", "contactId") REFERENCES "Contact"("businessId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadConversation" ADD CONSTRAINT "LeadConversation_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadConversation" ADD CONSTRAINT "LeadConversation_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
