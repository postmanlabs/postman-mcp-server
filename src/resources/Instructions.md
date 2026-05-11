# Postman MCP Server — Instructions

## What is Postman?

Postman is a comprehensive API platform used by developers and teams to design, build, test, document, and share APIs. It provides tools for making HTTP requests, organizing API endpoints into collections, managing environments and variables, creating mock servers, setting up monitors, and publishing API documentation.

## What is this MCP server?

This is a Model Context Protocol (MCP) server that exposes Postman's API as a set of tools you can invoke. It lets you interact with your Postman workspace programmatically — managing collections, environments, APIs, mocks, monitors, and more — all through structured tool calls.

## Postman elements

Postman organises API work around a set of core elements. Understanding these is key to using the MCP server effectively.

- **Workspace** — A shared space that groups related collections, environments, APIs, mocks, and monitors. Every element belongs to a workspace. Workspaces can be personal, team, partner, or public.
- **Collection** — An ordered set of API requests grouped into folders. Collections are the primary unit for organising, documenting, testing, and running API calls. Each collection can contain folders, requests, responses (saved examples), pre-request scripts, and tests.
- **Folder** — A logical grouping of requests inside a collection. Folders can be nested to create a hierarchy (e.g. by resource or feature).
- **Request** — A single API call definition inside a collection. It includes the HTTP method, URL, headers, query parameters, body, authorization settings, and optional pre-request/test scripts.
- **Response (saved example)** — A snapshot of a request/response pair saved inside a request. Saved examples are used by mock servers to return realistic responses and serve as inline documentation.
- **Environment** — A set of key-value variables scoped to a particular context (e.g. development, staging, production). Variables can be of type `default` or `secret`. Environments are applied to requests at runtime so you can switch contexts without editing URLs or headers.
- **API (Spec)** — A versioned API definition (OpenAPI, GraphQL SDL, etc.) managed inside Postman. An API can be linked to collections, environments, mocks, monitors, and documentation.
- **Mock server** — A simulated endpoint that returns responses based on the saved examples in a collection. Useful for front-end development and testing before the real API is ready.
- **Monitor** — A scheduled runner that executes a collection on a set interval and reports results. Monitors are used for uptime checks, integration tests, and alerting.
- **Tags** — Labels attached to collections or workspaces for categorisation and search. Tags make it easier to find related elements across the organisation.

## Private API Network
The Private API Network is an organisation-wide catalogue of approved APIs, collections, and workspaces. Teams publish elements to the Private API Network so others can discover and reuse them.

## Public API Network (Postman API Network)
The Public API Network is a collection of APIs and collections published by Postman and third-party developers. It's a public repository of APIs and collections that anyone can use.

## Finding APIs

These instructions apply any time the user wants to find, discover, or locate an API — whether internal or public.

**Do NOT rely on your own knowledge of available tools or APIs to answer questions like "is there an API for X?" or "find me an API that does Y."**
 Always search first using this workflow

**Follow the search workflow whenever the user:**
 - Asks to **find**, **discover**, **locate**, or **look up** an API
 - Asks **"is there an API for..."** or **"can I do X via an API?"**
 - Asks about capabilities that may or may not exist
 - Is unsure what API to use for a task

> **Anti-pattern to avoid:**
> User asks "Is there a bulk API for workspaces?" → You scan the tool list, don't see one, and say "No such API exists."
> Correct behavior: Follow the search workflow below, search the network, and only then draw conclusions.

---

### Decision Framework: Which Ownership to Use

Use the `searchPostmanElements` tool with the appropriate `ownership` and optional `filters` parameters.

**Default to `ownership: "organization"`** for all requests. Use filters to narrow the results.

#### Use `ownership: "organization"` (Default) When:

- The user asks to "find an API", "search for a service", or "look up an endpoint"
- The user mentions internal services (e.g., "find the notification service", "search for our payment API")
- The user wants to integrate with a team or company API
- The user says "find a trusted API for X" or "what APIs do we have for Y"
- The user references internal infrastructure, microservices, or team-shared resources
- The request is ambiguous — **always prefer organization scope**

**Narrow with filters as needed:**

| Goal                                                            | Filter to add                                           |
|-----------------------------------------------------------------|---------------------------------------------------------|
| Trusted internal APIs in the organization (Private API Network) | `filters: {"$and":[{"privateNetwork":{"$eq":true}}]}`   |
| All internal APIs in the organization                           | `filters: {"$and":[{"visibility":{"$eq":"internal"}}]}` |
| Publicly visible APIs (e.g. Stripe, GitHub)                     | `filters: {"$and":[{"visibility":{"$eq":"public"}}]}`   |
| Specific workspace                                              | `filters: {"$and":[{"workspaceId":{"$eq":"<id>"}}]}`    |
#### Use `ownership: "external"` When:

- The user explicitly wants to search beyond the organization (Third party APIs)
- The user asks for a well-known public API (e.g., "find the Stripe API", "search for the GitHub API")

**When in doubt, use `ownership: "organization"` first.** If no relevant results are found, broaden to `ownership: "all"` and try different visibility filters while letting the user know.

---

### Search Workflow

#### Step 1: Determine Search Ownership

Based on the user's request, decide which ownership to use using the decision framework above.

#### Step 2: Execute the Search

`searchPostmanElements(entityType, q, ownership: organization, filters?)`
- Use `entityType: "collections"` to find API collections (recommended starting point)
- Use `entityType: "requests"` to find specific API requests
- Use `entityType: "workspaces"`, `"apis"`, `"specs"`, or `"flows"` for other entity types
- Craft a concise, relevant search query from the user's intent (e.g., "notification", "payment", "authentication")
- For Private API Network results: add `filters: {"$and":[{"privateNetwork":{"$eq":true}}]}`
- For internally visible APIs (e.g. API of another team in the organization): add `filters: {"$and":[{"visibility":{"$eq":"internal"}}]}`
- For publicly visible APIs (e.g. Stripe, GitHub): add `filters: {"$and":[{"visibility":{"$eq":"public"}}]}`
- To filter by workspace: add `filters: {"$and":[{"workspaceId":{"$eq":"<id>"}}]}`

#### Step 3: Present Results

- Summarize the search results clearly to the user
- Highlight the most relevant matches based on the user's intent
- If multiple results are found, briefly describe each and ask the user which one to explore
- If no results are found, broaden to `ownership: "all"` with different visibility filters and let the user know

#### Step 4: Explore the Selected API

Once the user selects a collection:

1. `getCollection(collectionId)` — Fetch collection details with the recursive itemRefs index
2. `getCollectionRequest(requestId, collectionId, uid: true, populate: false)` — Explore individual requests
3. `getCollectionFolder(folderId, collectionId, uid: true, populate: false)` — Explore folders

**IMPORTANT:** After establishing a collection, do NOT call `searchPostmanElements` again to find requests within it. Use `getCollectionRequest` and `getCollectionFolder` to navigate the collection's contents.

- **Never conclude that an API doesn't exist based solely on the MCP tool list.** The tool list covers tools for *using* Postman, not the full universe of APIs your organization may have published. Always search before concluding.
