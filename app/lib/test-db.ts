import { db } from "./db";

async function main() {
    await db.$connect();

    console.log("Database connected");

    await db.$disconnect();
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});