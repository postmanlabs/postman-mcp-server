import express from 'express';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { get } from 'es-toolkit/compat';

type Logger = {
  info: (message: string, sessionId?: string | null) => void;
  debug: (message: string, sessionId?: string | null) => void;
  warn: (message: string, sessionId?: string | null) => void;
  error: (message: string, error?: any, sessionId?: string | null) => void;
  timestamp: () => string;
};

export function createApp(
  server: Server,
  logger: Logger,
  setApiKeyCallback: (apiKey: string | undefined) => void
): express.Application {
  const app = express();
  const transports: Record<string, SSEServerTransport> = {};

  function extractApiKey(req: express.Request, res: express.Response, next: express.NextFunction) {
    const authHeader = get(req, 'headers.authorization', '');
    const apiKey = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : undefined;
    setApiKeyCallback(apiKey);
    logger.debug(`extractApiKey middleware: API key ${apiKey ? 'present' : 'absent'} in headers.`);
    next();
  }
  app.use(extractApiKey);

  app.post('/mcp', async (req: express.Request, res: express.Response) => {
    logger.info('Received POST MCP request');
    try {
      const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: undefined,
      });

      await server.connect(transport);
      await transport.handleRequest(req, res, req.body);

      res.on('close', () => {
        logger.info('Request closed');
        transport.close();
      });
    } catch (error) {
      logger.error('Error handling MCP request:', error);
      if (!res.headersSent) {
        res.status(500).json({
          jsonrpc: '2.0',
          error: {
            code: -32603,
            message: 'Internal server error',
          },
          id: null,
        });
      }
    }
  });

  app.get('/mcp', (_req, res: express.Response) => {
    logger.info('Received GET MCP request');
    res.writeHead(405).end(
      JSON.stringify({
        jsonrpc: '2.0',
        error: {
          code: -32000,
          message: 'Method not allowed.',
        },
        id: null,
      })
    );
  });
  app.delete('/mcp', (_req, res) => {
    logger.warn('Received DELETE /mcp request - Method Not Allowed.');
    res.status(405).json({
      jsonrpc: '2.0',
      error: { code: -32600, message: 'Method Not Allowed. Use POST.' },
      id: null,
    });
  });

  app.get('/sse', async (_req, res) => {
    const clientIp = _req.headers['x-forwarded-for'] || _req.socket.remoteAddress;
    const userAgent = _req.headers['user-agent'];
    logger.info(`New SSE connection from ${clientIp} - User-Agent: ${userAgent}`);

    const transport = new SSEServerTransport('/messages', res);
    const createdAt = new Date();
    logger.info(`SSE transport established`, transport.sessionId);

    transports[transport.sessionId] = transport;
    res.on('close', () => {
      const durationSec = ((new Date().getTime() - createdAt.getTime()) / 1000).toFixed(2);
      logger.info(`SSE connection closed after ${durationSec}s`, transport.sessionId);
      delete transports[transport.sessionId];
    });

    try {
      await server.connect(transport);
      logger.info(`Server connected to SSE transport successfully`, transport.sessionId);
    } catch (error) {
      logger.error(
        `Failed to connect server to SSE transport: ${error.message}`,
        error,
        transport.sessionId
      );
    }
  });
  app.post('/messages', async (req, res) => {
    const sessionId = (req.query.sessionId as string) || '';
    logger.info(`Received message for processing`, sessionId);

    const transport = get(transports, sessionId, null);
    if (transport) {
      try {
        logger.debug(`Processing message with transport handler`, sessionId);
        await transport.handlePostMessage(req, res);
        logger.info(`Message processed successfully`, sessionId);
      } catch (error) {
        logger.error(`Error processing message: ${error.message}`, error, sessionId);
        if (!res.headersSent) {
          res.status(500).send('Error processing message');
        }
      }
    } else {
      logger.warn(`No transport found for sessionId`, sessionId);
      res.status(400).send('No transport found for sessionId');
    }
  });

  app.get('/knockknock', (_req, res) => {
    res.status(200).json({ server: 'papi', version: '0', status: 'ok', transport: 'http/sse' });
  });

  return app;
}
