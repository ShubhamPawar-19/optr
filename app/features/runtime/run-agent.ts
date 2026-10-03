import type { LLMProvider } from "./llm";
import { decideNextAction } from "./decide";
import { addAgentStep } from "./add-step";
import { completeAgentRun, failAgentRun, startAgentRun } from "./state";
import { executeToolStep } from "./execute-tool-step";
import type { RuntimeContext } from "./types";

const MAX_STEPS = 10;

export async function runAgent(
    provider: LLMProvider,
    initialContext: RuntimeContext,
    userId: string,
): Promise<RuntimeContext> {
    let context = {
        ...initialContext,
        run: startAgentRun(initialContext.run),
    };

    try {
        while (context.run.stepCount < MAX_STEPS) {
            const decision = await decideNextAction(
                provider,
                context,
            );

            if (decision.type === "FINAL") {
                context = addAgentStep(context, {
                    id: crypto.randomUUID(),
                    runId: context.run.id,
                    type: "LLM",
                    input: context.event,
                    output: decision.response,
                    createdAt: new Date(),
                });

                context = {
                    ...context,
                    run: completeAgentRun(context.run),
                };

                return context;
            }

            const toolContext = {
                agentId: context.agent.id,
                userId,
                runId: context.run.id,
                event: context.event
                    ? {
                          id: context.event.id,
                      }
                    : undefined,
            };

            context = await executeToolStep(
                context,
                decision.toolName,
                decision.input,
                toolContext,
            );
        }

        throw new Error(
            `Agent exceeded maximum step limit of ${MAX_STEPS}`,
        );
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : "Unknown agent runtime error";

        return {
            ...context,
            run: failAgentRun(
                context.run,
                message,
            ),
        };
    }
}