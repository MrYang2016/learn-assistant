import { NextRequest, NextResponse } from 'next/server';
import { sessions } from '@/lib/mcp-sessions';

/**
 * POST /api/mcp/messages - Handle client messages for SSE transport
 */
export async function POST(request: NextRequest) {
  try {
    // Extract session ID from query parameter
    const sessionId = request.nextUrl.searchParams.get('sessionId');
    if (!sessionId) {
      console.error('[MCP] Missing sessionId parameter');
      return NextResponse.json(
        { jsonrpc: '2.0', error: { code: -32000, message: 'Missing sessionId parameter' }, id: null },
        { status: 400 }
      );
    }

    const session = sessions.get(sessionId);
    if (!session) {
      console.error(`[MCP] Session not found: ${sessionId}`);
      console.error(`[MCP] Available sessions: ${Array.from(sessions.keys()).join(', ')}`);
      return NextResponse.json(
        { jsonrpc: '2.0', error: { code: -32000, message: 'Session not found' }, id: null },
        { status: 404 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { method, params, id } = body;
    console.log(`[MCP] Received ${method} request (id: ${id}) for session ${sessionId}`);

    // Handle MCP methods
    let result: any;
    try {
      switch (method) {
        case 'initialize': {
          result = {
            jsonrpc: '2.0',
            id,
            result: {
              protocolVersion: '2024-11-05',
              capabilities: {
                tools: {},
              },
              serverInfo: {
                name: 'learn-assistant',
                version: '1.0.0',
              },
            },
          };
          break;
        }

        case 'tools/list': {
          const toolsResult = await session.mcpServer.handleListTools();
          result = {
            jsonrpc: '2.0',
            id,
            result: toolsResult,
          };
          break;
        }

        case 'tools/call': {
          const callResult = await session.mcpServer.handleCallTool(
            params.name,
            params.arguments || {}
          );
          result = {
            jsonrpc: '2.0',
            id,
            result: callResult,
          };
          break;
        }

        default:
          result = {
            jsonrpc: '2.0',
            id,
            error: {
              code: -32601,
              message: `Method not found: ${method}`,
            },
          };
      }

      // Queue the response to be sent via SSE immediately
      if (id && result) {
        session.messageQueue.push({ id: String(id), message: result });
        console.log(`[MCP] Queued response for request ${id}, method: ${method}`);

        // Trigger immediate processing by setting a flag or directly notifying
        // The SSE stream will pick it up in the next poll cycle (100ms)
      }

      // Return accepted response (SSE will send the actual response)
      // This is crucial - must return 202 Accepted, not the JSON response
      return new NextResponse('Accepted', {
        status: 202,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
    } catch (error: any) {
      const errorResult = {
        jsonrpc: '2.0',
        id,
        error: {
          code: error.code || -32603,
          message: error.message || 'Internal error',
        },
      };

      if (id) {
        session.messageQueue.push({ id: String(id), message: errorResult });
      }

      return NextResponse.json(errorResult, {
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
  } catch (error: any) {
    console.error('Message handling error:', error);
    return NextResponse.json(
      {
        jsonrpc: '2.0',
        id: null,
        error: {
          code: -32603,
          message: error.message || 'Internal error',
        },
      },
      {
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
}

// Handle OPTIONS for CORS preflight
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
