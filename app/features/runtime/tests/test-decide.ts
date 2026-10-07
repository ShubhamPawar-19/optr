import "dotenv/config";

import { decideNextAction } from "../decide";
import { VercelAIProvider } from "../llm-provider";
import type { Agent } from "../../agents/types";
import { createAgentRun } from "../create-run";

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

When a user asks about properties,
use the search_properties tool.

Never invent properties.
Only use properties returned by the tool.
`,

        model,

        temperature: 0,

        isActive: true,

        tools: [
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
            text: "I am looking for a 2 bedroom apartment in Dubai under AED 1.5 million.",
        },

        metadata: {},
    });

    const userId = "test-user";

    const decision = await decideNextAction(
        provider,
        context,
        userId,
    );

    console.log("Agent decision:");
    console.dir(decision, { depth: null });
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});