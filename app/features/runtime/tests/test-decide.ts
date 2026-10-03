import "dotenv/config";

import { google } from "@ai-sdk/google";

import { decideNextAction } from "./decide";
import { VercelAIProvider } from "./llm-provider";
import type { Agent } from "../agents/types";
import { createAgentRun } from "./create-run";

async function main() {
    const provider = new VercelAIProvider(
        google("gemini-3.8-flash"),
    );

    const agent: Agent = {
        id: "agent-test",

        name: "Test Operator",

        description:
            "A test AI operator for OPTR.",

        instructions:
            "You are a helpful AI operator. Use tools when they are necessary.",

        model: "gemini-3.8-flash",

        temperature: 0,

        isActive: true,

        tools: [
            {
                name: "get_current_time",
                enabled: true,
            },
        ],
    };

    const context = createAgentRun(agent, {
        id: "event-test",

        source: "WEBHOOK",

        type: "TEST",

        occurredAt: new Date(),

        content: {
            type: "TEXT",
            text: "What time is it right now?",
        },

        metadata: {},
    });

    const decision = await decideNextAction(
        provider,
        context,
    );

    console.log("Agent decision:");
    console.dir(decision, { depth: null });
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});