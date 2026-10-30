ALTER TABLE "Conversation"
ADD COLUMN "phoneNumberId" TEXT;

CREATE INDEX "Conversation_phoneNumberId_channel_idx"
ON "Conversation"("phoneNumberId", "channel");
