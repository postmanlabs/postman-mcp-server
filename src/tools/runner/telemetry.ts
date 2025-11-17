import { RUNNER_ACCEPT_HEADER } from '../../constants.js';
import { PostmanAPIClient } from '../../clients/postman.js';
import { ExecutionResult, TelemetryPayload } from './models.js';
import { v4 as uuidv4 } from 'uuid';

export function buildTelemetryPayload(
  collectionId: string,
  collectionName: string,
  result: ExecutionResult
): TelemetryPayload {
  const durationMs = result.durationMs;
  const stats = result.summary?.run?.stats || {};

  const iterations = stats.iterations || { total: 0, pending: 0, failed: 0 };
  const items = stats.items || { total: 0, pending: 0, failed: 0 };
  const scripts = stats.scripts || { total: 0, pending: 0, failed: 0 };
  const prerequests = stats.prerequests || { total: 0, pending: 0, failed: 0 };
  const requests = stats.requests || { total: 0, pending: 0, failed: 0 };
  const tests = stats.tests || { total: 0, pending: 0, failed: 0 };
  const assertions = stats.assertions || { total: 0, pending: 0, failed: 0 };
  const testScripts = stats.testScripts || { total: 0, pending: 0, failed: 0 };
  const prerequestScripts = stats.prerequestScripts || { total: 0, pending: 0, failed: 0 };

  const responses = result.summary?.run?.executions || [];
  const totalResponseTime = responses.reduce((sum: number, exec: any) => {
    return sum + (exec?.response?.responseTime || 0);
  }, 0);
  const averageResponseTime = responses.length > 0 ? totalResponseTime / responses.length : 0;

  const totalDataReceived = responses.reduce((sum: number, exec: any) => {
    return sum + (exec?.response?.responseSize || 0);
  }, 0);

  const iterationsData = (result.summary?.run?.executions || []).map((exec: any) => {
    const item = exec.item || {};
    const request = exec.request || {};
    const response = exec.response || {};
    const assertions = exec.assertions || [];

    const testResults = assertions.map((assertion: any) => ({
      name: assertion.assertion || 'Unnamed test',
      status: assertion.error ? 'fail' : 'pass',
      error: assertion.error
        ? {
          name: assertion.error.name || 'AssertionError',
          message: assertion.error.message || 'Unknown error',
          stack: assertion.error.stack || '',
        }
        : null,
    }));

    const requestData: any = {
      url: request.url?.toString() || '',
      method: request.method || 'GET',
      headers: request.headers || {},
    };

    if (request.body) {
      requestData.body = {
        mode: request.body.mode || 'raw',
        raw: request.body.raw || '',
      };
      if (request.body.options) {
        requestData.body.options = request.body.options;
      }
    }

    const responseData: any = {
      code: response.code || 0,
      name: response.status || '',
      time: response.responseTime || 0,
      size: response.responseSize || 0,
      headers: response.headers || [],
    };

    if (response.stream) {
      try {
        responseData.body = response.stream.toString();
      } catch {
        responseData.body = '';
      }
    }

    return {
      id: uuidv4(),
      name: item.name || 'Request',
      error: exec.requestError
        ? {
          name: exec.requestError.name || 'Error',
          message: exec.requestError.message || 'Unknown error',
        }
        : null,
      tests: testResults,
      request: requestData,
      response: responseData,
    };
  });

  return {
    collectionRun: {
      id: uuidv4(),
      collection: collectionId,
      name: collectionName,
      status: 'finished',
      source: 'postman-cli',
      delay: 0,
      currentIteration: iterations.total || 1,
      failedTestCount: result.testStats.failed,
      skippedTestCount: 0,
      passedTestCount: result.testStats.passed,
      totalTestCount: result.testStats.total,
      iterations: iterationsData.length > 0 ? [iterationsData] : [],
      totalTime: durationMs,
      totalRequests: requests.total || 0,
      startedAt: result.startTime,
      createdAt: result.endTime,
      branchSource: 'local',
      branch: process.env.GIT_BRANCH || 'main',
    },
    runOverview: {
      collectionName: collectionName,
      runDurationInMiliseconds: durationMs,
      averageResponseTimeInMiliseconds: Math.round(averageResponseTime),
      totalDataReceivedInBytes: totalDataReceived,
      statistics: {
        iterations: {
          total: iterations.total || 0,
          pending: iterations.pending || 0,
          failed: iterations.failed || 0,
        },
        items: {
          total: items.total || 0,
          pending: items.pending || 0,
          failed: items.failed || 0,
        },
        scripts: {
          total: scripts.total || 0,
          pending: scripts.pending || 0,
          failed: scripts.failed || 0,
        },
        prerequests: {
          total: prerequests.total || 0,
          pending: prerequests.pending || 0,
          failed: prerequests.failed || 0,
        },
        requests: {
          total: requests.total || 0,
          pending: requests.pending || 0,
          failed: requests.failed || 0,
        },
        tests: {
          total: tests.total || 0,
          pending: tests.pending || 0,
          failed: tests.failed || 0,
        },
        assertions: {
          total: assertions.total || 0,
          pending: assertions.pending || 0,
          failed: assertions.failed || 0,
        },
        testScripts: {
          total: testScripts.total || 0,
          pending: testScripts.pending || 0,
          failed: testScripts.failed || 0,
        },
        prerequestScripts: {
          total: prerequestScripts.total || 0,
          pending: prerequestScripts.pending || 0,
          failed: prerequestScripts.failed || 0,
        },
        responses: {
          total: responses.length || 0,
          pending: 0,
          failed: requests.failed || 0,
          totalResponseTime: Math.round(totalResponseTime),
        },
      },
    },
  };
}

export function reportTelemetryAsync(
  payload: TelemetryPayload,
  client: PostmanAPIClient
): void {
  setImmediate(async () => {
    try {
      await client.post('/collectionruns', {
        body: JSON.stringify(payload),
        headers: {
          Accept: RUNNER_ACCEPT_HEADER,
        },
      });
    } catch (error: any) {
      console.error('[TelemetryReporter] Failed to post collection run data:', error.message);
    }
  });
}

