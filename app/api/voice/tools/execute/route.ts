
import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";

import { resolveRetellToolInvocationId } from "@/app/features/voice/providers/retell-tool-invocation";
import { executeVoiceTool } from "@/app/features/voice/services/execute-voice-tool";
import {
    readLimitedBody,
    RequestBodyTooLargeError,
} from "@/app/features/voice/providers/read-limited-body";

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

function verifyVoiceToolSecret(request: NextRequest): boolean {
    const expectedSecret = process.env.OPTR_VOICE_TOOL_SECRET;
    const providedSecret = request.headers.get("x-optr-voice-secret");

    if (!expectedSecret || !providedSecret) {
        return false;
    }

    const expected = Buffer.from(expectedSecret, "utf8");
    const provided = Buffer.from(providedSecret, "utf8");

    if (expected.length !== provided.length) {
        return false;
    }

    return timingSafeEqual(expected, provided);
}

export async function POST(request: NextRequest) {
    // 1. Authenticate custom-function request.
    if (!verifyVoiceToolSecret(request)) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 },
        );
    }

    // 2. Read the request body.
    let rawBody: string;

    try {
        rawBody = await readLimitedBody(request, 128 * 1024);
    } catch (error) {
        if (error instanceof RequestBodyTooLargeError) {
            return NextResponse.json(
                { error: "Request body too large" },
                { status: 413 },
            );
        }

        return NextResponse.json(
            { error: "Unable to read request body" },
            { status: 400 },
        );
    }

    if (!rawBody) {
        return NextResponse.json(
            { error: "Invalid request body" },
            { status: 400 },
        );
    }

    // 3. Parse the authenticated request.
    let payload: unknown;

    try {
        payload = JSON.parse(rawBody);
    } catch {
        return NextResponse.json(
            { error: "Invalid JSON payload" },
            { status: 400 },
        );
    }

    if (!isRecord(payload) || !isRecord(payload.call)) {
        return NextResponse.json(
            { error: "Invalid tool request" },
            { status: 400 },
        );
    }

    const toolName = payload.name;
    const args = parseObject(payload.args);
    const providerCallId = payload.call.call_id;

    if (
        typeof toolName !== "string" ||
        !toolName.trim() ||
        !args ||
        typeof providerCallId !== "string" ||
        !providerCallId.trim()
    ) {
        return NextResponse.json(
            { error: "Missing tool request fields" },
            { status: 400 },
        );
    }

    // 4. Resolve the exact invocation from the call transcript.
    const providerToolCallId = resolveRetellToolInvocationId({
        call: payload.call,
        toolName,
        args,
    });

    if (!providerToolCallId) {
        return NextResponse.json(
            { error: "Unable to identify tool invocation" },
            { status: 400 },
        );
    }

    // 5. Execute using OPTR's existing authorization and idempotency.
    try {
        const result = await executeVoiceTool({
            providerCallId,
            providerToolCallId,
            toolName,
            input: args,
        });

        return NextResponse.json(result);
    } catch (error) {
        console.error("[voice-tool] Execution failed", {
            providerCallId,
            toolName,
            error:
                error instanceof Error
                    ? error.message
                    : "Unknown error",
        });

        return NextResponse.json({
            success: false,
            error: "Unable to execute this tool.",
        });
    }
}
