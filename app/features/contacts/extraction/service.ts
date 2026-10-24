
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

        case "NUMBER":
            return Number.isFinite(Number(value))
                ? String(Number(value))
                : null;

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
            // Select options need an explicit options definition.
            // Do not guess which values are allowed.
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

    const messages = await db.message.findMany({
        where: { conversationId },
        orderBy: { createdAt: "asc" },
        select: { role: true, content: true },
    });

    if (messages.length === 0) {
        return { extracted: 0, changed: 0 };
    }

    const existingValues = await db.contactProfileValue.findMany({
        where: { contactId, contactFieldId: { in: fields.map((f) => f.id) } },
        select: { contactFieldId: true, value: true },
    });

    const currentValues = new Map(
        existingValues.map((item) => [
            item.contactFieldId,
            item.value,
        ]),
    );

    const result = await generateObject({
        model: openrouter(model),
        schema: contactExtractionSchema,
        maxOutputTokens: 1000,
        system: `Extract structured facts about the customer from the conversation.

Rules:
- Extract only facts explicitly supported by the conversation.
- Do not infer missing facts or treat assistant suggestions as customer-confirmed facts.
- Use the configured field key exactly.
- Each evidence value must be a short verbatim excerpt from a customer message.
- Do not extract a fact if there is no clear customer-message evidence.
- Return an empty facts array when no reliable facts are present.
- Values must be strings. For dates, use YYYY-MM-DD when explicitly known.
- For boolean fields, use true or false only when the customer clearly confirms the fact.
- For multi-select fields, use a JSON array encoded as a string.
- Existing values are context, not evidence for new facts.
- Do not return a field merely because its existing value is known.`,
        prompt: JSON.stringify({
            fields: fields.map((field) => ({
                key: field.key,
                label: field.label,
                description: field.description,
                type: field.type,
                existingValue: currentValues.get(field.id) ?? null,
            })),
            conversation: messages.map((message) => ({
                role: message.role,
                content: message.content,
            })),
        }),
    });

    const fieldByKey = new Map(
        fields.map((field) => [field.key, field]),
    );

    const changed = await db.$transaction(async (tx) => {
        let changedCount = 0;

        for (const fact of result.object.facts) {
            const field = fieldByKey.get(fact.fieldKey);

            if (!field || !isCustomerEvidence(fact, messages)) {
                continue;
            }

            const value = validateValue(field, fact.value);

            if (value === null) {
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

    return messages.some(
        (message) =>
            message.role === "USER" &&
            message.content.includes(evidence),
    );
}
