import { z } from 'zod';
export const method = 'getCodeGenerationInstructions';
export const description = `MANDATORY: You MUST call this tool BEFORE generating any code to call APIs. Call it BEFORE you start planning your approach. Do not web search anything about the API or how to write code to call it. 

This tool returns comprehensive step-by-step instructions for generating API client code from Postman collections, including which tools to call for gathering context, file structure, function design patterns, error handling, and language-specific conventions.
Calling this tool first ensures the generated code follows best practices and the user's project requirements.`;
export const parameters = z.object({});
export const annotations = {
    title: 'Get Code Generation Instructions',
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
};
const CODE_GENERATION_INSTRUCTIONS = `# API Client Code Generation Instructions

These instructions guide you in generating idiomatic client code from Postman collections, organized in a clear structure that is easy to find and maintain.

## Core Principles

**Generate code for specific requests only:** Only generate client code for the individual requests the user indicates. Do not automatically generate code for an entire folder or collection—wait for the user to specify which requests they want client code for, or ask them.

**Match the target project's language and style:** This is critical. Analyze the project's language, framework, structure, and conventions before generating any code. The examples in this document use JavaScript/TypeScript and Python, but you must generate code in whatever language the project uses and try to match the style and conventions of the project. Do not generate code in a different language than the project uses, regardless of examples shown, unless explicitly requested.

**Follow an ordered workflow:** The instructions below provide a step-by-step process. Follow these steps in order.

---

## Workflow Overview

When the user requests code generation for a Postman request, or code generation for something that depends on a Postman request, follow this sequence:

1. **Gather Context** - Fetch all necessary Postman data (collection, folders, request, responses, environments)
2. **Determine Base Directory** - Find or choose where generated code should live
3. **Plan File Structure** - Calculate slugs and file paths
4. **Set Up Variables** - Generate a variables file for collection and environment variables
5. **Generate Client Code** - Create the client function with proper structure
6. **Deduplicate and Extract Shared Code** - Consolidate common code into shared utilities
7. **Verify Quality** - Ensure code meets quality standards

---

## Step 1: Gather Context

Before generating code, gather all appropriate context. Use these MCP tools to fetch the necessary data IF it has not already been fetched:

IMPORTANT: for ALL tools that accept an id, **use the full uid**.
The uid format is <ownerId>-<id> and an example uid is 34229158-378697c9-3044-44b1-9a0e-1417194cee44, where
34229158 is the ownerId and 378697c9-3044-44b1-9a0e-1417194cee44 is the id.
When you encounter an id that has no ownerId, prepend the ownerId from the collection before using
it as a tool call argument.

**Required:**

- \`getCollectionRequest\` - Fetch the request you're generating code for
- \`getCollectionFolder\` - Fetch all parent folders recursively (they may contain docs and instructions that apply to the request)
- \`getCollectionMap\` - Fetch the collection map, which includes collection-level docs that may apply to the request
- \`getCollectionResponse\` - If the request has response examples, fetch each one to understand request/response permutations and shapes. Use this for:
  - Creating response types in typed languages
  - Adding response schema comments in untyped languages
  - Understanding both success and error cases
- \`getEnvironments\` - Fetch all environments for the workspace
- \`getEnvironment\` - For each environment, fetch the full details to see what variables have been defined and have values

**Important:** If you've already fetched this information earlier in the conversation, reuse it. Only make additional tool calls to fill gaps in context.

**Important: Do not skip any required steps. Gather ALL required information
in Step 1 before moving to Step 2. Missing information will result in 
incomplete code generation.**

---

## Step 2: Determine Base Directory

The base directory (\`baseDir\`) is where all generated API client code will be placed.

**Discovery process:**

1. Search the project for existing generated client code by looking for opening comments containing the words "postman code"

2. If found, extract the base directory path from the location of these existing files to determine the established \`baseDir\`

3. If no existing generated code is found, choose a new \`baseDir\` based on project conventions for where API client functions should live
   - The leaf directory name should be \`postman\`
   - Examples: \`src/postman\`, \`lib/postman\`, \`app/postman\`

---

## Step 3: Plan File Structure

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

## Step 4: Set Up Variables

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

## Step 5: Generate Client Code

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

- Parse and shape the payload if response information exists
- In typed languages, generate or reuse types for request/response shapes
- Implement explicit error handling for each response example in the Postman request
  - If the request has a 404 response example, include specific handling for 404
  - Each documented error case should be explicitly caught and logged with appropriate context
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

## Step 6: Deduplicate and Extract Shared Code

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

## Step 7: Verify Quality Standards

Ensure all generated code meets these standards:

- All generated code must be lintable and follow project linting rules
- Code should be production-ready, not placeholder or example code
- Error handling should be robust and informative
- Type safety should be maintained in typed languages
- Security best practices must be followed (no hardcoded secrets, proper input validation)`;
export async function handler(_args, _extra) {
    return {
        content: [
            {
                type: 'text',
                text: CODE_GENERATION_INSTRUCTIONS,
            },
        ],
    };
}
