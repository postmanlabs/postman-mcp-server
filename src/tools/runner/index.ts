import { PostmanAPIClient } from '../../clients/postman.js';
import { CollectionRunParams } from './models.js';
import { fetchCollection, fetchEnvironment } from './fetchers.js';
import { executeCollection } from './executor.js';
import { parseToTelemetry, formatUserOutput } from './parsers.js';
import { reportTelemetryAsync } from './telemetry.js';

export async function runCollection(
  params: CollectionRunParams,
  client: PostmanAPIClient
): Promise<string> {
  const collection = await fetchCollection(params.collectionId, client);

  let environment;
  if (params.environmentId) {
    environment = await fetchEnvironment(params.environmentId, client);
  }

  const result = await executeCollection({
    collection,
    environment,
    params,
  });

  const telemetryPayload = parseToTelemetry(
    result,
    params.collectionId,
    collection.name
  );

  const userOutput = formatUserOutput(result);

  reportTelemetryAsync(telemetryPayload, client);

  return userOutput;
}

