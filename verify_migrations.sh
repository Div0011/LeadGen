#!/bin/bash
# Database Migration Verification Script
# Run this AFTER alembic upgrade head completes

echo "🔍 Verifying Database Schema..."
echo ""

# These commands verify the migrations ran successfully
psql $DATABASE_URL << EOF

-- 1. Check users table has settings_verified columns
echo "✓ Checking users table..."
SELECT COUNT(*) as column_count FROM information_schema.columns 
WHERE table_name='users' AND column_name IN ('settings_verified', 'settings_verified_at');

-- 2. Check leads table has all new columns
echo "✓ Checking leads table has 15+ new columns..."
SELECT COUNT(*) as column_count FROM information_schema.columns 
WHERE table_name='leads' AND column_name IN (
  'phone', 'email_valid', 'email_validated_at', 'email_validation_source',
  'email_validation_status', 'brochure_sent', 'date_brochure_sent',
  'email_opened', 'email_opened_at', 'brochure_clicked', 'brochure_clicked_at',
  'follow_up_sent', 'follow_up_count', 'follow_up_scheduled_at', 'last_follow_up_sent_at'
);

-- 3. Verify user_leads table exists
echo "✓ Checking user_leads table exists..."
SELECT 1 FROM information_schema.tables WHERE table_name='user_leads';

-- 4. Verify campaign_runs table exists
echo "✓ Checking campaign_runs table exists..."
SELECT 1 FROM information_schema.tables WHERE table_name='campaign_runs';

-- 5. Check migration history
echo "✓ Migration history:"
SELECT version, description, installed_on FROM alembic_version 
ORDER BY installed_on DESC LIMIT 5;

EOF

echo ""
echo "✅ If you see 2, 15, 1, 1 above, all migrations were successful!"
