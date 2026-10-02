import type { AgentStep, RuntimeContext } from "./types";

export function addAgentStep(
    context: RuntimeContext,
    step: AgentStep,
): RuntimeContext {
    if (step.runId !== context.run.id) {
        throw new Error("Step does not belong to this run");
    }

    return {
        ...context,
        steps: [...context.steps, step],
        run: {
            ...context.run,
            stepCount: context.run.stepCount + 1,
        },
    };
}