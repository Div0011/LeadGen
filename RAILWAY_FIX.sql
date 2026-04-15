-- Fix missing columns in Railway PostgreSQL database
-- Run this via Railway's database console or CLI

-- 1. Add missing columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS settings_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS settings_verified_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS brochure_data BYTEA;
ALTER TABLE users ADD COLUMN IF NOT EXISTS company_intro_for_email VARCHAR(1000);

-- Mailjet API columns
ALTER TABLE users ADD COLUMN IF NOT EXISTS mailjet_api_key VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS mailjet_api_secret VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS mailjet_enabled BOOLEAN DEFAULT FALSE;

-- 2. Add missing columns to user_leads table
ALTER TABLE user_leads ADD COLUMN IF NOT EXISTS campaign_id VARCHAR(36);
ALTER TABLE user_leads ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE user_leads ADD COLUMN IF NOT EXISTS website_status VARCHAR(20);
ALTER TABLE user_leads ADD COLUMN IF NOT EXISTS evidence TEXT;
ALTER TABLE user_leads ADD COLUMN IF NOT EXISTS recommended_service_type VARCHAR(50);
ALTER TABLE user_leads ADD COLUMN IF NOT EXISTS lead_priority_score INTEGER;
ALTER TABLE user_leads ADD COLUMN IF NOT EXISTS primary_contact_method VARCHAR(20);
ALTER TABLE user_leads ADD COLUMN IF NOT EXISTS outreach_angle TEXT;
ALTER TABLE user_leads ADD COLUMN IF NOT EXISTS google_maps_url VARCHAR(500);
ALTER TABLE user_leads ADD COLUMN IF NOT EXISTS delivered BOOLEAN DEFAULT FALSE;
ALTER TABLE user_leads ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMP;
ALTER TABLE user_leads ADD COLUMN IF NOT EXISTS email_opened BOOLEAN DEFAULT FALSE;
ALTER TABLE user_leads ADD COLUMN IF NOT EXISTS email_opened_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE user_leads ADD COLUMN IF NOT EXISTS follow_up_sent BOOLEAN DEFAULT FALSE;
ALTER TABLE user_leads ADD COLUMN IF NOT EXISTS follow_up_sent_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE user_leads ADD COLUMN IF NOT EXISTS reply_received BOOLEAN DEFAULT FALSE;
ALTER TABLE user_leads ADD COLUMN IF NOT EXISTS reply_received_at TIMESTAMP WITH TIME ZONE;

-- 3. Ensure campaign_runs.id is VARCHAR(36), not UUID
-- Check current type and fix if needed
ALTER TABLE campaign_runs ALTER COLUMN id TYPE VARCHAR(36);

-- 4. Ensure user_leads.business_name can handle long content (was VARCHAR(255) but needed TEXT)
ALTER TABLE user_leads ALTER COLUMN business_name TYPE TEXT;

-- Verify columns were added
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'users' ORDER BY ordinal_position;

SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'user_leads' ORDER BY ordinal_position;

SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'campaign_runs' ORDER BY ordinal_position;