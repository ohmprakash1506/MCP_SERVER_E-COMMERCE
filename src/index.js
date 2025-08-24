import dotenv from 'dotenv';
import express from 'express';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { discoverTools } from './lib/tools.js';
import { registerResources } from './lib/resource.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const SERVER_NAME = 'fakestore-mcp-server';

async function setupServer() {
  const tools = await discoverTools();
  const server = new McpServer({
    name: SERVER_NAME,
    version: '1.0.0',
  });

  registerResources(server);

  for (const tool of tools) {
    server.registerTool(
      tool.definition.function.name,
      {
        title: tool.definition.function.name,
        description: tool.definition.function.description,
        inputSchema: tool.definition.function.parameters.shape,
      },
      async (args) => {
        const result = await tool.function(args);
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
      }
    );
  }

  return server;
}

async function setupStreamableHttp() {
  const app = express();
  app.use(express.json());

  app.post('/mcp', async (req, res) => {
    try {
      const server = await setupServer();
      const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
      res.on('close', async () => {
        await transport.close();
        await server.close();
      });
      await server.connect(transport);
      await transport.handleRequest(req, res, req.body);
    } catch (error) {
      console.error('Error:', error);
      if (!res.headersSent) {
        res.status(500).json({ jsonrpc: '2.0', error: { code: -32603, message: 'Internal error' }, id: null });
      }
    }
  });

  const port = parseInt(process.env.PORT || '3001', 10);
  app.listen(port, () => console.log(`Streamable HTTP Server at http://127.0.0.1:${port}/mcp`));
}

async function setupStdio() {
  const server = await setupServer();
  process.on('SIGINT', async () => {
    await server.close();
    process.exit(0);
  });
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

async function run() {
  const args = process.argv.slice(2);
  const isStreamableHttp = args.includes('--streamable-http');

  if (isStreamableHttp) {
    await setupStreamableHttp();
  } else {
    await setupStdio();
  }
}

run().catch(console.error);