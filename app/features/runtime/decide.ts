import { getAllTools } from "../tools/registry";
import type { LLMProvider } from "./llm";
import { parseAgentDecision } from "./parse-decision";
import type { RuntimeContext } from "./types";

function buildDecisionPrompt(context: RuntimeContext): string {
    const availableTools = getAllTools()
        .filter((tool) =>
            context.agent.tools.some(
                (config) =>
                    config.name === tool.name &&
                    config.enabled,
            ),
        )
        .map(
            (tool) =>
                `- ${tool.name}: ${tool.description}\nParameters: ${JSON.stringify(
                    tool.parameters,
                )}`,
        )
        .join("\n\n");

    const event = context.event
        ? JSON.stringify(context.event, null, 2)
        : "No event.";

    const previousSteps =
        context.steps.length > 0
            ? JSON.stringify(
                  context.steps.map((step) => ({
                      type: step.type,
                      toolName: step.toolName,
                      input: step.input,
                      output: step.output,
                      toolResult: step.toolResult,
                  })),
                  null,
                  2,
              )
            : "No previous steps.";

    return `
You are an AI operator.

Your job is to decide the next action required to accomplish the user's task.

You can either:

1. Return a FINAL response when the task is complete.
2. Use one of the available tools when more information or an action is required.

AVAILABLE TOOLS:
${availableTools || "No tools available."}

CURRENT EVENT:
${event}

PREVIOUS STEPS:
${previousSteps}

Return ONLY valid JSON.

For a final response:
{
  "type": "FINAL",
  "response": "your response"
}

For a tool call:
{
  "type": "TOOL",
  "toolName": "tool_name",
  "input": {}
}

Do not return markdown.
Do not wrap the JSON in backticks.
Do not include any explanation outside the JSON.
`;
}

export async function decideNextAction(
    provider: LLMProvider,
    context: RuntimeContext,
) {
    const response = await provider.generate({
        model: context.agent.model,

        system: context.agent.instructions,

        messages: [
            {
                role: "user",
                content: buildDecisionPrompt(context),
            },
        ],
    });

    let parsedResponse: unknown;

    try {
        parsedResponse = JSON.parse(response.content);
    } catch {
        throw new Error(
            "LLM returned invalid JSON for agent decision",
        );
    }

    return parseAgentDecision(parsedResponse);
}