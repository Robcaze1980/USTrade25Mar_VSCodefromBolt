/*
  # Fix HS Codes Descriptions

  1. Changes
    - Copy hs_code_description to description_long
    - Clear description_short as it's not being used
    - Update indexes for better performance

  2. Security
    - Maintain existing RLS policies
*/

-- Update descriptions to ensure consistency
UPDATE hs_codes
SET 
  description_long = hs_code_description,
  description_short = '';

-- Create index for hs_code_description for better search performance
CREATE INDEX IF NOT EXISTS idx_hs_codes_description ON hs_codes USING gin (hs_code_description gin_trgm_ops);

-- Analyze table to update statistics for query optimizer
ANALYZE hs_codes;