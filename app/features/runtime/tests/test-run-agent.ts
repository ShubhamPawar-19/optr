import "dotenv/config";

import type { Agent } from "../../agents/types";
import { createAgentRun } from "../create-run";
import { runAgent } from "../run-agent";
import { VercelAIProvider } from "../llm-provider";

async function main() {
    const model =
        process.env.OPENROUTER_MODEL ??
        "openrouter/free";

    const provider = new VercelAIProvider(model);

    const agent: Agent = {
        id: "agent-test",

        name: "Test Operator",
        businessId: "demo-business",
        description:
            "A test AI operator for OPTR.",

        instructions: `
You are a business AI operator.

Your job is to help users find information in the current business's datasets.

Rules:
- When the user asks about information stored in a dataset, use search_data.
- Pass the exact dataset name as datasetName and relevant keywords as query.
- Use returned field definitions to understand the records.
- Never invent records or business information.
- Only provide details supported by returned records.
- If no matching records are found, say so clearly.
- Be concise and helpful.
`,

        model,

        temperature: 0,

        isActive: true,

        tools: [
            { name: "get_current_time", enabled: true },
            { name: "list_datasets", enabled: true },
            { name: "search_data", enabled: true },
        ],
    };

    const context = createAgentRun(agent, {
        id: crypto.randomUUID(),

        source: "WEBHOOK",

        type: "TEST",

        occurredAt: new Date(),

        content: {
            type: "TEXT",
            text: "I am looking for a 2 bedroom apartment in Dubai under AED 1.5 million."
        },

        metadata: {},
    });

    const result = await runAgent(
        provider,
        context,
        "user-test",
    );

    console.log("\n=== OPTR AGENT RUN ===");

    console.log("Status:", result.run.status);

    console.log("Steps:", result.run.stepCount);

    console.log("\nSteps:");

    console.dir(result.steps, {
        depth: null,
    });

    console.log("\nRun:");

    console.dir(result.run, {
        depth: null,
    });
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});