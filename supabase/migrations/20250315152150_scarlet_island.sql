/*
  # HTS Concordance and User Codes Setup

  1. New Tables
    - `hts_concordance`
      - `hts10` (text, primary key)
      - `description_short` (text)
    
    - `user_hs_codes`
      - `user_id` (uuid, references auth.users)
      - `hs_code_id` (text, references hts_concordance)
      - `subscription_id` (uuid, references subscriptions)

  2. Security
    - Enable RLS on user_hs_codes
    - Add policies for authenticated users
    
  3. Changes
    - Ensure proper foreign key relationships
    - Add performance indexes
*/

-- Enable required extensions first
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create hts_concordance table with proper constraints
CREATE TABLE IF NOT EXISTS hts_concordance (
  hts10 text NOT NULL,
  description_short text NOT NULL,
  CONSTRAINT hts_concordance_pkey PRIMARY KEY (hts10)
);

-- Create btree index for hts10 lookups
CREATE INDEX IF NOT EXISTS idx_hts_concordance_hts10 
ON hts_concordance(hts10);

-- Create GiST index for text search (more suitable for this case than GIN)
CREATE INDEX IF NOT EXISTS idx_hts_concordance_description 
ON hts_concordance USING gist (description_short gist_trgm_ops);

-- Recreate user_hs_codes table with proper relationships
DO $$ 
BEGIN
  -- Drop the table if it exists
  DROP TABLE IF EXISTS user_hs_codes CASCADE;
  
  -- Create the table with proper constraints
  CREATE TABLE user_hs_codes (
    user_id uuid NOT NULL,
    hs_code_id text NOT NULL,
    subscription_id uuid,
    created_at timestamptz DEFAULT now(),
    CONSTRAINT user_hs_codes_pkey PRIMARY KEY (user_id, hs_code_id),
    CONSTRAINT user_hs_codes_user_id_fkey FOREIGN KEY (user_id) 
      REFERENCES auth.users(id) ON DELETE CASCADE,
    CONSTRAINT user_hs_codes_hs_code_id_fkey FOREIGN KEY (hs_code_id) 
      REFERENCES hts_concordance(hts10) ON DELETE CASCADE,
    CONSTRAINT user_hs_codes_subscription_id_fkey FOREIGN KEY (subscription_id) 
      REFERENCES subscriptions(id) ON DELETE CASCADE
  );

  -- Enable RLS
  ALTER TABLE user_hs_codes ENABLE ROW LEVEL SECURITY;

EXCEPTION
  WHEN others THEN
    RAISE NOTICE 'Error creating tables: %', SQLERRM;
END $$;

-- Create policies for user_hs_codes
DO $$ 
BEGIN
  -- Drop existing policies if they exist
  DROP POLICY IF EXISTS "Users can view own hs codes" ON user_hs_codes;
  DROP POLICY IF EXISTS "Users can insert own hs codes" ON user_hs_codes;
  DROP POLICY IF EXISTS "Users can delete own hs codes" ON user_hs_codes;

  -- Create new policies
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

EXCEPTION
  WHEN others THEN
    RAISE NOTICE 'Error creating policies: %', SQLERRM;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_hs_codes_user_id 
ON user_hs_codes(user_id);

CREATE INDEX IF NOT EXISTS idx_user_hs_codes_hs_code_id 
ON user_hs_codes(hs_code_id);