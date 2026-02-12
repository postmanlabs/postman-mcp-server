# Postman MCP Server

The Postman MCP Server connects Postman to AI tools, giving AI agents and assistants the ability to access workspaces, manage collections and environments, evaluate APIs, and automate workflows through natural language interactions.

Postman supports the following tool configurations:

* **Minimal** — (Default) Only includes essential tools for basic Postman operations This offers faster performance and simplifies use for those who only need basic Postman operations. Ideal for users who want to modify a single Postman elements, such as collections, workspaces, or environments.
* **Full** — Includes all available Postman API tools (100+ tools). This configuration is ideal for users who engage in advanced collaboration and Postman's Enterprise features.
* **Code** — Includes tools to generate high-quality, well-organized client code from public and internal API definitions. This configuration is ideal for users who need to consume APIs or simply get context about APIs to their agents.

For a complete list of the Postman MCP Server's tools, see the [Postman MCP Server collection](https://www.postman.com/postman/postman-public-workspace/collection/681dc649440b35935978b8b7). This collection offers both the remote [full](https://www.postman.com/postman/postman-public-workspace/mcp-request/6821a76b17ccb90a86df48d3) and [minimal](https://www.postman.com/postman/postman-public-workspace/mcp-request/689e1c635be722a98b723238) servers, and the [local server](https://www.postman.com/postman/postman-public-workspace/mcp-request/6866a655b36c67cc435b5033).

Postman also offers servers as an [npm package](https://www.npmjs.com/package/@postman/postman-mcp-server).

### Authentication

For the best developer experience and fastest setup, use **OAuth** on the remote server (`https://mcp.postman.com`). OAuth is fully compliant with the [MCP Authorization specification](https://modelcontextprotocol.io/specification/draft/basic/authorization) and requires no manual API key configuration. The EU remote server and the [local server](#local-server) (this repo/npm package) support only [Postman API key](https://postman.postman.co/settings/me/api-keys) authentication.

### Use Cases

* **API Testing** - Continuously test your API using your Postman collection. To be able to test local APIs, use the [local server](#local-server), as the remote server won't have network access to your workstation.
* **Code synchronization** - Effortlessly keep your code in sync with your [Postman Collections](https://learning.postman.com/docs/design-apis/collections/overview/) and specs.
* **Collection management** - Create and [tag](https://learning.postman.com/docs/collections/use-collections/collaborate-with-collections/#tag-a-collection) collections, update collection and request [documentation](https://learning.postman.com/docs/publishing-your-api/api-documentation-overview/), add [comments](https://learning.postman.com/docs/collaborating-in-postman/comments/), or perform actions across multiple collections without leaving your editor.
* **Workspace and environment management** - Create [workspaces](https://learning.postman.com/docs/collaborating-in-postman/using-workspaces/overview/) and [environments](https://learning.postman.com/docs/sending-requests/variables/managing-environments/), plus manage your environment variables.
* **Automatic spec creation** - Create [specs](https://learning.postman.com/docs/design-apis/specifications/overview/) from your code and use them to generate collections.
* **Client code generation** - Generate production-ready client code that consumes APIs following best practices and project conventions. The `code` toolset produces code that precisely matches your API definitions, organizes it into an intuitive tree structure mirroring your Postman collections and requests, and leverages example responses to create accurate response types and error handling.

Designed for developers who want to integrate their AI tools with Postman's context and features. Supports quick natural language queries to advanced agent workflows.

### Support for EU

The Postman MCP Server supports the EU region for remote and local servers:

* For streamable HTTP, the remote server is available at `https://mcp.eu.postman.com`.
* For our STDIO public package, use the `--region` flag to specify the Postman API region (`us` or `eu`), or set the `POSTMAN_API_BASE_URL` environment variable directly.
* OAuth isn't supported for the EU Postman MCP Server. The EU remote server only supports API key authentication.

---

### Contents

* [**Remote server**](#remote-server)
  * [**VS Code**](#install-in-visual-studio-code)
  * [**Cursor**](#install-in-cursor)
  * [**Claude Code**](#install-in-claude-code)
  * [**Codex**](#install-in-codex)
  * [**Windsurf**](#install-in-windsurf)
  * [**Antigravity**](#install-in-antigravity)
  * [**GitHub Copilot CLI**](#install-in-github-copilot-cli)
* [**Local server**](#local-server)
  * [**VS Code**](#install-in-visual-studio-code-1)
  * [**Cursor**](#install-in-cursor-1)
  * [**Claude**](#claude-integration)
  * [**Claude Code**](#install-in-claude-code-1)
  * [**Codex**](#install-in-codex-1)
  * [**Windsurf**](#install-in-windsurf-1)
  * [**Antigravity**](#install-in-antigravity-1)
  * [**GitHub Copilot CLI**](#install-in-github-copilot-cli-1)
  * [**Gemini CLI**](#use-as-a-gemini-cli-extension)
  * [**Docker**](#install-in-docker)
* [**Questions and support**](#questions-and-support)
* [**Migration from Postman MCP Server v1 to v2**](#migration-from-v1x-to-v2x)

---

## Remote server

The remote Postman MCP Server is hosted by Postman over streamable HTTP and provides the easiest method for getting started.

The remote server (`https://mcp.postman.com`) supports OAuth for the best developer experience and fastest setup, and no API key needed. OAuth also provides stronger security and fine-grained access control compared to a static API key. OAuth is MCP specification–compliant, including Dynamic Client Registration (DCR), OAuth metadata, and PKCE.

**Note:** The EU remote server (`https://mcp.eu.postman.com`) only supports API key authentication.

MCP hosts that support OAuth can discover and use it automatically for all tools. The remote server also accepts a [Postman API key](https://postman.postman.co/settings/me/api-keys) (Bearer token in the Authorization header).

**Why use the remote server?**

Consider using the remote Postman MCP server if:

* You want to get started quickly and easily.
* You are working with public APIs
* Your MCP host doesn't support local MCP servers.


**Supported configurations**

The remote server supports the following tool configurations:

* **Minimal** — (Default) Only includes essential tools for basic Postman operations, available at `https://mcp.postman.com/minimal` and `https://mcp.eu.postman.com/minimal` for EU users.
* **Code** — Includes tools for searching public and internal API definitions and generating client code, available at `https://mcp.postman.com/code` and `https://mcp.eu.postman.com/code` for EU users.
* **Full** — Includes all available Postman API tools (100+ tools), available at `https://mcp.postman.com/mcp` and `https://mcp.eu.postman.com/mcp` for EU users.

### Install in Cursor

[![Install in Cursor](https://cursor.com/deeplink/mcp-install-dark.svg)](https://cursor.com/en/install-mcp?name=postman_mcp_server&config=eyJ1cmwiOiJodHRwczovL21jcC5wb3N0bWFuLmNvbS9taW5pbWFsIiwiaGVhZGVycyI6eyJBdXRob3JpemF0aW9uIjoiQmVhcmVyIFlPVVJfQVBJX0tFWSJ9fQ%3D%3D)

To install the remote Postman MCP Server in Cursor, click the install button.

**Note:** If your MCP host supports OAuth, use the `https://mcp.postman.com` server URL with no headers for the fastest setup. Otherwise, ensure the Authorization header uses the `Bearer <YOUR_API_KEY>` format. OAuth is not available on the EU server.

By default, the server uses **Minimal** mode. To access **Full** mode, change the `url` value to `https://mcp.postman.com/mcp` in the `mcp.json` file. To access **Code** mode, change the value to `https://mcp.postman.com/code`.

### Install in Visual Studio Code

[![Install in VS Code](https://img.shields.io/badge/VS_Code-Install_Server-0098FF?style=flat-square&logo=visualstudiocode&logoColor=white)](https://insiders.vscode.dev/redirect/mcp/install?name=postman_mcp_server&config=%7B%22type%22%3A%20%22http%22%2C%22url%22%3A%20%22https%3A%2F%2Fmcp.postman.com%2Fminimal%22%2C%22headers%22%3A%7B%22Authorization%22%3A%22Bearer%20YOUR_API_KEY%22%7D%7D)

To install the remote Postman MCP Server in VS Code, click the install button or use the [Postman VS Code Extension](https://marketplace.visualstudio.com/items?itemName=Postman.postman-for-vscode).

By default, the server uses **Minimal** mode. To access **Full** mode, change the `url` value to `https://mcp.postman.com/mcp` in the `mcp.json` file. To access **Code** mode, change the value to `https://mcp.postman.com/code`.

#### Manual configuration

You can use the Postman MCP Server with MCP-compatible extensions in VS Code, such as GitHub Copilot, Claude for VS Code, or other AI assistants that support MCP. To do so, add the following JSON block to the `.vscode/mcp.json` configuration file:

**OAuth**

Add the following JSON block to use the recommended OAuth installation method:

```json
{
  "servers": {
    "postman": {
      "type": "http",
      "url": "https://mcp.postman.com/{minimal OR code OR mcp}"
    }
  }
}
```

When prompted, enter your Postman API key.

**API key**

Use the following JSON block to use the API key installation method:

```json
{
  "servers": {
    "postman": {
      "type": "http",
      "url": "https://mcp.postman.com/{minimal OR code OR mcp}",
      // For the EU server, use "https://mcp.eu.postman.com/{minimal OR code OR mcp}"
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

When prompted, enter your Postman API key.

### Install in Claude Code

To install the MCP server in Claude Code, run the following command in your terminal. On the US server, Claude Code uses OAuth automatically for the best installation experience. To use an API key (required for the EU server), add the `--header` flag.

**OAuth**

Use the recommended OAuth installation method for US servers:

```bash
claude mcp add --transport http postman https://mcp.postman.com/minimal
```

```bash
claude mcp add --transport http postman https://mcp.postman.com/code
```

```bash
claude mcp add --transport http postman https://mcp.postman.com/mcp
```

**API key**

Use the API key installation method if required and for EU servers:

```bash
claude mcp add --transport http postman https://mcp.postman.com/minimal --header "Authorization: Bearer <POSTMAN_API_KEY>"
```

```bash
claude mcp add --transport http postman https://mcp.postman.com/code --header "Authorization: Bearer <POSTMAN_API_KEY>"
```

```bash
claude mcp add --transport http postman https://mcp.postman.com/mcp --header "Authorization: Bearer <POSTMAN_API_KEY>"
```

### Install in Codex

To install the remote server in Codex, use one of the following methods, depending on your authentication and region.

**OAuth**

Use the recommended OAuth installation method with the US server for the best installation experience. This requires no manual API key setup.

For **Minimal** mode:

```bash
codex mcp add postman --remote-url https://mcp.postman.com/minimal
```

For **Code** mode:

```bash
codex mcp add postman --remote-url https://mcp.postman.com/code
```

For **Full** mode:

```bash
codex mcp add postman --remote-url https://mcp.postman.com/mcp
```

**API key**

If you're using the EU server, a [local server](#install-in-codex-1), or prefer API key authentication, use the API key method. Set the `POSTMAN_API_KEY` environment variable and invoke the MCP server using `npx`.

For **Minimal** mode:

```bash
codex mcp add postman --env POSTMAN_API_KEY=<POSTMAN_API_KEY> -- npx @postman/postman-mcp-server --minimal
```

For **Code** mode:

```bash
codex mcp add postman --env POSTMAN_API_KEY=<POSTMAN_API_KEY> -- npx @postman/postman-mcp-server --code
```

For **Full** mode:

```bash
codex mcp add postman --env POSTMAN_API_KEY=<POSTMAN_API_KEY> -- npx @postman/postman-mcp-server --full
```

### Install in Windsurf

To install the MCP server in Windsurf, copy the following JSON config into the `.codeium/windsurf/mcp_config.json` file.

This configuration uses the remote server (`https://mcp.postman.com`), which authenticates with OAuth automatically.

```json
{
    "mcpServers": {
        "postman-full": {
            "args": [
                "mcp-remote",
                "https://mcp.postman.com/mcp"
            ],
            "disabled": false,
            "disabledTools": [],
            "env": {}
        },
        "postman-code": {
            "args": [
                "mcp-remote",
                "https://mcp.postman.com/code"
            ],
            "disabled": false,
            "disabledTools": [],
            "env": {}
        },
        "postman-minimal": {
            "args": [
                "mcp-remote",
                "https://mcp.postman.com/minimal"
            ],
            "disabled": false,
            "disabledTools": [],
            "env": {}
        }
    }
}
```

### Install in Antigravity

To install the MCP server in Antigravity, click **Manage MCP servers > View raw config**. Then, copy the following JSON config into the `.codeium/windsurf/mcp_config.json` file.

This configuration uses the remote server (`https://mcp.postman.com`), which authenticates automatically with OAuth.

```json
{
    "mcpServers": {
        "postman-full": {
            "args": [
                "mcp-remote",
                "https://mcp.postman.com/mcp"
            ],
            "disabled": false,
            "disabledTools": [],
            "env": {}
        },
        "postman-code": {
            "args": [
                "mcp-remote",
                "https://mcp.postman.com/code"
            ],
            "disabled": false,
            "disabledTools": [],
            "env": {}
        },
        "postman-minimal": {
            "args": [
                "mcp-remote",
                "https://mcp.postman.com/minimal"
            ],
            "disabled": false,
            "disabledTools": [],
            "env": {}
        }
    }
}
```

### Install in GitHub Copilot CLI

You can add the MCP server to your Copilot CLI either with OAuth (recommended) or an API key.

Use the Copilot CLI to interactively add the MCP server:

```bash
/mcp add
```

Or, add the following to your `~/.copilot/mcp-config.json` config file:

```json
{
  "mcpServers": {
    "postman": {
      "type": "http",
      "url": "https://mcp.postman.com/minimal" // Use "https://mcp.postman.com/mcp" for Full mode, or "https://mcp.postman.com/code"` for Code mode.
    }
  }
}
```

**API key**

Use the following method to install on EU servers or if API key is required:

```json
{
  "mcpServers": {
    "postman": {
      "type": "http",
      "url": "https://mcp.eu.postman.com/minimal",
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

By default, this uses **Minimal** mode. To access **Full** mode, change the `url` value to `https://mcp.postman.com/mcp`. To access **Code** mode, change the value to `https://mcp.postman.com/code`.

For more information, see the [Copilot CLI documentation](https://docs.github.com/en/copilot/concepts/agents/about-copilot-cli).

---

## Local server

The local server uses STDIO transport and is hosted locally on an environment of your choice.

**Why use the local server?**

Consider using the local Postman MCP server if:

* You are working with internal APIs.
* You want to power local use cases, such as local API testing.
* You have specific security and network requirements.
* You prefer to build the MCP server from the source code in this repo.

**Supported configurations**

The local server supports the following tool configurations:

* **Minimal** — (Default) Only includes essential tools for basic Postman operations.
* **Code** — Includes tools for searching public and internal API definitions and generating client code
* **Full** — Includes all available Postman API tools (100+ tools). Use the `--full` flag to enable this configuration.

**Note:**
* Use the `--region` flag to specify the Postman API region (`us` or `eu`), or set the `POSTMAN_API_BASE_URL` environment variable directly. By default, the server uses the `us` option.
* The local server only supports API key authentication (with a Postman API key or Bearer token). To run the server as a Node application, install [Node.js](https://nodejs.org/en).

### Install in Visual Studio Code

[![Install with Node in VS Code](https://img.shields.io/badge/VS_Code-Install_Server-0098FF?style=flat-square&logo=visualstudiocode&logoColor=white)](https://insiders.vscode.dev/redirect/mcp/install?name=postman-api-mcp&inputs=%5B%7B%22id%22%3A%22postman-api-key%22%2C%22type%22%3A%22promptString%22%2C%22description%22%3A%22Enter%20your%20Postman%20API%20key%22%7D%5D&config=%7B%22command%22%3A%22npx%22%2C%22args%22%3A%5B%22%40postman%2Fpostman-mcp-server%22%2C%22--full%22%5D%2C%22env%22%3A%7B%22POSTMAN_API_KEY%22%3A%22%24%7Binput%3Apostman-api-key%7D%22%7D%7D)

To install the local Postman MCP Server in VS Code, click the install button.

By default, the server uses **Full** mode. To access **Minimal** mode, remove the `--full` flag from the `mcp.json` configuration file. To access **Code** mode, replace the `--full` flag with `--code`.

#### Manual configuration

You can manually integrate your MCP server with Cursor or VS Code to use it with extensions that support MCP. To do this, create a `mcp.json` file in your project and add the following JSON block to it:

```json
{
    "servers": {
        "postman": {
            "type": "stdio",
            "command": "npx",
            "args": [
                "@postman/postman-mcp-server",
                "--full", // (optional) Use this flag to enable full mode...
                "--code", // (optional) ...or this flag to enable code mode.
                "--region us" // (optional) Use this flag to specify the Postman API region (us or eu). Defaults to us.
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

[![Install with Node in Cursor](https://cursor.com/deeplink/mcp-install-dark.svg)](https://cursor.com/en/install-mcp?name=postman-api-mcp&config=eyJjb21tYW5kIjoibnB4IiwiYXJncyI6WyJAcG9zdG1hbi9wb3N0bWFuLW1jcC1zZXJ2ZXIiLCItLWZ1bGwiXSwiZW52Ijp7IlBPU1RNQU5fQVBJX0tFWSI6IllPVVJfQVBJX0tFWSJ9fQ%3D%3D)

To install the local Postman MCP Server in Cursor, click the install button.

By default, the server uses **Full** mode. To access **Minimal** mode, remove the `--full` flag from the `mcp.json` configuration file. To access **Code** mode, replace the `--full` flag with `--code`.

### Claude integration

To integrate the MCP server with Claude, check the latest [Postman MCP Server release](https://github.com/postmanlabs/postman-mcp-server/releases) and get the `.mcpb` file.

* **Minimal** — `postman-mcp-server-minimal.mcpb`
* **Full** — `postman-mcp-server-full.mcpb`
* **Code** — `postman-mcp-server-code.mcpb`

For more information, see the [Claude Desktop Extensions](https://www.anthropic.com/engineering/desktop-extensions) documentation.

### Install in Claude Code

To install the MCP server in Claude Code, run the following command in your terminal:

For **Minimal** mode:

```bash
claude mcp add postman --env POSTMAN_API_KEY=YOUR_KEY -- npx @postman/postman-mcp-server@latest
```

For **Code** mode:

```bash
claude mcp add postman --env POSTMAN_API_KEY=YOUR_KEY -- npx @postman/postman-mcp-server@latest  --code
```

For **Full** mode:

```bash
claude mcp add postman --env POSTMAN_API_KEY=YOUR_KEY -- npx @postman/postman-mcp-server@latest --full
```

### Install in Codex

To install the local server, use the API key installation method. Set the `POSTMAN_API_KEY` environment variable and invoke the MCP server using `npx`.

For **Minimal** mode:

```bash
codex mcp add postman --env POSTMAN_API_KEY=<POSTMAN_API_KEY> -- npx @postman/postman-mcp-server --minimal
```

For **Code** mode:

```bash
codex mcp add postman --env POSTMAN_API_KEY=<POSTMAN_API_KEY> -- npx @postman/postman-mcp-server --code
```

For **Full** mode:

```bash
codex mcp add postman --env POSTMAN_API_KEY=<POSTMAN_API_KEY> -- npx @postman/postman-mcp-server --full
```

### Install in Windsurf

To manually install the MCP server in Windsurf, do the following:

1. Click **Open MCP Marketplace** in Windsurf.
1. Type "Postman" in the search text box to filter the marketplace results.
1. Click **Install**.
1. When prompted, enter a valid Postman API key.
1. Select the tools that you want to enable, or click **All Tools** to select all available tools.
1. Turn on **Enabled** to enable the Postman MCP server.

#### Manual installation

Copy the following JSON config into the `.codeium/windsurf/mcp_config.json` file:

```json
{
    "mcpServers": {
        "postman": {
            "args": [
                "@postman/postman-mcp-server"
            ],
            "command": "npx",
            "disabled": false,
            "disabledTools": [],
            "env": {
                "POSTMAN_API_KEY": "<POSTMAN_API_KEY>"
            }
        }
    }
}
```

### Install in Antigravity

To install the MCP server in Antigravity, click **Manage MCP servers > View raw config**. Then, copy the following JSON config into the `.codeium/windsurf/mcp_config.json` file:

```json
{
    "mcpServers": {
        "postman": {
            "args": [
                "@postman/postman-mcp-server"
            ],
            "command": "npx",
            "disabled": false,
            "disabledTools": [],
            "env": {
                "POSTMAN_API_KEY": "XXXX"
            }
        }
    }
}
```

### Install in GitHub Copilot CLI

Use the Copilot CLI to interactively add the MCP server:

```bash
/mcp add
```

Alternatively, create or edit the configuration file `~/.copilot/mcp-config.json` and add:

```json
{
  "mcpServers": {
    "postman": {
      "command": "npx",
      "args": ["@postman/postman-mcp-server"],
      "env": {
        "POSTMAN_API_KEY": "YOUR_API_KEY"
      }
    }
  }
}
```

For more information, see the [Copilot CLI documentation](https://docs.github.com/en/copilot/concepts/agents/about-copilot-cli).

### Use as a Gemini CLI extension

To install the MCP server as a Gemini CLI extension, run the following command in your terminal:

```bash
gemini extensions install https://github.com/postmanlabs/postman-mcp-server
```

### Install in Docker

For Docker set up and installation, see [DOCKER.md](./DOCKER.md).

---

## Migration from v1.x to v2.x

If you're migrating from Postman MCP Server version 1.x to 2.x, be aware of the following:

* **Tool naming changes** - All tool names changed from kebab-case to camelCase. For example:
  * `create-collection` → `createCollection`
  * `get-workspaces` → `getWorkspaces`
  * `delete-environment` → `deleteEnvironment`
* **Tool availability changes**
  * The default (minimal) behavior provides only 37 essential tools.
  * The `--full` flag provides access to all tools.

---

## Questions and support

* See [Add your MCP requests to your collections](https://learning.postman.com/docs/postman-ai-agent-builder/mcp-requests/overview/) to learn how to use Postman to perform MCP requests.
* Visit the [Postman Community](https://community.postman.com/) to share what you've built, ask questions, and get help.
* You can connect to both the remote and local servers and test them using the [Postman MCP Server collection](https://www.postman.com/postman/postman-public-workspace/collection/681dc649440b35935978b8b7).
