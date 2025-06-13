# Docker Build Instructions

This project uses a multi-stage Docker build to create a STDIO version of the application.

## Building with Docker

```bash
docker build -t postman-api-mcp-stdio .
```

## Running the Docker container

```bash
docker run -i -e POSTMAN_API_KEY="<your-secret-key>" postman-api-mcp-stdio
```

The container will start the MCP server in STDIO mode, suitable for integration with editors and tools like VS Code.

For more information about VS Code integration, see the [README](./README.md) file.
