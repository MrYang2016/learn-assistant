/*
  # Add is_in_review_plan field to knowledge_points

  ## Changes
  - Adds `is_in_review_plan` boolean field to knowledge_points table
  - Defaults to true for backward compatibility
  - Allows users to choose whether to include knowledge points in review schedule
*/

-- Add is_in_review_plan column to knowledge_points table
ALTER TABLE knowledge_points 
ADD COLUMN IF NOT EXISTS is_in_review_plan boolean DEFAULT true;

-- Add index for better query performance when filtering by review plan status
CREATE INDEX IF NOT EXISTS idx_knowledge_points_review_plan 
ON knowledge_points(user_id, is_in_review_plan);

-- Update existing knowledge points to be in review plan by default
UPDATE knowledge_points 
SET is_in_review_plan = true 
WHERE is_in_review_plan IS NULL;
