
"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/app/lib/db";
import { getCurrentBusiness } from "@/app/lib/current-business";
import { encryptWhatsAppToken } from "./encrypt-token";

const connectSchema = z.object({
  phoneNumberId: z
    .string()
    .trim()
    .min(1, "Enter your WhatsApp Phone Number ID")
    .max(100)
    .regex(/^\d+$/, "Phone Number ID must contain only digits"),
  accessToken: z
    .string()
    .trim()
    .min(20, "Enter a valid Meta access token")
    .max(5000),
});

type ActionResult =
  | { success: true; message: string; displayPhoneNumber?: string; verifiedName?: string }
  | { success: false; message: string };

export async function connectWhatsAppChannel(
  formData: FormData,
): Promise<ActionResult> {
  const business = await getCurrentBusiness();

  if (!business) {
    return { success: false, message: "Your business workspace was not found." };
  }

  const parsed = connectSchema.safeParse({
    phoneNumberId: formData.get("phoneNumberId"),
    accessToken: formData.get("accessToken"),
  });

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Check the entered details.",
    };
  }

  const { phoneNumberId, accessToken } = parsed.data;

  try {
    // Validate the supplied token and phone number with Meta before saving.
    const url = new URL(
      `https://graph.facebook.com/v23.0/${encodeURIComponent(phoneNumberId)}`,
    );
    url.searchParams.set("fields", "id,display_phone_number,verified_name");

    const response = await fetch(url, {
      method: "GET",
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
      signal: AbortSignal.timeout(12_000),
    });

    const result: unknown = await response.json().catch(() => null);

    if (!response.ok) {
      return {
        success: false,
        message:
          "Meta could not verify these credentials. Check the Phone Number ID, access token, and WhatsApp permissions.",
      };
    }

    if (
      typeof result !== "object" ||
      result === null ||
      !("id" in result) ||
      result.id !== phoneNumberId
    ) {
      return {
        success: false,
        message: "Meta returned unexpected phone-number details. Nothing was saved.",
      };
    }

    const existing = await db.whatsAppChannel.findUnique({
      where: { phoneNumberId },
      select: { businessId: true },
    });

    if (existing && existing.businessId !== business.id) {
      return {
        success: false,
        message: "This WhatsApp number is already connected to another workspace.",
      };
    }

    const encryptedAccessToken = encryptWhatsAppToken(accessToken);

    if (existing) {
      await db.whatsAppChannel.update({
        where: { phoneNumberId },
        data: { encryptedAccessToken, isActive: true },
      });
    } else {
      await db.whatsAppChannel.create({
        data: {
          businessId: business.id,
          phoneNumberId,
          encryptedAccessToken,
          isActive: true,
        },
      });
    }

    revalidatePath("/integrations/whatsapp");

    const meta = result as {
      display_phone_number?: unknown;
      verified_name?: unknown;
    };

    return {
      success: true,
      message: "WhatsApp was connected successfully.",
      displayPhoneNumber:
        typeof meta.display_phone_number === "string"
          ? meta.display_phone_number
          : undefined,
      verifiedName:
        typeof meta.verified_name === "string"
          ? meta.verified_name
          : undefined,
    };
  } catch (error) {
    console.error("WhatsApp connection failed:", error);

    return {
      success: false,
      message:
        "Could not connect to Meta right now. Check your server configuration and try again.",
    };
  }
}

export async function disconnectWhatsAppChannel(
  phoneNumberId: string,
): Promise<ActionResult> {
  const business = await getCurrentBusiness();

  if (!business) {
    return { success: false, message: "Your business workspace was not found." };
  }

  const parsedId = z.string().regex(/^\d+$/).safeParse(phoneNumberId);

  if (!parsedId.success) {
    return { success: false, message: "Invalid Phone Number ID." };
  }

  const result = await db.whatsAppChannel.updateMany({
    where: {
      businessId: business.id,
      phoneNumberId: parsedId.data,
    },
    data: { isActive: false },
  });

  if (result.count === 0) {
    return {
      success: false,
      message: "The WhatsApp channel was not found in this workspace.",
    };
  }

  revalidatePath("/integrations/whatsapp");

  return { success: true, message: "WhatsApp was disconnected." };
}
