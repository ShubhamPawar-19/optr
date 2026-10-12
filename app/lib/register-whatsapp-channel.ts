
import "dotenv/config";
import { db } from "./db";

async function main() {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!phoneNumberId) {
    throw new Error("WHATSAPP_PHONE_NUMBER_ID is missing from .env");
  }

  const business = await db.business.findUnique({
    where: { id: "demo-business" },
    select: { id: true },
  });

  if (!business) {
    throw new Error('Business "demo-business" does not exist');
  }

  const channel = await db.whatsAppChannel.upsert({
    where: { phoneNumberId },
    update: {
      businessId: business.id,
      isActive: true,
    },
    create: {
      phoneNumberId,
      businessId: business.id,
      isActive: true,
    },
  });

  console.log("WhatsApp channel registered:", {
    channelId: channel.id,
    businessId: channel.businessId,
    isActive: channel.isActive,
  });
}

main()
  .catch((error) => {
    console.error("Channel registration failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });