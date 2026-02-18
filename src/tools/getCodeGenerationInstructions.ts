import { z } from 'zod';
import { PostmanAPIClient } from '../clients/postman.js';
import { IsomorphicHeaders, CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { ServerContext } from './utils/toolHelpers.js';

export const method = 'getCodeGenerationInstructions';
export const description = `This tool returns essential instructions for searching Postman, calling other tools to get data from Postman (e.g. getCollection, getCollectionRequest, etc.), and generating API client code.

MANDATORY: You MUST call this tool when the user says to "use postman", or when the user wants to do something that requires locating a specific API for the purpose of answering questions, planning a build, and in most cases proceeding to generate code that calls the API. ALWAYS call getCodeGenerationInstructions BEFORE calling other tools in this workflow. This tool returns comprehensive step-by-step instructions on how to search for APIs, gather API-specific context from other tools, and then generate client code based on the context retrieved.`;

export const parameters = z.object({});

export const annotations = {
  title: 'Get Code Generation Instructions',
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
};

const CODE_GENERATION_INSTRUCTIONS = `# API Exploration and Client Code Generation Instructions

These instructions guide you in exploring APIs, planning an approach to build something with an API, and then generating idiomatic client code from Postman collections, organized in a clear structure that is easy to find and maintain.

---

## Workflow Overview

The workflow has three main parts:

**Part 1: API Discovery and Planning** - Work with the user to find the right collection, explore requests, answer questions, and determine which requests need code generated.

**Part 2: Gather Complete Context** - Once you know which requests to generate code for, gather all remaining context needed for code generation.

**Part 3: Code Generation** - Generate the client code with proper structure, variables, and documentation.

### Important Notes on Tool Calls

These notes apply to all tool calls throughout this workflow:

- For ALL tools that accept an id, **use the full uid**. The uid format is <ownerId>-<id> (e.g., 34229158-378697c9-3044-44b1-9a0e-1417194cee44). When you encounter an id without an ownerId, prepend the ownerId from the collection.

- No need to call the same tool twice with the same arguments. Once you've fetched data, reuse it.

---

# Part 1: API Discovery and Planning

This is the interactive phase where you work with the user to find the right APIs and plan what to build.

## 1.1 Find the Collection

First, locate the collection the user wants to work with. Determine whether the user is looking for a **public API** (e.g., Stripe, GitHub, Twilio) or an **internal API** (e.g., company-specific services, internal microservices). If unclear, ask the user or make an educated guess based on context.

### For Public APIs

Use \`searchPostmanElements\` to find public API collections:

- \`searchPostmanElements(q, entityType: collections)\` - Search for public collections. E.g. if the user says "find the Stripe API and build a demo" then call this tool with the query "stripe" and entityType "collections". Review the collection(s) returned and select the best match. If multiple collections look viable, ask the user which one to use.

### For Internal APIs

Use \`getWorkspaces\` and \`getWorkspace\` to find internal API collections:

- \`getWorkspaces()\` - Fetch all workspaces the user has access to. Look for a workspace with a name that matches what the user is looking for.

- \`getWorkspace(workspaceId)\` - For each promising workspace, fetch its details to see the collections it contains. Look for collections with names that match the user's request.

### Fetch Collection Details

Once you've identified the target collection (from either path above):

- \`getCollection(collectionId)\` - Fetch the collection details by passing its uid. IMPORTANT: Do NOT pass model=minimal or model=full, omit the model parameter entirely. The response will include collection-level documentation and a recursive itemRefs array with the names and uids of all folders and requests.

**IMPORTANT:** Once you have established the collection, do NOT call searchPostmanElements or getWorkspaces again to find requests. Use getCollectionRequest to explore individual requests within the collection.

## 1.2 Explore Requests and Plan

With the collection established, explore specific requests to answer user questions and plan what will be built:

- \`getCollectionRequest(requestId, collectionId, uid: true, populate: false)\` - For each request the user is interested in, use this tool to fetch the details. ALWAYS pass populate: false to avoid fetching all response examples, which can overload the context window. The response includes response uids that you can fetch individually later.

Use the information from request exploration to:
- Answer user questions about the API
- Help the user understand what's available
- Plan which requests will need code generated
- Determine the scope of the build

You can also call other tools like getCollectionFolder, getCollectionResponse, and getEnvironments during this phase if it aids in the exploration process.

---

# Part 2: Gather Complete Context

Once you know which requests need code generated, gather all remaining context that wasn't fetched during exploration. Use these tools to gather the context:

- \`getCollectionFolder(folderId, collectionId, uid: true, populate: false)\` - For each request that will have code generated, call this tool for all ancestor folders, which may contain docs and instructions that apply to the request. ALWAYS pass populate: false to avoid fetching child objects.

- \`getCollectionResponse(responseId, collectionId, uid: true, populate: false)\` - Call this for response example uids returned from getCollectionRequest. Use the information for: creating response types in typed languages, adding response schema comments in untyped languages, and understanding both success and error cases.

- \`getEnvironments(workspaceId)\` - Fetch all environments for the workspace that the collection belongs to (the workspaceId was returned from searchPostmanElements). ALWAYS pass a workspaceId. If you do not have a workspaceId, do NOT call this tool.

- \`getEnvironment(environmentId)\` - For each environment, fetch the full details to see what variables have been defined and retrieve their values.

Do not skip any tool calls unless you lack the data to make the call. Missing information will result in incomplete code generation. Reuse data from previous tool calls when possible.

---

# Part 3: Code Generation

**Key principle:** Only generate client code for the specific API requests that were deemed relevant in the previous steps. Do not automatically generate code for an entire folder or collection unless explicitly told to do so.**

## 3.1 Determine Base Directory

The base directory (\`baseDir\`) is where all generated API client code will be placed.

**Discovery process:**

1. Search the project for existing generated client code by looking for opening comments containing the words "postman code"

2. If found, extract the base directory path from the location of these existing files to determine the established \`baseDir\`

3. If no existing generated code is found, choose a new \`baseDir\` based on project conventions for where API client functions should live
   - The leaf directory name should be \`postman\`
   - Examples: \`src/postman\`, \`lib/postman\`, \`app/postman\`

---

## 3.2 Plan File Structure

### Directory Structure

Organize generated code following this hierarchy:

\`\`\`
<baseDir>/
  <collection-slug>/
    <folder-slug>/
      <request-slug>/
        client.<ext>
    <request-slug>/
      client.<ext>
    shared/
      (extracted types and utilities)
\`\`\`

### File Path Per Request

- Path pattern: \`<baseDir>/<collection-slug>/<folder-slug?>/<request-slug>/client.<ext>\`
- Do not use the request name in the filename; always use \`client.ts\`, \`client.js\`, \`client.py\`, etc.
- Each request gets its own directory named with its slug
- Export following existing project conventions

### Slugification

Convert any Postman object name into a filesystem and git-safe string:

\`\`\`javascript
function createSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
\`\`\`

### Collision Handling

If two sibling requests resolve to the same slug, append an index: \`-1\`, \`-2\`, \`-3\`, etc.

---

## 3.3 Set Up Variables

If variables exist at the collection level or in any environment, generate a variables file in the shared folder.

### Variables File Location

Place the variables file at: \`<baseDir>/<collection-slug>/shared/variables.<ext>\`

Use the appropriate extension for the target language (\`.ts\`, \`.js\`, \`.py\`, etc.).

### Variables File Structure

Export a single object named \`variables\` that contains:

- A \`collection\` key for collection-level variables
- A key for each environment (using the exact environment name from Postman)

**Important:**
- Environment names can be anything and are used exactly as they appear in Postman
- Do not modify or normalize environment names
- Do not bind variables to environment variables here—this file reflects what's on Postman
- The caller of the generated API client is responsible for preparing variables to pass to the API clients, using data from the variables file or whatever it deems appropriate

**Example (TypeScript):**

\`\`\`typescript
export const variables = {
  collection: {
    apiVersion: 'v2',
    retryAttempts: 3,
  },
  "Production Environment": {
    baseUrl: 'https://api.example.com',
    apiKey: '',
  },
  "Staging Environment": {
    baseUrl: 'https://api-staging.example.com',
    apiKey: '',
  },
};
\`\`\`

**Example (Python):**

\`\`\`python
variables = {
    'collection': {
        'api_version': 'v2',
        'retry_attempts': 3,
    },
    'Production Environment': {
        'base_url': 'https://api.example.com',
        'api_key': '',
    },
    'Staging Environment': {
        'base_url': 'https://api-staging.example.com',
        'api_key': '',
    },
}
\`\`\`

---

## 3.4 Generate Client Code

**Critical:** Analyze the project's language, framework, structure, and conventions before generating any code. Generate code in whatever language the project uses and match its style and conventions. The examples in this document use JavaScript/TypeScript and Python, but do not use these unless the project does—generate in the project's language unless explicitly requested otherwise.

For each request, generate a client file with the following components:

### Opening Comment (Required)

Every generated client file must include an opening comment at the top using language-appropriate comment syntax.

**Required fields:**

- The phrase "Generated by Postman Code" (for discovery)
- Collection name and Collection UID (grouped together)
- Full path showing folders and request name (e.g., "Folder1 > Subfolder > Request Name")
- Request UID
- Modified timestamp from the Postman request object (serves as a version indicator)

**Example formats:**

JavaScript/TypeScript:

\`\`\`javascript
/**
 * Generated by Postman Code
 *
 * Collection: Stripe API
 * Collection UID: 12345678-1234-1234-1234-123456789abc
 *
 * Request: Payment Intents > Create Payment Intent
 * Request UID: 87654321-4321-4321-4321-cba987654321
 * Request modified at: 2024-11-10T15:45:30.000Z
 */
\`\`\`

Python:

\`\`\`python
"""
Generated by Postman Code
Collection: Stripe API
Collection UID: 12345678-1234-1234-1234-123456789abc
Request: Payment Intents > Create Payment Intent
Request UID: 87654321-4321-4321-4321-cba987654321
Request modified at: 2024-11-10T15:45:30.000Z
"""
\`\`\`

### Client Function Implementation

Generate a client function that implements these components:

**Variable handling:**

- Client functions should accept all variables they will use as specific function parameters
- Do not hardcode variable values in client functions
- The caller is responsible for:
  - Selecting which environment to use from the variables object
  - Merging collection-level and environment-level variables
  - Binding any variables to environment variables or secrets
  - Passing the merged variables to client functions

**URL construction:**

- Accept base URL and other URL-related variables as function parameters
- Substitute path parameters with function arguments
- Encode query parameters properly
- Build the complete URL from the base URL and path

**Headers:**

- Set headers per specification
- Never hardcode secrets; use environment variables or project secret helpers
- Follow project conventions for auth token handling

**Request body:**

- Serialize according to content type (JSON, form-data, urlencoded, etc.)
- Type appropriately in typed languages

**Authentication:**

- Implement exactly as defined in the request (bearer token, API key, basic auth, etc.)
- Always pull credentials from environment variables or project secret management
- Never hardcode credentials

**Response handling:**

- When response examples exist in the Postman request, use them to:
  - Generate accurate types for request/response shapes in typed languages
  - Add response schema comments in untyped languages
  - Implement explicit error handling for each documented error case (e.g., 404, 401, 422)
- When response examples do NOT exist, you may infer types from context, but you MUST add a warning comment to indicate uncertainty:
  - Add a comment like \`// WARNING: Unverified response type - no response examples in Postman\` above the inferred type
  - Or \`// WARNING: Unverified types - inferred from request structure\` as appropriate
- Follow project and any existing API client code conventions for error handling patterns around logging, exception classes, error codes, etc.

**Error handling example:**

\`\`\`javascript
// If Postman request has examples for 200, 404, 401, and 422 responses:
const response = await fetch(url, options);

if (response.ok) {
  return await response.json();
}

// Explicit handling for each documented error response
switch (response.status) {
  case 404:
    console.error('Resource not found');
    throw new NotFoundError(await response.json());

  case 401:
    console.error('Authentication failed');
    throw new UnauthorizedError(await response.json());

  case 422:
    console.error('Validation failed');
    throw new ValidationError(await response.json());

  default:
    console.error('Unexpected error');
    throw new Error(await response.text());
}
\`\`\`

**Documentation:**

- Add standard docstrings (JSDoc, TSDoc, Python docstrings, etc.)
- Include description from Postman request
- Document all parameters, return types, and possible errors

### Follow Existing Patterns

**Match project conventions:**

- Mirror the Postman workspace structure: collection → folders → requests
- Follow existing naming conventions in the \`baseDir\`
- Match casing style (camelCase, PascalCase, snake_case)
- Match export style (named exports, default exports, module.exports)
- Match directory layout conventions
- Use existing HTTP helpers if present in the project
- Follow existing error handling patterns
- Match existing auth implementation patterns
- Use environment variables consistently with project conventions
- Match documentation style already present

**Only deviate from existing patterns if explicitly requested by the user.**

### Language-Specific Guidelines

**JavaScript/TypeScript:**

- Use modern async/await syntax unless the project conventions dictate otherwise
- Use \`fetch\` or existing HTTP client in the project
- If TS, proper TypeScript types for all functions, parameters, and return values
- If JS, proper JSDoc comments that contain request and response shapes
- Use JSDoc or TSDoc comments in general for all functions, parameters, and return values

**Python:**

- Use \`requests\` library or existing HTTP client
- Type hints for all functions
- Proper docstrings (Google, NumPy, or project style)
- Follow PEP 8 conventions

**Other languages:**

- Follow idiomatic patterns for the language
- Use standard HTTP libraries
- Apply language-specific naming conventions
- Use appropriate documentation format; follow guidelines above for TS/JS and adapt to the language

---

## 3.5 Deduplicate and Extract Shared Code

After generating all requested client files, consolidate duplicated code within each collection.

### Detection

Identify duplicated types, interfaces, and utility functions within the same collection.

### Extraction Location

Extract shared code to: \`<baseDir>/<collection-slug>/shared/\`

This location is used for:

- Common types and interfaces
- Shared utility functions
- Common authentication helpers
- Reusable validation logic

### Update Imports

After extracting shared code:

- Modify generated clients to import from shared locations
- Maintain correct relative paths
- Ensure all imports resolve correctly

### Cross-Collection Sharing

- Keep helpers within a collection by default (e.g., Stripe and Slack collections stay separate)
- Only share code across collections when explicitly requested by the user

### Example Structure

\`\`\`
<baseDir>/
  github-api/
    shared/
      types.ts
      auth.ts
    users/
      get-user/
        client.ts
      list-users/
        client.ts
    repos/
      get-repo/
        client.ts
      list-repos/
        client.ts
\`\`\`

---

## 3.6 Verify Quality

Ensure all generated code meets these standards:

- All generated code must be lintable and follow project linting rules
- Code should be production-ready, not placeholder or example code
- Error handling should be robust and informative
- Type safety should be maintained in typed languages
- Security best practices must be followed (no hardcoded secrets, proper input validation)`;

export async function handler(
  _args: z.infer<typeof parameters>,
  _extra: { client: PostmanAPIClient; headers?: IsomorphicHeaders; serverContext?: ServerContext }
): Promise<CallToolResult> {
  return {
    content: [
      {
        type: 'text',
        text: CODE_GENERATION_INSTRUCTIONS,
      },
    ],
  };
}
