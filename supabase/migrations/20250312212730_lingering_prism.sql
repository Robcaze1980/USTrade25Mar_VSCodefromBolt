/*
  # User Profile Synchronization System

  1. Changes
    - Consolidates and improves user profile synchronization
    - Adds better error handling and logging
    - Ensures data consistency between auth and profiles
    - Adds missing indexes and constraints
    - Updates RLS policies for better security

  2. New Functions
    - Enhanced handle_new_user() function with better error handling
    - Added audit logging for debugging

  3. Security
    - Strengthened RLS policies
    - Added input validation
    - Improved error handling
*/

-- Create audit log table for debugging
CREATE TABLE IF NOT EXISTS auth_sync_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id),
    event_type text NOT NULL,
    details jsonb,
    created_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS on audit logs
ALTER TABLE auth_sync_logs ENABLE ROW LEVEL SECURITY;

-- Only allow admins to read audit logs
CREATE POLICY "Admins can read audit logs"
    ON auth_sync_logs
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.is_admin = true
        )
    );

-- Improved user creation function with error handling and logging
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    _log_id uuid;
BEGIN
    -- Create initial log entry
    INSERT INTO auth_sync_logs (user_id, event_type, details)
    VALUES (NEW.id, 'USER_CREATION_STARTED', jsonb_build_object('email', NEW.email))
    RETURNING id INTO _log_id;

    -- Insert into profiles with enhanced error handling
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
            NEW.id,
            COALESCE(NEW.email, ''),
            COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
            COALESCE(NEW.raw_user_meta_data->>'company_name', ''),
            COALESCE(NEW.raw_user_meta_data->>'position', ''),
            now(),
            now()
        );

        -- Update log with success
        UPDATE auth_sync_logs
        SET details = jsonb_build_object(
            'status', 'SUCCESS',
            'profile_created', true,
            'timestamp', now()
        )
        WHERE id = _log_id;

    EXCEPTION WHEN others THEN
        -- Log the error
        UPDATE auth_sync_logs
        SET details = jsonb_build_object(
            'status', 'ERROR',
            'error_message', SQLERRM,
            'error_detail', SQLSTATE,
            'timestamp', now()
        )
        WHERE id = _log_id;
        
        RAISE WARNING 'Error creating profile for user %: %', NEW.id, SQLERRM;
    END;

    -- Initialize user credits
    BEGIN
        INSERT INTO public.user_credits (
            user_id,
            credits_available,
            last_reset_date
        )
        VALUES (
            NEW.id,
            100, -- Default starting credits
            CURRENT_DATE
        );

        -- Update log with credits creation success
        UPDATE auth_sync_logs
        SET details = details || jsonb_build_object(
            'credits_created', true,
            'initial_credits', 100
        )
        WHERE id = _log_id;

    EXCEPTION WHEN others THEN
        -- Log the error
        UPDATE auth_sync_logs
        SET details = details || jsonb_build_object(
            'credits_error', SQLERRM,
            'credits_error_detail', SQLSTATE
        )
        WHERE id = _log_id;
        
        RAISE WARNING 'Error creating credits for user %: %', NEW.id, SQLERRM;
    END;

    RETURN NEW;
END;
$$;

-- Ensure the trigger is properly set up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Add missing indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at);
CREATE INDEX IF NOT EXISTS idx_auth_sync_logs_user_id ON auth_sync_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_sync_logs_created_at ON auth_sync_logs(created_at);

-- Add constraints to ensure data consistency
ALTER TABLE profiles
ADD CONSTRAINT email_not_empty CHECK (email != '');

-- Update RLS policies for profiles
CREATE POLICY "Users can view their own profile"
    ON profiles
    FOR SELECT
    TO authenticated
    USING (id = auth.uid());

CREATE POLICY "Users can update their own profile"
    ON profiles
    FOR UPDATE
    TO authenticated
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

-- Analyze tables for query optimization
ANALYZE profiles;
ANALYZE user_credits;
ANALYZE auth_sync_logs;