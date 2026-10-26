
export type OutboundRecoveryStatus =
    | "PENDING"
    | "SENDING"
    | "UNKNOWN"
    | "SENT"
    | "DELIVERED"
    | "READ"
    | "FAILED";

export type OutboundRecoveryDecision =
    | { action: "ignore" }
    | { action: "investigate"; reason: "stale-sending" | "uncertain-outcome" };

const DEFAULT_STALE_AFTER_MS = 5 * 60 * 1000;

export function decideOutboundRecovery(params: {
    status: OutboundRecoveryStatus;
    createdAt: Date;
    now: Date;
    staleAfterMs?: number;
}): OutboundRecoveryDecision {
    const staleAfterMs = params.staleAfterMs ?? DEFAULT_STALE_AFTER_MS;

    if (
        !Number.isFinite(params.now.getTime()) ||
        !Number.isFinite(params.createdAt.getTime()) ||
        !Number.isFinite(staleAfterMs) ||
        staleAfterMs < 0
    ) {
        return { action: "ignore" };
    }

    const ageMs = params.now.getTime() - params.createdAt.getTime();

    if (ageMs < staleAfterMs) {
        return { action: "ignore" };
    }

    if (params.status === "SENDING") {
        return { action: "investigate", reason: "stale-sending" };
    }

    if (params.status === "UNKNOWN") {
        return { action: "investigate", reason: "uncertain-outcome" };
    }

    return { action: "ignore" };
}
