/*
  # Add Vector Search Support

  ## Overview
  Adds pgvector extension and embedding column to knowledge_points table
  for semantic search capabilities.

  ## Changes
  1. Enable pgvector extension
  2. Add embedding column to knowledge_points table
  3. Create vector similarity search function
  4. Create index on embedding column for performance

  ## Notes
  - Embedding dimension is configurable (default: 1536 for OpenAI text-embedding-3-small)
  - Vector similarity uses cosine distance
*/

-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Add embedding column to knowledge_points table
-- Using 1536 dimensions (Supabase limit, truncated from larger models)
ALTER TABLE knowledge_points 
ADD COLUMN IF NOT EXISTS embedding vector(1536);

-- Create index for vector similarity search using HNSW (supports higher dimensions)
-- HNSW is better than IVFFlat for dimensions > 2000
CREATE INDEX IF NOT EXISTS idx_knowledge_points_embedding 
ON knowledge_points 
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- Create function for semantic search
CREATE OR REPLACE FUNCTION search_knowledge_points(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 5,
  filter_user_id uuid DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  question text,
  answer text,
  similarity float,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    kp.id,
    kp.user_id,
    kp.question,
    kp.answer,
    1 - (kp.embedding <=> query_embedding) as similarity,
    kp.created_at,
    kp.updated_at
  FROM knowledge_points kp
  WHERE 
    kp.embedding IS NOT NULL
    AND (filter_user_id IS NULL OR kp.user_id = filter_user_id)
    AND 1 - (kp.embedding <=> query_embedding) > match_threshold
  ORDER BY kp.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION search_knowledge_points TO authenticated;

-- Add comment to embedding column
COMMENT ON COLUMN knowledge_points.embedding IS 'Vector embedding for semantic search using OpenAI embeddings';
