/*
  # Create HS Codes Table and Initial Data

  1. New Tables
    - `hs_codes`
      - `id` (text, primary key)
      - `hs_code_description` (text)

  2. Security
    - Update foreign key constraints
    - Create indexes for performance
    
  3. Data
    - Insert initial HS codes data
*/

-- Create extension for text search if not exists
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create new hs_codes table
CREATE TABLE IF NOT EXISTS hs_codes (
  id text PRIMARY KEY,
  hs_code_description text NOT NULL
);

-- Update user_hs_codes foreign key constraint
DO $$ 
BEGIN
    -- Drop existing foreign key if it exists
    ALTER TABLE user_hs_codes
    DROP CONSTRAINT IF EXISTS user_hs_codes_hs_code_id_fkey;

    -- Add new foreign key constraint
    ALTER TABLE user_hs_codes
    ADD CONSTRAINT user_hs_codes_hs_code_id_fkey
    FOREIGN KEY (hs_code_id)
    REFERENCES hs_codes(id)
    ON DELETE CASCADE;
EXCEPTION 
    WHEN undefined_object THEN 
        NULL;
END $$;

-- Create new indexes
CREATE INDEX IF NOT EXISTS idx_hs_codes_id 
ON hs_codes(id);

CREATE INDEX IF NOT EXISTS idx_hs_codes_description 
ON hs_codes USING gin (hs_code_description gin_trgm_ops);

-- Insert sample HS codes if table is empty
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM hs_codes LIMIT 1) THEN
        INSERT INTO hs_codes (id, hs_code_description)
        VALUES 
        ('0101210010', 'Purebred breeding horses'),
        ('0101290010', 'Live horses other than purebred breeding'),
        ('0102210010', 'Purebred breeding cattle'),
        ('0102290010', 'Live bovine animals other than purebred breeding'),
        ('0103100010', 'Live swine, purebred breeding animals'),
        ('0104100010', 'Live sheep'),
        ('0105110010', 'Live chickens weighing not more than 185 g'),
        ('0106110010', 'Live primates'),
        ('0201100010', 'Carcasses and half-carcasses of bovine animals, fresh or chilled'),
        ('0202100010', 'Carcasses and half-carcasses of bovine animals, frozen')
        ON CONFLICT (id) DO NOTHING;
    END IF;
EXCEPTION WHEN others THEN
    RAISE NOTICE 'Error inserting HS codes: %', SQLERRM;
END $$;