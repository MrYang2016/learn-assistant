-- Add policy to allow service role to read API keys for verification
-- This is needed for MCP server to verify API keys
CREATE POLICY "Service role can read API keys for verification"
  ON api_keys FOR SELECT
  TO service_role
  USING (true);

