import { z } from 'zod';
import { enabledResources } from '../enabledResources.js';
import { asMcpError, McpError } from './utils/toolHelpers.js';
export const method = 'getEnabledTools';
export const description = 'IMPORTANT: Run this tool first when a requested tool is unavailable. Returns information about which tools are enabled in the full and minimal tool sets, helping you identify available alternatives.';
export const parameters = z.object({});
export const annotations = {
    title: 'Get Enabled Tools',
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
};
export async function handler(_args, extra) {
    try {
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify({
                        serverInfo: extra.serverContext
                            ? {
                                serverType: extra.serverContext.serverType,
                                currentServerTools: extra.serverContext.availableTools,
                                currentServerToolCount: extra.serverContext.availableTools.length,
                            }
                            : {
                                serverType: 'unknown',
                                note: 'Server context not available',
                            },
                        enabledTools: {
                            full: Array.from(enabledResources.full),
                            minimal: Array.from(enabledResources.minimal),
                            excludedFromGeneration: Array.from(enabledResources.excludedFromGeneration),
                        },
                        stats: {
                            totalFull: enabledResources.full.length,
                            totalMinimal: enabledResources.minimal.length,
                            totalExcludedFromGeneration: enabledResources.excludedFromGeneration.length,
                        },
                    }, null, 2),
                },
            ],
        };
    }
    catch (e) {
        if (e instanceof McpError) {
            throw e;
        }
        throw asMcpError(e);
    }
}
