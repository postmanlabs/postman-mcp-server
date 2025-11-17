import packageJson from '../package.json' with { type: 'json' };

/**
 * Shared constants for the Postman MCP Server
 */

export const SERVER_NAME = packageJson.name;
export const APP_VERSION = packageJson.version;
export const USER_AGENT = `${packageJson.name}/${packageJson.version}`;
export const RUNNER_ACCEPT_HEADER = 'application/vnd.postman.v2+json';
