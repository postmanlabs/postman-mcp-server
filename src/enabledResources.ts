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

  // Monitors
  'createMonitor',
  'deleteMonitor',
  'getMonitor',
  'getMonitors',
  'updateMonitor',
  'runMonitor',

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
  'getAllElementsAndFolders',
  'getAllPanAddElementRequests',
  'deletePanElementOrFolder',
  'postPanElementOrFolder',
  'updatePanElementOrFolder',

  // // Documentation
  'publishDocumentation',
  'unpublishDocumentation',

  // Tasks and Status
  'getAsyncSpecTaskStatus',
  'getStatusOfAnAsyncApiTask',

  // User and Tags
  'getAuthenticatedUser',
  'getTaggedEntities',

  // Code Generation
  'getCodeGenerationInstructions',

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
  'getStatusOfAnAsyncApiTask',
  'runCollection',
  'getEnabledTools',
  'updateCollectionRequest',
] as const;

const code = [
  'getCodeGenerationInstructions',
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
] as const;

const excludedFromGeneration = [
  'runCollection',
  'getEnabledTools',
  'getCodeGenerationInstructions',
  'getCollectionMap',
  'getCollection',
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

export const enabledResources = {
  full,
  minimal,
  code,
  excludedFromGeneration,
  subtools,
};
