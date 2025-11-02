import { NextRequest, NextResponse } from 'next/server';
import { LearnAssistantMCPServer } from '@/lib/mcp-server';
import { verifyApiKey } from '@/lib/api-key-auth';

/**
 * MCP API Route Handler
 * Supports HTTP POST (JSON-RPC 2.0)
 * 
 * Authentication: API key via Authorization header (Bearer token)
 * Format: Authorization: Bearer <api_key>
 */
export async function POST(request: NextRequest) {
  try {
    // Extract API key from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: { code: -32000, message: 'Unauthorized: API key required' } },
        {
          status: 401,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS, GET',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          }
        }
      );
    }

    const apiKey = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify API key
    const authResult = await verifyApiKey(apiKey);
    if (!authResult) {
      return NextResponse.json(
        { error: { code: -32000, message: 'Unauthorized: Invalid API key' } },
        {
          status: 401,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS, GET',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          }
        }
      );
    }

    // Parse request body
    const body = await request.json();

    // Create MCP server instance with user context
    const mcpServer = new LearnAssistantMCPServer();
    await mcpServer.setContextFromApiKey(apiKey);

    // Handle different MCP methods
    const { method, params, id } = body;

    let result;
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
        const toolsResult = await mcpServer.handleListTools();
        result = {
          jsonrpc: '2.0',
          id,
          result: toolsResult,
        };
        break;
      }

      case 'tools/call': {
        try {
          const callResult = await mcpServer.handleCallTool(params.name, params.arguments || {});
          result = {
            jsonrpc: '2.0',
            id,
            result: callResult,
          };
        } catch (error: any) {
          const errorCode = error.code || -32603;
          const errorMessage = error.message || 'Internal error';
          result = {
            jsonrpc: '2.0',
            id,
            error: {
              code: errorCode,
              message: errorMessage,
            },
          };
          return NextResponse.json(result, {
            status: errorCode >= -32099 && errorCode <= -32000 ? 400 : 500,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'POST, OPTIONS, GET',
              'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            }
          });
        }
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
        return NextResponse.json(result, {
          status: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS, GET',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          }
        });
    }

    return NextResponse.json(result, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS, GET',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    });
  } catch (error: any) {
    console.error('MCP API error:', error);
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
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
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
      'Access-Control-Allow-Methods': 'POST, OPTIONS, GET',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

// Handle GET for health check / discovery
export async function GET(request: NextRequest) {
  // Return MCP server info for discovery
  return NextResponse.json(
    {
      name: 'learn-assistant',
      version: '1.0.0',
      protocol: 'json-rpc-2.0',
      endpoint: '/api/mcp',
      authentication: {
        type: 'bearer',
        header: 'Authorization',
      },
    },
    {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS, GET',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    }
  );
}

