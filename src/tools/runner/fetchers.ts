import { PostmanAPIClient } from '../../clients/postman.js';
import { CollectionData, EnvironmentData } from './models.js';
import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';

export async function fetchCollection(
  collectionId: string,
  client: PostmanAPIClient
): Promise<CollectionData> {
  try {
    const response = await client.get(`/collections/${collectionId}`);
    const collectionJSON = response.collection || response;

    return {
      json: collectionJSON,
      name: collectionJSON.info?.name || 'Unknown',
      id: collectionId,
    };
  } catch (error) {
    throw new McpError(ErrorCode.InternalError, `Failed to fetch collection: ${collectionId}`, {
      cause: error,
    });
  }
}

export async function fetchEnvironment(
  environmentId: string,
  client: PostmanAPIClient
): Promise<EnvironmentData> {
  try {
    const response = await client.get(`/environments/${environmentId}`);
    const environmentJSON = response.environment || response;

    return {
      json: environmentJSON,
      name: environmentJSON.name || 'Unknown',
      id: environmentId,
    };
  } catch (error) {
    throw new McpError(ErrorCode.InternalError, `Failed to fetch environment: ${environmentId}`, {
      cause: error,
    });
  }
}

