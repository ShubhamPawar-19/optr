import type { LLMProvider } from "./llm";
import { decideNextAction } from "./decide";
import { addAgentStep } from "./add-step";
import {
    createPersistedEvent,
    createPersistedRun,
    createPersistedStep,
    updatePersistedRun,
} from "./persistence";
import {
    completeAgentRun,
    failAgentRun,
    startAgentRun,
} from "./state";
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
    if (context.event) {
        await createPersistedEvent(context.event);
    }

    await createPersistedRun(context.run);

    try {
        while (context.run.stepCount < MAX_STEPS) {
            const decision = await decideNextAction(
    provider,
    context,
    userId,
);

            const decisionStep = {
                id: crypto.randomUUID(),
                runId: context.run.id,
                type: "LLM" as const,
                input: context.event,
                output: decision,
                createdAt: new Date(),
            };

            context = addAgentStep(
                context,
                decisionStep,
            );

            await createPersistedStep(decisionStep);

            if (decision.type === "FINAL") {
                context = {
                    ...context,
                    run: completeAgentRun(
                        context.run,
                    ),
                };

                await updatePersistedRun(
                    context.run,
                );

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

            const previousStepCount =
                context.steps.length;

            context = await executeToolStep(
                context,
                decision.toolName,
                decision.input,
                toolContext,
            );

            const newStep =
                context.steps[previousStepCount];

            await createPersistedStep(newStep);

            await updatePersistedRun(
                context.run,
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

        context = {
            ...context,
            run: failAgentRun(
                context.run,
                message,
            ),
        };

        await updatePersistedRun(
            context.run,
        );

        return context;
    }
}