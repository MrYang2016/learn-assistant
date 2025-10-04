/*
  # Add recall text field to review schedules

  ## Overview
  Adds a field to store the user's recalled answer when completing reviews,
  supporting active recall learning methodology.

  ## Changes Made
  
  ### 1. Modified Tables
    - `review_schedules`
      - Added `recall_text` (text, nullable) - Stores what the user recalled before viewing the answer
  
  ## Important Notes
  - This field is optional and stores the user's attempt at recalling the answer
  - Helps users track their learning progress over time
  - The recall text is saved when a review is marked as completed
*/

-- Add recall_text column to review_schedules
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'review_schedules' AND column_name = 'recall_text'
  ) THEN
    ALTER TABLE review_schedules ADD COLUMN recall_text text;
  END IF;
END $$;