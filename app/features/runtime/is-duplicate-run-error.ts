export function isDuplicateRunError(error: unknown): boolean {
    if (
        typeof error !== "object" ||
        error === null ||
        !("code" in error) ||
        error.code !== "P2002" ||
        !("meta" in error) ||
        typeof error.meta !== "object" ||
        error.meta === null ||
        !("target" in error.meta)
    ) {
        return false;
    }

    const target = error.meta.target;

    if (Array.isArray(target)) {
        return (
            target.includes("agentId") &&
            target.includes("eventId")
        );
    }

    return (
        typeof target === "string" &&
        target.includes("AgentRun_agentId_eventId_key")
    );
}