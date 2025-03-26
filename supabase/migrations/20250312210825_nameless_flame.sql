/*
  # Database Optimization and Security Enhancement

  1. Performance Improvements
    - Add indexes for common queries
    - Add partial indexes for active subscriptions
  
  2. Security Enhancements
    - Add INSERT policies for profiles
    - Add input validation
    - Add check constraints
  
  3. Data Integrity
    - Add NOT NULL constraints
    - Add check constraints for numeric values
    - Add date validation
*/

-- Add missing indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_active_subscriptions ON subscriptions(user_id) WHERE status = 'active';

-- Add check constraints
ALTER TABLE user_credits ADD CONSTRAINT positive_credits CHECK (credits_available >= 0);
ALTER TABLE subscriptions ADD CONSTRAINT valid_status CHECK (status IN ('active', 'cancelled', 'expired', 'pending'));
ALTER TABLE subscriptions ADD CONSTRAINT valid_dates CHECK (end_date IS NULL OR end_date >= start_date);

-- Add NOT NULL constraints where appropriate
ALTER TABLE profiles ALTER COLUMN created_at SET NOT NULL;
ALTER TABLE profiles ALTER COLUMN updated_at SET NOT NULL;
ALTER TABLE subscriptions ALTER COLUMN created_at SET NOT NULL;

-- Add missing RLS policies
CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add composite index for date-based queries
CREATE INDEX IF NOT EXISTS idx_subscriptions_dates ON subscriptions(user_id, start_date, end_date);

-- Add function to validate subscription dates
CREATE OR REPLACE FUNCTION validate_subscription_dates()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.end_date IS NOT NULL AND NEW.end_date < NEW.start_date THEN
        RAISE EXCEPTION 'end_date cannot be earlier than start_date';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Note: Removed duplicate trigger creation since it already exists

-- Add statistics for query optimizer
ANALYZE profiles;
ANALYZE subscriptions;
ANALYZE user_credits;