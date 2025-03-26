/*
  # Add Initial HTS Concordance Data

  1. Changes
    - Add sample HTS codes to hts_concordance table
    - Ensure data consistency with proper error handling
*/

-- First ensure the table exists with proper structure
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'hts_concordance'
    ) THEN
        CREATE TABLE hts_concordance (
            hts10 text PRIMARY KEY,
            description_short text NOT NULL
        );
    END IF;
END $$;

-- Insert initial HTS codes with proper error handling
DO $$
BEGIN
    -- Insert each code individually to handle errors gracefully
    INSERT INTO hts_concordance (hts10, description_short)
    VALUES ('0101210010', 'Purebred breeding horses')
    ON CONFLICT (hts10) DO NOTHING;

    INSERT INTO hts_concordance (hts10, description_short)
    VALUES ('0101290010', 'Live horses other than purebred breeding')
    ON CONFLICT (hts10) DO NOTHING;

    INSERT INTO hts_concordance (hts10, description_short)
    VALUES ('0102210010', 'Purebred breeding cattle')
    ON CONFLICT (hts10) DO NOTHING;

    INSERT INTO hts_concordance (hts10, description_short)
    VALUES ('0102290010', 'Live bovine animals other than purebred breeding')
    ON CONFLICT (hts10) DO NOTHING;

    INSERT INTO hts_concordance (hts10, description_short)
    VALUES ('0103100010', 'Live swine, purebred breeding animals')
    ON CONFLICT (hts10) DO NOTHING;

    INSERT INTO hts_concordance (hts10, description_short)
    VALUES ('0104100010', 'Live sheep')
    ON CONFLICT (hts10) DO NOTHING;

    INSERT INTO hts_concordance (hts10, description_short)
    VALUES ('0105110010', 'Live chickens weighing not more than 185 g')
    ON CONFLICT (hts10) DO NOTHING;

    INSERT INTO hts_concordance (hts10, description_short)
    VALUES ('0106110010', 'Live primates')
    ON CONFLICT (hts10) DO NOTHING;

    INSERT INTO hts_concordance (hts10, description_short)
    VALUES ('0201100010', 'Carcasses and half-carcasses of bovine animals, fresh or chilled')
    ON CONFLICT (hts10) DO NOTHING;

    INSERT INTO hts_concordance (hts10, description_short)
    VALUES ('0202100010', 'Carcasses and half-carcasses of bovine animals, frozen')
    ON CONFLICT (hts10) DO NOTHING;

EXCEPTION WHEN others THEN
    RAISE NOTICE 'Error inserting HTS codes: %', SQLERRM;
END $$;