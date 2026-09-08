import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { randomUUID, createHash } from 'node:crypto';
const TRACE_GAP_MS = 30_000;
export class TelemetrySession {
    installId;
    mcpSessionId;
    sessionId;
    region;
    transport;
    toolset;
    serverVersion;
    clientName;
    clientVersion;
    protocolVersion;
    clientCapabilities;
    toolsetSnapshotId;
    toolListCount;
    traceId;
    lastToolCallTime = 0;
    constructor(options) {
        this.installId = options.installId;
        this.mcpSessionId = options.mcpSessionId;
        this.sessionId = options.sessionId ?? randomUUID();
        this.region = options.region;
        this.transport = options.transport;
        this.toolset = options.toolset;
        this.serverVersion = options.serverVersion;
        this.clientName = options.clientName ?? '';
        this.clientVersion = options.clientVersion ?? '';
        this.protocolVersion = options.protocolVersion ?? '';
        this.clientCapabilities = options.clientCapabilities ?? [];
        this.toolsetSnapshotId = options.toolsetSnapshotId ?? '';
        this.toolListCount = options.toolListCount ?? 0;
    }
    getTraceId(conversationId) {
        if (conversationId) {
            return conversationId;
        }
        const now = Date.now();
        if (!this.traceId || now - this.lastToolCallTime > TRACE_GAP_MS) {
            this.traceId = randomUUID();
        }
        this.lastToolCallTime = now;
        return this.traceId;
    }
    setClientInfo(clientInfo, protocolVersion) {
        this.clientName = clientInfo.name;
        this.clientVersion = clientInfo.version;
        this.protocolVersion = protocolVersion;
    }
    setClientCapabilities(capabilities) {
        this.clientCapabilities = Object.keys(capabilities ?? {});
    }
    setToolNames(toolNames) {
        this.toolListCount = toolNames.length;
        const sorted = [...toolNames].sort();
        const hash = createHash('sha256').update(sorted.join(',')).digest('hex');
        this.toolsetSnapshotId = hash.substring(0, 12);
    }
    getToolListCount() {
        return this.toolListCount;
    }
    serialize() {
        return {
            installId: this.installId,
            mcpSessionId: this.mcpSessionId,
            sessionId: this.sessionId,
            region: this.region,
            transport: this.transport,
            toolset: this.toolset,
            serverVersion: this.serverVersion,
            clientName: this.clientName,
            clientVersion: this.clientVersion,
            protocolVersion: this.protocolVersion,
            clientCapabilities: this.clientCapabilities,
            toolsetSnapshotId: this.toolsetSnapshotId,
            toolListCount: this.toolListCount,
        };
    }
    static fromSerialized(snapshot) {
        return new TelemetrySession({
            installId: snapshot.installId,
            mcpSessionId: snapshot.mcpSessionId,
            sessionId: snapshot.sessionId,
            region: snapshot.region,
            transport: snapshot.transport,
            toolset: snapshot.toolset,
            serverVersion: snapshot.serverVersion,
            clientName: snapshot.clientName,
            clientVersion: snapshot.clientVersion,
            protocolVersion: snapshot.protocolVersion,
            clientCapabilities: snapshot.clientCapabilities ?? [],
            toolsetSnapshotId: snapshot.toolsetSnapshotId,
            toolListCount: snapshot.toolListCount,
        });
    }
    static loadOrCreateInstallIdFromDisk() {
        const dir = join(homedir(), '.postman');
        const filePath = join(dir, 'mcp-telemetry-id');
        try {
            const existing = readFileSync(filePath, 'utf-8');
            return existing.trim();
        }
        catch {
        }
        const newId = randomUUID();
        try {
            mkdirSync(dir, { recursive: true });
            writeFileSync(filePath, newId, 'utf-8');
        }
        catch {
        }
        return newId;
    }
}
