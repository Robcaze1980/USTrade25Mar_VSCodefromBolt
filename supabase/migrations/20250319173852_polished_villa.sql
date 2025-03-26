/*
  # Add Trade Type to User HS Codes

  1. Changes
    - Add trade_type column to user_hs_codes table
    - Add check constraint for valid trade types
    - Set default value to 'Import'
    
  2. Security
    - Maintain existing RLS policies
*/

-- Add trade_type column to user_hs_codes
ALTER TABLE user_hs_codes
ADD COLUMN trade_type text NOT NULL DEFAULT 'Import'
CHECK (trade_type IN ('Import', 'Export'));

-- Create index for trade_type queries
CREATE INDEX idx_user_hs_codes_trade_type ON user_hs_codes(trade_type);