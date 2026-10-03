import { db } from "../../lib/db";

import type { AgentRun, AgentStep } from "./types";

export async function createPersistedRun(
    run: AgentRun,
) {
    return db.agentRun.create({
        data: {
            id: run.id,
            agentId: run.agentId,
            eventId: run.eventId,
            status: run.status,
            stepCount: run.stepCount,
            startedAt: run.startedAt,
            completedAt: run.completedAt,
            error: run.error,
        },
    });
}

export async function createPersistedStep(
    step: AgentStep,
) {
    return db.agentStep.create({
        data: {
            id: step.id,
            runId: step.runId,
            type: step.type,
            input: step.input as never,
            output: step.output as never,
            toolName: step.toolName,
            toolResult: step.toolResult as never,
            createdAt: step.createdAt,
        },
    });
}

export async function updatePersistedRun(
    run: AgentRun,
) {
    return db.agentRun.update({
        where: {
            id: run.id,
        },
        data: {
            status: run.status,
            stepCount: run.stepCount,
            completedAt: run.completedAt,
            error: run.error,
        },
    });
}