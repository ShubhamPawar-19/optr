import { generateObject } from "ai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { db } from "@/app/lib/db";
import {
    contactExtractionSchema,
    type ExtractedContactFact,
} from "./schema";

const openrouter = createOpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY,
});

const MAX_CUSTOMER_MESSAGES = 12;

type ConfiguredField = {
    id: string;
    key: string;
    label: string;
    description: string | null;
    type:
    | "TEXT"
    | "NUMBER"
    | "BOOLEAN"
    | "DATE"
    | "SINGLE_SELECT"
    | "MULTI_SELECT"
    | "URL"
    | "MEDIA";
};

function validateValue(
    field: ConfiguredField,
    rawValue: string,
): string | null {
    const value = rawValue.trim();

    if (!value) return null;

    switch (field.type) {
        case "TEXT":
        case "MEDIA":
            return value;

        case "NUMBER": {
            const number = Number(value);

            return Number.isFinite(number)
                ? String(number)
                : null;
        }

        case "BOOLEAN": {
            const normalized = value.toLowerCase();

            if (["true", "yes"].includes(normalized)) {
                return "true";
            }

            if (["false", "no"].includes(normalized)) {
                return "false";
            }

            return null;
        }

        case "DATE": {
            if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
                return null;
            }

            const date = new Date(`${value}T00:00:00.000Z`);

            return !Number.isNaN(date.getTime()) &&
                date.toISOString().slice(0, 10) === value
                ? value
                : null;
        }

        case "URL": {
            try {
                const url = new URL(value);

                return ["http:", "https:"].includes(url.protocol)
                    ? url.toString()
                    : null;
            } catch {
                return null;
            }
        }

        case "SINGLE_SELECT":
        case "MULTI_SELECT":
            // Do not save select values until configured options
            // are available and validated.
            return null;
    }
}

export async function extractContactProfile(params: {
    businessId: string;
    contactId: string;
    conversationId: string;
    model: string;
}) {
    const { businessId, contactId, conversationId, model } = params;

    const [contact, conversation, fields] = await Promise.all([
        db.contact.findFirst({
            where: { id: contactId, businessId },
            select: { id: true },
        }),
        db.conversation.findUnique({
            where: { id: conversationId },
            select: { id: true, agentId: true },
        }),
        db.contactField.findMany({
            where: { businessId, isActive: true },
            orderBy: { position: "asc" },
            select: {
                id: true,
                key: true,
                label: true,
                description: true,
                type: true,
            },
        }),
    ]);

    if (!contact) {
        throw new Error("Contact not found for this business");
    }

    if (!conversation) {
        throw new Error("Conversation not found");
    }

    const owningAgent = await db.agent.findFirst({
        where: {
            id: conversation.agentId,
            businessId,
        },
        select: { id: true },
    });

    if (!owningAgent) {
        throw new Error("Conversation does not belong to this business");
    }

    if (fields.length === 0) {
        return { extracted: 0, changed: 0 };
    }

    const allMessages = await db.message.findMany({
        where: { conversationId },
        orderBy: { createdAt: "asc" },
        select: { role: true, content: true },
    });

    // Only customer-authored messages can establish customer facts.
    // Keep the most recent messages to control prompt size.
    const customerMessages = allMessages
        .filter((message) => message.role === "USER")
        .slice(-MAX_CUSTOMER_MESSAGES);

    if (customerMessages.length === 0) {
        return { extracted: 0, changed: 0 };
    }

    const existingValues = await db.contactProfileValue.findMany({
        where: {
            contactId,
            contactFieldId: {
                in: fields.map((field) => field.id),
            },
        },
        select: {
            contactFieldId: true,
            value: true,
        },
    });

    const currentValues = new Map(
        existingValues.map((item) => [
            item.contactFieldId,
            item.value,
        ]),
    );

    const extractionModel =
        process.env.OPTR_EXTRACTION_MODEL?.trim() || model;

    const result = await generateObject({
        model: openrouter(extractionModel),
        schema: contactExtractionSchema,
        maxOutputTokens: 4000,
        temperature: 0,
        system: `Extract structured customer profile facts from customer messages.

Return one JSON object matching the supplied schema.

Rules:
- Extract only facts explicitly stated by the customer.
- Do not infer missing facts.
- Do not treat assistant messages, suggestions, or questions as customer-confirmed facts.
- Return the exact configured field key in the "fieldKey" property.
- Never use "key" instead of "fieldKey".
- Preserve the configured field key's spelling and capitalization.
- Each evidence value must be a short, exact excerpt from a customer message.
- Do not invent, paraphrase, or combine evidence from different messages.
- Return an empty facts array if no reliable facts can be extracted.
- Every fact must include a non-empty value and a non-empty evidence excerpt.
- Every value must be a string.
- For NUMBER fields, return the complete normalized numeric value as a string, without currency symbols or separators.
- Normalize quantities expressed in words or abbreviated units. For example, "AED 2.5 million" becomes "2500000", "2 million" becomes "2000000", and "1.75 million" becomes "1750000".
- Never return only the numeric fragment from the evidence when it represents a larger quantity.
- For TEXT fields, return the customer's stated preference as a concise value, preserving its meaning.
- Use evidence as the exact excerpt from the customer's message that supports the extracted value.
- Represent booleans as "true" or "false" only when explicitly confirmed.
- Represent dates as YYYY-MM-DD only when the date is explicitly known.
- For select fields, return only an explicitly stated value; the application may reject values that are not configured.
- Existing values are context only, not evidence for a new fact.
- Do not return a fact solely because it appears in existing values.
- Prefer the customer's latest explicit statement when it clearly updates an earlier value.
- Do not extract appointment times or scheduling intentions unless they match an explicitly configured profile field.
- Do not include explanations outside the structured result.`,
        prompt: JSON.stringify({
            fields: fields.map((field) => ({
                fieldKey: field.key,
                label: field.label,
                description: field.description,
                type: field.type,
                existingValue: currentValues.get(field.id) ?? null,
            })),
            customerMessages: customerMessages.map((message) => ({
                role: "USER",
                content: message.content,
            })),
        }),
    });
    console.dir(
        {
            label: "[OPTR Extraction Debug]",
            configuredFields: fields.map((field) => ({
                key: field.key,
                label: field.label,
                type: field.type,
            })),
            existingValues: fields.map((field) => ({
                key: field.key,
                value: currentValues.get(field.id) ?? null,
            })),
            extractedFacts: result.object.facts,
        },
        { depth: null },
    );
    // Normalize keys for lookup, but retain the actual configured
    // field object and ID for database writes.
    const fieldByKey = new Map(
        fields.map((field) => [
            field.key.trim().toLowerCase(),
            field,
        ]),
    );

    const changed = await db.$transaction(async (tx) => {
        let changedCount = 0;

        for (const fact of result.object.facts) {
            const normalizedKey = fact.fieldKey.trim().toLowerCase();
            const field = fieldByKey.get(normalizedKey);

            if (!field) {
                console.warn("[OPTR Extraction Skipped]", {
                    reason: "FIELD_NOT_FOUND",
                    fieldKey: fact.fieldKey,
                });
                continue;
            }

            if (!isCustomerEvidence(fact, customerMessages)) {
                console.warn("[OPTR Extraction Skipped]", {
                    reason: "EVIDENCE_NOT_FOUND",
                    fieldKey: fact.fieldKey,
                    evidence: fact.evidence,
                });
                continue;
            }

            if (typeof fact.value !== "string" || !fact.value.trim()) {
                continue;
            }

            const value = validateValue(field, fact.value);

            if (value === null) {
                console.warn("[OPTR Extraction Skipped]", {
                    reason: "INVALID_VALUE",
                    fieldKey: fact.fieldKey,
                    fieldType: field.type,
                    extractedValue: fact.value,
                });
                continue;
            }

            const previous = await tx.contactProfileValue.findUnique({
                where: {
                    contactId_contactFieldId: {
                        contactId,
                        contactFieldId: field.id,
                    },
                },
            });

            if (previous?.value === value) {
                continue;
            }

            const profileValue = await tx.contactProfileValue.upsert({
                where: {
                    contactId_contactFieldId: {
                        contactId,
                        contactFieldId: field.id,
                    },
                },
                create: {
                    contactId,
                    contactFieldId: field.id,
                    value,
                    source: "INFERRED",
                    evidence: fact.evidence,
                },
                update: {
                    value,
                    source: "INFERRED",
                    evidence: fact.evidence,
                },
            });

            await tx.contactProfileValueHistory.create({
                data: {
                    contactProfileValueId: profileValue.id,
                    previousValue: previous?.value ?? null,
                    newValue: value,
                    source: "INFERRED",
                    evidence: fact.evidence,
                },
            });

            changedCount++;
        }

        return changedCount;
    });

    return {
        extracted: result.object.facts.length,
        changed,
    };
}

function isCustomerEvidence(
    fact: ExtractedContactFact,
    messages: { role: string; content: string }[],
): boolean {
    const evidence = fact.evidence.trim();

    if (!evidence) {
        return false;
    }

    return messages.some(
        (message) =>
            message.role === "USER" &&
            message.content.includes(evidence),
    );
}
