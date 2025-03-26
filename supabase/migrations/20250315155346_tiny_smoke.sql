/*
  # Fix HTS Code Schema and Relationships

  1. Changes
    - Make subscription_id nullable in user_hs_codes table
    - Maintain existing indexes and policies
    - Keep all other constraints intact

  2. Security
    - Maintain RLS policies
    - Keep existing security measures
*/

-- Create extension for text search if not exists
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create HTS concordance table
CREATE TABLE IF NOT EXISTS hts_concordance (
  hts10 text PRIMARY KEY,
  description_short text NOT NULL
);

-- Create indexes for HTS concordance
CREATE INDEX IF NOT EXISTS idx_hts_concordance_hts10 ON hts_concordance(hts10);
CREATE INDEX IF NOT EXISTS idx_hts_concordance_description ON hts_concordance USING btree (description_short);

-- Create user_hs_codes table with nullable subscription_id
CREATE TABLE IF NOT EXISTS user_hs_codes (
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  hs_code_id text REFERENCES hts_concordance(hts10) ON DELETE CASCADE,
  subscription_id uuid REFERENCES subscriptions(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, hs_code_id)
);

-- Create indexes for user_hs_codes
CREATE INDEX IF NOT EXISTS idx_user_hs_codes_user_id ON user_hs_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_user_hs_codes_hs_code_id ON user_hs_codes(hs_code_id);

-- Enable RLS
ALTER TABLE user_hs_codes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Users can view own hs codes" ON user_hs_codes;
    DROP POLICY IF EXISTS "Users can insert own hs codes" ON user_hs_codes;
    DROP POLICY IF EXISTS "Users can delete own hs codes" ON user_hs_codes;
EXCEPTION 
    WHEN undefined_object THEN 
        NULL;
END $$;

-- Create RLS policies
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_hs_codes' 
        AND policyname = 'Users can view own hs codes'
    ) THEN
        CREATE POLICY "Users can view own hs codes"
            ON user_hs_codes
            FOR SELECT
            TO authenticated
            USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_hs_codes' 
        AND policyname = 'Users can insert own hs codes'
    ) THEN
        CREATE POLICY "Users can insert own hs codes"
            ON user_hs_codes
            FOR INSERT
            TO authenticated
            WITH CHECK (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_hs_codes' 
        AND policyname = 'Users can delete own hs codes'
    ) THEN
        CREATE POLICY "Users can delete own hs codes"
            ON user_hs_codes
            FOR DELETE
            TO authenticated
            USING (auth.uid() = user_id);
    END IF;
END $$;