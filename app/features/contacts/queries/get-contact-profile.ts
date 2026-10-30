
import "server-only";

import { db } from "@/app/lib/db";
import { getCurrentBusiness } from "@/app/lib/current-business";

export async function getContactProfile(contactId: string) {
  if (!contactId.trim()) {
    return null;
  }

  const business = await getCurrentBusiness();

  if (!business) {
    return null;
  }

  return db.contact.findFirst({
    where: {
      id: contactId,
      businessId: business.id,
    },
    select: {
      id: true,
      name: true,
      phone: true,
      email: true,
      createdAt: true,
      updatedAt: true,
      identities: {
        select: {
          id: true,
          channel: true,
          externalId: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      },
      conversations: {
        select: {
          id: true,
          channel: true,
          externalId: true,
          createdAt: true,
          updatedAt: true,
          messages: {
            select: {
              id: true,
              role: true,
              content: true,
              createdAt: true,
            },
            orderBy: {
              createdAt: "desc",
            },
            take: 3,
          },
        },
        orderBy: {
          updatedAt: "desc",
        },
      },
      profileValues: {
        select: {
          id: true,
          value: true,
          source: true,
          evidence: true,
          createdAt: true,
          updatedAt: true,
          field: {
            select: {
              id: true,
              key: true,
              label: true,
              description: true,
              type: true,
              isRequired: true,
              isActive: true,
              position: true,
            },
          },
          history: {
            select: {
              id: true,
              previousValue: true,
              newValue: true,
              source: true,
              evidence: true,
              changedAt: true,
            },
            orderBy: {
              changedAt: "desc",
            },
            take: 10,
          },
        },
        orderBy: {
          updatedAt: "desc",
        },
      },
      business: {
        select: {
          contactFields: {
            orderBy: [
              { position: "asc" },
              { createdAt: "asc" },
            ],
            select: {
              id: true,
              key: true,
              label: true,
              description: true,
              type: true,
              isRequired: true,
              isActive: true,
              position: true,
            },
          },
        },
      },
    },
  });
}
