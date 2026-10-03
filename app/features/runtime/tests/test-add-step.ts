import { addAgentStep } from "../add-step";
import { createAgentRun } from "../create-run";
import { startAgentRun } from "../state";
import type { Agent } from "../../agents/types";

const agent: Agent = {
    id: "agent-001",
    name: "Test Agent",
    description: "Agent for testing the runtime",
    instructions: "Help the user with their request.",
    model: "gemini-2.5-flash",
    isActive: true,
    tools: [],
};

const context = createAgentRun(agent);

const runningRun = startAgentRun(context.run);

let runtimeContext = {
    ...context,
    run: runningRun,
};

runtimeContext = addAgentStep(runtimeContext, {
    id: crypto.randomUUID(),
    runId: runningRun.id,
    type: "TOOL",
    toolName: "get_current_time",
    input: {},
    output: {
        iso: new Date().toISOString(),
    },
    createdAt: new Date(),
});

console.log("Run status:", runtimeContext.run.status);
console.log("Step count:", runtimeContext.run.stepCount);
console.log("Steps:", runtimeContext.steps);