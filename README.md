# Postman MCP Server

The Postman MCP Server connects Postman to AI tools, giving AI agents and assistants the ability to access workspaces, manage collections and environments, evaluate APIs, and automate workflows through natural language interactions. Learn more on the [Postman MCP Server product page](https://www.postman.com/product/mcp-server/).

Postman also offers the server as an [npm package](https://www.npmjs.com/package/@postman/postman-mcp-server).

---

## Postman MCP Server collection

The [Postman MCP Server collection](https://www.postman.com/postman/postman-public-workspace/collection/681dc649440b35935978b8b7) is the quickest way to explore, test, and connect to the Postman MCP Server. Use it to:

- Browse the complete list of available tools across all configurations.
- Connect to and test the remote server — [Full](https://www.postman.com/postman/postman-public-workspace/mcp-request/6821a76b17ccb90a86df48d3) and [Minimal](https://www.postman.com/postman/postman-public-workspace/mcp-request/689e1c635be722a98b723238).
- Connect to and test the [local server](https://www.postman.com/postman/postman-public-workspace/mcp-request/6866a655b36c67cc435b5033).

---

## Tool configurations

- **Minimal** — (Default) Only includes essential tools for basic Postman operations. Ideal for users who want to modify a single Postman element, such as collections, workspaces, or environments.
- **Code** — Includes tools to generate high-quality, well-organized client code from public and internal API definitions. Ideal for users who need to consume APIs or get API context to their agents.
- **Full** — Includes all available Postman API tools (100+ tools). Ideal for users who engage in advanced collaboration and Postman's Enterprise features.

---

## Authentication

For the best developer experience and fastest setup, use **OAuth** on the remote server (`https://mcp.postman.com`). OAuth is fully compliant with the [MCP Authorization specification](https://modelcontextprotocol.io/specification/draft/basic/authorization) and requires no manual API key configuration.

The EU remote server and the local server support only [Postman API key](https://postman.postman.co/settings/me/api-keys) authentication.

---

## Quick start

**Remote** (any OAuth-compatible MCP host):

Add this URL to your MCP host's configuration:

```bash
https://mcp.postman.com/minimal
```

Change `/minimal` to `/code` or `/mcp` for Code or Full mode. For EU or API key auth, pass `Authorization: Bearer <POSTMAN_API_KEY>` as a header.

**Local:**

```bash
npx @postman/postman-mcp-server
```

Add `--code` or `--full` for Code or Full mode. Set `POSTMAN_API_KEY` as an environment variable.

For IDE-specific setup instructions, see the table below. For more information, see the [Postman MCP Server docs](https://learning.postman.com/latest-v-12/docs/reference/postman-api/postman-mcp-server/overview).

---

## Supported agents and IDEs


| Agent / IDE        | Remote                                                                                                                          | Local                                                                                                                          |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Claude Code        | [Docs](https://learning.postman.com/docs/reference/postman-api/postman-mcp-server/postman-mcp-remote-server#claude-code)        | [Docs](https://learning.postman.com/docs/reference/postman-api/postman-mcp-server/postman-mcp-local-server#claude-code)        |
| Claude Desktop     | —                                                                                                                               | [Docs](https://learning.postman.com/docs/reference/postman-api/postman-mcp-server/postman-mcp-local-server#claude)             |
| Cursor             | [Docs](https://learning.postman.com/docs/reference/postman-api/postman-mcp-server/postman-mcp-remote-server#cursor)             | [Docs](https://learning.postman.com/docs/reference/postman-api/postman-mcp-server/postman-mcp-local-server#cursor)             |
| VS Code            | [Docs](https://learning.postman.com/docs/reference/postman-api/postman-mcp-server/postman-mcp-remote-server#visual-studio-code) | [Docs](https://learning.postman.com/docs/reference/postman-api/postman-mcp-server/postman-mcp-local-server#visual-studio-code) |
| Codex              | [Docs](https://learning.postman.com/docs/reference/postman-api/postman-mcp-server/postman-mcp-remote-server#codex)              | [Docs](https://learning.postman.com/docs/reference/postman-api/postman-mcp-server/postman-mcp-local-server#codex)              |
| Windsurf           | [Docs](https://learning.postman.com/docs/reference/postman-api/postman-mcp-server/postman-mcp-remote-server#windsurf)           | [Docs](https://learning.postman.com/docs/reference/postman-api/postman-mcp-server/postman-mcp-local-server#windsurf)           |
| Antigravity        | [Docs](https://learning.postman.com/docs/reference/postman-api/postman-mcp-server/postman-mcp-remote-server#antigravity)        | [Docs](https://learning.postman.com/docs/reference/postman-api/postman-mcp-server/postman-mcp-local-server#antigravity)        |
| GitHub Copilot CLI | [Docs](https://learning.postman.com/docs/reference/postman-api/postman-mcp-server/postman-mcp-remote-server#github-copilot-cli) | [Docs](https://learning.postman.com/docs/reference/postman-api/postman-mcp-server/postman-mcp-local-server#github-copilot-cli) |
| Gemini CLI         | [Docs](https://learning.postman.com/docs/reference/postman-api/postman-mcp-server/postman-mcp-remote-server#gemini-cli)         | [Docs](https://learning.postman.com/docs/reference/postman-api/postman-mcp-server/postman-mcp-local-server#gemini-cli)         |
| Kiro               | [Docs](https://learning.postman.com/docs/reference/postman-api/postman-mcp-server/postman-mcp-remote-server#kiro)               | [Docs](https://learning.postman.com/docs/reference/postman-api/postman-mcp-server/postman-mcp-local-server#kiro)               |
| Docker             | —                                                                                                                               | [Docs](https://learning.postman.com/docs/reference/postman-api/postman-mcp-server/postman-mcp-local-server#docker)             |


---

## EU support

The Postman MCP Server supports the EU region for remote and local servers:

- For streamable HTTP, the remote server is available at `https://mcp.eu.postman.com/mcp` (Full), `https://mcp.eu.postman.com/code`, and `https://mcp.eu.postman.com/minimal`.
- For the STDIO public package, use the `--region eu` flag, or set the `POSTMAN_API_BASE_URL` environment variable directly.
- OAuth isn't supported for the EU server. The EU remote server only supports API key authentication.

---

## Use cases

- **API Testing** — Continuously test your API using your Postman collection. Use the local server to test local APIs, as the remote server won't have network access to your workstation.
- **Code synchronization** — Keep your code in sync with your [Postman Collections](https://learning.postman.com/docs/design-apis/collections/overview/) and specs.
- **Collection management** — Create and tag collections, update documentation, add comments, or perform actions across multiple collections without leaving your editor.
- **Workspace and environment management** — Create workspaces and environments, plus manage environment variables.
- **Automatic spec creation** — Create specs from your code and use them to generate collections.
- **Client code generation** — Generate production-ready client code that consumes APIs following best practices and project conventions.

---

## Docker

For Docker setup and installation, see [DOCKER.md](./DOCKER.md).

---

## Questions and support

- See [Add your MCP requests to your collections](https://learning.postman.com/docs/postman-ai-agent-builder/mcp-requests/overview/) to learn how to use Postman to perform MCP requests.
- Visit the [Postman Community](https://community.postman.com/) to share what you've built, ask questions, and get help.
- You can connect to both the remote and local servers and test them using the [Postman MCP Server collection](https://www.postman.com/postman/postman-public-workspace/collection/681dc649440b35935978b8b7).

