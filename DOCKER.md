# Docker Build Instructions

This project uses a multi-stage Docker build to create either an HTTP API or STDIO version of the application.

## Building with Docker

### HTTP API Version (default)
```bash
docker build -t postman-api-mcp-server .
```

### STDIO Version
```bash
docker build --target production-stdio -t postman-api-mcp-stdio .
```

### Running the Docker Container

#### STDIO Version
```bash
docker run -i -e POSTMAN_API_KEY="<your-secret-key>" postman-api-mcp-stdio
```

#### HTTP API Version
```bash
docker run -p 1337:1337 postman-api-mcp-server
```

### Accessing the HTTP API
You can access the HTTP API at `http://localhost:1337/mcp`. Use a tool like Postman or VS Code to connect to this endpoint (see the [README](./README.md) for VS Code integration).
