# Docker Build Instructions

This project uses a multi-stage Docker build to create a STDIO version of the application.

## Building with Docker

```bash
docker build -t postman-api-mcp-stdio .
```

## Running the Docker container

### Minimal Mode - 37 Tools (Default)

Minimal mode is designed to stay within VS Code's 128 tool limit when combined with other MCP servers. It provides 37 essential tools for common Postman operations:

```bash
docker run -i -e POSTMAN_API_KEY="<your-secret-key>" postman-api-mcp-stdio
```

### Full Mode - 106 Tools

This mode includes all 106 available tools with the `--full` flag:

```bash
docker run -i -e POSTMAN_API_KEY="<your-secret-key>" postman-api-mcp-stdio --full
```
