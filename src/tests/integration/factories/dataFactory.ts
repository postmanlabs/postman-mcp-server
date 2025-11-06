export class TestDataFactory {
  protected createdIds: string[] = [];

  addCreatedId(id: string): void {
    this.createdIds.push(id);
  }

  getCreatedIds(): string[] {
    return [...this.createdIds];
  }

  clearCreatedIds(): void {
    this.createdIds = [];
  }
}

export interface TestWorkspace {
  name: string;
  description?: string;
  type: 'personal';
}

export class WorkspaceDataFactory extends TestDataFactory {
  public static createWorkspace(overrides: Partial<TestWorkspace> = {}): TestWorkspace {
    return {
      name: '[Integration Test] Test Workspace',
      description: 'Created by integration test suite',
      type: 'personal',
      ...overrides,
    };
  }

  static validateResponse(response: any): boolean {
    if (!response || !response.content || !Array.isArray(response.content)) {
      return false;
    }
    const text = response.content[0]?.text;
    return typeof text === 'string';
  }

  static extractIdFromResponse(response: any): string | null {
    const text = response.content[0]?.text;
    if (!text) return null;

    try {
      const parsed = JSON.parse(text);
      if (parsed.workspace?.id) {
        return parsed.workspace.id;
      } else if (parsed.id) {
        return parsed.id;
      }

      const pattern = /"id": "([a-zA-Z0-9_-]+)"/;
      const match = text.match(pattern);
      return match ? match[1] : null;
    } catch {
      const pattern = /"id": "([a-zA-Z0-9_-]+)"/;
      const match = text.match(pattern);
      return match ? match[1] : null;
    }
  }
}

export interface TestEnvironmentVariable {
  enabled?: boolean;
  key?: string;
  value?: string;
  type?: 'secret' | 'default';
}

export interface TestEnvironment {
  name: string;
  values?: TestEnvironmentVariable[];
}

export class EnvironmentDataFactory extends TestDataFactory {
  public static createEnvironment(overrides: Partial<TestEnvironment> = {}): TestEnvironment {
    return {
      name: '[Integration Test] Test Environment',
      values: [
        { enabled: true, key: 'test_var', value: 'test_value', type: 'default' },
        { enabled: true, key: 'api_url', value: 'https://api.example.com', type: 'default' },
      ],
      ...overrides,
    };
  }

  public static createMinimalEnvironment(
    overrides: Partial<TestEnvironment> = {}
  ): TestEnvironment {
    return {
      name: '[Integration Test] Minimal Environment',
      ...overrides,
    };
  }

  static validateResponse(response: any): boolean {
    if (!response || !response.content || !Array.isArray(response.content)) {
      return false;
    }
    const text = response.content[0]?.text;
    return typeof text === 'string';
  }

  static extractIdFromResponse(response: any): string | null {
    const text = response.content[0]?.text;
    if (!text) return null;

    try {
      const parsed = JSON.parse(text);
      if (parsed.environment?.id) {
        return parsed.environment.id;
      } else if (parsed.id) {
        return parsed.id;
      }
      const pattern = /"id": "([a-zA-Z0-9_-]+)"/;
      const match = text.match(pattern);
      return match ? match[1] : null;
    } catch {
      const pattern = /"id": "([a-zA-Z0-9_-]+)"/;
      const match = text.match(pattern);
      return match ? match[1] : null;
    }
  }
}

export interface TestSpec {
  name: string;
  type: 'OPENAPI:3.0' | 'ASYNCAPI:2.0';
  files: TestSpecFile[];
  description?: string;
}

export interface TestSpecFile {
  path: string;
  content: string;
}

export class SpecDataFactory extends TestDataFactory {
  public static createSpec(overrides: Partial<TestSpec> = {}): TestSpec {
    return {
      name: '[Integration Test] Test Spec',
      description: 'Created by integration test suite',
      type: 'OPENAPI:3.0',
      files: [this.createSpecFile()],
      ...overrides,
    };
  }

  public static createSpecFile(overrides: Partial<TestSpecFile> = {}): TestSpecFile {
    return {
      path: 'index.yaml',
      content:
        'openapi: 3.0.0\ninfo:\n  title: My API\n  version: 1.0.0\npaths:\n  /:\n    get:\n      summary: My Endpoint\n      responses:\n        \'200\':\n          description: OK',
      ...overrides,
    };
  }

  static validateResponse(response: any): boolean {
    if (!response || !response.content || !Array.isArray(response.content)) {
      return false;
    }
    const text = response.content[0]?.text;
    return typeof text === 'string';
  }

  static extractIdFromResponse(response: any): string | null {
    const text = response.content[0]?.text;
    if (!text) return null;

    try {
      const parsed = JSON.parse(text);
      if (parsed.spec?.id) {
        return parsed.spec.id;
      } else if (parsed.id) {
        return parsed.id;
      }

      const pattern = /"id": "([a-zA-Z0-9_-]+)"/;
      const match = text.match(pattern);
      return match ? match[1] : null;
    } catch {
      const pattern = /"id": "([a-zA-Z0-9_-]+)"/;
      const match = text.match(pattern);
      return match ? match[1] : null;
    }
  }

  static extractSpecFileFromResponse(response: any): any | null {
    const text = response.content[0]?.text;
    if (!text) return null;
    try {
      const parsed = JSON.parse(text);
      return parsed;
    } catch {
      return null;
    }
  }

  static extractSpecFilesFromResponse(response: any): any | null {
    const text = response.content[0]?.text;
    if (!text) return null;
    try {
      const parsed = JSON.parse(text);
      return parsed.files;
    } catch {
      return null;
    }
  }
}

export interface TestCollection {
  info: {
    name: string;
    description?: string;
    schema: string;
  };
  item: Array<{
    name: string;
    request?: {
      url?: string;
      method?: string;
      header?: Array<{ key: string; value: string }>;
      body?: {
        mode?: string;
        raw?: string;
      };
    };
  }>;
}

export class CollectionDataFactory extends TestDataFactory {
  public static createCollection(overrides: Partial<TestCollection> = {}): TestCollection {
    return {
      info: {
        name: '[Integration Test] Test Collection',
        description: 'Created by integration test suite',
        schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
      },
      item: [
        {
          name: 'Sample Request',
          request: {
            url: 'https://postman-echo.com/get',
            method: 'GET',
          },
        },
      ],
      ...overrides,
    };
  }

  public static createMinimalCollection(
    overrides: Partial<TestCollection> = {}
  ): TestCollection {
    return {
      info: {
        name: '[Integration Test] Minimal Collection',
        schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
      },
      item: [],
      ...overrides,
    };
  }

  static validateResponse(response: any): boolean {
    if (!response || !response.content || !Array.isArray(response.content)) {
      return false;
    }
    const text = response.content[0]?.text;
    return typeof text === 'string';
  }

  static extractIdFromResponse(response: any): string | null {
    const text = response.content[0]?.text;
    if (!text) return null;

    try {
      const parsed = JSON.parse(text);
      if (parsed.collection?.id) {
        return parsed.collection.id;
      } else if (parsed.collection?.uid) {
        return parsed.collection.uid;
      } else if (parsed.id) {
        return parsed.id;
      } else if (parsed.uid) {
        return parsed.uid;
      }

      // Try to extract uid pattern (owner-id)
      const uidPattern = /"uid":\s*"([^"]+)"/;
      const uidMatch = text.match(uidPattern);
      if (uidMatch) return uidMatch[1];

      const idPattern = /"id":\s*"([a-zA-Z0-9_-]+)"/;
      const idMatch = text.match(idPattern);
      return idMatch ? idMatch[1] : null;
    } catch {
      const uidPattern = /"uid":\s*"([^"]+)"/;
      const uidMatch = text.match(uidPattern);
      if (uidMatch) return uidMatch[1];

      const idPattern = /"id":\s*"([a-zA-Z0-9_-]+)"/;
      const idMatch = text.match(idPattern);
      return idMatch ? idMatch[1] : null;
    }
  }

  static extractCollectionFromResponse(response: any): any | null {
    const text = response.content[0]?.text;
    if (!text) return null;
    try {
      const parsed = JSON.parse(text);
      return parsed.collection || parsed;
    } catch {
      return null;
    }
  }
}
