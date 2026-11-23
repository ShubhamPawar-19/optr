
"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/app/lib/db";
import { getCurrentBusiness } from "@/app/lib/current-business";

export type ContactActionState = {
  error?: string;
  success?: string;
};

function readString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : null;
}

async function getBusinessId() {
  const business = await getCurrentBusiness();
  return business?.id ?? null;
}

export async function updateContactAction(
  _previousState: ContactActionState,
  formData: FormData,
): Promise<ContactActionState> {
  const contactId = readString(formData, "contactId");
  const name = readString(formData, "name");
  const email = readString(formData, "email");
  const phone = readString(formData, "phone");

  if (!contactId || name === null || email === null || phone === null) {
    return { error: "Invalid contact details." };
  }

  if (name.length > 150 || email.length > 254 || phone.length > 40) {
    return { error: "One or more fields exceed the allowed length." };
  }

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Enter a valid email address." };
  }

  const businessId = await getBusinessId();
  if (!businessId) {
    return { error: "Please sign in and select a business." };
  }

  try {
    const result = await db.$transaction(
      async (tx) => {
        const contact = await tx.contact.findFirst({
          where: { id: contactId, businessId },
          select: {
            id: true,
            phone: true,
            identities: {
              where: {
                channel: { in: ["WHATSAPP", "PHONE"] },
              },
              select: { id: true },
              take: 1,
            },
          },
        });

        if (!contact) {
          return { error: "Contact not found." };
        }

        const hasPhoneIdentity = contact.identities.length > 0;

        if (hasPhoneIdentity && phone !== (contact.phone ?? "")) {
          return {
            error:
              "This contact has a linked WhatsApp or phone identity. Its phone number cannot be edited safely.",
          };
        }

        await tx.contact.updateMany({
          where: { id: contactId, businessId },
          data: {
            name: name || null,
            email: email ? email.toLowerCase() : null,
            ...(hasPhoneIdentity ? {} : { phone: phone || null }),
          },
        });

        return { success: "Contact updated successfully." };
      },
      { isolationLevel: "Serializable" },
    );

    if (result.error) return result;

    revalidatePath("/contacts");
    revalidatePath(`/contacts/${contactId}`);

    return { success: result.success };
  } catch (error) {
    console.error("Failed to update contact:", error);
    return { error: "Unable to update this contact. Please try again." };
  }
}

export async function deleteContactAction(
  _previousState: ContactActionState,
  formData: FormData,
): Promise<ContactActionState> {
  const contactId = readString(formData, "contactId");

  if (!contactId) {
    return { error: "Invalid contact." };
  }

  const businessId = await getBusinessId();
  if (!businessId) {
    return { error: "Please sign in and select a business." };
  }

  try {
    const result = await db.$transaction(
      async (tx) => {
        const contact = await tx.contact.findFirst({
          where: { id: contactId, businessId },
          select: {
            id: true,
            _count: {
              select: { leads: true },
            },
          },
        });

        if (!contact) {
          return { error: "Contact not found." };
        }

        if (contact._count.leads > 0) {
          return {
            error: `This contact has ${contact._count.leads} associated lead(s). Delete or reassign those leads before deleting this contact.`,
          };
        }

        await tx.contact.deleteMany({
          where: { id: contactId, businessId },
        });

        return { success: "Contact deleted successfully." };
      },
      { isolationLevel: "Serializable" },
    );

    if (result.error) return result;

    revalidatePath("/contacts");
    revalidatePath(`/contacts/${contactId}`);

    return { success: result.success };
  } catch (error) {
    console.error("Failed to delete contact:", error);
    return {
      error:
        "Unable to delete this contact. It may have been changed by another operation. Please refresh and try again.",
    };
  }
}
