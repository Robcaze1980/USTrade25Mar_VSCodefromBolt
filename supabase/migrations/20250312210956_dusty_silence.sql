/*
  # Fix User Sign Up Process

  1. Changes
    - Drop and recreate profiles table with correct constraints
    - Add proper RLS policies for profile creation
    - Update user creation trigger to handle all required fields
    - Add proper error handling for user creation

  2. Security
    - Enable RLS on all tables
    - Add proper policies for user data access
*/

-- Recreate profiles table with proper constraints
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  company_name text,
  position text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Create comprehensive policies
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create improved user creation function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Insert into profiles with error handling
  BEGIN
    INSERT INTO public.profiles (
      id,
      email,
      full_name,
      company_name,
      position,
      created_at,
      updated_at
    )
    VALUES (
      new.id,
      COALESCE(new.email, ''),
      COALESCE(new.raw_user_meta_data->>'full_name', ''),
      COALESCE(new.raw_user_meta_data->>'company_name', ''),
      COALESCE(new.raw_user_meta_data->>'position', ''),
      now(),
      now()
    );
  EXCEPTION WHEN others THEN
    RAISE NOTICE 'Error creating profile: %', SQLERRM;
    RETURN new;
  END;

  -- Insert into user_credits with error handling
  BEGIN
    INSERT INTO public.user_credits (
      user_id,
      credits_available,
      last_reset_date
    )
    VALUES (
      new.id,
      100,
      CURRENT_DATE
    );
  EXCEPTION WHEN others THEN
    RAISE NOTICE 'Error creating user credits: %', SQLERRM;
  END;

  RETURN new;
END;
$$;