import "dotenv/config";
import { db } from "./db";

async function main() {
    const conversations = await db.conversation.findMany({
        include: {
            messages: true,
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    console.dir(conversations, { depth: null });
}

main()
    .catch(console.error)
    .finally(async () => {
        await db.$disconnect();
    });