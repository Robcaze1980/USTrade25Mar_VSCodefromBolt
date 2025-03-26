/*
  # Fix HS Codes Structure

  1. Changes
    - Drop and recreate hs_codes table with correct structure
    - Ensure proper foreign key relationships
    - Add appropriate indexes
    - Add sample data
*/

-- Drop existing tables and recreate with proper structure
DROP TABLE IF EXISTS user_hs_codes CASCADE;
DROP TABLE IF EXISTS hs_codes CASCADE;

-- Create hs_codes table
CREATE TABLE hs_codes (
  id text PRIMARY KEY,
  hs_code_description text NOT NULL,
  description_long text,
  description_tsv tsvector GENERATED ALWAYS AS (to_tsvector('english', COALESCE(description_long, ''))) STORED,
  category text,
  subcategory text,
  status text DEFAULT 'active',
  last_updated timestamptz DEFAULT now()
);

-- Create user_hs_codes table
CREATE TABLE user_hs_codes (
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  hs_code_id text REFERENCES hs_codes(id) ON DELETE CASCADE,
  subscription_id uuid REFERENCES subscriptions(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, hs_code_id)
);

-- Enable RLS
ALTER TABLE user_hs_codes ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own hs codes"
  ON user_hs_codes
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own hs codes"
  ON user_hs_codes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own hs codes"
  ON user_hs_codes
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_hs_codes_description ON hs_codes USING gin (hs_code_description gin_trgm_ops);
CREATE INDEX idx_hs_codes_category ON hs_codes(category);
CREATE INDEX idx_hs_codes_status ON hs_codes(status);
CREATE INDEX idx_user_hs_codes_user_id ON user_hs_codes(user_id);
CREATE INDEX idx_user_hs_codes_hs_code_id ON user_hs_codes(hs_code_id);

-- Insert sample data
INSERT INTO hs_codes (id, hs_code_description, category, subcategory)
VALUES 
  ('0101210010', 'HORSES AND ASSES, PUREBRED BREEDING', 'Live Animals', 'Horses, Asses, Mules and Hinnies'),
  ('0101210020', 'HORSES AND ASSES, PUREBRED BREEDING FEMALE', 'Live Animals', 'Horses, Asses, Mules and Hinnies'),
  ('0102210010', 'CATTLE, PUREBRED BREEDING', 'Live Animals', 'Bovine Animals'),
  ('0102290010', 'CATTLE, OTHER THAN PUREBRED BREEDING', 'Live Animals', 'Bovine Animals'),
  ('0103100010', 'SWINE, PUREBRED BREEDING', 'Live Animals', 'Swine'),
  ('0104100010', 'SHEEP, LIVE', 'Live Animals', 'Sheep and Goats'),
  ('0105110010', 'CHICKENS, BREEDING, WEIGHING NOT MORE THAN 185 G', 'Live Animals', 'Poultry'),
  ('0106110010', 'PRIMATES, LIVE', 'Live Animals', 'Other Live Animals'),
  ('0201100010', 'BOVINE CARCASSES AND HALF-CARCASSES, FRESH OR CHILLED', 'Meat and Edible Meat Offal', 'Bovine Meat'),
  ('0202100010', 'BOVINE CARCASSES AND HALF-CARCASSES, FROZEN', 'Meat and Edible Meat Offal', 'Bovine Meat')
ON CONFLICT (id) DO UPDATE 
SET 
  hs_code_description = EXCLUDED.hs_code_description,
  category = EXCLUDED.category,
  subcategory = EXCLUDED.subcategory;