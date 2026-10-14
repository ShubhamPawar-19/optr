export function parseWhatsAppTimestamp(
    value: unknown,
): string | null {
    if (typeof value !== "string" || value.trim() === "") {
        return null;
    }

    const seconds = Number(value);

    if (
        !Number.isFinite(seconds) ||
        seconds <= 0 ||
        !Number.isFinite(seconds * 1000)
    ) {
        return null;
    }

    const milliseconds = seconds * 1000;
    const date = new Date(milliseconds);

    if (!Number.isFinite(date.getTime())) {
        return null;
    }

    return date.toISOString();
}
