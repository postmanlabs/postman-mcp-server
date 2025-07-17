import { z } from 'zod';
import { fetchPostmanAPI, ContentType } from '../clients/postman.js';

export const method = 'create-monitor';
export const description =
  'Creates a monitor.\n\n**Note:**\n\n- You cannot create monitors for collections added to an API definition.\n- If you do not pass the \\`workspace\\` parameter, the monitor is created in your personal workspace.\n';
export const parameters = z.object({
  workspace: z.string().describe("The workspace's ID.").optional(),
  monitor: z
    .object({
      name: z.string().describe("The monitor's name."),
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
      collection: z.string().describe("The unique ID of the monitor's associated collection."),
      environment: z
        .string()
        .describe("The unique ID of the monitor's associated environment.")
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
              "The monitor's run frequency, based on the given cron pattern. For example:\n\n| Frequency | Cron pattern |\n| --------- | ------------ |\n| Every 5 minutes | `*/5 * * * *` |\n| Every 30 minutes | `*/30 * * * *` |\n| Every hour | `0 */1 * * *` |\n| Every 6 hours | `0 */6 * * *` |\n| Every day at 5 pm | `0 17 * * *` |\n| Every Monday at 12 pm | `0 12 * * MON` |\n| Every weekday (Mon — Fri) at 6 am | `0 6 * * MON-FRI` |\n"
            )
            .optional(),
          timezone: z
            .string()
            .describe(
              "The monitor's [timezone](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones)."
            )
            .optional(),
        })
        .describe("Information about the monitor's schedule."),
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
    'Creates a monitor.\n\n**Note:**\n\n- You cannot create monitors for collections added to an API definition.\n- If you do not pass the \\`workspace\\` parameter, the monitor is created in your personal workspace.\n',
  readOnlyHint: false,
  destructiveHint: false,
  idempotentHint: false,
};

export async function handler(
  params: z.infer<typeof parameters>,
  extra: { apiKey: string }
): Promise<{ content: Array<{ type: string; text: string } & Record<string, unknown>> }> {
  try {
    const endpoint = `/monitors`;
    const query = new URLSearchParams();
    if (params.workspace !== undefined) query.set('workspace', String(params.workspace));
    const url = query.toString() ? `${endpoint}?${query.toString()}` : endpoint;
    const bodyPayload: any = {};
    if (params.monitor !== undefined) bodyPayload.monitor = params.monitor;
    const result = await fetchPostmanAPI(url, {
      method: 'POST',
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
