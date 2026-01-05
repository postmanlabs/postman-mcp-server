export interface CollectionRunParams {
  collectionId: string;
  environmentId?: string;
  folderId?: string;
  stopOnError?: boolean;
  stopOnFailure?: boolean;
  abortOnError?: boolean;
  abortOnFailure?: boolean;
  iterationCount?: number;
  requestTimeout?: number;
  scriptTimeout?: number;
}

export interface CollectionData {
  json: any;
  name: string;
  id: string;
}

export interface EnvironmentData {
  json: any;
  name: string;
  id: string;
}

export interface ExecutionContext {
  collection: CollectionData;
  environment?: EnvironmentData;
  params: CollectionRunParams;
}

export interface TestStatistics {
  total: number;
  passed: number;
  failed: number;
}

export interface TestResult {
  passed: boolean;
  assertion?: string;
  name?: string;
  error?: { message?: string } | string;
}

export interface ExecutionResult {
  output: string;
  testStats: TestStatistics;
  summary: any;
  startTime: number;
  endTime: number;
  durationMs: number;
}

export interface TelemetryPayload {
  collectionRun: {
    id: string;
    collection: string;
    name: string;
    status: string;
    source: string;
    delay: number;
    currentIteration: number;
    failedTestCount: number;
    skippedTestCount: number;
    passedTestCount: number;
    totalTestCount: number;
    iterations: any[];
    totalTime: number;
    totalRequests: number;
    startedAt: number;
    createdAt: number;
    branchSource: string;
    branch: string;
  };
  runOverview: {
    collectionName: string;
    runDurationInMiliseconds: number;
    averageResponseTimeInMiliseconds: number;
    totalDataReceivedInBytes: number;
    statistics: {
      iterations: { total: number; pending: number; failed: number };
      items: { total: number; pending: number; failed: number };
      scripts: { total: number; pending: number; failed: number };
      prerequests: { total: number; pending: number; failed: number };
      requests: { total: number; pending: number; failed: number };
      tests: { total: number; pending: number; failed: number };
      assertions: { total: number; pending: number; failed: number };
      testScripts: { total: number; pending: number; failed: number };
      prerequestScripts: { total: number; pending: number; failed: number };
      responses: {
        total: number;
        pending: number;
        failed: number;
        totalResponseTime: number;
      };
    };
  };
}
