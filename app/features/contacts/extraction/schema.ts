
import { z } from "zod";

export const contactFactSchema = z
    .object({
        fieldKey: z.string().min(1).optional(),
        key: z.string().min(1).optional(),
        value: z.string().optional(),
        evidence: z.string().min(1),
    })
    .transform((fact, ctx) => {
        const fieldKey = fact.fieldKey?.trim() || fact.key?.trim();

        if (!fieldKey) {
            ctx.addIssue({
                code: "custom",
                message: "Either fieldKey or key must be provided",
                path: ["fieldKey"],
            });

            return z.NEVER;
        }

        return {
            fieldKey,
            value: fact.value,
            evidence: fact.evidence,
        };
    });

const rawContactExtractionSchema = z.object({
    facts: z.array(contactFactSchema).optional(),
    fields: z.array(contactFactSchema).optional(),
});

export const contactExtractionSchema =
    rawContactExtractionSchema.transform((result) => ({
        facts: result.facts ?? result.fields ?? [],
    }));

export type ExtractedContactFact = z.infer<
    typeof contactFactSchema
>;

export type ContactExtraction = z.infer<
    typeof contactExtractionSchema
>;
