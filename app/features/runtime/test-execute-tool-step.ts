import { createAgentRun } from "./create-run";
import { startAgentRun } from "./state";
import { executeToolStep } from "./execute-tool-step";
import type { Agent } from "../agents/types";

async function main() {
    const agent: Agent = {
        id: "agent-001",
        name: "Test Agent",
        description: "Agent for testing the runtime",
        instructions: "Help the user with their request.",
        model: "gemini-2.5-flash",
        isActive: true,
        tools: [
            {
                name: "get_current_time",
                enabled: true,
            },
        ],
    };

    const initialContext = createAgentRun(agent);

    const runningRun = startAgentRun(initialContext.run);

    let runtimeContext = {
        ...initialContext,
        run: runningRun,
    };

    const allowedContext = await executeToolStep(
        runtimeContext,
        "get_current_time",
        {},
        {
            agentId: agent.id,
            userId: "test-user",
            runId: runningRun.id,
        },
    );

    console.log("Allowed tool:");
    console.log("Step count:", allowedContext.run.stepCount);
    console.log(
        "Result:",
        allowedContext.steps[0]?.toolResult,
    );

    try {
        await executeToolStep(
            allowedContext,
            "unknown_tool",
            {},
            {
                agentId: agent.id,
                userId: "test-user",
                runId: runningRun.id,
            },
        );
    } catch (error) {
        console.log("\nDenied tool:");

        console.log(
            error instanceof Error
                ? error.message
                : error,
        );
    }
}

main();