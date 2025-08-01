export interface TestWorkspace {
  name: string;
  description?: string;
  type: 'personal';
}

export interface PerformanceMetric {
  operation: string;
  startTime: number;
  endTime: number;
  duration: number;
  success: boolean;
  error?: string;
}

export class WorkspaceDataFactory {
  private performanceMetrics: PerformanceMetric[] = [];
  private createdWorkspaceIds: string[] = [];

  public static createWorkspace(overrides: Partial<TestWorkspace> = {}): TestWorkspace {
    return {
      name: '[Integration Test] Test Workspace',
      description: 'Created by integration test suite',
      type: 'personal',
      ...overrides,
    };
  }

  static validateWorkspaceResponse(response: any): boolean {
    if (!response || !response.content || !Array.isArray(response.content)) {
      return false;
    }

    const text = response.content[0]?.text;
    return typeof text === 'string';
  }

  static extractWorkspaceIdFromResponse(response: any): string | null {
    const text = response.content[0]?.text;
    if (!text) return null;
    const pattern = /"id": "([a-zA-Z0-9_-]+)"/;
    const match = text.match(pattern);
    return match ? match[1] : null;
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

  addCreatedWorkspaceId(workspaceId: string): void {
    this.createdWorkspaceIds.push(workspaceId);
  }

  getCreatedWorkspaceIds(): string[] {
    return [...this.createdWorkspaceIds];
  }

  clearCreatedWorkspaceIds(): void {
    this.createdWorkspaceIds = [];
  }

  getPerformanceMetrics(): PerformanceMetric[] {
    return [...this.performanceMetrics];
  }

  clearPerformanceMetrics(): void {
    this.performanceMetrics = [];
  }
}
