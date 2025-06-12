import packageJson from '../../package.json' with { type: 'json' };
const BASE_URL = 'https://api.postman.com';

export enum ContentType {
  Json = 'application/json',
  JsonPatch = 'application/json-patch+json',
}

export interface FetchPostmanAPIOptions extends RequestInit {
  contentType?: ContentType;
  apiKey: string;
}

export async function fetchPostmanAPI(
  endpoint: string,
  options: FetchPostmanAPIOptions
): Promise<any> {
  const apiKey = options.apiKey || process.env.POSTMAN_API_KEY;
  if (!apiKey) {
    throw new Error('API key is required.');
  }
  const contentType = options.contentType || ContentType.Json;

  const headers = {
    'Content-Type': contentType,
    'X-API-Key': apiKey,
    'User-Agent': `${packageJson.name}/${packageJson.version}`,
    ...options.headers,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API request failed: ${response.status} ${errorText}`);
  }

  if (response.status === 204) return null;

  const responseContentType = response.headers.get('content-type') || '';
  if (responseContentType.includes('application/json')) {
    return response.json();
  }

  return response.text();
}
