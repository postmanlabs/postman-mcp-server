const full = [
  // Collections
  'createCollection',
  'deleteCollection',
  'generateCollection',
  'getCollection',
  'getCollections',
  'patchCollection',
  'putCollection',
  'getCollectionTags',
  'updateCollectionTags',
  'getCollectionUpdatesTasks',
  'syncCollectionWithSpec',
  'syncSpecWithCollection',
  'generateSpecFromCollection',
  'getGeneratedCollectionSpecs',
  'getSpecCollections',

  // Collection Forks
  'getCollectionForks',
  'getSourceCollectionStatus',
  'getCollectionsForkedByUser',
  'pullCollectionChanges',
  'createCollectionFork',
  'mergeCollectionFork',

  // Collection Folders
  'createCollectionFolder',
  'deleteCollectionFolder',
  'getCollectionFolder',
  'updateCollectionFolder',
  'transferCollectionFolders',

  // Collection Requests
  'createCollectionRequest',
  'deleteCollectionRequest',
  'getCollectionRequest',
  'updateCollectionRequest',
  'transferCollectionRequests',

  // Collection Responses
  'createCollectionResponse',
  'deleteCollectionResponse',
  'getCollectionResponse',
  'updateCollectionResponse',
  'transferCollectionResponses',

  // Collection Runner
  'runCollection',

  // Comments
  'createCollectionComment',
  'deleteCollectionComment',
  'getCollectionComments',
  'updateCollectionComment',
  'updateApiCollectionComment',
  'createFolderComment',
  'deleteFolderComment',
  'getFolderComments',
  'updateFolderComment',
  'createRequestComment',
  'deleteRequestComment',
  'getRequestComments',
  'updateRequestComment',
  'createResponseComment',
  'deleteResponseComment',
  'getResponseComments',
  'updateResponseComment',
  'resolveCommentThread',

  // Environments
  'createEnvironment',
  'deleteEnvironment',
  'getEnvironment',
  'getEnvironments',
  'patchEnvironment',
  'putEnvironment',

  // Mocks
  'createMock',
  'deleteMock',
  'getMock',
  'getMocks',
  'updateMock',
  'publishMock',
  'unpublishMock',

  // Mock Server Responses
  'createMockServerResponse',
  'deleteMockServerResponse',
  'getMockServerResponse',
  'getMockServerResponses',
  'updateMockServerResponse',

  // Monitors
  'createMonitor',
  'deleteMonitor',
  'getMonitor',
  'getMonitors',
  'updateMonitor',
  'runMonitor',
  'listMonitorExecutions',
  'listRunsForExecution',
  'getMonitorRunResults',

  // Specs
  'createSpec',
  'deleteSpec',
  'getSpec',
  'getAllSpecs',
  'getSpecDefinition',
  'updateSpecProperties',
  'createSpecFile',
  'getSpecFile',
  'getSpecFiles',
  'updateSpecFile',

  // Workspaces
  'createWorkspace',
  'deleteWorkspace',
  'getWorkspace',
  'getWorkspaces',
  'updateWorkspace',
  'getWorkspaceGlobalVariables',
  'updateWorkspaceGlobalVariables',
  'getWorkspaceTags',
  'updateWorkspaceTags',

  // PAN (Private API Network)
  'listPrivateNetworkWorkspaces',
  'listPrivateNetworkAddRequests',
  'removeWorkspaceFromPrivateNetwork',
  'addWorkspaceToPrivateNetwork',
  'respondPrivateNetworkAddRequest',

  // // Documentation
  'publishDocumentation',
  'unpublishDocumentation',

  // Tasks and Status
  'getAsyncSpecTaskStatus',
  'getStatusOfAnAsyncApiTask',

  // User and Tags
  'getAuthenticatedUser',
  'getTaggedEntities',

  // Instructions
  'getCodeGenerationInstructions',
  'getPostmanContextOverview',
  'getApiDiscoveryInstructions',
  'getInstalledApiMaintenanceInstructions',

  // Transfer
  'transferCollectionFolders',
  'transferCollectionResponses',
  'transferCollectionResponses',

  // 'asyncMergePullCollectionFork' skipped
  // 'asyncMergePullCollectionTaskStatus' skipped

  // Duplicate Collection
  'duplicateCollection',
  'getDuplicateCollectionTaskStatus',
  'deleteApiCollectionComment',
  'deleteSpecFile',
  'getEnabledTools',
  'searchPostmanElements',

  // Learning Center
  'searchLearningCenter',

  // Analytics
  'getAnalyticsData',
  'getAnalyticsMetadata',
] as const;

const minimal = [
  'createCollection',
  'createEnvironment',
  'createMock',
  'createSpec',
  'createSpecFile',
  'createWorkspace',
  'generateCollection',
  'generateSpecFromCollection',
  'getAllSpecs',
  'getAuthenticatedUser',
  'getCollection',
  'getCollections',
  'getEnvironment',
  'getEnvironments',
  'getGeneratedCollectionSpecs',
  'getMock',
  'getMocks',
  'getSpec',
  'getSpecCollections',
  'getSpecDefinition',
  'getSpecFile',
  'getSpecFiles',
  'getTaggedEntities',
  'getWorkspace',
  'getWorkspaces',
  'publishMock',
  'putCollection',
  'putEnvironment',
  'syncCollectionWithSpec',
  'syncSpecWithCollection',
  'updateMock',
  'updateSpecFile',
  'updateSpecProperties',
  'updateWorkspace',
  'createCollectionRequest',
  'createCollectionResponse',
  'duplicateCollection',
  'getDuplicateCollectionTaskStatus',
  'runCollection',
  'getEnabledTools',
  'updateCollectionRequest',
  'searchPostmanElements',
] as const;

const code = [
  'getCodeGenerationInstructions',
  'getPostmanContextOverview',
  'getApiDiscoveryInstructions',
  'getInstalledApiMaintenanceInstructions',
  'getWorkspace',
  'getWorkspaces',
  'searchPostmanElements',
  'getCollectionRequest',
  'getCollectionResponse',
  'getCollectionFolder',
  'getAuthenticatedUser',
  'getCollection',
  'getEnvironment',
  'getEnvironments',
  // Context tools (AI-optimized markdown views)
  'getCollectionContext',
  'getFolderContext',
  'getRequestContext',
  'getResponseContext',
  'getRequestCodeContext',
  'getEnvironmentContext',
  'getWorkspacesContext',
  'getWorkspaceContext',
  'getWorkspaceEnvironmentsContext',
] as const;

const learn = ['searchLearningCenter'] as const;

const excludedFromGeneration = [
  'runCollection',
  'getEnabledTools',
  'listMonitorExecutions',
  'listRunsForExecution',
  'getMonitorRunResults',
  'getCodeGenerationInstructions',
  'getPostmanContextOverview',
  'getApiDiscoveryInstructions',
  'getInstalledApiMaintenanceInstructions',
  'getCollectionMap',
  'getCollection',
  'searchPostmanElements',
  'searchPostmanElementsInPublicNetwork',
  'searchPostmanElementsInPrivateNetwork',
  'searchLearningCenter',
  // Context tools (hand-written, not generated from spec)
  'getCollectionContext',
  'getFolderContext',
  'getRequestContext',
  'getResponseContext',
  'getRequestCodeContext',
  'getEnvironmentContext',
  'getWorkspacesContext',
  'getWorkspaceContext',
  'getWorkspaceEnvironmentsContext',
] as const;

/**
 * Subtools are tools that are grouped under a parent tool orchestrator.
 * Each subtool is defined with:
 * - orchestrator: The main tool that will be exposed (the index.ts file)
 * - subtools: Array of tools that will be placed in the orchestrator's folder
 *
 * Example structure for 'getCollection':
 * tools/
 *   getCollection/
 *     index.ts          <- orchestrator (handles routing logic)
 *     getCollection.ts  <- subtool (the actual API call)
 *     getCollectionMap.ts <- subtool (the map variant)
 */
const subtools = {
  getCollection: {
    orchestrator: 'getCollection',
    subtools: ['getCollection', 'getCollectionMap'],
  },
} as const;

const templated = ['getCollections', 'getWorkspaces'] as const;

export const enabledResources = {
  full,
  minimal,
  code,
  learn,
  excludedFromGeneration,
  subtools,
  templated,
};
