import { executeTool } from "./execute";

async function main() {
    const result = await executeTool(
        "get_current_time",
        {},
        {
            agentId: "test-agent",
            businessId: "test-business",
            userId: "test-user",
            runId: "test-run",
        },
    );

    console.log(result);
}

main();