import "dotenv/config";

import { google } from "@ai-sdk/google";

import { VercelAIProvider } from "./llm-provider";

async function main() {
    const provider = new VercelAIProvider(
        google("gemini-3.8-flash"),
    );

    const response = await provider.generate({
        model: "gemini-3.8-flash",

        system: "You are an AI operator.",

        messages: [
            {
                role: "user",
                content: "Say hello in one sentence.",
            },
        ],
    });

    console.log("LLM response:", response);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});