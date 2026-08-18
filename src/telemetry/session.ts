import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { randomUUID, createHash } from 'node:crypto';

/**
 * Options for constructing a TelemetrySession.
 *
 * A TelemetrySession represents the identity + metadata of ONE logical MCP
 * session. In stdio mode there is one per process; in HTTP mode there is
 * one per Mcp-Session-Id minted by the dispatcher.
 */
export interface TelemetrySessionOptions {
  /** Anonymous install identifier. Per-process for stdio (FS-persisted),
   *  per-MCP-session for HTTP (freshly generated). Caller supplies it. */
  installId: string;

  /** MCP protocol session id from the `Mcp-Session-Id` header. Undefined for
   *  stdio. Used as the Redis key for cross-pod hydration in HTTP mode. */
  mcpSessionId?: string;

  /** Telemetry session id (the value emitted as `session_id` in events).
   *  Defaults to a fresh UUID; pass explicitly to keep it stable when
   *  reconstructing a TelemetrySession from Redis on another pod. */
  sessionId?: string;

  region: 'us' | 'eu';
  transport: 'stdio' | 'http' | 'sse';
  toolset: 'full' | 'minimal' | 'code' | 'learn';
  serverVersion: string;

  clientName?: string;
  clientVersion?: string;
  protocolVersion?: string;
  /** Keys of the client-advertised capabilities object from the MCP
   *  `initialize` request. Pre-extracted to keys so the snapshot is small
   *  and `session_init` can emit it without re-deriving. */
  clientCapabilities?: string[];
  toolsetSnapshotId?: string;
  toolListCount?: number;
}

/** Gap threshold (ms) for generating a new trace_id. */
const TRACE_GAP_MS = 30_000;

/**
 * Plain-object serialization of a TelemetrySession. Stable enough to be
 * round-tripped through Redis JSON without losing semantics.
 *
 * `traceId` / `lastToolCallTime` are intentionally omitted: trace state
 * is local to whichever pod is currently serving the session — re-deriving
 * a new trace on cross-pod hydration is acceptable (a 30s-gap heuristic
 * was always best-effort).
 */
export interface SerializedTelemetrySession {
  installId: string;
  mcpSessionId: string | undefined;
  sessionId: string;
  region: 'us' | 'eu';
  transport: 'stdio' | 'http' | 'sse';
  toolset: 'full' | 'minimal' | 'code' | 'learn';
  serverVersion: string;
  clientName: string;
  clientVersion: string;
  protocolVersion: string;
  clientCapabilities: string[];
  toolsetSnapshotId: string;
  toolListCount: number;
}

/**
 * Identity + metadata for ONE logical MCP session. Owned by the dispatcher
 * per Mcp-Session-Id in HTTP mode, or by the process in stdio mode. The
 * TelemetryClient consumes one of these per emitted event.
 */
export class TelemetrySession {
  readonly installId: string;
  readonly mcpSessionId: string | undefined;
  readonly sessionId: string;
  readonly region: 'us' | 'eu';
  readonly transport: 'stdio' | 'http' | 'sse';
  readonly toolset: 'full' | 'minimal' | 'code' | 'learn';
  readonly serverVersion: string;

  clientName: string;
  clientVersion: string;
  protocolVersion: string;
  clientCapabilities: string[];
  toolsetSnapshotId: string;
  toolListCount: number;

  private traceId: string | undefined;
  private lastToolCallTime = 0;

  constructor(options: TelemetrySessionOptions) {
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

  /**
   * Returns a trace identifier for grouping related tool calls.
   *
   * If a conversationId is provided (Phase 2 _meta), it is returned directly.
   * Otherwise, applies a 30-second gap heuristic: a new UUID is generated
   * when no existing trace exists or more than 30 seconds have elapsed since
   * the last call.
   */
  getTraceId(conversationId?: string): string {
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

  /** Stores client metadata received during the MCP initialize handshake. */
  setClientInfo(
    clientInfo: { name: string; version: string },
    protocolVersion: string,
  ): void {
    this.clientName = clientInfo.name;
    this.clientVersion = clientInfo.version;
    this.protocolVersion = protocolVersion;
  }

  /**
   * Stores the client-advertised capabilities from the MCP initialize
   * request. Accepts the raw `capabilities` object as the client sent it
   * (a plain record of feature flags) and stores the keys — that's all the
   * `session_init` event needs and it keeps the snapshot small.
   */
  setClientCapabilities(capabilities: Record<string, unknown> | undefined): void {
    this.clientCapabilities = Object.keys(capabilities ?? {});
  }

  /**
   * Computes a toolset snapshot from the list of enabled tool names.
   * Sets toolListCount and generates a deterministic toolsetSnapshotId
   * (first 12 hex chars of SHA-256 over sorted, comma-joined names).
   */
  setToolNames(toolNames: string[]): void {
    this.toolListCount = toolNames.length;
    const sorted = [...toolNames].sort();
    const hash = createHash('sha256')
      .update(sorted.join(','))
      .digest('hex');
    this.toolsetSnapshotId = hash.substring(0, 12);
  }

  /** Returns the number of tools in the current toolset. */
  getToolListCount(): number {
    return this.toolListCount;
  }

  /** Snapshot of the session as a plain object suitable for JSON / Redis. */
  serialize(): SerializedTelemetrySession {
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

  /** Reconstruct a TelemetrySession from a serialized snapshot. */
  static fromSerialized(snapshot: SerializedTelemetrySession): TelemetrySession {
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

  /**
   * Reads (or creates) the persistent install id at `~/.postman/mcp-telemetry-id`.
   * Used by stdio mode where install identity is per-process across runs.
   * HTTP mode does NOT call this — it generates a fresh installId per MCP session.
   *
   * Best-effort: failures fall back to an ephemeral UUID.
   */
  static loadOrCreateInstallIdFromDisk(): string {
    const dir = join(homedir(), '.postman');
    const filePath = join(dir, 'mcp-telemetry-id');

    try {
      const existing = readFileSync(filePath, 'utf-8');
      return existing.trim();
    } catch {
      // File doesn't exist or isn't readable — generate a new one.
    }

    const newId = randomUUID();

    try {
      mkdirSync(dir, { recursive: true });
      writeFileSync(filePath, newId, 'utf-8');
    } catch {
      // Best-effort — telemetry still works with an ephemeral ID.
    }

    return newId;
  }
}
