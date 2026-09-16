import { z } from 'zod';
import { asMcpError, McpError } from './utils/toolHelpers.js';
export const method = 'getApiCatalogDiscoveryService';
export const title = "Get a discovered service's information";
export const description = "Gets one discovered service in detail, including its endpoint list and its OpenAPI\ndefinition as a base64-encoded string — decode that value before reading it. Use\ngetApiCatalogDiscoveryServices first to find the service ID.\nDo not use this tool for a catalogued service's health, traffic, or ownership data;\nuse getApiCatalogService instead. Requires a Postman Enterprise plan.\n";
export const parameters = z.object({
    serviceId: z.string().describe("The discovered service's ID."),
});
export const annotations = {
    title: "Get a discovered service's information",
    readOnlyHint: true,
    openWorldHint: false,
    destructiveHint: false,
    idempotentHint: true,
};
export async function handler(args, extra) {
    try {
        const endpoint = `/api-catalog/discovery-services/${encodeURIComponent(String(args.serviceId))}`;
        const query = new URLSearchParams();
        const url = query.toString() ? `${endpoint}?${query.toString()}` : endpoint;
        const options = {
            headers: extra.headers,
        };
        const result = await extra.client.get(url, options);
        return {
            content: [
                {
                    type: 'text',
                    text: `${typeof result === 'string' ? result : JSON.stringify(result, null, 2)}`,
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
