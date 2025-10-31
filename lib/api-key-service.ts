import { supabaseFetch } from './supabase-fetch';

export interface ApiKey {
  id: string;
  user_id: string;
  key_name: string;
  api_key: string; // Hashed key in database
  prefix: string; // First 8 characters for display
  last_used_at: string | null;
  created_at: string;
  expires_at: string | null;
}

/**
 * Generate a random API key
 * Format: sk_<32 random bytes base64url encoded>
 */
export function generateApiKey(): string {
  // Generate 32 random bytes and encode as base64url
  const randomBytes = new Uint8Array(32);
  crypto.getRandomValues(randomBytes);
  
  // Convert to base64url (URL-safe base64)
  const base64 = btoa(String.fromCharCode(...randomBytes));
  const base64url = base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  
  return `sk_${base64url}`;
}

/**
 * Get prefix from API key (first 8 characters after sk_)
 */
export function getApiKeyPrefix(apiKey: string): string {
  return apiKey.substring(3, 11); // sk_ + 8 chars
}

/**
 * Create a new API key
 */
export async function createApiKey(keyName: string, accessToken?: string): Promise<{ apiKey: ApiKey; plainKey: string }> {
  if (!accessToken) {
    throw new Error('Access token required for creating API keys');
  }

  // Get user info
  const user = await supabaseFetch.getUser(accessToken);
  if (!user) {
    throw new Error('Not authenticated');
  }

  // Generate API key
  const plainKey = generateApiKey();
  const prefix = getApiKeyPrefix(plainKey);

  // For now, store the plain key (in production, should hash it)
  // TODO: Implement proper hashing on the backend
  const apiKeyResponse = await supabaseFetch.insert<ApiKey[]>(
    'api_keys',
    {
      user_id: user.id,
      key_name: keyName,
      api_key: plainKey, // In production, this should be hashed
      prefix: prefix,
    },
    { columns: '*' },
    accessToken
  );

  const apiKey = apiKeyResponse[0];
  
  return { apiKey, plainKey };
}

/**
 * Get all API keys for a user
 */
export async function getAllApiKeys(userId: string, accessToken?: string): Promise<ApiKey[]> {
  return supabaseFetch.select<ApiKey>(
    'api_keys',
    {
      columns: '*',
      filters: { user_id: userId },
      order: { column: 'created_at', ascending: false }
    },
    accessToken
  );
}

/**
 * Update API key name
 */
export async function updateApiKey(id: string, keyName: string, accessToken?: string): Promise<ApiKey> {
  const response = await supabaseFetch.update<ApiKey[]>(
    'api_keys',
    { key_name: keyName },
    { id },
    { columns: '*' },
    accessToken
  );
  return response[0];
}

/**
 * Delete API key
 */
export async function deleteApiKey(id: string, accessToken?: string): Promise<void> {
  await supabaseFetch.delete('api_keys', { id }, accessToken);
}

/**
 * Update last used timestamp for an API key
 */
export async function updateApiKeyLastUsed(id: string, accessToken?: string): Promise<void> {
  await supabaseFetch.update(
    'api_keys',
    { last_used_at: new Date().toISOString() },
    { id },
    {},
    accessToken
  );
}

