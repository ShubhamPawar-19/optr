
import "server-only";

import { db } from "@/app/lib/db";
import { getCurrentBusiness } from "@/app/lib/current-business";

export async function listLeads() {
  const business = await getCurrentBusiness();

  if (!business) {
    return {
      fields: [],
      contacts: [],
    };
  }

  const businessId = business.id;

  const [contacts, fields] = await Promise.all([
    db.contact.findMany({
      where: {
        businessId,
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
        profileValues: {
          select: {
            contactFieldId: true,
            value: true,
            source: true,
            updatedAt: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    }),

    db.contactField.findMany({
      where: {
        businessId,
        isActive: true,
      },
      select: {
        id: true,
        key: true,
        label: true,
        type: true,
        position: true,
      },
      orderBy: [
        { position: "asc" },
        { createdAt: "asc" },
      ],
    }),
  ]);

  return {
    fields,
    contacts: contacts.map((contact) => ({
      ...contact,
      profileValues: contact.profileValues.filter((value) =>
        fields.some((field) => field.id === value.contactFieldId),
      ),
    })),
  };
}
