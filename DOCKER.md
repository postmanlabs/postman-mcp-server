# Docker Build Instructions

This project uses a multi-stage Docker build to create either an HTTP API or an STDIO version of the application.

## Building with Docker

### HTTP API (default)
```bash
docker build -t postman-api-mcp-server .
```

### STDIO
```bash
docker build --target production-stdio -t postman-api-mcp-stdio .
```

## Running the Docker container

### STDIO
```bash
docker run -i -e POSTMAN_API_KEY="<your-secret-key>" postman-api-mcp-stdio
```

### HTTP API
```bash
docker run -p 1337:1337 postman-api-mcp-server
```

## Accessing the HTTP API
You can access the HTTP API at `http://localhost:1337/mcp`. Use a tool like Postman or VS Code to connect to this endpoint. For more information about VS Code integration, see the [README](./README.md) file.
