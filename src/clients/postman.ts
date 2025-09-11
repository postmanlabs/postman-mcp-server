import { IsomorphicHeaders, McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';
import packageJson from '../../package.json' with { type: 'json' };

export enum ContentType {
  Json = 'application/json',
  JsonPatch = 'application/json-patch+json',
}

export interface PostmanAPIRequestOptions extends Omit<RequestInit, 'headers'> {
  contentType?: ContentType;
  headers?: IsomorphicHeaders;
}

export interface IPostmanAPIClient {
  get<T = any>(
    endpoint: string,
    options?: Omit<PostmanAPIRequestOptions, 'method' | 'body'>
  ): Promise<T>;
  post<T = any>(endpoint: string, options?: PostmanAPIRequestOptions): Promise<T>;
  put<T = any>(endpoint: string, options?: PostmanAPIRequestOptions): Promise<T>;
  patch<T = any>(endpoint: string, options?: PostmanAPIRequestOptions): Promise<T>;
  delete<T = any>(
    endpoint: string,
    options?: Omit<PostmanAPIRequestOptions, 'method' | 'body'>
  ): Promise<T>;
}

/**
 * Postman API Client following SOLID principles
 * - Single Responsibility: Handles HTTP requests to Postman API
 * - Open/Closed: Extensible for different request types
 * - Liskov Substitution: Consistent interface implementation
 * - Interface Segregation: Focused IPostmanAPIClient interface
 * - Dependency Inversion: Depends on abstractions, not concretions
 */
export class PostmanAPIClient implements IPostmanAPIClient {
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private static instance: PostmanAPIClient | null = null;

  constructor(
    apiKey: string,
    baseUrl: string = process.env.POSTMAN_API_BASE_URL || 'https://api.postman.com'
  ) {
    if (!apiKey && !process.env.POSTMAN_API_KEY) {
      throw new Error(
        'API key is required. Provide it as parameter or set POSTMAN_API_KEY environment variable.'
      );
    }
    this.apiKey = apiKey || process.env.POSTMAN_API_KEY!;
    this.baseUrl = baseUrl;
  }

  /**
   * Get singleton instance of PostmanAPIClient
   * Creates instance if it doesn't exist, otherwise returns existing instance
   */
  static getInstance(apiKey?: string, baseUrl?: string): PostmanAPIClient {
    if (!PostmanAPIClient.instance) {
      const key = apiKey || process.env.POSTMAN_API_KEY;
      if (!key) {
        throw new Error(
          'API key is required. Provide it as parameter or set POSTMAN_API_KEY environment variable.'
        );
      }
      PostmanAPIClient.instance = new PostmanAPIClient(key, baseUrl);
    }
    return PostmanAPIClient.instance;
  }

  /**
   * Reset singleton instance (useful for testing or reconfiguration)
   */
  static resetInstance(): void {
    PostmanAPIClient.instance = null;
  }

  async get<T = any>(
    endpoint: string,
    options: Omit<PostmanAPIRequestOptions, 'method' | 'body'> = {}
  ): Promise<T> {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  async post<T = any>(endpoint: string, options: PostmanAPIRequestOptions = {}): Promise<T> {
    return this.request(endpoint, { ...options, method: 'POST' });
  }

  async put<T = any>(endpoint: string, options: PostmanAPIRequestOptions = {}): Promise<T> {
    return this.request(endpoint, { ...options, method: 'PUT' });
  }

  async patch<T = any>(endpoint: string, options: PostmanAPIRequestOptions = {}): Promise<T> {
    return this.request(endpoint, { ...options, method: 'PATCH' });
  }

  async delete<T = any>(
    endpoint: string,
    options: Omit<PostmanAPIRequestOptions, 'method' | 'body'> = {}
  ): Promise<T> {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }

  private async request<T = any>(
    endpoint: string,
    options: PostmanAPIRequestOptions & { method: string }
  ): Promise<T> {
    const contentType = options.contentType || ContentType.Json;

    const userAgentHeader =
      options.headers && 'user-agent' in options.headers
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

    if (response.status === 204) return null as T;

    const responseContentType = response.headers.get('content-type') || '';
    if (responseContentType.includes('application/json')) {
      return response.json();
    }

    return response.text() as T;
  }

  private async handleErrorResponse(response: Response): Promise<never> {
    const errorText = await response.text();

    switch (response.status) {
      case 400:
      case 422:
      case 401:
      case 403:
        throw new McpError(
          ErrorCode.InvalidParams,
          `API request failed: ${response.status} ${errorText}`,
          {
            cause: errorText,
          }
        );
      default:
        throw new McpError(ErrorCode.InternalError, `API request failed: ${response.status}`, {
          cause: errorText,
        });
    }
  }
}
