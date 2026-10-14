
import type { NormalizedEvent } from "../events/types";
import { getOrCreateConversation, createMessage } from "../conversations/service";
import {
    findPersistedRunByEvent,
} from "../runtime/persistence";
import { createAgentRun } from "../runtime/create-run";
import { runAgent } from "../runtime/run-agent";
import { VercelAIProvider } from "../runtime/llm-provider";
import type { Agent } from "./types";
import { DuplicateAgentRunError } from "../runtime/duplicate-run-error";

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
                result: undefined,
            };
        }

        throw error;
    }

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

        if (
            finalStep &&
            typeof finalStep.output === "object" &&
            finalStep.output !== null &&
            "response" in finalStep.output &&
            typeof finalStep.output.response === "string"
        ) {
            await createMessage({
                conversationId: conversation.id,
                role: "ASSISTANT",
                content: finalStep.output.response,
            });
        }
    }

    return {
        duplicate: false as const,
        conversation,
        result,
    };
}
