/*
  # Add Trade Statistics Table and Sample Data

  1. New Tables
    - `trade_stats`
      - `id` (uuid, primary key)
      - `hs_code_id` (text, references hs_codes)
      - `country_name` (text)
      - `year_val` (integer)
      - `month_val` (integer)
      - `value` (numeric)
      - `volume` (numeric)
      - `trade_flow` (text)
      - `created_at` (timestamptz)
      - `description` (text)

  2. Indexes
    - Composite index for efficient time-series queries
    - Index on hs_code_id for fast lookups
    - Index on trade_flow for filtering

  3. Security
    - Enable RLS
    - Add policy for authenticated users to view trade stats
*/

-- Create trade_stats table
CREATE TABLE IF NOT EXISTS trade_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hs_code_id text REFERENCES hs_codes(id),
  country_name text,
  year_val integer CHECK (year_val >= 2000 AND year_val <= 2100),
  month_val integer CHECK (month_val >= 1 AND month_val <= 12),
  value numeric,
  volume numeric,
  trade_flow text CHECK (trade_flow IN ('Import', 'Export')),
  created_at timestamptz DEFAULT now(),
  description text
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS trade_stats_idx ON trade_stats(hs_code_id, country_name, year_val, month_val);
CREATE INDEX IF NOT EXISTS trade_stats_hs_code_id_idx ON trade_stats(hs_code_id);
CREATE INDEX IF NOT EXISTS trade_stats_trade_flow_idx ON trade_stats(trade_flow);

-- Enable RLS
ALTER TABLE trade_stats ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Trade stats via view only" ON trade_stats;

-- Create policy for viewing trade stats
CREATE POLICY "Trade stats via view only"
  ON trade_stats
  FOR SELECT
  TO public
  USING (false);

-- Insert sample data for testing
INSERT INTO trade_stats (hs_code_id, country_name, year_val, month_val, value, volume, trade_flow)
VALUES 
  ('1604141010', 'CHINA', 2024, 1, 1500000, 75000, 'Import'),
  ('1604141010', 'CHINA', 2024, 2, 1750000, 87500, 'Import'),
  ('1604141010', 'CHINA', 2024, 3, 1250000, 62500, 'Import'),
  ('1604141010', 'VIETNAM', 2024, 1, 800000, 40000, 'Import'),
  ('1604141010', 'VIETNAM', 2024, 2, 900000, 45000, 'Import'),
  ('1604141010', 'VIETNAM', 2024, 3, 750000, 37500, 'Import'),
  ('1604141010', 'THAILAND', 2024, 1, 500000, 25000, 'Export'),
  ('1604141010', 'THAILAND', 2024, 2, 600000, 30000, 'Export'),
  ('1604141010', 'THAILAND', 2024, 3, 450000, 22500, 'Export')
ON CONFLICT DO NOTHING;