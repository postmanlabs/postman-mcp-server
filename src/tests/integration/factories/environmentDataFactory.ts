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

export interface PerformanceMetric {
  operation: string;
  startTime: number;
  endTime: number;
  duration: number;
  success: boolean;
  error?: string;
}

export class EnvironmentDataFactory {
  private performanceMetrics: PerformanceMetric[] = [];
  private createdEnvironmentIds: string[] = [];

  public static createEnvironment(overrides: Partial<TestEnvironment> = {}): TestEnvironment {
    return {
      name: '[Integration Test] Test Environment',
      values: [
        {
          enabled: true,
          key: 'test_var',
          value: 'test_value',
          type: 'default',
        },
        {
          enabled: true,
          key: 'api_url',
          value: 'https://api.example.com',
          type: 'default',
        },
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

  static validateEnvironmentResponse(response: any): boolean {
    if (!response || !response.content || !Array.isArray(response.content)) {
      return false;
    }

    const text = response.content[0]?.text;
    return typeof text === 'string';
  }

  static extractEnvironmentIdFromResponse(response: any): string | null {
    const text = response.content[0]?.text;
    if (!text) return null;

    try {
      const parsed = JSON.parse(text);
      // Handle both direct environment object and nested structure
      if (parsed.environment?.id) {
        return parsed.environment.id;
      } else if (parsed.id) {
        return parsed.id;
      }

      // Fallback to regex pattern matching
      const pattern = /"id": "([a-zA-Z0-9_-]+)"/;
      const match = text.match(pattern);
      return match ? match[1] : null;
      // eslint-disable-next-line unused-imports/no-unused-vars
    } catch (e) {
      // Fallback to regex if JSON parsing fails
      const pattern = /"id": "([a-zA-Z0-9_-]+)"/;
      const match = text.match(pattern);
      return match ? match[1] : null;
    }
  }

  // Performance tracking
  startTimer(): number {
    return Date.now();
  }

  endTimer(operation: string, startTime: number, success: boolean, error?: string): void {
    const endTime = Date.now();
    const duration = endTime - startTime;

    this.performanceMetrics.push({
      operation,
      startTime,
      endTime,
      duration,
      success,
      error,
    });
  }

  addCreatedEnvironmentId(environmentId: string): void {
    this.createdEnvironmentIds.push(environmentId);
  }

  getCreatedEnvironmentIds(): string[] {
    return [...this.createdEnvironmentIds];
  }

  clearCreatedEnvironmentIds(): void {
    this.createdEnvironmentIds = [];
  }

  getPerformanceMetrics(): PerformanceMetric[] {
    return [...this.performanceMetrics];
  }

  clearPerformanceMetrics(): void {
    this.performanceMetrics = [];
  }
}
