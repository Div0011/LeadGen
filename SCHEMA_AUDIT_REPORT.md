# Database Schema Audit Report
**Generated: 2026-04-14**

## 🚨 CRITICAL ISSUES FOUND

### 1. LEADS Table - Missing 15 Columns
**Status**: WILL CAUSE ERRORS in production

**Columns Missing from Migration but defined in Model**:
- `phone` (String 50)
- `email_valid` (Boolean)
- `email_validated_at` (DateTime)
- `email_validation_source` (String 50)
- `email_validation_status` (String 50)
- `brochure_sent` (String 10)
- `date_brochure_sent` (DateTime)
- `email_opened` (Boolean)
- `email_opened_at` (DateTime)
- `brochure_clicked` (Boolean)
- `brochure_clicked_at` (DateTime)
- `follow_up_sent` (Boolean)
- `follow_up_count` (Integer)
- `follow_up_scheduled_at` (DateTime)
- `last_follow_up_sent_at` (DateTime)

**Impact**: APIs trying to access these fields will fail with `UndefinedColumnError`

**Affected Files**:
- `backend/app/api/leads.py` (line 67: `email_opened`)
- `backend/app/models/lead.py` (defines all these columns)

---

### 2. USER_LEADS Table - MISSING ENTIRELY
**Status**: WILL CAUSE ERRORS when creating/querying leads

**Table Definition Missing**:
- Table `user_leads` defined in `backend/app/models/user.py` 
- BUT **NOT** in any migration file
- Used extensively in `backend/app/api/leads.py`

**Columns that should exist**:
```python
id, user_id, campaign_id, business_name, website, email, phone
contact_name, industry, location, is_redesign_needed, email_valid
source, status, delivered, delivered_at, email_opened
email_opened_at, created_at
```

**Impact**: 
- Initial insert: `sqlalchemy.dialects.postgresql.asyncpg.ProgrammingError: relation "user_leads" does not exist`
- All lead endpoints will fail (GET /api/leads, POST /api/leads, etc.)

---

### 3. CAMPAIGN_RUNS Table - MISSING ENTIRELY
**Status**: WILL CAUSE ERRORS when CampaignRun model is queried

**Table Definition Missing**:
- Table `campaign_runs` defined in `backend/app/models/user.py`
- BUT **NOT** in any migration file

**Columns that should exist**:
```python
id, user_id, agency_type, location, leads_found
leads_validated, leads_delivered, status, created_at, completed_at
```

**Impact**: 
- Any query on CampaignRun: `relation "campaign_runs" does not exist`

---

### 4. ID Column Type Inconsistency
**Status**: Medium - May not cause immediate errors but is problematic

**Issue**: 
- User model uses: `String(36)` 
- Lead model uses: `String(36)` (but migration uses UUID with PostgreSQL UUID type)
- Campaign uses: UUID
- EmailTemplate uses: UUID

**Impact**: 
- Type mismatches when joining tables
- Potential serialization issues

---

### 5. Missing Indexes
**Status**: Performance issue

**Recommended Indexes Missing**:
- `user_leads(user_id)` - Already defined in model but might not be in DB
- `user_leads(campaign_id)` - Already defined in model but might not be in DB
- `leads(email)` - Need for uniqueness checks
- `leads(status)` - Need for status queries
- `leads(created_at)` - Need for sorting

---

## 📋 SUMMARY BY MODEL

| Model | Migration |Status | Missing |
|-------|-----------|-------|---------|
| User | 001 ✅ | Complete | N/A |
| Campaign | 001 ✅ | Complete | N/A |
| EmailTemplate | 001 ✅ | Complete | N/A |
| Lead | 001 ⚠️ | **INCOMPLETE** | 15 columns |
| UserLead | ❌ Missing | **MISSING** | Entire table |
| CampaignRun | ❌ Missing | **MISSING** | Entire table |
| Task | 001 ✅ | Complete | N/A |

---

## 🔧 REQUIRED FIXES

**New Migration Needed** (`003_add_missing_tables_and_columns.py`):
1. Add 15 missing columns to `leads` table
2. Create `user_leads` table with all 18 columns
3. Create `campaign_runs` table with all 10 columns
4. Add missing indexes for performance

**Expected Outcome**: All API endpoints will work without schema errors.

---

## 🚀 VERIFICATION STEPS

After applying fixes, run these to verify:

```bash
# SSH into Railway
railway shell

# Check leads table columns
psql $DATABASE_URL -c "\d leads"

# Check user_leads table exists
psql $DATABASE_URL -c "\d user_leads"

# Check campaign_runs table exists
psql $DATABASE_URL -c "\d campaign_runs"

# Check for missing columns
psql $DATABASE_URL -c "SELECT column_name FROM information_schema.columns WHERE table_name='leads' ORDER BY column_name;"
```

---

## 📝 NOTES

- This audit scanned all Python models and found definitions that don't exist in migrations
- The same error type as `settings_verified` will occur if these aren't fixed
- Missing tables are more severe than missing columns
- Recommend running this audit monthly as part of CI/CD
