const NOOP_REPORTER = {
    report: async () => undefined,
    heartbeat: async () => undefined,
    stop: () => undefined,
};
export function createProgressReporter({ sendNotification, meta, signal }, { intervalMs = 10_000 } = {}) {
    const progressToken = meta?.progressToken;
    if (progressToken === undefined)
        return NOOP_REPORTER;
    let progress = 0;
    let stopped = false;
    const send = (value, total, message) => sendNotification({
        method: 'notifications/progress',
        params: { progressToken, progress: value, total, message },
    });
    const stop = () => {
        if (stopped)
            return;
        stopped = true;
        if (interval)
            clearInterval(interval);
        if (signal && abortHandler)
            signal.removeEventListener('abort', abortHandler);
    };
    let interval;
    if (intervalMs > 0) {
        interval = setInterval(() => {
            progress += 1;
            void send(progress, undefined, 'working').catch(() => undefined);
        }, intervalMs);
        interval.unref?.();
    }
    let abortHandler;
    if (signal) {
        if (signal.aborted) {
            stop();
        }
        else {
            abortHandler = stop;
            signal.addEventListener('abort', abortHandler, { once: true });
        }
    }
    return {
        report: async (value, total, message) => {
            if (stopped)
                return;
            progress = Math.max(progress, value);
            await send(progress, total, message);
        },
        heartbeat: async (message) => {
            if (stopped)
                return;
            progress += 1;
            await send(progress, undefined, message);
        },
        stop,
    };
}
