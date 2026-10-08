-- Create Business table
CREATE TABLE "Business" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Business_pkey" PRIMARY KEY ("id")
);

-- Create Agent table
CREATE TABLE "Agent" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "instructions" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "temperature" DOUBLE PRECISION,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Agent_pkey" PRIMARY KEY ("id")
);

-- Create the demo business first
INSERT INTO "Business" (
    "id",
    "name",
    "updatedAt"
)
VALUES (
    'demo-business',
    'Demo Real Estate Business',
    CURRENT_TIMESTAMP
);

-- Add businessId as nullable temporarily
ALTER TABLE "Property"
ADD COLUMN "businessId" TEXT;

-- Assign all existing properties to the demo business
UPDATE "Property"
SET "businessId" = 'demo-business'
WHERE "businessId" IS NULL;

-- Make businessId required
ALTER TABLE "Property"
ALTER COLUMN "businessId" SET NOT NULL;

-- Indexes
CREATE INDEX "Agent_businessId_idx"
ON "Agent"("businessId");

CREATE INDEX "Property_businessId_idx"
ON "Property"("businessId");

-- Foreign keys
ALTER TABLE "Agent"
ADD CONSTRAINT "Agent_businessId_fkey"
FOREIGN KEY ("businessId")
REFERENCES "Business"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

ALTER TABLE "Property"
ADD CONSTRAINT "Property_businessId_fkey"
FOREIGN KEY ("businessId")
REFERENCES "Business"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;