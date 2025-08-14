# Docker Build Instructions

This project uses a multi-stage Docker build to create a STDIO version of the application.

## Building with Docker

```bash
docker build -t postman-api-mcp-stdio .
```

## Running the Docker container

### Default (Minimal) Mode - 37 Tools

```bash
docker run -i -e POSTMAN_API_KEY="<your-secret-key>" postman-api-mcp-stdio
```

### Full Mode - 106 Tools

```bash
docker run -i -e POSTMAN_API_KEY="<your-secret-key>" postman-api-mcp-stdio --full
```

## Tool Configuration Modes

- **Default (minimal)**: Provides 37 essential tools for common Postman operations.
- **Full mode**: Adds all 106 available tools via the `--full` flag.

Note: Minimal mode is designed to stay within VS Code's 128 tool limit when combined with other MCP servers.
