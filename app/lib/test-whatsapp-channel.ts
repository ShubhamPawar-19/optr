
import "dotenv/config";
import { db } from "./db";
import { resolveWhatsAppBusiness } from "@/app/features/agents/resolve-whatsapp-business";

async function main() {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!phoneNumberId) {
    throw new Error("WHATSAPP_PHONE_NUMBER_ID is missing");
  }

  const businessId = await resolveWhatsAppBusiness(phoneNumberId);

  if (businessId !== "demo-business") {
    throw new Error(`Unexpected business mapping: ${businessId}`);
  }

  console.log("PASS: WhatsApp channel resolves to demo-business");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });