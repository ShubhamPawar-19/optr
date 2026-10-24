
import { db } from "./db";

const CONTACT_ID = "cmvkou5ev0000u0mlefelnkx4";

async function main() {
    const [values, history] = await Promise.all([
        db.contactProfileValue.findMany({
            where: { contactId: CONTACT_ID },
            include: {
                field: {
                    select: { key: true, label: true, type: true },
                },
            },
        }),
        db.contactProfileValueHistory.findMany({
            where: {
                profileValue: { contactId: CONTACT_ID },
            },
            include: {
                profileValue: {
                    include: {
                        field: {
                            select: { key: true, label: true },
                        },
                    },
                },
            },
            orderBy: { changedAt: "asc" },
        }),
    ]);

    console.log("CURRENT PROFILE VALUES:");
    console.dir(values, { depth: null });

    console.log("VALUE CHANGE HISTORY:");
    console.dir(history, { depth: null });
}

main()
    .catch(console.error)
    .finally(async () => {
        await db.$disconnect();
    });
