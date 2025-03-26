/*
  # Fix HS Codes Description Fields

  1. Changes
    - Remove unused description_short column
    - Ensure hs_code_description is used consistently
    - Update indexes for search performance
*/

-- Drop unused columns if they exist
DO $$ 
BEGIN
    ALTER TABLE hs_codes DROP COLUMN IF EXISTS description_short;
EXCEPTION 
    WHEN undefined_column THEN NULL;
END $$;

-- Ensure proper indexes exist for searching
DROP INDEX IF EXISTS idx_hs_codes_description;
CREATE INDEX idx_hs_codes_description ON hs_codes USING gin (hs_code_description gin_trgm_ops);

-- Analyze table to update statistics
ANALYZE hs_codes;