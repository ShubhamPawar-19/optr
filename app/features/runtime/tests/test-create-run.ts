import { Agent } from "../../agents/types";
import { createAgentRun } from "../create-run";

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

console.log("Agent:", context.agent.name);
console.log("Run ID:", context.run.id);
console.log("Status:", context.run.status);
console.log("Step count:", context.run.stepCount);
console.log("Steps:", context.steps);