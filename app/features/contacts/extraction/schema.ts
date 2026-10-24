
import { z } from "zod";

export const contactFactSchema = z.object({
    fieldKey: z.string().min(1),
    value: z.string(),
    evidence: z.string().min(1),
});

export const contactExtractionSchema = z.object({
    facts: z.array(contactFactSchema),
});

export type ExtractedContactFact = z.infer<
    typeof contactFactSchema
>;

export type ContactExtraction = z.infer<
    typeof contactExtractionSchema
>;
