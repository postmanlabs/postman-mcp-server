import type { Notification, RequestMeta } from '@modelcontextprotocol/sdk/types.js';

export interface ProgressReporter {
  /**
   * Report progress with an explicit value. Spec requires the value to be
   * monotonically increasing per progressToken; calls with a smaller value
   * are clamped up to the last reported value.
   */
  report: (progress: number, total?: number, message?: string) => Promise<void>;
  /** Bump progress by 1 and emit a notification. */
  heartbeat: (message?: string) => Promise<void>;
  /** Stop the auto-heartbeat interval. Idempotent. */
  stop: () => void;
}

interface ProgressReporterDeps {
  /** SDK-provided sender that scopes the notification to the inbound request. */
  sendNotification: (notification: Notification) => Promise<void>;
  /** Inbound request metadata; the progressToken (if any) lives here. */
  meta?: RequestMeta;
  /** Optional abort signal — stops auto-heartbeat when the client cancels. */
  signal?: AbortSignal;
}

interface ProgressReporterOptions {
  /** Auto-heartbeat interval in ms. Set to 0 to disable. Default: 10000. */
  intervalMs?: number;
}

const NOOP_REPORTER: ProgressReporter = {
  report: async () => undefined,
  heartbeat: async () => undefined,
  stop: () => undefined,
};

export function createProgressReporter(
  { sendNotification, meta, signal }: ProgressReporterDeps,
  { intervalMs = 10_000 }: ProgressReporterOptions = {}
): ProgressReporter {
  const progressToken = meta?.progressToken;
  if (progressToken === undefined) return NOOP_REPORTER;

  let progress = 0;
  let stopped = false;

  const send = (value: number, total?: number, message?: string) =>
    sendNotification({
      method: 'notifications/progress',
      params: { progressToken, progress: value, total, message },
    });

  const stop = (): void => {
    if (stopped) return;
    stopped = true;
    if (interval) clearInterval(interval);
    if (signal && abortHandler) signal.removeEventListener('abort', abortHandler);
  };

  let interval: NodeJS.Timeout | undefined;
  if (intervalMs > 0) {
    interval = setInterval(() => {
      progress += 1;
      void send(progress, undefined, 'working').catch(() => undefined);
    }, intervalMs);
    interval.unref?.();
  }

  let abortHandler: (() => void) | undefined;
  if (signal) {
    if (signal.aborted) {
      stop();
    } else {
      abortHandler = stop;
      signal.addEventListener('abort', abortHandler, { once: true });
    }
  }

  return {
    report: async (value, total, message) => {
      if (stopped) return;
      progress = Math.max(progress, value);
      await send(progress, total, message);
    },
    heartbeat: async (message) => {
      if (stopped) return;
      progress += 1;
      await send(progress, undefined, message);
    },
    stop,
  };
}
