## What's Changed

Synced tools, entrypoint, and tests from `postman-mcp-server` (#155).

### New tools

**Mock Server Responses**
- `createMockServerResponse`
- `getMockServerResponse`
- `getMockServerResponses`
- `updateMockServerResponse`
- `deleteMockServerResponse`

**Monitors**
- `listMonitorExecutions`
- `listRunsForExecution`
- `getMonitorRunResults`

### Tool set changes

- `full` set: added Mock Server Response tools and new Monitor execution tools. Removed the standalone Context tools group (still available in the `code` set).
- `minimal` set: added `searchPostmanElements`.
- `code` set: added the new Monitor execution tools; removed `searchPostmanElementsInPrivateNetwork`.

### Other updates

- Refreshed analytics tools (`getAnalyticsData`, `getAnalyticsMetadata`).
- Updated spec tools (`createSpec`, `createSpecFile`, `updateSpecFile`, `getSpecDefinition`, `generateSpecFromCollection`, `syncSpecWithCollection`).
- Tweaks to `createCollectionRequest`, `updateCollectionRequest`, `putCollection`, `updateMock`, `searchPostmanElements`.
- Template renderer utilities updated (`errorTemplateRenderer`, `templateRenderer`).
- Integration tests refreshed (`src/tests/integration/direct.test.ts`).
- `Instructions.md` resource updated.

**Full Changelog**: https://github.com/postmanlabs/postman-api-mcp/compare/v2.8.9...v2.9.0
