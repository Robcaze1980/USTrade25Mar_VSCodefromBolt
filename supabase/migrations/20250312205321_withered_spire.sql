/*
  # Add Company Information Fields

  1. Changes
    - Add company_name and position columns to profiles table
    - Update handle_new_user function to include new fields
    
  2. Security
    - Maintain existing RLS policies
*/

-- Add new columns to profiles table
ALTER TABLE profiles 
ADD COLUMN company_name text,
ADD COLUMN position text;

-- Update handle_new_user function to include new fields
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
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
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'company_name',
    new.raw_user_meta_data->>'position',
    now(),
    now()
  );

  INSERT INTO public.user_credits (user_id, credits_available, last_reset_date)
  VALUES (
    new.id,
    100, -- Default starting credits
    now()
  );

  RETURN new;
END;
$$;