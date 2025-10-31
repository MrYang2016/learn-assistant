/*
  # API Keys Schema

  ## Overview
  Creates a table for storing user API keys for authentication.

  ## Tables Created
  
  ### api_keys
  Stores API keys for users to authenticate API requests.
  - `id` (uuid, primary key) - Unique identifier
  - `user_id` (uuid) - Owner of the API key (references auth.users)
  - `key_name` (text) - User-friendly name for the API key
  - `api_key` (text) - The actual API key (hashed)
  - `prefix` (text) - First 8 characters of the API key for display
  - `last_used_at` (timestamptz) - When the API key was last used
  - `created_at` (timestamptz) - When the API key was created
  - `expires_at` (timestamptz) - Optional expiration date (NULL = never expires)

  ## Security
  - RLS enabled on the table
  - Users can only access their own API keys
  - API keys are stored hashed (using pgcrypto extension)
  - Separate policies for SELECT, INSERT, UPDATE, DELETE operations
*/

-- Enable pgcrypto extension for hashing API keys
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create api_keys table
CREATE TABLE IF NOT EXISTS api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  key_name text NOT NULL,
  api_key text NOT NULL, -- This will store the hashed key
  prefix text NOT NULL, -- First 8 characters for display
  last_used_at timestamptz,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz -- NULL means never expires
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_api_key ON api_keys(api_key);
CREATE INDEX IF NOT EXISTS idx_api_keys_prefix ON api_keys(prefix);

-- Enable Row Level Security
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- RLS Policies for api_keys
CREATE POLICY "Users can view own API keys"
  ON api_keys FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own API keys"
  ON api_keys FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own API keys"
  ON api_keys FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own API keys"
  ON api_keys FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to generate a random API key
CREATE OR REPLACE FUNCTION generate_api_key() RETURNS text AS $$
  SELECT 'sk_' || encode(gen_random_bytes(32), 'base64url');
$$ LANGUAGE SQL;

