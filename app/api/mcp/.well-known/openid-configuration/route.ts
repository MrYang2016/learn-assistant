import { NextRequest, NextResponse } from 'next/server';

/**
 * OpenID Connect Discovery
 */
export async function GET(request: NextRequest) {
  return NextResponse.json(
    {
      issuer: request.nextUrl.origin,
      authorization_endpoint: null,
      token_endpoint: null,
      jwks_uri: null,
      response_types_supported: [],
      subject_types_supported: [],
      id_token_signing_alg_values_supported: [],
      scopes_supported: [],
      authentication_method: 'bearer_token',
      note: 'This MCP server uses Bearer Token (API Key) authentication, not OpenID Connect',
    },
    {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
    }
  );
}

