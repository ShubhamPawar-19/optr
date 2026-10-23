
import "server-only";

import { db } from "@/app/lib/db";

const DEMO_BUSINESS_ID = "demo-business";

export async function listContacts() {
    return db.contact.findMany({
        where: {
            businessId: DEMO_BUSINESS_ID,
        },
        select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            createdAt: true,
            updatedAt: true,
            _count: {
                select: {
                    conversations: true,
                },
            },
        },
        orderBy: {
            updatedAt: "desc",
        },
    });
}
