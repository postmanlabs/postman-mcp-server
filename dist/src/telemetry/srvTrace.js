import { randomBytes } from 'node:crypto';
const SRV_TRACE_PREFIX = 'v=1;t=';
const SRV_TRACE_BYTES = 8;
export function generateSrvTrace() {
    return SRV_TRACE_PREFIX + randomBytes(SRV_TRACE_BYTES).toString('hex');
}
