# Postman API MCP Server

**This project offers a single MCP-compatible server option:**

- **STDIO server** — A lightweight MCP server that communicates over standard input/output, ideal for integration with editors and tools like [VS Code](https://code.visualstudio.com/).

See more about the Model Context Protocol available transports in the [MCP specification](https://modelcontextprotocol.io/docs/concepts/transports).

## 🧰 VS Code Integration

You can integrate your MCP server with Visual Studio Code to use it with VS Code extensions that support MCP.

1. Create a `.vscode/mcp.json` file in your project with the following configuration:

    ```json
    {
      "servers": {
        "postman-api-mcp": {
          "type": "stdio",
          "command": "node",
          "args": [
            "${workspaceFolder}/dist/src/index.js"
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

2. Install an MCP-compatible VS Code extension (such as GitHub Copilot, Claude for VS Code, or other AI assistants that support MCP).

3. Configure your extension to use the MCP server:

   - **postman-api-mcp**: Uses the local stdio-based server, running directly from your project files.
     - Clone the repository
     - In the repository root folder, execute `npm install && npm run build`. This compiles the server code in the `dist` folder.
     - Make sure to replace `${workspaceFolder}` in the mcp.json file with the full path to the Postman API MCP repository.

4. When prompted, enter your Postman API key.

You can now use your Postman API tools with your VS Code extension through the MCP protocol.

## 🐳 Docker Setup

See [DOCKER.md](./DOCKER.md) for up-to-date build, Docker, and usage instructions.


## 💬 Questions and support

- See the [Postman Agent Generator](https://postman.com/explore/agent-generator) page for updates and new capabilities.
- See [Add your MCP requests to your collections](https://learning.postman.com/docs/postman-ai-agent-builder/mcp-requests/overview/) to learn how to use Postman to perform MCP requests.
- Visit the [Postman Community](https://community.postman.com/) to share what you've built, ask questions, and get help.
