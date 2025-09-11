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
