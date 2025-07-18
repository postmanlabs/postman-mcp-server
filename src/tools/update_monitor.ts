import { z } from 'zod';
import { fetchPostmanAPI, ContentType } from '../clients/postman.js';

export const method = 'update-monitor';
export const description =
  "Updates a monitor's [configurations](https://learning.postman.com/docs/monitoring-your-api/setting-up-monitor/#configure-a-monitor).";
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
            .describe(
              'The number of times to reattempt a monitor run if it fails or errors. This may impact your [monitor usage](https://learning.postman.com/docs/monitoring-your-api/monitor-usage/#view-monitor-usage).'
            )
            .optional(),
        })
        .optional(),
      options: z
        .object({
          followRedirects: z.boolean().describe('If true, follow redirects enabled.').optional(),
          requestDelay: z
            .number()
            .gte(1)
            .lte(900000)
            .describe("The monitor's request delay value, in milliseconds.")
            .optional(),
          requestTimeout: z
            .number()
            .gte(1)
            .lte(900000)
            .describe("The monitor's request timeout value, in milliseconds.")
            .optional(),
          strictSSL: z.boolean().describe('If true, strict SSL enabled.').optional(),
        })
        .describe("Information about the monitor's option settings.")
        .optional(),
      schedule: z
        .object({
          cron: z
            .string()
            .describe(
              'The cron expression that defines when the monitor runs. Use standard five-field POSIX cron syntax.\n'
            )
            .optional(),
          timezone: z
            .string()
            .describe(
              "The monitor's [timezone](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones)."
            )
            .optional(),
        })
        .describe("Information about the monitor's schedule.")
        .optional(),
      distribution: z
        .array(
          z.object({
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
          })
        )
        .describe(
          "A list of the monitor's [geographic regions](https://learning.postman.com/docs/monitoring-your-api/setting-up-monitor/#add-regions)."
        )
        .optional(),
      notifications: z
        .object({
          onError: z
            .array(
              z.object({
                email: z
                  .string()
                  .email()
                  .describe('The email address of the user to notify on monitor error.')
                  .optional(),
              })
            )
            .optional(),
          onFailure: z
            .array(
              z.object({
                email: z
                  .string()
                  .email()
                  .describe('The email address of the user to notify on monitor failure.')
                  .optional(),
              })
            )
            .optional(),
        })
        .describe("Information about the monitor's notification settings.")
        .optional(),
    })
    .optional(),
});
export const annotations = {
  title:
    "Updates a monitor's [configurations](https://learning.postman.com/docs/monitoring-your-api/setting-up-monitor/#configure-a-monitor).",
  readOnlyHint: false,
  destructiveHint: false,
  idempotentHint: true,
};

export async function handler(
  params: z.infer<typeof parameters>,
  extra: { apiKey: string }
): Promise<{ content: Array<{ type: string; text: string } & Record<string, unknown>> }> {
  try {
    const endpoint = `/monitors/${params.monitorId}`;
    const query = new URLSearchParams();
    const url = query.toString() ? `${endpoint}?${query.toString()}` : endpoint;
    const bodyPayload: any = {};
    if (params.monitor !== undefined) bodyPayload.monitor = params.monitor;
    const result = await fetchPostmanAPI(url, {
      method: 'PUT',
      body: JSON.stringify(bodyPayload),
      contentType: ContentType.Json,
      apiKey: extra.apiKey,
    });
    return {
      content: [
        {
          type: 'text',
          text: `${typeof result === 'string' ? result : JSON.stringify(result, null, 2)}`,
        },
      ],
    };
  } catch (e: any) {
    return {
      content: [{ type: 'text', text: `Failed: ${e.message}` }],
    };
  }
}
