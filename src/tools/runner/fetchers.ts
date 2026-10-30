import { PostmanAPIClient } from '../../clients/postman.js';
import { CollectionData, EnvironmentData } from './models.js';
import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';
import { encodePathSegment } from '../utils/toolHelpers.js';

export async function fetchCollection(
  collectionId: string,
  client: PostmanAPIClient
): Promise<CollectionData> {
  const endpoint = `/collections/${encodePathSegment(collectionId, 'collectionId')}`;
  try {
    const response = await client.get(endpoint);
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
  const endpoint = `/environments/${encodePathSegment(environmentId, 'environmentId')}`;
  try {
    const response = await client.get(endpoint);
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
