import { PostmanAPIClient } from '../../clients/postman.js';
import { CollectionRunParams } from './models.js';
import { fetchCollection, fetchEnvironment } from './fetchers.js';
import { executeCollection } from './executor.js';
import { parseToTelemetry, formatUserOutput } from './parsers.js';
import { reportTelemetryAsync } from './telemetry.js';
import type { ProgressReporter } from '../utils/progress.js';

export async function runCollection(
  params: CollectionRunParams,
  client: PostmanAPIClient,
  progress?: ProgressReporter
): Promise<string> {
  await progress?.report(1, undefined, 'fetching collection');
  const collection = await fetchCollection(params.collectionId, client);

  let environment;
  if (params.environmentId) {
    await progress?.heartbeat('fetching environment');
    environment = await fetchEnvironment(params.environmentId, client);
  }

  const result = await executeCollection(
    {
      collection,
      environment,
      params,
    },
    progress
  );

  const telemetryPayload = parseToTelemetry(result, params.collectionId, collection.name);

  const userOutput = formatUserOutput(result);

  reportTelemetryAsync(telemetryPayload, client);

  return userOutput;
}
