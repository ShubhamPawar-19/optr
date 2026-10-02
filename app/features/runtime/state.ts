import type { AgentRun } from "./types";

export function startAgentRun(run: AgentRun): AgentRun {
    if (run.status !== "PENDING") {
        throw new Error(
            `Cannot start run with status "${run.status}"`,
        );
    }

    return {
        ...run,
        status: "RUNNING",
    };
}

export function completeAgentRun(run: AgentRun): AgentRun {
    if (run.status !== "RUNNING") {
        throw new Error(
            `Cannot complete run with status "${run.status}"`,
        );
    }

    return {
        ...run,
        status: "COMPLETED",
        completedAt: new Date(),
    };
}

export function failAgentRun(
    run: AgentRun,
    error: string,
): AgentRun {
    if (run.status !== "RUNNING") {
        throw new Error(
            `Cannot fail run with status "${run.status}"`,
        );
    }

    return {
        ...run,
        status: "FAILED",
        completedAt: new Date(),
        error,
    };
}