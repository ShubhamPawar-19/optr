import "dotenv/config";
import { PrismaClient } from "./app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const db = new PrismaClient({ adapter });

async function main() {
  console.log("BUSINESSES");
  console.log(await db.business.findMany({
    select: { id: true, name: true },
  }));

  console.log("AGENTS");
  console.log(await db.agent.findMany({
    select: { id: true, name: true, businessId: true, isActive: true },
  }));

  console.log("WHATSAPP CHANNELS");
  console.log(await db.whatsAppChannel.findMany({
    select: { phoneNumberId: true, businessId: true, isActive: true },
  }));

  console.log("CONTACTS");
  console.log(await db.contact.findMany({
    select: { id: true, businessId: true, name: true, phone: true },
  }));
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());