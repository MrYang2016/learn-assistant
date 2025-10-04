/*
  # Learning Application Schema

  ## Overview
  Creates a spaced repetition learning system with active recall support.

  ## Tables Created
  
  ### 1. knowledge_points
  Stores individual learning items with their questions and explanations.
  - `id` (uuid, primary key) - Unique identifier
  - `user_id` (uuid) - Owner of the knowledge point (references auth.users)
  - `question` (text) - The question/prompt for active recall
  - `answer` (text) - Detailed explanation of the knowledge point
  - `created_at` (timestamptz) - When the knowledge point was created
  - `updated_at` (timestamptz) - Last modification time

  ### 2. review_schedules
  Tracks the review schedule for each knowledge point using spaced repetition.
  - `id` (uuid, primary key) - Unique identifier
  - `knowledge_point_id` (uuid) - References knowledge_points(id)
  - `user_id` (uuid) - Owner (references auth.users)
  - `review_date` (date) - Date when this review should occur
  - `review_number` (int) - Which review this is (1=day 0, 2=day 7, 3=day 16, 4=day 31)
  - `completed` (boolean) - Whether this review has been completed
  - `completed_at` (timestamptz) - When the review was marked complete
  - `created_at` (timestamptz) - When this schedule was created

  ## Security
  - RLS enabled on all tables
  - Users can only access their own knowledge points and schedules
  - Separate policies for SELECT, INSERT, UPDATE, DELETE operations

  ## Important Notes
  - Review schedule follows: Day 0, Day 7, Day 16, Day 31
  - Automatic review schedule creation handled by application logic
  - All timestamps use UTC timezone
*/

-- Create knowledge_points table
CREATE TABLE IF NOT EXISTS knowledge_points (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question text NOT NULL,
  answer text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create review_schedules table
CREATE TABLE IF NOT EXISTS review_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  knowledge_point_id uuid NOT NULL REFERENCES knowledge_points(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  review_date date NOT NULL,
  review_number int NOT NULL CHECK (review_number BETWEEN 1 AND 4),
  completed boolean DEFAULT false,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_knowledge_points_user_id ON knowledge_points(user_id);
CREATE INDEX IF NOT EXISTS idx_review_schedules_user_id ON review_schedules(user_id);
CREATE INDEX IF NOT EXISTS idx_review_schedules_review_date ON review_schedules(review_date, user_id);
CREATE INDEX IF NOT EXISTS idx_review_schedules_kp_id ON review_schedules(knowledge_point_id);

-- Enable Row Level Security
ALTER TABLE knowledge_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_schedules ENABLE ROW LEVEL SECURITY;

-- RLS Policies for knowledge_points
CREATE POLICY "Users can view own knowledge points"
  ON knowledge_points FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own knowledge points"
  ON knowledge_points FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own knowledge points"
  ON knowledge_points FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own knowledge points"
  ON knowledge_points FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for review_schedules
CREATE POLICY "Users can view own review schedules"
  ON review_schedules FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own review schedules"
  ON review_schedules FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own review schedules"
  ON review_schedules FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own review schedules"
  ON review_schedules FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);