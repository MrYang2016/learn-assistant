import { NextRequest, NextResponse } from 'next/server';

/**
 * OAuth 2.0 Authorization Server Metadata
 */
export async function GET(request: NextRequest) {
  return NextResponse.json(
    {
      issuer: request.nextUrl.origin,
      authorization_endpoint: null,
      token_endpoint: null,
      jwks_uri: null,
      scopes_supported: [],
      response_types_supported: [],
      grant_types_supported: [],
      token_endpoint_auth_methods_supported: ['bearer'],
      authentication_method: 'bearer_token',
      note: 'This MCP server uses Bearer Token (API Key) authentication, not OAuth 2.0',
    },
    {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
    }
  );
}

