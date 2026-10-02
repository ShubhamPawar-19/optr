import {
    completeAgentRun,
    failAgentRun,
    startAgentRun,
} from "./state";
import { createAgentRun } from "./create-run";
import type { Agent } from "../agents/types";

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

console.log("Initial:", context.run.status);

const runningRun = startAgentRun(context.run);

console.log("Started:", runningRun.status);

const completedRun = completeAgentRun(runningRun);

console.log("Completed:", completedRun.status);
console.log("Completed at:", completedRun.completedAt);

const failedRun = failAgentRun(runningRun, "Example failure");

console.log("Failed:", failedRun.status);
console.log("Error:", failedRun.error);