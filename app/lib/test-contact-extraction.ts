
import { db } from "./db";
import { extractContactProfile } from "../features/contacts/extraction/service";

const BUSINESS_ID = "demo-business";
const CONTACT_ID = "cmvkou5ev0000u0mlefelnkx4";
const CONVERSATION_ID = "bbb4ebfe-c739-4f2b-b2ac-35bf80706945";

async function main() {
    const result = await extractContactProfile({
        businessId: BUSINESS_ID,
        contactId: CONTACT_ID,
        conversationId: CONVERSATION_ID,
        model: process.env.OPENROUTER_MODEL ?? "openrouter/free",
    });

    console.log("EXTRACTION RESULT:");
    console.dir(result, { depth: null });

    const values = await db.contactProfileValue.findMany({
        where: { contactId: CONTACT_ID },
        include: {
            field: {
                select: { key: true, label: true, type: true },
            },
        },
    });

    console.log("SAVED PROFILE VALUES:");
    console.dir(values, { depth: null });

    const history = await db.contactProfileValueHistory.findMany({
        where: { profileValue: { contactId: CONTACT_ID } },
        include: {
            profileValue: {
                include: {
                    field: { select: { key: true } },
                },
            },
        },
        orderBy: { changedAt: "asc" },
    });

    console.log("SAVED HISTORY:");
    console.dir(history, { depth: null });
}

main()
    .catch((error) => {
        console.error("EXTRACTION TEST FAILED:", error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await db.$disconnect();
    });
