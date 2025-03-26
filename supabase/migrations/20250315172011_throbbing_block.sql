/*
  # Add Additional Columns to HS Codes Table

  1. New Columns
    - `description_long` (text)
    - `description_tsv` (tsvector, generated from description_long)
    - `category` (text)
    - `subcategory` (text)
    - `status` (text)
    - `last_updated` (timestamptz)

  2. Constraints
    - Add status validation
    - Add indexes for search performance

  3. Data Updates
    - Set categories and subcategories based on HS code patterns
*/

-- Add new columns to hs_codes table
ALTER TABLE hs_codes
ADD COLUMN description_long text,
ADD COLUMN description_tsv tsvector GENERATED ALWAYS AS (to_tsvector('english', COALESCE(description_long, ''))) STORED,
ADD COLUMN category text,
ADD COLUMN subcategory text,
ADD COLUMN status text DEFAULT 'active',
ADD COLUMN last_updated timestamptz DEFAULT now();

-- Add constraints
ALTER TABLE hs_codes
ADD CONSTRAINT valid_status CHECK (status IN ('active', 'inactive', 'deprecated'));

-- Create indexes for better search performance
CREATE INDEX IF NOT EXISTS idx_description_tsv ON hs_codes USING gin (description_tsv);
CREATE INDEX IF NOT EXISTS idx_hs_codes_category ON hs_codes(category);
CREATE INDEX IF NOT EXISTS idx_hs_codes_status ON hs_codes(status);

-- Update existing records with more detailed information
UPDATE hs_codes
SET 
  description_long = hs_code_description,
  category = CASE 
    WHEN id LIKE '01%' THEN 'Live Animals'
    WHEN id LIKE '02%' THEN 'Meat and Edible Meat Offal'
    WHEN id LIKE '03%' THEN 'Fish and Crustaceans'
    WHEN id LIKE '04%' THEN 'Dairy Produce'
    ELSE 'Other'
  END,
  subcategory = CASE 
    WHEN id LIKE '0101%' THEN 'Horses, Asses, Mules and Hinnies'
    WHEN id LIKE '0102%' THEN 'Bovine Animals'
    WHEN id LIKE '0103%' THEN 'Swine'
    WHEN id LIKE '0104%' THEN 'Sheep and Goats'
    WHEN id LIKE '0105%' THEN 'Poultry'
    WHEN id LIKE '0106%' THEN 'Other Live Animals'
    ELSE 'Other'
  END;