import { db } from "./db";

async function main() {
    const count = await db.property.count();

    console.log("Property count:", count);

    await db.$disconnect();
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});