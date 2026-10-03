import { parseAgentDecision } from ".././parse-decision";

const finalDecision = parseAgentDecision({
    type: "FINAL",
    response: "The current time is available.",
});

console.log("FINAL:", finalDecision);

const toolDecision = parseAgentDecision({
    type: "TOOL",
    toolName: "get_current_time",
    input: {},
});

console.log("TOOL:", toolDecision);

try {
    parseAgentDecision({
        type: "SOMETHING_ELSE",
        response: "This should fail",
    });
} catch (error) {
    console.log(
        "INVALID:",
        error instanceof Error ? error.message : error,
    );
}