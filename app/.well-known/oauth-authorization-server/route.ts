import { NextRequest, NextResponse } from 'next/server';

/**
 * OAuth/OIDC Discovery Endpoints
 * These endpoints tell Cursor that we use Bearer Token authentication, not OAuth
 */

// OAuth 2.0 Authorization Server Metadata
export async function GET(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Handle well-known endpoints
  if (pathname === '/.well-known/oauth-authorization-server' ||
    pathname === '/.well-known/oauth-authorization-server/api/mcp') {
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

  // OAuth 2.0 Protected Resource Metadata
  if (pathname === '/.well-known/oauth-protected-resource' ||
    pathname === '/.well-known/oauth-protected-resource/api/mcp') {
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

  // OpenID Connect Discovery
  if (pathname === '/.well-known/openid-configuration' ||
    pathname === '/.well-known/openid-configuration/api/mcp' ||
    pathname === '/api/mcp/.well-known/openid-configuration') {
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

  // Default 404 for other paths
  return NextResponse.json(
    { error: 'Not found' },
    { status: 404 }
  );
}

