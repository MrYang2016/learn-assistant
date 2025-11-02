import { NextRequest } from 'next/server';
import { LearnAssistantMCPServer } from '@/lib/mcp-server';
import { verifyApiKey } from '@/lib/api-key-auth';
import { randomUUID } from 'node:crypto';
import { sessions, Session } from '@/lib/mcp-sessions';

/**
 * MCP SSE API Route Handler
 * Supports Server-Sent Events transport for MCP
 * 
 * Authentication: API key via Authorization header (Bearer token)
 * Format: Authorization: Bearer <api_key>
 */

/**
 * GET /api/mcp/sse - Establish SSE connection
 */
export async function GET(request: NextRequest) {
  try {
    // Extract API key from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response('Unauthorized: API key required', {
        status: 401,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
    }

    const apiKey = authHeader.substring(7);

    // Verify API key
    const authResult = await verifyApiKey(apiKey);
    if (!authResult) {
      return new Response('Unauthorized: Invalid API key', {
        status: 401,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
    }

    // Create session
    const sessionId = randomUUID();
    const mcpServer = new LearnAssistantMCPServer();
    await mcpServer.setContextFromApiKey(apiKey);

    const session: Session = {
      mcpServer,
      userId: authResult.userId,
      apiKeyId: authResult.apiKeyId,
      messageQueue: [],
      messageResolvers: new Map(),
    };
    sessions.set(sessionId, session);
    console.log(`[MCP] Created SSE session ${sessionId} for user ${authResult.userId}`);

    // Create SSE stream
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();

        // Send endpoint event (must be relative path as per MCP spec)
        // The endpoint should be relative, and sessionId is added as query param
        const endpointUrl = `/api/mcp/messages?sessionId=${sessionId}`;
        controller.enqueue(encoder.encode(`event: endpoint\ndata: ${endpointUrl}\n\n`));

        // Handle messages from queue
        const processMessages = () => {
          const currentSession = sessions.get(sessionId);
          if (!currentSession) return;

          while (currentSession.messageQueue.length > 0) {
            const { id, message } = currentSession.messageQueue.shift()!;
            const data = JSON.stringify(message);
            // Use 'event: message' format as per MCP SSE spec
            controller.enqueue(encoder.encode(`event: message\ndata: ${data}\n\n`));
            console.log(`[MCP] Sent SSE message for request ${id}`);

            // Resolve the promise if waiting
            const resolver = currentSession.messageResolvers.get(id);
            if (resolver) {
              resolver(message);
              currentSession.messageResolvers.delete(id);
            }
          }
        };

        // Process messages periodically
        const messageInterval = setInterval(() => {
          try {
            processMessages();
          } catch (error) {
            console.error('Error processing messages:', error);
          }
        }, 100);

        // Send heartbeat/keepalive every 30 seconds to prevent timeout
        // SSE connections timeout if no data is sent for too long
        const heartbeatInterval = setInterval(() => {
          try {
            const currentSession = sessions.get(sessionId);
            if (!currentSession) {
              clearInterval(heartbeatInterval);
              clearInterval(messageInterval);
              return;
            }
            // Send a comment line as keepalive (SSE comment lines start with :)
            controller.enqueue(encoder.encode(`: heartbeat ${Date.now()}\n\n`));
          } catch (error) {
            console.error('Error sending heartbeat:', error);
            clearInterval(heartbeatInterval);
            clearInterval(messageInterval);
          }
        }, 30000); // 30 seconds

        // Handle connection close
        request.signal.addEventListener('abort', () => {
          clearInterval(messageInterval);
          clearInterval(heartbeatInterval);
          sessions.delete(sessionId);
          try {
            controller.close();
          } catch (error) {
            // Ignore errors when closing already closed controller
          }
        });

        // Cleanup on close (1 hour timeout)
        setTimeout(() => {
          clearInterval(messageInterval);
          clearInterval(heartbeatInterval);
          sessions.delete(sessionId);
          try {
            controller.close();
          } catch (error) {
            // Ignore errors when closing already closed controller
          }
        }, 3600000); // 1 hour timeout
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no', // Disable buffering in Nginx
        'X-Content-Type-Options': 'nosniff',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  } catch (error: any) {
    console.error('SSE connection error:', error);
    return new Response('Internal Server Error', {
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}

// Handle OPTIONS for CORS preflight
export async function OPTIONS(request: NextRequest) {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}