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
import type { AgentDecision } from "./decision";
import { DuplicateAgentRunError } from "./duplicate-run-error";
import { isDuplicateRunError } from "./is-duplicate-run-error";

const MAX_STEPS = 10;

export async function runAgent(
    provider: LLMProvider,
    initialContext: RuntimeContext,
    userId: string,
    onRunClaimed?: () => Promise<void>,
): Promise<RuntimeContext> {
    let context = {
        ...initialContext,
        run: startAgentRun(initialContext.run),
    };

    if (context.event) {
        await createPersistedEvent(context.event);
    }

    try {
        try {
            await createPersistedRun(context.run);
        } catch (error) {
            if (
                context.run.eventId &&
                isDuplicateRunError(error)
            ) {
                throw new DuplicateAgentRunError();
            }

            throw error;
        }

        // Run ownership is established before processing the event.
        await onRunClaimed?.();

        while (context.run.stepCount < MAX_STEPS) {
            const llmStartedAt = Date.now();
            let decision: AgentDecision;

            try {
                decision = await decideNextAction(
                    provider,
                    context,
                    userId,
                );
            } catch (error) {
                const message =
                    error instanceof Error
                        ? error.message
                        : "Unknown LLM execution error";

                const failedStep = {
                    id: crypto.randomUUID(),
                    runId: context.run.id,
                    type: "LLM" as const,
                    status: "FAILED" as const,
                    durationMs: Date.now() - llmStartedAt,
                    error: message,
                    input: context.event,
                    createdAt: new Date(),
                };

                context = addAgentStep(context, failedStep);
                await createPersistedStep(failedStep);

                throw error;
            }

            const decisionStep = {
                id: crypto.randomUUID(),
                runId: context.run.id,
                type: "LLM" as const,
                status: "SUCCEEDED" as const,
                durationMs: Date.now() - llmStartedAt,
                input: context.event,
                output: decision,
                createdAt: new Date(),
            };

            context = addAgentStep(context, decisionStep);
            await createPersistedStep(decisionStep);

            if (decision.type === "FINAL") {
                context = {
                    ...context,
                    run: completeAgentRun(context.run),
                };

                await updatePersistedRun(context.run);

                return context;
            }

            const toolContext = {
                agentId: context.agent.id,
                businessId: context.businessId,
                userId,
                runId: context.run.id,
                event: context.event
                    ? { id: context.event.id }
                    : undefined,
            };

            const previousStepCount = context.steps.length;

            context = await executeToolStep(
                context,
                decision.toolName,
                decision.input,
                toolContext,
            );

            const newStep = context.steps[previousStepCount];

            await createPersistedStep(newStep);
            await updatePersistedRun(context.run);

            if (newStep.status === "FAILED") {
                throw new Error(
                    newStep.error ?? "Tool execution failed",
                );
            }
        }

        throw new Error(
            `Agent exceeded maximum step limit of ${MAX_STEPS}`,
        );
    } catch (error) {
        if (error instanceof DuplicateAgentRunError) {
            throw error;
        }

        const message =
            error instanceof Error
                ? error.message
                : "Unknown agent runtime error";

        context = {
            ...context,
            run: failAgentRun(context.run, message),
        };

        await updatePersistedRun(context.run);

        return context;
    }
}