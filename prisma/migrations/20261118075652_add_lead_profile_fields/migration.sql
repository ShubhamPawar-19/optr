/*
  Warnings:

  - You are about to drop the column `qualificationData` on the `Lead` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[businessId,id]` on the table `Lead` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Lead" DROP COLUMN "qualificationData";

-- CreateTable
CREATE TABLE "LeadField" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "type" "DatasetFieldType" NOT NULL DEFAULT 'TEXT',
    "isRequired" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LeadField_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeadProfileValue" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "leadFieldId" TEXT NOT NULL,
    "value" TEXT,
    "source" TEXT NOT NULL DEFAULT 'INFERRED',
    "evidence" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LeadProfileValue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeadProfileValueHistory" (
    "id" TEXT NOT NULL,
    "leadProfileValueId" TEXT NOT NULL,
    "previousValue" TEXT,
    "newValue" TEXT,
    "source" TEXT NOT NULL DEFAULT 'INFERRED',
    "evidence" TEXT,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LeadProfileValueHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LeadField_businessId_position_idx" ON "LeadField"("businessId", "position");

-- CreateIndex
CREATE UNIQUE INDEX "LeadField_businessId_id_key" ON "LeadField"("businessId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "LeadField_businessId_key_key" ON "LeadField"("businessId", "key");

-- CreateIndex
CREATE INDEX "LeadProfileValue_businessId_leadId_idx" ON "LeadProfileValue"("businessId", "leadId");

-- CreateIndex
CREATE INDEX "LeadProfileValue_businessId_leadFieldId_idx" ON "LeadProfileValue"("businessId", "leadFieldId");

-- CreateIndex
CREATE UNIQUE INDEX "LeadProfileValue_leadId_leadFieldId_key" ON "LeadProfileValue"("leadId", "leadFieldId");

-- CreateIndex
CREATE INDEX "LeadProfileValueHistory_leadProfileValueId_changedAt_idx" ON "LeadProfileValueHistory"("leadProfileValueId", "changedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Lead_businessId_id_key" ON "Lead"("businessId", "id");

-- AddForeignKey
ALTER TABLE "LeadField" ADD CONSTRAINT "LeadField_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadProfileValue" ADD CONSTRAINT "LeadProfileValue_businessId_leadId_fkey" FOREIGN KEY ("businessId", "leadId") REFERENCES "Lead"("businessId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadProfileValue" ADD CONSTRAINT "LeadProfileValue_businessId_leadFieldId_fkey" FOREIGN KEY ("businessId", "leadFieldId") REFERENCES "LeadField"("businessId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadProfileValueHistory" ADD CONSTRAINT "LeadProfileValueHistory_leadProfileValueId_fkey" FOREIGN KEY ("leadProfileValueId") REFERENCES "LeadProfileValue"("id") ON DELETE CASCADE ON UPDATE CASCADE;
