
type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
    return (
        typeof value === "object" &&
        value !== null &&
        !Array.isArray(value)
    );
}

function parseObject(value: unknown): UnknownRecord | null {
    if (typeof value === "string") {
        try {
            const parsed: unknown = JSON.parse(value);
            return isRecord(parsed) ? parsed : null;
        } catch {
            return null;
        }
    }

    return isRecord(value) ? value : null;
}

function stableJson(value: unknown): string {
    if (Array.isArray(value)) {
        return `[${value.map(stableJson).join(",")}]`;
    }

    if (isRecord(value)) {
        const entries = Object.entries(value).sort(([a], [b]) =>
            a.localeCompare(b),
        );

        return `{${entries
            .map(
                ([key, item]) =>
                    `${JSON.stringify(key)}:${stableJson(item)}`,
            )
            .join(",")}}`;
    }

    return JSON.stringify(value) ?? "undefined";
}

export function resolveRetellToolInvocationId(params: {
    call: UnknownRecord;
    toolName: string;
    args: UnknownRecord;
}): string | null {
    const { call, toolName, args } = params;

    const transcript = call.transcript_with_tool_calls;

    if (!Array.isArray(transcript)) {
        return null;
    }

    // Search backwards for the latest matching invocation.
    for (let i = transcript.length - 1; i >= 0; i--) {
        const entry = transcript[i];

        if (
            !isRecord(entry) ||
            entry.role !== "tool_call_invocation"
        ) {
            continue;
        }

        if (entry.name !== toolName) {
            continue;
        }

        const invocationId = entry.tool_call_id;
        const invocationArgs = parseObject(entry.arguments);

        if (
            typeof invocationId !== "string" ||
            !invocationId.trim() ||
            !invocationArgs
        ) {
            continue;
        }

        if (stableJson(invocationArgs) !== stableJson(args)) {
            continue;
        }

        return invocationId;
    }

    return null;
}
