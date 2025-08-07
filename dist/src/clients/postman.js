import packageJson from '../../package.json' with { type: 'json' };
const BASE_URL = 'https://api.postman.com';
export var ContentType;
(function (ContentType) {
    ContentType["Json"] = "application/json";
    ContentType["JsonPatch"] = "application/json-patch+json";
})(ContentType || (ContentType = {}));
export async function fetchPostmanAPI(endpoint, options) {
    const apiKey = options.apiKey || process.env.POSTMAN_API_KEY;
    if (!apiKey) {
        throw new Error('API key is required.');
    }
    const contentType = options.contentType || ContentType.Json;
    const userAgentHeader = options.headers && 'user-agent' in options.headers
        ? `${options.headers['user-agent']}/${packageJson.name}/${packageJson.version}`
        : `${packageJson.name}/${packageJson.version}`;
    const headers = {
        'content-type': contentType,
        'x-api-key': apiKey,
        'user-agent': userAgentHeader,
    };
    const { headers: _, ...optionsWithoutHeaders } = options;
    const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...optionsWithoutHeaders,
        headers,
    });
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API request failed: ${response.status} ${errorText}`);
    }
    if (response.status === 204)
        return null;
    const responseContentType = response.headers.get('content-type') || '';
    if (responseContentType.includes('application/json')) {
        return response.json();
    }
    return response.text();
}
