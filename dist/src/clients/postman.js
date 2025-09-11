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
        if (!apiKey && !process.env.POSTMAN_API_KEY) {
            throw new Error('API key is required. Provide it as parameter or set POSTMAN_API_KEY environment variable.');
        }
        this.apiKey = apiKey || process.env.POSTMAN_API_KEY;
        this.baseUrl = baseUrl;
    }
    static getInstance(apiKey, baseUrl) {
        if (!PostmanAPIClient.instance) {
            const key = apiKey || process.env.POSTMAN_API_KEY;
            if (!key) {
                throw new Error('API key is required. Provide it as parameter or set POSTMAN_API_KEY environment variable.');
            }
            PostmanAPIClient.instance = new PostmanAPIClient(key, baseUrl);
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
        const contentType = options.contentType || ContentType.Json;
        const userAgentHeader = options.headers && 'user-agent' in options.headers
            ? `${options.headers['user-agent']}/${packageJson.name}/${packageJson.version}`
            : `${packageJson.name}/${packageJson.version}`;
        const headers = {
            'content-type': contentType,
            'x-api-key': this.apiKey,
            'user-agent': userAgentHeader,
            ...options.headers,
        };
        const { headers: _, ...optionsWithoutHeaders } = options;
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            ...optionsWithoutHeaders,
            headers,
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
