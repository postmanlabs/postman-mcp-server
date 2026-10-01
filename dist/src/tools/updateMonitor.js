import { z } from 'zod';
import { ContentType } from '../clients/postman.js';
import { asMcpError, McpError } from './utils/toolHelpers.js';
export const method = 'updateMonitor';
export const title = 'Update a monitor';
export const description = "Updates a monitor's [configurations](https://learning.postman.com/docs/monitoring-your-api/setting-up-monitor/#configure-a-monitor).";
export const parameters = z.object({
    monitorId: z.string().describe("The monitor's ID."),
    monitor: z
        .object({
        name: z.string().describe("The monitor's name.").optional(),
        active: z
            .boolean()
            .describe('If true, the monitor is active and makes calls to the specified URL.')
            .default(true),
        notificationLimit: z
            .number()
            .gte(1)
            .lte(99)
            .describe('Stop email notifications after the given number consecutive failures.')
            .optional(),
        retry: z
            .object({
            attempts: z
                .number()
                .gte(1)
                .lte(2)
                .describe('The number of times to reattempt a monitor run if it fails or errors. This may impact your [monitor usage](https://learning.postman.com/docs/monitoring-your-api/monitor-usage/#view-monitor-usage).')
                .optional(),
        })
            .describe("Information about the monitor's retry settings.")
            .optional(),
        options: z
            .object({
            followRedirects: z.boolean().describe('If true, follow redirects enabled.').optional(),
            requestDelay: z
                .number()
                .int()
                .gte(0)
                .lte(900000)
                .describe("The monitor's delay between requests, in milliseconds, as a whole number. A `0` value means no delay. The maximum value is `600000` (10 minutes) on free plans and `900000` (15 minutes) on paid plans. This value is checked only when the value changes.")
                .optional(),
            requestTimeout: z
                .number()
                .int()
                .gte(1)
                .lte(900000)
                .nullable()
                .describe("The monitor's request timeout, in milliseconds, as a whole number. A `null` value means no timeout, and so does omitting it when creating a monitor. A monitor with no timeout returns a `null` value. The maximum value is `600000` (10 minutes) on free plans and `900000` (15 minutes) on paid plans, checked only when the value changes.")
                .optional(),
            strictSSL: z.boolean().describe('If true, strict SSL enabled.').optional(),
            requestSelection: z
                .object({
                selectedItems: z
                    .array(z
                    .object({
                    id: z
                        .string()
                        .regex(new RegExp('^(?:[0-9]{1,23}-)?[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$|^[0-9a-f]{24}$'))
                        .max(60)
                        .describe("The collection item's ID:\n\n- For a collection that contains only HTTP requests, use the item's UID in `<ownerId>-<id>` format (for example, `12345678-5daabc50-8451-45f6-922d-96b403b4f28e`). An ID without the `ownerId` prefix is also accepted.\n- For a collection that contains GraphQL or gRPC requests, use the item's 24 character hexadecimal ID (for example, `66f1c0e2a1b2c3d4e5f60718`). Letters must be lowercase.\n"),
                })
                    .strict())
                    .min(1)
                    .describe("The collection items to run, in run order. Each entry's position in this array is its position in the run, not the collection's ordering. Each item must exist in the monitor's collection, or the request returns an HTTP `400 Bad Request` error."),
            })
                .strict()
                .nullable()
                .describe("The ordered subset of the monitor's collection to run. If set, the monitor runs exactly these items in the given order instead of the full collection. Pass a `null` value to clear the selection and run the full collection again.")
                .optional(),
        })
            .refine((value) => Object.keys(value).length >= 1, {
            message: 'Must include at least 1 property.',
        })
            .describe("Information about the monitor's option settings.")
            .optional(),
        schedule: z
            .object({
            cron: z
                .string()
                .describe('The cron expression that defines when the monitor runs. Use standard five-field POSIX cron syntax.\n')
                .optional(),
            timezone: z
                .string()
                .describe("The monitor's [timezone](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones).")
                .optional(),
        })
            .describe("Information about the monitor's schedule.")
            .optional(),
        distribution: z
            .array(z.object({
            region: z
                .enum([
                'us-east',
                'us-west',
                'ap-southeast',
                'ca-central',
                'eu-central',
                'sa-east',
                'uk',
                'us-east-staticip',
                'us-west-staticip',
            ])
                .describe('The assigned distribution region.')
                .optional(),
        }))
            .describe("A list of the monitor's [geographic regions](https://learning.postman.com/docs/monitoring-your-api/setting-up-monitor/#add-regions).")
            .optional(),
        notifications: z
            .object({
            onError: z
                .array(z.object({
                email: z
                    .string()
                    .email()
                    .describe('The email address of the user to notify on monitor error.')
                    .optional(),
            }))
                .describe('A list of recipients to notify when the monitor errors.')
                .optional(),
            onFailure: z
                .array(z.object({
                email: z
                    .string()
                    .email()
                    .describe('The email address of the user to notify on monitor failure.')
                    .optional(),
            }))
                .describe('A list of recipients to notify when the monitor fails.')
                .optional(),
        })
            .describe("Information about the monitor's notification settings.")
            .optional(),
    })
        .describe('Information about the monitor.')
        .optional(),
});
export const annotations = {
    title: 'Update a monitor',
    readOnlyHint: false,
    openWorldHint: true,
    destructiveHint: true,
    idempotentHint: true,
};
export async function handler(args, extra) {
    try {
        const endpoint = `/monitors/${encodeURIComponent(String(args.monitorId))}`;
        const query = new URLSearchParams();
        const url = query.toString() ? `${endpoint}?${query.toString()}` : endpoint;
        const bodyPayload = {};
        if (args.monitor !== undefined)
            bodyPayload.monitor = args.monitor;
        const options = {
            body: JSON.stringify(bodyPayload),
            contentType: ContentType.Json,
            headers: extra.headers,
        };
        const result = await extra.client.put(url, options);
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
