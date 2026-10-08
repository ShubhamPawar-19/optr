import type { NormalizedEvent } from "../events/types";
import { createAgentRun } from "../runtime/create-run";
import { runAgent } from "../runtime/run-agent";
import { VercelAIProvider } from "../runtime/llm-provider";
import {
    getOrCreateConversation,
    createMessage,
} from "../conversations/service";
import type { Agent } from "./types";

export async function processAgentEvent(params: {
    agent: Agent;
    event: NormalizedEvent;
    userId: string;
}) {
    const {
        agent,
        event,
        userId,
    } = params;

    const conversation = event.conversation
        ? await getOrCreateConversation({
              agentId: agent.id,
              channel: event.source,
              externalId: event.conversation.id,
          })
        : undefined;

    if (conversation && event.content?.text) {
        await createMessage({
            conversationId: conversation.id,
            role: "USER",
            content: event.content.text,
            externalId: event.id,
        });
    }

    const runtimeContext = createAgentRun(
        agent,
        event,
        conversation?.id,
    );

    const provider = new VercelAIProvider(
        agent.model,
    );

    const result = await runAgent(
        provider,
        runtimeContext,
        userId,
    );

    if (
        conversation &&
        result.run.status === "COMPLETED"
    ) {
        const finalStep = [...result.steps]
            .reverse()
            .find(
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
        conversation,
        result,
    };
}