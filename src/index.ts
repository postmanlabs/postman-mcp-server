#!/usr/bin/env node

import dotenv from 'dotenv';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';

import zodToJsonSchema from 'zod-to-json-schema';

import { createApp } from './servers/express.js';

import * as update_api_collection_comment from './tools/update_api_collection_comment.js';
import * as delete_api_collection_comment from './tools/delete_api_collection_comment.js';
import * as get_status_of_an_async_task from './tools/get_status_of_an_async_task.js';
import * as get_collections from './tools/get_collections.js';
import * as create_collection from './tools/create_collection.js';
import * as get_collections_forked_by_user from './tools/get_collections_forked_by_user.js';
import * as create_collection_fork from './tools/create_collection_fork.js';
import * as get_collection from './tools/get_collection.js';
import * as put_collection from './tools/put_collection.js';
import * as patch_collection from './tools/patch_collection.js';
import * as delete_collection from './tools/delete_collection.js';
import * as get_collection_comments from './tools/get_collection_comments.js';
import * as create_collection_comment from './tools/create_collection_comment.js';
import * as update_collection_comment from './tools/update_collection_comment.js';
import * as delete_collection_comment from './tools/delete_collection_comment.js';
import * as create_collection_folder from './tools/create_collection_folder.js';
import * as get_folder_comments from './tools/get_folder_comments.js';
import * as create_folder_comment from './tools/create_folder_comment.js';
import * as update_folder_comment from './tools/update_folder_comment.js';
import * as delete_folder_comment from './tools/delete_folder_comment.js';
import * as get_collection_forks from './tools/get_collection_forks.js';
import * as get_generated_collection_specs from './tools/get_generated_collection_specs.js';
import * as generate_spec_from_collection from './tools/generate_spec_from_collection.js';
import * as publish_documentation from './tools/publish_documentation.js';
import * as unpublish_documentation from './tools/unpublish_documentation.js';
import * as pull_collection_changes from './tools/pull_collection_changes.js';
import * as create_collection_request from './tools/create_collection_request.js';
import * as get_request_comments from './tools/get_request_comments.js';
import * as create_request_comment from './tools/create_request_comment.js';
import * as update_request_comment from './tools/update_request_comment.js';
import * as delete_request_comment from './tools/delete_request_comment.js';
import * as create_collection_response from './tools/create_collection_response.js';
import * as get_response_comments from './tools/get_response_comments.js';
import * as create_response_comment from './tools/create_response_comment.js';
import * as update_response_comment from './tools/update_response_comment.js';
import * as delete_response_comment from './tools/delete_response_comment.js';
import * as get_source_collection_status from './tools/get_source_collection_status.js';
import * as sync_collection_with_spec from './tools/sync_collection_with_spec.js';
import * as get_collection_folder from './tools/get_collection_folder.js';
import * as update_collection_folder from './tools/update_collection_folder.js';
import * as delete_collection_folder from './tools/delete_collection_folder.js';
import * as get_collection_request from './tools/get_collection_request.js';
import * as update_collection_request from './tools/update_collection_request.js';
import * as delete_collection_request from './tools/delete_collection_request.js';
import * as get_collection_response from './tools/get_collection_response.js';
import * as update_collection_response from './tools/update_collection_response.js';
import * as delete_collection_response from './tools/delete_collection_response.js';
import * as get_collection_tags from './tools/get_collection_tags.js';
import * as update_collection_tags from './tools/update_collection_tags.js';
import * as transfer_collection_folders from './tools/transfer_collection_folders.js';
import * as transfer_collection_requests from './tools/transfer_collection_requests.js';
import * as transfer_collection_responses from './tools/transfer_collection_responses.js';
import * as get_collection_updates_tasks from './tools/get_collection_updates_tasks.js';
import * as resolve_comment_thread from './tools/resolve_comment_thread.js';
import * as get_async_spec_task_status from './tools/get_async_spec_task_status.js';
import * as get_environments from './tools/get_environments.js';
import * as create_environment from './tools/create_environment.js';
import * as get_environment from './tools/get_environment.js';
import * as patch_environment from './tools/patch_environment.js';
import * as put_environment from './tools/put_environment.js';
import * as delete_environment from './tools/delete_environment.js';
import * as get_authenticated_user from './tools/get_authenticated_user.js';
import * as get_mocks from './tools/get_mocks.js';
import * as create_mock from './tools/create_mock.js';
import * as get_mock from './tools/get_mock.js';
import * as update_mock from './tools/update_mock.js';
import * as delete_mock from './tools/delete_mock.js';
import * as publish_mock from './tools/publish_mock.js';
import * as unpublish_mock from './tools/unpublish_mock.js';
import * as get_monitors from './tools/get_monitors.js';
import * as create_monitor from './tools/create_monitor.js';
import * as get_monitor from './tools/get_monitor.js';
import * as update_monitor from './tools/update_monitor.js';
import * as delete_monitor from './tools/delete_monitor.js';
import * as run_monitor from './tools/run_monitor.js';
import * as get_all_elements_and_folders from './tools/get_all_elements_and_folders.js';
import * as post_pan_element_or_folder from './tools/post_pan_element_or_folder.js';
import * as update_pan_element_or_folder from './tools/update_pan_element_or_folder.js';
import * as delete_pan_element_or_folder from './tools/delete_pan_element_or_folder.js';
import * as get_all_pan_add_element_requests from './tools/get_all_pan_add_element_requests.js';
import * as get_tagged_entities from './tools/get_tagged_entities.js';
import * as get_all_specs from './tools/get_all_specs.js';
import * as create_spec from './tools/create_spec.js';
import * as get_spec from './tools/get_spec.js';
import * as delete_spec from './tools/delete_spec.js';
import * as update_spec_properties from './tools/update_spec_properties.js';
import * as get_spec_definition from './tools/get_spec_definition.js';
import * as create_update_spec_file from './tools/create_update_spec_file.js';
import * as get_spec_collections from './tools/get_spec_collections.js';
import * as generate_collection from './tools/generate_collection.js';
import * as sync_spec_with_collection from './tools/sync_spec_with_collection.js';
import * as get_workspaces from './tools/get_workspaces.js';
import * as create_workspace from './tools/create_workspace.js';
import * as get_workspace from './tools/get_workspace.js';
import * as update_workspace from './tools/update_workspace.js';
import * as delete_workspace from './tools/delete_workspace.js';
import * as get_workspace_global_variables from './tools/get_workspace_global_variables.js';
import * as update_workspace_global_variables from './tools/update_workspace_global_variables.js';
import * as get_workspace_tags from './tools/get_workspace_tags.js';
import * as update_workspace_tags from './tools/update_workspace_tags.js';

dotenv.config();

const SERVER_NAME = 'generated-postman-api-mcp-server';
const APP_VERSION = '0.1.0';
export const USER_AGENT = `${SERVER_NAME}/${APP_VERSION}`;

const logger = {
  timestamp() {
    return new Date().toISOString();
  },
  info(message: string, sessionId: string | null = null) {
    const sessionPart = sessionId ? `[SessionId: ${sessionId}] ` : '';
    console.log(`[${this.timestamp()}] [INFO] ${sessionPart}${message}`);
  },
  debug(message: string, sessionId: string | null = null) {
    const sessionPart = sessionId ? `[SessionId: ${sessionId}] ` : '';
    console.log(`[${this.timestamp()}] [DEBUG] ${sessionPart}${message}`);
  },
  warn(message: string, sessionId: string | null = null) {
    const sessionPart = sessionId ? `[SessionId: ${sessionId}] ` : '';
    console.warn(`[${this.timestamp()}] [WARN] ${sessionPart}${message}`);
  },
  error(message: string, error: any = null, sessionId: string | null = null) {
    const sessionPart = sessionId ? `[SessionId: ${sessionId}] ` : '';
    console.error(`[${this.timestamp()}] [ERROR] ${sessionPart}${message}`, error || '');
  },
};

let currentApiKey: string | undefined = undefined;

const allGeneratedTools = [
  update_api_collection_comment,
  delete_api_collection_comment,
  get_status_of_an_async_task,
  get_collections,
  create_collection,
  get_collections_forked_by_user,
  create_collection_fork,
  get_collection,
  put_collection,
  patch_collection,
  delete_collection,
  get_collection_comments,
  create_collection_comment,
  update_collection_comment,
  delete_collection_comment,
  create_collection_folder,
  get_folder_comments,
  create_folder_comment,
  update_folder_comment,
  delete_folder_comment,
  get_collection_forks,
  get_generated_collection_specs,
  generate_spec_from_collection,
  publish_documentation,
  unpublish_documentation,
  pull_collection_changes,
  create_collection_request,
  get_request_comments,
  create_request_comment,
  update_request_comment,
  delete_request_comment,
  create_collection_response,
  get_response_comments,
  create_response_comment,
  update_response_comment,
  delete_response_comment,
  get_source_collection_status,
  sync_collection_with_spec,
  get_collection_folder,
  update_collection_folder,
  delete_collection_folder,
  get_collection_request,
  update_collection_request,
  delete_collection_request,
  get_collection_response,
  update_collection_response,
  delete_collection_response,
  get_collection_tags,
  update_collection_tags,
  transfer_collection_folders,
  transfer_collection_requests,
  transfer_collection_responses,
  get_collection_updates_tasks,
  resolve_comment_thread,
  get_async_spec_task_status,
  get_environments,
  create_environment,
  get_environment,
  patch_environment,
  put_environment,
  delete_environment,
  get_authenticated_user,
  get_mocks,
  create_mock,
  get_mock,
  update_mock,
  delete_mock,
  publish_mock,
  unpublish_mock,
  get_monitors,
  create_monitor,
  get_monitor,
  update_monitor,
  delete_monitor,
  run_monitor,
  get_all_elements_and_folders,
  post_pan_element_or_folder,
  update_pan_element_or_folder,
  delete_pan_element_or_folder,
  get_all_pan_add_element_requests,
  get_tagged_entities,
  get_all_specs,
  create_spec,
  get_spec,
  delete_spec,
  update_spec_properties,
  get_spec_definition,
  create_update_spec_file,
  get_spec_collections,
  generate_collection,
  sync_spec_with_collection,
  get_workspaces,
  create_workspace,
  get_workspace,
  update_workspace,
  delete_workspace,
  get_workspace_global_variables,
  update_workspace_global_variables,
  get_workspace_tags,
  update_workspace_tags,
];

async function run() {
  const args = process.argv.slice(2);
  const isSSE = args.includes('--sse') || process.env.MCP_TRANSPORT === 'sse';
  logger.info(`Transport mode determined: ${isSSE ? 'HTTP/SSE' : 'Stdio'}`);

  const server = new Server(
    { name: SERVER_NAME, version: APP_VERSION },
    { capabilities: { tools: {} } }
  );

  server.onerror = (error: any) => logger.error('[MCP Server Error]', error);

  process.on('SIGINT', async () => {
    logger.info('SIGINT received, shutting down server...');
    await server.close();
    process.exit(0);
  });

  logger.info(`Registering ${allGeneratedTools.length} tools...`);

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const toolName = request.params.name;
    const tool = allGeneratedTools.find((t) => t.method === toolName);

    if (!tool) {
      throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${toolName}`);
    }

    const args = request.params.arguments || {};

    try {
      if (!currentApiKey) {
        throw new McpError(ErrorCode.InvalidParams, 'API key is required.');
      }

      const result = await tool.handler(args as any, { apiKey: currentApiKey });
      return result;
    } catch (error: any) {
      throw new McpError(ErrorCode.InternalError, `API error: ${error.message}`, {
        originalError: error,
      });
    }
  });

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    const transformedTools = allGeneratedTools.map((tool) => ({
      name: tool.method,
      description: tool.description,
      inputSchema: zodToJsonSchema(tool.parameters),
      annotations: tool.annotations,
    }));
    return { tools: transformedTools };
  });

  if (isSSE) {
    const apiKeyCb = (key: string | undefined) => {
      currentApiKey = key;
      logger.info('API key set successfully.');
    };
    const app = createApp(server, logger, apiKeyCb);
    const port = process.env.PORT || 1337;
    const httpServer = app.listen(port, () => {
      logger.info(`[${SERVER_NAME} - HTTP/SSE Server] running on port ${port}.`);
    });
    process.on('SIGINT', () => {
      httpServer.close(() => logger.info('HTTP server closed.'));
    });
  } else {
    currentApiKey = process.env.POSTMAN_API_KEY;
    if (!currentApiKey) {
      logger.error('API key is required. Set the POSTMAN_API_KEY environment variable.');
      process.exit(1);
    }
    logger.info(`[${SERVER_NAME} - Stdio Transport] running.`);
    const transport = new StdioServerTransport();
    await server.connect(transport);
    logger.info('Stdio transport connected. Waiting for messages...');
  }
}

run().catch((error) => {
  logger.error('Unhandled error during server execution:', error);
  process.exit(1);
});
