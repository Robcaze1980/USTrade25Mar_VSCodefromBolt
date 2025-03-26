/*
  # Fix Trade Statistics Access Policy

  1. Changes
    - Update RLS policy to allow authenticated users to read trade stats
    - Keep table security enabled
*/

-- Drop the restrictive policy
DROP POLICY IF EXISTS "Trade stats via view only" ON trade_stats;

-- Create new policy allowing authenticated users to read trade stats
CREATE POLICY "Authenticated users can read trade stats"
  ON trade_stats
  FOR SELECT
  TO authenticated
  USING (true);

-- Ensure RLS is enabled
ALTER TABLE trade_stats ENABLE ROW LEVEL SECURITY;