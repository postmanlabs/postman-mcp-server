import { z } from 'zod';
import { PostmanAPIClient } from '../../clients/postman.js';
import { CallToolResult, IsomorphicHeaders } from '@modelcontextprotocol/sdk/types.js';
import { ServerContext, McpError, asMcpError } from '../utils/toolHelpers.js';
import {
  handler as getCollectionApiHandler,
  parameters as getCollectionApiParameters,
} from './getCollection.js';
import { handler as getCollectionMapHandler } from './getCollectionMap.js';

export const method = 'getCollection';
export const description = `Get information about a collection. By default this tool returns the lightweight collection map (metadata + recursive itemRefs).
Use the model parameter to opt in to Postman's full API responses:
- model=minimal — root-level folder/request IDs only
- model=full — full Postman collection payload.`;

const baseParameters = getCollectionApiParameters.pick({
  collectionId: true,
  access_key: true,
});

export const parameters = baseParameters.extend({
  model: z
    .enum(['minimal', 'full'])
    .describe(
      'Optional response shape override. Omit to receive the lightweight collection map. Set to `minimal` for the Postman minimal model or `full` for the complete collection payload.'
    )
    .optional(),
});

export const annotations = {
  title: 'Get Collection (map by default)',
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
};

type ControllerArgs = z.infer<typeof parameters>;
type HandlerExtra = {
  client: PostmanAPIClient;
  headers?: IsomorphicHeaders;
  serverContext?: ServerContext;
};

function omitModel<T extends ControllerArgs>(args: T): Omit<T, 'model'> {
  const { model: _ignored, ...rest } = args;
  return rest as Omit<T, 'model'>;
}

export async function handler(args: ControllerArgs, extra: HandlerExtra): Promise<CallToolResult> {
  try {
    if (!args.model) {
      return await getCollectionMapHandler(omitModel(args), extra);
    }

    if (args.model === 'minimal') {
      return await getCollectionApiHandler({ ...args, model: 'minimal' }, extra);
    }

    return await getCollectionApiHandler(omitModel(args), extra);
  } catch (e: unknown) {
    if (e instanceof McpError) {
      throw e;
    }
    throw asMcpError(e);
  }
}
