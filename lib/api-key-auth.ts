import { ApiKey } from './api-key-service';

/**
 * Verify API key and get user information
 * Returns the user_id if API key is valid, null otherwise
 * Uses service role to bypass RLS for API key verification
 */
export async function verifyApiKey(apiKey: string): Promise<{ userId: string; apiKeyId: string } | null> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    if (!serviceRoleKey) {
      console.error('[MCP] ERROR: SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY not set');
      return null;
    }
    
    // Check if we're using service role or anon key
    const isServiceRole = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
    console.log('[MCP] Using', isServiceRole ? 'SERVICE_ROLE_KEY' : 'ANON_KEY (may have RLS restrictions)');
    
    if (!isServiceRole) {
      console.warn('[MCP] WARNING: Using ANON_KEY instead of SERVICE_ROLE_KEY. RLS policies may prevent query.');
    }

    // Use direct fetch with service role key to bypass RLS
    // Strategy: Query by prefix first (faster), then match full key in memory
    // This avoids URL encoding issues with special characters in the API key
    const prefix = apiKey.substring(3, 11); // sk_ + 8 chars
    const queryUrl = `${supabaseUrl}/rest/v1/api_keys?prefix=eq.${prefix}&select=id,user_id,api_key,expires_at,last_used_at`;
    console.log('[MCP] Verifying API key, query by prefix:', prefix);

    console.log('[MCP] Query URL:', queryUrl);
    console.log('[MCP] Using service role key:', serviceRoleKey ? 'YES (length: ' + serviceRoleKey.length + ')' : 'NO');
    console.log('[MCP] Supabase URL:', supabaseUrl);
    
    const response = await fetch(queryUrl, {
      method: 'GET',
      headers: {
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('[MCP] Response status:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[MCP] API key verification failed:', response.status, errorText);
      console.error('[MCP] API key attempted:', apiKey.substring(0, 15) + '...');
      return null;
    }

    const apiKeys: ApiKey[] = await response.json();
    console.log('[MCP] API keys found with prefix:', apiKeys.length);
    if (apiKeys.length > 0) {
      console.log('[MCP] First key details:', {
        id: apiKeys[0].id,
        prefix: apiKeys[0].prefix,
        key_name: apiKeys[0].key_name,
        api_key_preview: apiKeys[0].api_key?.substring(0, 20) + '...'
      });
    }
    
    // Now match the full API key in memory (since it may be stored as plain text)
    const matchedKey = apiKeys.find(key => key.api_key === apiKey);
    
    if (!matchedKey) {
      console.error('[MCP] No matching API key found after prefix match');
      console.error('[MCP] Stored keys (first 20 chars):', apiKeys.map(k => k.api_key?.substring(0, 20) || 'null').join(', '));
      console.error('[MCP] Looking for:', apiKey.substring(0, 20));
      return null;
    }
    
    console.log('[MCP] API key matched successfully');

    const keyRecord = matchedKey;

    // Check if key has expired
    if (keyRecord.expires_at) {
      const expiresAt = new Date(keyRecord.expires_at);
      if (expiresAt < new Date()) {
        return null;
      }
    }

    // Update last_used_at timestamp using service role
    try {
      await fetch(
        `${supabaseUrl}/rest/v1/api_keys?id=eq.${keyRecord.id}`,
        {
          method: 'PATCH',
          headers: {
            'apikey': serviceRoleKey,
            'Authorization': `Bearer ${serviceRoleKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal',
          },
          body: JSON.stringify({ last_used_at: new Date().toISOString() }),
        }
      );
    } catch (error) {
      // If update fails, continue anyway (non-critical)
      console.warn('Failed to update last_used_at:', error);
    }

    return {
      userId: keyRecord.user_id,
      apiKeyId: keyRecord.id,
    };
  } catch (error) {
    console.error('API key verification error:', error);
    return null;
  }
}

/**
 * Get Supabase access token for a user ID
 * This is a simplified version - in production you might want to use service role
 * or create a service account token
 */
export async function getAccessTokenForUser(userId: string): Promise<string | null> {
  // For MCP server, we'll use the anon key with user context
  // In production, you might want to use service role key or create a JWT token
  // For now, we'll return null and use the userId directly in queries
  // The supabaseFetch functions will need to be adapted to work with userId instead of accessToken
  return null;
}

