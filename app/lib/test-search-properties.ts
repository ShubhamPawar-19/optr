import { searchPropertiesTool } from "../features/tools/search-properties";

async function main() {
    const result = await searchPropertiesTool.execute(
        {
            city: "Dubai",
            bedrooms: 2,
        },
        {
            agentId: "test-agent",
            userId: "test-user",
            runId: "test-run",
        },
    );

    console.dir(result, { depth: null });
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});