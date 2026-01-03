/*
  # Keep Vector Dimension at 1536 (Deprecated - Use original migration)

  ## Overview
  This migration is no longer needed. We use 1536 dimensions due to Supabase limits.

  ## Changes
  1. Drop existing index
  2. Drop existing search function
  3. Alter embedding column to use 2560 dimensions
  4. Recreate index with new dimension
  5. Recreate search function with new dimension
*/

-- Drop existing index (it depends on the vector type)
DROP INDEX IF EXISTS idx_knowledge_points_embedding;

-- Drop existing search function (it uses the old dimension)
DROP FUNCTION IF EXISTS search_knowledge_points(vector(1536), float, int, uuid);

-- Alter the embedding column to use 2560 dimensions
ALTER TABLE knowledge_points 
ALTER COLUMN embedding TYPE vector(2560);

-- Recreate index for vector similarity search using HNSW (supports higher dimensions)
-- HNSW is better than IVFFlat for dimensions > 2000
CREATE INDEX idx_knowledge_points_embedding 
ON knowledge_points 
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- Recreate function for semantic search with new dimension
CREATE OR REPLACE FUNCTION search_knowledge_points(
  query_embedding vector(2560),
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

-- Update comment
COMMENT ON COLUMN knowledge_points.embedding IS 'Vector embedding for semantic search (2560 dimensions)';
