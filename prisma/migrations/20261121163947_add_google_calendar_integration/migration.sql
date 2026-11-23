-- CreateTable
CREATE TABLE "GoogleCalendarConnection" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "googleAccountId" TEXT NOT NULL,
    "googleAccountEmail" TEXT NOT NULL,
    "encryptedAccessToken" TEXT,
    "encryptedRefreshToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "calendarId" TEXT,
    "calendarName" TEXT,
    "timezone" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GoogleCalendarConnection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GoogleCalendarOAuthState" (
    "id" TEXT NOT NULL,
    "stateHash" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "consumedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GoogleCalendarOAuthState_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GoogleCalendarConnection_businessId_key" ON "GoogleCalendarConnection"("businessId");

-- CreateIndex
CREATE INDEX "GoogleCalendarConnection_googleAccountId_idx" ON "GoogleCalendarConnection"("googleAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "GoogleCalendarOAuthState_stateHash_key" ON "GoogleCalendarOAuthState"("stateHash");

-- CreateIndex
CREATE INDEX "GoogleCalendarOAuthState_businessId_expiresAt_idx" ON "GoogleCalendarOAuthState"("businessId", "expiresAt");

-- CreateIndex
CREATE INDEX "GoogleCalendarOAuthState_userId_expiresAt_idx" ON "GoogleCalendarOAuthState"("userId", "expiresAt");

-- AddForeignKey
ALTER TABLE "GoogleCalendarConnection" ADD CONSTRAINT "GoogleCalendarConnection_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GoogleCalendarOAuthState" ADD CONSTRAINT "GoogleCalendarOAuthState_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GoogleCalendarOAuthState" ADD CONSTRAINT "GoogleCalendarOAuthState_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
