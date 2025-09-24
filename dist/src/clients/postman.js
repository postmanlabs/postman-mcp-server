import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';
import packageJson from '../../package.json' with { type: 'json' };
export var ContentType;
(function (ContentType) {
    ContentType["Json"] = "application/json";
    ContentType["JsonPatch"] = "application/json-patch+json";
})(ContentType || (ContentType = {}));
export class PostmanAPIClient {
    baseUrl;
    apiKey;
    static instance = null;
    constructor(apiKey, baseUrl = process.env.POSTMAN_API_BASE_URL || 'https://api.postman.com') {
        this.apiKey = apiKey;
        this.baseUrl = baseUrl;
    }
    static getInstance(apiKey, baseUrl) {
        if (!PostmanAPIClient.instance) {
            PostmanAPIClient.instance = new PostmanAPIClient(apiKey, baseUrl);
        }
        return PostmanAPIClient.instance;
    }
    static resetInstance() {
        PostmanAPIClient.instance = null;
    }
    async get(endpoint, options = {}) {
        return this.request(endpoint, { ...options, method: 'GET' });
    }
    async post(endpoint, options = {}) {
        return this.request(endpoint, { ...options, method: 'POST' });
    }
    async put(endpoint, options = {}) {
        return this.request(endpoint, { ...options, method: 'PUT' });
    }
    async patch(endpoint, options = {}) {
        return this.request(endpoint, { ...options, method: 'PATCH' });
    }
    async delete(endpoint, options = {}) {
        return this.request(endpoint, { ...options, method: 'DELETE' });
    }
    async request(endpoint, options) {
        const currentApiKey = this.apiKey || process.env.POSTMAN_API_KEY;
        if (!currentApiKey) {
            throw new Error('API key is required for requests. Provide it via constructor parameter or set POSTMAN_API_KEY environment variable.');
        }
        const contentType = options.contentType || ContentType.Json;
        const userAgentKey = Object.keys(options.headers ?? {}).find((key) => key.toLowerCase() === 'user-agent');
        const userAgentValue = userAgentKey ? options.headers?.[userAgentKey] : undefined;
        const userAgentHeader = userAgentValue
            ? `${userAgentValue}/${packageJson.name}/${packageJson.version}`
            : `${packageJson.name}/${packageJson.version}`;
        const disallowed = new Set([
            'content-length',
            'transfer-encoding',
            'connection',
            'host',
            'accept-encoding',
            'keep-alive',
        ]);
        const extra = Object.fromEntries(Object.entries(options.headers ?? {}).filter(([k]) => !disallowed.has(k.toLowerCase())));
        const hasBody = options.body !== undefined && options.body !== null;
        const headers = {
            ...(hasBody ? { 'content-type': contentType } : {}),
            ...extra,
            'x-api-key': currentApiKey,
            'user-agent': userAgentHeader,
        };
        const { headers: _ignored, ...optionsWithoutHeaders } = options;
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            ...optionsWithoutHeaders,
            headers,
            signal: AbortSignal.timeout(300000),
        });
        if (!response.ok) {
            await this.handleErrorResponse(response);
        }
        if (response.status === 204)
            return null;
        const responseContentType = response.headers.get('content-type') || '';
        if (responseContentType.includes('application/json')) {
            return response.json();
        }
        return response.text();
    }
    async handleErrorResponse(response) {
        const errorText = await response.text();
        switch (response.status) {
            case 400:
            case 422:
            case 401:
            case 403:
                throw new McpError(ErrorCode.InvalidParams, `API request failed: ${response.status} ${errorText}`, {
                    cause: errorText,
                });
            default:
                throw new McpError(ErrorCode.InternalError, `API request failed: ${response.status}`, {
                    cause: errorText,
                });
        }
    }
}
