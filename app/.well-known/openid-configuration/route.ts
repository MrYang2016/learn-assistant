import { NextRequest, NextResponse } from 'next/server';

/**
 * OAuth 2.0 Protected Resource Metadata
 */
export async function GET(request: NextRequest) {
  return NextResponse.json(
    {
      resource: request.nextUrl.origin + '/api/mcp',
      resource_documentation: null,
      authorization_servers: [],
      scopes_supported: [],
      bearer_methods_supported: ['header'],
      authentication_method: 'bearer_token',
      note: 'This MCP server uses Bearer Token (API Key) authentication via Authorization header',
    },
    {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
    }
  );
}

