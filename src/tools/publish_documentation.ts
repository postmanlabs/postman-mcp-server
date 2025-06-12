import { z } from 'zod';
import { fetchPostmanAPI, ContentType } from '../clients/postman.js';

export const method = 'publish-documentation';
export const description =
  "Publishes a collection's documentation. This makes it publicly available to anyone with the link to the documentation.\n\n**Note:**\n\n- Your [Postman plan](https://www.postman.com/pricing/) impacts your use of these endpoints:\n  - For **Free** and **Basic** users, you must have permissions to edit the collection.\n  - If [API Governance and Security](https://learning.postman.com/docs/api-governance/configurable-rules/configurable-rules-overview/) is enabled for your [**Enterprise**](https://www.postman.com/pricing/) team, only users with the [Community Manager role](https://learning.postman.com/docs/collaborating-in-postman/roles-and-permissions/#team-roles) can publish documentation.\n- Publishing is only supported for collections with HTTP requests.\n- You cannot publish a collection added to an API.\n";
export const parameters = z.object({
  collectionId: z.string().describe("The collection's unique ID."),
  environmentUid: z
    .string()
    .describe(
      "The unique ID of the environment to publish with the documentation. The initial values of all variables are published with the documentation. Make certain they don't contain sensitive information such as passwords or tokens."
    )
    .optional(),
  customColor: z
    .object({
      highlight: z
        .string()
        .describe("The hexcode color code for the documentation's highlighting.")
        .optional(),
      rightSidebar: z
        .string()
        .describe("The hexcode color code for the documentation's right sidebar color.")
        .optional(),
      topBar: z
        .string()
        .describe("The hexcode color code for the documentation's top bar color.")
        .optional(),
    })
    .describe(
      "The theme's colors, in six digit hexcode. The values in this object must match the hexcode values of either the `light` or `dark` theme defined in the `appearance` object."
    ),
  documentationLayout: z
    .enum(['classic-single-column', 'classic-double-column'])
    .describe(
      "The documentation's default layout style:\n- `classic-single-column` — Displays sample code inline beneath each request.\n- `classic-double-column` — Displays sample code in a column next to the documentation.\n"
    )
    .default('classic-single-column'),
  customization: z
    .object({
      metaTags: z
        .array(
          z.object({
            name: z
              .string()
              .describe(
                "The key's name:\n  - `title` — The title of your documentation. This value appears in relevant search queries and browser tabs. By default, the system uses the collection's name for the documentation title.\n  - `description` — The documentation's description. This provides brief information about your document and lets users know what it contains. By default, the system uses the collection's description content.\n"
              ),
            value: z.string().describe("The `name` key's value."),
          })
        )
        .describe(
          "The key-pair values that contain the documentation's `title` and `description` metadata information."
        )
        .optional(),
      appearance: z
        .object({
          default: z
            .enum(['light', 'dark'])
            .describe(
              'The default color theme (`light` or `dark`). Documentation uses the given theme value by default.'
            )
            .optional(),
          themes: z
            .array(
              z.object({
                name: z.enum(['dark', 'light']).describe('The `light` or `dark` theme.').optional(),
                colors: z
                  .object({
                    highlight: z
                      .string()
                      .describe("The hexcode color code for the documentation's highlighting.")
                      .optional(),
                    rightSidebar: z
                      .string()
                      .describe(
                        "The hexcode color code for the documentation's right sidebar color."
                      )
                      .optional(),
                    topBar: z
                      .string()
                      .describe("The hexcode color code for the documentation's top bar color.")
                      .optional(),
                  })
                  .describe(
                    "The theme's colors, in six digit hexcode. The values in this object must match the hexcode values of either the `light` or `dark` theme defined in the `appearance` object."
                  )
                  .optional(),
                logo: z
                  .string()
                  .nullable()
                  .describe(
                    "The URL to the documentation's logo image. By default, public documentation uses your team logo."
                  )
                  .optional(),
              })
            )
            .describe('A list of theme settings for the `light` and `dark` themes.')
            .optional(),
        })
        .describe('Information about the documentation appearance, such as colors and theme.')
        .optional(),
    })
    .describe("Information about the documentation's customization."),
});
export const annotations = {
  title:
    "Publishes a collection's documentation. This makes it publicly available to anyone with the link to the documentation.\n\n**Note:**\n\n- Your [Postman plan](https://www.postman.com/pricing/) impacts your use of these endpoints:\n  - For **Free** and **Basic** users, you must have permissions to edit the collection.\n  - If [API Governance and Security](https://learning.postman.com/docs/api-governance/configurable-rules/configurable-rules-overview/) is enabled for your [**Enterprise**](https://www.postman.com/pricing/) team, only users with the [Community Manager role](https://learning.postman.com/docs/collaborating-in-postman/roles-and-permissions/#team-roles) can publish documentation.\n- Publishing is only supported for collections with HTTP requests.\n- You cannot publish a collection added to an API.\n",
  readOnlyHint: false,
  destructiveHint: false,
  idempotentHint: true,
};

export async function handler(
  params: z.infer<typeof parameters>,
  extra: { apiKey: string }
): Promise<{ content: Array<{ type: string; text: string } & Record<string, unknown>> }> {
  try {
    const endpoint = `/collections/${params.collectionId}/public-documentations`;
    const query = new URLSearchParams();
    const url = query.toString() ? `${endpoint}?${query.toString()}` : endpoint;
    const bodyPayload: any = {};
    if (params.environmentUid !== undefined) bodyPayload.environmentUid = params.environmentUid;
    if (params.customColor !== undefined) bodyPayload.customColor = params.customColor;
    if (params.documentationLayout !== undefined)
      bodyPayload.documentationLayout = params.documentationLayout;
    if (params.customization !== undefined) bodyPayload.customization = params.customization;
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
