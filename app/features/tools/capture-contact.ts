
import { z } from "zod";
import type { OptrTool } from "./types";
import { captureVoiceContact } from "@/app/features/contacts/capture-voice-contact";

const captureContactSchema = z
    .object({
        name: z.string().trim().min(1).max(120).optional(),
        phone: z.string().trim().min(1).max(30).optional(),
        email: z.string().trim().min(1).max(254).optional(),
    })
    .refine(
        (input) => Boolean(input.phone || input.email),
        {
            message: "At least a phone number or email address is required.",
        },
    );

type CaptureContactInput = z.infer<typeof captureContactSchema>;

export const captureContactTool: OptrTool<typeof captureContactSchema> = {
    name: "capture_contact",

    description:
        "Capture a customer's contact details during an active voice call. " +
        "Use this after the customer voluntarily provides their name and " +
        "at least one contact identifier: phone number or email address. " +
        "Never invent or assume contact details. Ask for clarification if " +
        "the details are unclear. Phone numbers must use international " +
        "E.164 format. This tool creates or updates a business contact and " +
        "links it to the current conversation. Existing contact information " +
        "is not overwritten. If the tool returns an identity or conversation " +
        "conflict, do not claim the contact was saved; ask the customer to " +
        "confirm their details or offer a human handoff.",

    parameters: captureContactSchema,

    async execute(input: CaptureContactInput, context) {
        if (!context.callId || !context.conversationId) {
            return {
                success: false,
                error: "Contact capture is only available in an active voice conversation.",
            };
        }

        const result = await captureVoiceContact({
            businessId: context.businessId,
            callId: context.callId,
            conversationId: context.conversationId,
            name: input.name,
            phone: input.phone,
            email: input.email,
        });

        return {
            success: true,
            data: result,
        };
    },
};
