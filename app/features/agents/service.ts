import type { NormalizedEvent } from "../events/types";
import {
    getOrCreateConversation,
    createMessage,
} from "../conversations/service";
import { findPersistedRunByEvent } from "../runtime/persistence";
import { createAgentRun } from "../runtime/create-run";
import { runAgent } from "../runtime/run-agent";
import { VercelAIProvider } from "../runtime/llm-provider";
import type { Agent } from "./types";
import { DuplicateAgentRunError } from "../runtime/duplicate-run-error";
import { db } from "@/app/lib/db";
import { getOrCreateContact } from "../contacts/service";
import { extractContactProfile } from "../contacts/extraction/service";

export async function processAgentEvent(params: {
    agent: Agent;
    event: NormalizedEvent;
    userId: string;
}) {
    const { agent, event, userId } = params;

    const existingRun = await findPersistedRunByEvent(
        agent.id,
        event.id,
    );

    if (existingRun) {
        return {
            duplicate: true as const,
            conversation: undefined,
            assistantMessageId: null,
            result: undefined,
        };
    }

    const conversation = event.conversation
        ? await getOrCreateConversation({
              agentId: agent.id,
              channel: event.source,
              externalId: event.conversation.id,
          })
        : undefined;

    let contactId: string | undefined;

    if (
        conversation &&
        event.source === "WHATSAPP" &&
        event.actor?.phone
    ) {
        const contact = await getOrCreateContact({
            businessId: agent.businessId,
            channel: event.source,
            externalId: event.actor.phone,
            name: event.actor.name,
        });

        contactId = contact.id;

        await db.conversation.updateMany({
            where: {
                id: conversation.id,
                agentId: agent.id,
            },
            data: {
                contactId: contact.id,
            },
        });
    }

    const runtimeContext = createAgentRun(
        agent,
        event,
        conversation?.id,
    );

    const provider = new VercelAIProvider(agent.model);

    let result;

    try {
        result = await runAgent(
            provider,
            runtimeContext,
            userId,
            async () => {
                if (conversation && event.content?.text) {
                    await createMessage({
                        conversationId: conversation.id,
                        role: "USER",
                        content: event.content.text,
                        externalId: event.id,
                    });
                }
            },
        );
    } catch (error) {
        if (error instanceof DuplicateAgentRunError) {
            return {
                duplicate: true as const,
                conversation: undefined,
                assistantMessageId: null,
                result: undefined,
            };
        }

        throw error;
    }

    if (result.run.status === "FAILED") {
        throw new Error(
            result.run.error ?? "Agent run failed",
        );
    }

    let assistantMessageId: string | null = null;

    if (conversation && result.run.status === "COMPLETED") {
        const finalStep = [...result.steps].reverse().find(
            (step) =>
                step.type === "LLM" &&
                typeof step.output === "object" &&
                step.output !== null &&
                "type" in step.output &&
                step.output.type === "FINAL" &&
                "response" in step.output &&
                typeof step.output.response === "string",
        );

        const output: unknown = finalStep?.output;

        if (
            typeof output === "object" &&
            output !== null &&
            "response" in output &&
            typeof output.response === "string"
        ) {
            const assistantMessage = await createMessage({
                conversationId: conversation.id,
                role: "ASSISTANT",
                content: output.response,
                outboundStatus:
                    event.source === "WHATSAPP"
                        ? "PENDING"
                        : undefined,
            });

            assistantMessageId = assistantMessage.id;
        }
    }

    // Contact extraction is best-effort and must not fail the agent flow.
    if (
        event.source === "WHATSAPP" &&
        conversation &&
        contactId &&
        result.run.status === "COMPLETED"
    ) {
        try {
            const extractionResult = await extractContactProfile({
                businessId: agent.businessId,
                contactId,
                conversationId: conversation.id,
                model: agent.model,
            });

            console.info("[contact-extraction]", {
                contactId,
                conversationId: conversation.id,
                ...extractionResult,
            });
        } catch (error) {
            console.error("[contact-extraction] Failed", {
                contactId,
                conversationId: conversation.id,
                error,
            });
        }
    }

    return {
        duplicate: false as const,
        conversation,
        assistantMessageId,
        result,
    };
}