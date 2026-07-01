export function parseTelemetryFlag(raw) {
    if (raw == null) {
        return undefined;
    }
    return raw.trim().toLowerCase() === 'true';
}
