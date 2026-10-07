import "dotenv/config";

import { VercelAIProvider } from "../llm-provider";

async function main() {
    const model =
        process.env.OPENROUTER_MODEL ??
        "openrouter/free";

    const provider = new VercelAIProvider(model);

    const response = await provider.generate({
        model,

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