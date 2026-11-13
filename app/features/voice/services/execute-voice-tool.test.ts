import assert from "node:assert/strict";
import test from "node:test";

import { createVoiceToolExecutor } from "./execute-voice-tool";
import type { executeTool } from "@/app/features/tools/execute";

type ExecutionStatus = "PENDING" | "RUNNING" | "SUCCEEDED" | "FAILED";

type FakeExecution = {
    id: string;
    callId: string;
    providerToolCallId: string;
    toolName: string;
    status: ExecutionStatus;
    input: Record<string, unknown>;
    output: Record<string, unknown> | null;
    error: string | null;
    startedAt: Date;
    completedAt: Date | null;
};

const callRecord = {
    id: "call-1",
    provider: "RETELL",
    providerCallId: "retell-call-1",
    status: "IN_PROGRESS",
    voiceChannel: {
        provider: "RETELL",
        isActive: true,
        businessId: "business-1",
        agent: {
            id: "agent-1",
            businessId: "business-1",
            name: "Test Agent",
            description: null,
            instructions: "Help customers.",
            model: "test-model",
            temperature: null,
            isActive: true,
        },
    },
};

function createHarness(options?: {
    existingExecution?: Partial<FakeExecution>;
    failSuccessPersistence?: boolean;
}) {
    let execution: FakeExecution | null = options?.existingExecution
        ? {
              id: "execution-1",
              callId: "call-1",
              providerToolCallId: "tool-call-1",
              toolName: "search_data",
              status: "PENDING",
              input: { query: "Marina" },
              output: null,
              error: null,
              startedAt: new Date(),
              completedAt: null,
              ...options.existingExecution,
          }
        : null;

    let toolCalls = 0;

    const database = {
        call: {
            findUnique: async () => callRecord,
        },

        voiceToolExecution: {
            create: async ({ data }: { data: Record<string, unknown> }) => {
                if (execution) {
                    throw { code: "P2002" };
                }

                execution = {
                    id: "execution-1",
                    callId: String(data.callId),
                    providerToolCallId: String(data.providerToolCallId),
                    toolName: String(data.toolName),
                    status: "PENDING",
                    input: data.input as Record<string, unknown>,
                    output: null,
                    error: null,
                    startedAt: new Date(),
                    completedAt: null,
                };

                return execution;
            },

            findUnique: async () => execution,

            updateMany: async ({
                where,
                data,
            }: {
                where: {
                    OR?: Array<Record<string, unknown>>;
                    status?: string;
                };
                data: Record<string, unknown>;
            }) => {
                if (!execution) {
                    return { count: 0 };
                }

                // Claim operation.
                if (where.OR) {
                    const pending = execution.status === "PENDING";

                    const staleRunning =
                        execution.status === "RUNNING" &&
                        where.OR.some((condition) => {
                            if (!("startedAt" in condition)) {
                                return false;
                            }

                            const startedAt = execution!.startedAt;
                            const threshold = (
                                condition.startedAt as {
                                    lt: Date;
                                }
                            ).lt;

                            return startedAt < threshold;
                        });

                    if (!pending && !staleRunning) {
                        return { count: 0 };
                    }

                    Object.assign(execution, data);
                    return { count: 1 };
                }

                // Recovery operation after result persistence failure.
                if (
                    where.status === "RUNNING" &&
                    execution.status === "RUNNING"
                ) {
                    Object.assign(execution, data);
                    return { count: 1 };
                }

                return { count: 0 };
            },

            update: async ({
                data,
            }: {
                data: Record<string, unknown>;
            }) => {
                if (
                    options?.failSuccessPersistence &&
                    data.status === "SUCCEEDED"
                ) {
                    throw new Error("Database persistence failed");
                }

                if (!execution) {
                    throw new Error("Execution not found");
                }

                Object.assign(execution, data);
                return execution;
            },
        },
    };

    const runTool = (async () => {
        toolCalls++;

        return {
            success: true,
            data: {
                records: [{ name: "Marina View" }],
            },
        };
    }) as typeof executeTool;

    const execute = createVoiceToolExecutor({
        database: database as unknown as Parameters<
            typeof createVoiceToolExecutor
        >[0]["database"],
        runTool,
    });

    const params = {
        providerCallId: "retell-call-1",
        providerToolCallId: "tool-call-1",
        toolName: "search_data",
        input: { query: "Marina" },
    };

    return {
        execute,
        params,
        getExecution: () => execution,
        getToolCalls: () => toolCalls,
    };
}

test("executes a new invocation and persists its result", async () => {
    const harness = createHarness();

    const result = await harness.execute(harness.params);

    assert.equal(result.success, true);
    assert.equal(result.duplicate, false);
    assert.equal(harness.getToolCalls(), 1);
    assert.equal(harness.getExecution()?.status, "SUCCEEDED");
    assert.deepEqual(harness.getExecution()?.output, {
        records: [{ name: "Marina View" }],
    });
});

test("returns stored result for a duplicate successful invocation", async () => {
    const harness = createHarness({
        existingExecution: {
            status: "SUCCEEDED",
            output: { records: [{ name: "Previously saved" }] },
        },
    });

    const result = await harness.execute(harness.params);

    assert.equal(result.success, true);
    assert.equal(result.duplicate, true);
    assert.equal(harness.getToolCalls(), 0);
    assert.deepEqual(result.data, {
        records: [{ name: "Previously saved" }],
    });
});

test("rejects invocation ID reuse with different arguments", async () => {
    const harness = createHarness({
        existingExecution: {
            status: "PENDING",
        },
    });
    const params = {
        ...harness.params,
        input: { query: "Different query" },
    };

    await assert.rejects(
        harness.execute(params),
        /reused with different arguments/,
    );

    assert.equal(harness.getToolCalls(), 0);
});

test("recovers a pending execution", async () => {
    const harness = createHarness({
        existingExecution: {
            status: "PENDING",
        },
    });

    const result = await harness.execute(harness.params);

    assert.equal(result.success, true);
    assert.equal(harness.getToolCalls(), 1);
    assert.equal(harness.getExecution()?.status, "SUCCEEDED");
});

test("does not execute an already running invocation", async () => {
    const harness = createHarness({
        existingExecution: {
            status: "RUNNING",
            startedAt: new Date(),
        },
    });

    const result = await harness.execute(harness.params);

    assert.equal(result.success, false);
    assert.equal(result.duplicate, true);
    assert.equal(harness.getToolCalls(), 0);
    assert.equal(harness.getExecution()?.status, "RUNNING");
});

test("persists failed tool execution", async () => {
    const harness = createHarness({
        existingExecution: {
            status: "PENDING",
        },
    });
    const failingRunner = (async () => ({
        success: false,
        error: "Search failed",
    })) as typeof executeTool;

    const execute = createVoiceToolExecutor({
        database: {
            call: {
                findUnique: async () => callRecord,
            },
            voiceToolExecution: {
                ...({
                    create: async () => {
                        throw { code: "P2002" };
                    },
                    findUnique: async () => ({
                        ...harness.getExecution(),
                        status: "PENDING",
                    }),
                    updateMany: async () => ({ count: 1 }),
                    update: async ({ data }: {
                        data: Record<string, unknown>;
                    }) => {
                        Object.assign(harness.getExecution()!, data);
                        return harness.getExecution();
                    },
                }),
            },
        } as unknown as Parameters<
            typeof createVoiceToolExecutor
        >[0]["database"],
        runTool: failingRunner,
    });

    const result = await execute(harness.params);

    assert.equal(result.success, false);
    assert.equal(result.error, "Search failed");
    assert.equal(harness.getExecution()?.status, "FAILED");
});

test("returns retryable when successful result cannot be persisted", async () => {
    const harness = createHarness({
        failSuccessPersistence: true,
    });

    const result = await harness.execute(harness.params);

    assert.equal(result.success, false);
    assert.equal(result.retryable, true);
    assert.equal(harness.getToolCalls(), 1);
    assert.equal(harness.getExecution()?.status, "PENDING");
});


test("prevents concurrent duplicate invocations from executing twice", async () => {
    const harness = createHarness();

    const [first, second] = await Promise.all([
        harness.execute(harness.params),
        harness.execute(harness.params),
    ]);

    assert.equal(harness.getToolCalls(), 1);

    const results = [first, second];

    assert.equal(
        results.filter((result) => result.success).length,
        1,
    );

    assert.equal(
        results.filter(
            (result) =>
                !result.success &&
                result.error === "Tool execution is already in progress",
        ).length,
        1,
    );

    assert.equal(harness.getExecution()?.status, "SUCCEEDED");
});
