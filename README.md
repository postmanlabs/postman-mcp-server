# Postman MCP Server

The Postman MCP Server connects Postman to AI tools, giving AI agents and assistants the ability to access workspaces, manage collections and environments, evaluate APIs, and automate workflows through natural language interactions.

Postman supports the following tool configurations:

- **Minimal** — (Default) Only includes essential tools for basic Postman operations This offers faster performance and simplifies use for those who only need basic Postman operations. Ideal for users who want to modify a single Postman elements, such as collections, workspaces, or environments.
- **Full** — Includes all available Postman API tools (100+ tools). This configuration is ideal for users who engage in advanced collabration and Postman's Enterprise features.

### Use Cases

- **Collection management** - Create and tag collections, update collection and request documentation, add comments, or perform actions across multiple collections without leaving your editor.
- **Workspace and environment management** - Create workspaces and environments, plus manage your environment variables.
- **Automatic spec creation** - Create [specs](https://learning.postman.com/docs/design-apis/specifications/overview/) from your code and use them to generate Postman collections.
- **Code synchronization** - Effortlessly keep your code up to date based on changes made to your Postman collections and specs.

Designed for developers who want to integrate their AI tools with Postman’s context and features. Supports quick natural language queries queries to advanced agent workflows.

### Support for EU

The Postman MCP Server supports the EU region for Streamable HTTP and STDIO:
- For streamable HTTP, the server is available at `https://mcp.eu.postman.com`.
- For our STDIO public package, use the `--region` flag to specify the Postman API region (`us` or `eu``), or set the `POSTMAN_API_BASE_URL` environment variable directly.

---

### Contents

- [**Streamable HTTP**](#streamable-http)
  - [**Prerequisites**](#prerequisites)
  - [**VS Code**](#install-in-vs-code)
  - [**Cursor**](#install-in-cursor)
- [**STDIO**](#stdio)
  - [**Prerequisites**](#prerequisites-1)
  - [**Configuration**](#configuration)
  - [**VS Code**](#install-in-vs-code-1)
  - [**Cursor**](#install-in-cursor-1)
  - [**Claude**](#claude-integration)
- [**Questions and support**](#questions-and-support)
- [**Migration from Postman MCP Server v1 to v2**](#migration-from-v1x-to-v2x)

---

## Streamable HTTP

The streamable HTTP Postman MCP Server is hosted by Postman and provides the easiest method for getting started. If your MCP host doesn't support remote MCP servers, you can use the [STDIO version of the Postman MCP Server](#stdio).

The streamable HTTP server supports the following tool configurations:

- **Minimal** — (Default) Only includes essential tools for basic Postman operations, available at `https://mcp.postman.com/minimal`.
- **Full** — Includes all available Postman API tools (100+ tools), available at `https://mcp.postman.com/mcp`.

**Note:** The streamable EU HTTP server is available at `https://mcp.eu.postman.com`.

### Prerequisites

Before getting started, make certain you have a valid [Postman API Key](https://postman.postman.co/settings/me/api-keys).

### Install in VS Code

[![Install in VS Code](https://img.shields.io/badge/VS_Code-Install_Server-0098FF?style=flat-square&logo=visualstudiocode&logoColor=white)](https://insiders.vscode.dev/redirect/mcp/install?name=postman_mcp_server&config=%7B%22type%22%3A%20%22http%22%2C%22url%22%3A%20%22https%3A%2F%2Fmcp.postman.com%2Fminimal%22%2C%22headers%22%3A%7B%22Authorization%22%3A%22Bearer%20YOUR_API_KEY%22%7D%7D)

To install the streamable HTTP Postman MCP Server in Visual Studio Code, click the install button or use the [Postman VS Code Extension](https://marketplace.visualstudio.com/items?itemName=Postman.postman-for-vscode).

Afterwards, enable Agent mode, located by the Copilot chat textbox to start the server.

**Note:** By default, the server provides 37 tools. Use full mode (`https://mcp.postman.com/mcp`) to access all 106 tools.

#### Manual configuration

To manually configure the streamable HTTP Postman MCP Server in VS Code, add the following JSON block to the *.vscode/mcp.json* file:

```json
{
    "servers": {
        "postman-api-http-server": {
            "type": "http",
            "url": "https://mcp.postman.com/{minimal | mcp}", // use "minimal" (default) or "mcp" (full)
            "headers": {
                "Authorization": "Bearer ${input:postman-api-key}"
            }
        }
    },
    "inputs": [
        {
            "id": "postman-api-key",
            "type": "promptString",
            "description": "Enter your Postman API key"
        }
    ]
}
```

When prompted, enter your Postman API key. Afterwards, the agent performs calls to the Postman cloud MCP server at `https://mcp.postman.com`.

### Install in Cursor

[![Install in Cursor](https://cursor.com/deeplink/mcp-install-dark.svg)](https://cursor.com/en/install-mcp?name=postman_mcp_server&config=eyJ1cmwiOiJodHRwczovL21jcC5wb3N0bWFuLmNvbS9taW5pbWFsIiwiaGVhZGVycyI6eyJBdXRob3JpemF0aW9uIjoiQmVhcmVyIFlPVVJfQVBJX0tFWSJ9fQ%3D%3D)

To install the remote Postman MCP Server in Cursor, click the install button.

**Note:** Ensure that the Authorization header uses the `Bearer <YOUR_API_KEY>` format.

---

## STDIO

If remote MCP servers aren't supported by your MCP host, you can install the Postman MCP Server to your local machine.

STDIO is a lightweight solution that's ideal for integration with editors and tools like Visual Studio Code. Install an MCP-compatible VS Code extension, such as GitHub Copilot, Claude for VS Code, or other AI assistants that support MCP.

[![Install GitHub Copilot](https://img.shields.io/badge/Install-GitHub%20Copilot-black?style=for-the-badge&logo=github)](vscode:extension/GitHub.copilot) [![Install Claude for VS Code](https://img.shields.io/badge/Install-Claude%20for%20VS%20Code-orange?style=for-the-badge&logo=anthropic)](vscode:extension/Anthropic.claude-dev)

**Note:** For Docker set up and installation, see [DOCKER.md](./DOCKER.md).

STDIO supports the following tool configurations:

- **Minimal** — (Default) Only includes essential tools for basic Postman operations.
- **Full** — Includes all available Postman API tools (100+ tools). Use the `--full` flag to enable this configuration.

### Prerequisites

Before getting started, you'll need the following:

1. To run the server as a Node application, install [Node.js](https://nodejs.org/en).
1. A valid [Postman API Key](https://postman.postman.co/settings/me/api-keys).

### Configuration

To configure the extension to use the local Postman MCP Server, do the following:

1. Clone the **postman-mcp-server** repository.
1. In the repository's root folder, run the `npm install` command. This installs all the required dependencies.
1. Replace `${workspaceFolder}` in the *mcp.json* file with the full path to the Postman MCP repository.
1. When prompted, enter your Postman API key.

### Install in VS Code

[![Install with Node in VS Code](https://img.shields.io/badge/VS_Code-Install_Server-0098FF?style=flat-square&logo=visualstudiocode&logoColor=white)](https://insiders.vscode.dev/redirect/mcp/install?name=postman-api-mcp&inputs=%5B%7B%22id%22%3A%22postman-api-key%22%2C%22type%22%3A%22promptString%22%2C%22description%22%3A%22Enter%20your%20Postman%20API%20key%22%7D%5D&config=%7B%22command%22%3A%22npx%22%2C%22args%22%3A%5B%22%40postman%2Fpostman-mcp-server%22%2C%22--full%22%5D%2C%22env%22%3A%7B%22POSTMAN_API_KEY%22%3A%22%24%7Binput%3Apostman-api-key%7D%22%7D%7D)

To install the local Postman MCP Server in Visual Studio Code, click the install button.

**Note:**
- By default, this server provides 37 tools (minimal mode). Use the `--full` flag to access all 106 tools.
- Use the `--region` flag to specify the Postman API region (`us` or `eu`), or set the `POSTMAN_API_BASE_URL` environment variable directly. By default, the server uses the `us` option.

#### Manual configuration

You can manually integrate your MCP server with VS Code to use it with extensions that support MCP. To do this, create a *.vscode/mcp.json* file in your project and add the following JSON block to it:

```json
{
    "servers": {
        "postman-api-mcp": {
            "type": "stdio",
            "command": "npx",
            "args": [
                "@postman/postman-mcp-server",
                "--full" // (optional) Use this flag to enable full mode
            ],
            "env": {
                "POSTMAN_API_KEY": "${input:postman-api-key}"
            }
        }
    },
    "inputs": [
        {
            "id": "postman-api-key",
            "type": "promptString",
            "description": "Enter your Postman API key"
        }
    ]
}
```

### Install in Cursor

<!-- Does this section require further set up instruction? -->

[![Install with Node in Cursor](https://cursor.com/deeplink/mcp-install-dark.svg)](https://cursor.com/en/install-mcp?name=postman-api-mcp&config=eyJjb21tYW5kIjoibnB4IiwiYXJncyI6WyJAcG9zdG1hbi9wb3N0bWFuLW1jcC1zZXJ2ZXIiLCItLWZ1bGwiXSwiZW52Ijp7IlBPU1RNQU5fQVBJX0tFWSI6IllPVVJfQVBJX0tFWSJ9fQ%3D%3D)

To install the local Postman MCP Server in Cursor, click the install button.

### Claude integration

To integrate the MCP server with Claude, check the latest [Postman MCP Server release](https://github.com/postmanlabs/postman-mcp-server/releases) and get the `.dxt` file. For more information, see Anthropic's [Claude Desktop Extensions](https://www.anthropic.com/engineering/desktop-extensions) documentation.

---

## Migration from v1.x to v2.x

If you're migrating from Postman MCP Server version 1.x to 2.x, be aware of the following:

- **Tool naming changes** - All tool names changed from kebab-case to camelCase. For example:
  - `create-collection` → `createCollection`
  - `get-workspaces` → `getWorkspaces`
  - `delete-environment` → `deleteEnvironment`
- **Tool availability changes**
  - The default (minimal) behavior provides only 37 essential tools.
  - The `--full` flag provides access to all 106 tools.

---

## Questions and support

- See the [Postman Agent Generator](https://postman.com/explore/agent-generator) page for updates and new capabilities.
- See [Add your MCP requests to your collections](https://learning.postman.com/docs/postman-ai-agent-builder/mcp-requests/overview/) to learn how to use Postman to perform MCP requests.
- Visit the [Postman Community](https://community.postman.com/) to share what you've built, ask questions, and get help.
- You can connect to both HTTP and STDIO servers and test them using the [Postman MCP Server collection](https://www.postman.com/postman/postman-public-workspace/collection/681dc649440b35935978b8b7).
