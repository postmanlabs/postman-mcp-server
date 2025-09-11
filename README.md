# Postman MCP Server

This project offers the following Model Context Protocol (MCP) server options:

- [**STDIO**](#stdio)
- [**Streamable HTTP**](#streamable-http)

For more information about the available transports, see the [MCP specification](https://modelcontextprotocol.io/docs/concepts/transports).

## STDIO

This is a lightweight solution that's ideal for integration with editors and tools like [VS Code](https://code.visualstudio.com/).

> For Docker set up and installation, see [DOCKER.md](./DOCKER.md).

### VS Code integration

> **Note:**
> By default, this server provides 37 tools (minimal mode). Use the `--full` flag to access all 106 tools.
> Use the `--region` flag to specify the Postman API region (`us` or `eu`), or set the `POSTMAN_API_BASE_URL` environment variable directly.

Integrate your MCP server with Visual Studio Code and use it with VS Code extensions that support MCP. To do this, do the following:

1. Create a *.vscode/mcp.json* file in your project and enter the following:

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

1. Install an MCP-compatible VS Code extension, such as GitHub Copilot, Claude for VS Code, or other AI assistants that support MCP.

#### Configure the extension

Configure the extension to use the **postman-api-mcp** server, a local STDIO-based server that runs directly from your project files:

1. Clone the **postman-mcp-server** repository.
1. In the repository's root folder, run the `npm install` command. This installs all the required dependencies.
1. Replace `${workspaceFolder}` in the *mcp.json* file with the full path to the Postman MCP repository.
1. When prompted, enter your [Postman API key](https://go.postman.co/settings/me/api-keys).

### Claude integration

To integrate the MCP server with Claude, check the latest [Postman MCP server release](https://github.com/postmanlabs/postman-mcp-server/releases) and download one of the following `.dxt` files:

- **postman-api-mcp-minimal.dxt** - Contains 37 essential tools for basic Postman operations.
- **postman-api-mcp-full.dxt** - Contains all 106+ tools for comprehensive Postman functionality.

For more information, see Anthropic's [Claude Desktop Extensions](https://www.anthropic.com/engineering/desktop-extensions) documentation.

## Streamable HTTP

The streamable HTTP version is available at `https://mcp.postman.com`. It supports two tool configurations to better serve different use cases:

- **Minimal** — Only includes essential tools for basic Postman operations, available at `https://mcp.postman.com/minimal`. This offers faster performance and simplifies use for those who only need basic Postman operations.
- **Full** — Includes all available Postman API tools (100+ tools), available at `https://mcp.postman.com/mcp`.

> **Note:** The streamable EU HTTP server is available at `https://mcp.eu.postman.com`.

### Cursor integration

To integrate the MCP server with Cursor, click the following button:
> Ensure the Authorization header uses the Bearer <YOUR_API_KEY> format.

[![Install the Postman MCP Server](https://cursor.com/deeplink/mcp-install-dark.svg)](https://cursor.com/en/install-mcp?name=postman_mcp_server&config=eyJ1cmwiOiJodHRwczovL21jcC5wb3N0bWFuLmNvbS9taW5pbWFsIiwiaGVhZGVycyI6eyJBdXRob3JpemF0aW9uIjoiQmVhcmVyIFlPVVJfQVBJX0tFWSJ9fQ%3D%3D)

### VS Code integration

> By default, the server provides 37 tools. Use **Full** (`https://mcp.postman.com/mcp`) mode to access all 106 tools.

To install in VS Code, you can use the [Postman VS Code Extension](https://marketplace.visualstudio.com/items?itemName=Postman.postman-for-vscode). Or you can add the following to the *.vscode/mcp.json* file:

```json
{
    "servers": {
        "postman-api-http-server": {
            "type": "http",
            "url": "https://mcp.postman.com/{minimal | mcp}", // choose "minimal" or "mcp"
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

## Migration from v1.x to v2.x

- **Tool naming changes** - All tool names changed from kebab-case to camelCase. For example:
  - `create-collection` → `createCollection`
  - `get-workspaces` → `getWorkspaces`
  - `delete-environment` → `deleteEnvironment`
- **Tool availability changes**
  - The default (Minimal) behavior provides only 37 essential tools.
  - The `--full` flag provides access to all 106 tools.

## Questions and support

- See the [Postman Agent Generator](https://postman.com/explore/agent-generator) page for updates and new capabilities.
- See [Add your MCP requests to your collections](https://learning.postman.com/docs/postman-ai-agent-builder/mcp-requests/overview/) to learn how to use Postman to perform MCP requests.
- Visit the [Postman Community](https://community.postman.com/) to share what you've built, ask questions, and get help.
- You can connect to both HTTP and STDIO servers and test them using the [Postman MCP Server collection](https://www.postman.com/postman/postman-public-workspace/collection/681dc649440b35935978b8b7).
