import { db } from "./app/lib/db";

async function main() {
  const conversations = await db.conversation.findMany({
    orderBy: { updatedAt: "desc" },
    take: 5,
    include: {
      messages: {
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          role: true,
          content: true,
          externalId: true,
          createdAt: true,
        },
      },
    },
  });

  console.dir(conversations, { depth: null });
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
