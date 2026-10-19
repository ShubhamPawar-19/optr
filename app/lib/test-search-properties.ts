
import { searchDataTool } from "../features/tools/search-data";

async function main() {
    const result = await searchDataTool.execute(
        {
            datasetName: "Properties",
            query: "",
            filters: [],
            limit: 10,
        },
        {
            agentId: "test-agent",
            businessId: "demo-business",
            userId: "test-user",
            runId: "test-run",
        },
    );

    console.dir(result, { depth: null });
}

main()
    .catch((error) => {
        console.error(error);
        process.exitCode = 1;
    });
