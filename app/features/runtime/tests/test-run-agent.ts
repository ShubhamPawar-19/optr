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

        description:
            "A test AI operator for OPTR.",

        instructions: `
You are a real estate AI operator.

Your job is to help customers find properties from the available inventory.

Rules:
- When the user asks about properties, ALWAYS use search_properties.
- Never recommend properties from your own knowledge.
- Never invent property listings.
- Only mention properties returned by search_properties.
- If the user provides city, bedrooms, or budget, pass those constraints to search_properties.
- If the search returns no results, say that no matching properties were found.
- Be concise and helpful.
`,

        model,

        temperature: 0,

        isActive: true,

        tools: [
            {
                name: "get_current_time",
                enabled: true,
            },
            {
                name: "search_properties",
                enabled: true,
            },
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