# 🚀 Deployment Checklist - April 14, 2026

## Phase 1: Code Pushed ✅
- [x] Committed all changes to git
- [x] Pushed to main branch
- [x] GitHub shows latest commits

**Files Updated:**
- ✅ `backend/alembic/versions/001_initial.py` - Complete users table
- ✅ `backend/alembic/versions/002_add_settings_verified.py` - Safe column additions
- ✅ `backend/alembic/versions/003_add_missing_tables_and_columns.py` - NEW migration
- ✅ `backend/app/models/user.py` - Uncommented settings_verified columns
- ✅ `SCHEMA_AUDIT_REPORT.md` - Complete audit findings

---

## Phase 2: Railway Deployment (In Progress)
**Expected Time: 2-3 minutes**

### Monitor Progress:
1. Go to: https://dashboard.railway.app/project/YOUR_PRJ_ID
2. Select: **lead-gen** service
3. Click: **Deployments** tab
4. Look for: 
   - 🟡 "In Progress" → 🟢 "Success"
   - Logs show: "Application startup complete"

### Current Status:
- [ ] Deployment started
- [ ] Code pulled from GitHub
- [ ] Docker image built
- [ ] Container started
- [ ] Application ready

---

## Phase 3: Run Database Migrations ⚙️
**This is the CRITICAL step**

### Steps:
1. Go to Railway Dashboard
2. Click **lead-gen** service
3. Click **Shell** tab  
4. Paste this command:
```bash
cd /app && alembic upgrade head
```

### Expected Output:
```
INFO  [alembic.runtime.migration] Starting upgrade 002 -> 003...
INFO  [alembic.runtime.migration] Running upgrade 002 -> 003, add missing tables...
INFO  [alembic.runtime.migration] Running upgrade 003 -> ...
INFO  [alembic.runtime.migration] Done.
```

### After Migration:
```bash
# Verify (optional):
psql $DATABASE_URL -c "\dt"  # List all tables
```

### Status:
- [ ] SSH into Railway
- [ ] Ran alembic upgrade head
- [ ] Saw success message
- [ ] Verified tables created

---

## Phase 4: Verify Everything Works ✅

### Test These Endpoints:
```bash
# Get your API URL (e.g., https://lead-gen-production-xxxx.railway.app)

# 1. Health check
curl https://YOUR_API_URL/docs

# 2. Register (should create user + tables)
curl -X POST https://YOUR_API_URL/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPass123!","name":"Test User"}'

# 3. Get leads (uses user_leads table)
curl -H "Authorization: Bearer YOUR_API_KEY" \
  https://YOUR_API_URL/api/leads

# 4. Get settings
curl -H "Authorization: Bearer YOUR_API_KEY" \
  https://YOUR_API_URL/api/settings
```

### Status Checks:
- [ ] No 500 errors in logs
- [ ] No "column does not exist" errors
- [ ] Register works
- [ ] Lead endpoints work
- [ ] Settings endpoints work

---

## Phase 5: Final Verification

Run in Railway shell:
```bash
# Check users table has settings_verified columns
psql $DATABASE_URL -c "SELECT * FROM users LIMIT 1;"

# Check user_leads table exists
psql $DATABASE_URL -c "\d user_leads"

# Check campaign_runs table exists
psql $DATABASE_URL -c "\d campaign_runs"

# Check leads table has email_opened column
psql $DATABASE_URL -c "\d leads" | grep -E "email_opened|follow_up_sent|phone"
```

### Status:
- [ ] Users table complete
- [ ] user_leads table exists
- [ ] campaign_runs table exists
- [ ] Leads table has all new columns

---

## 🎯 Success Criteria

All API endpoints working without schema errors:
- ✅ POST /api/auth/register
- ✅ POST /api/auth/login
- ✅ GET /api/settings
- ✅ PUT /api/settings
- ✅ GET /api/leads
- ✅ POST /api/leads
- ✅ GET /api/campaigns
- ✅ GET /api/analytics/dashboard

---

## 🆘 Troubleshooting

### Error: "relation 'user_leads' does not exist"
**Solution**: Migrations didn't run. SSH into Railway and run:
```bash
cd /app && alembic upgrade head
```

### Error: "column 'email_opened' does not exist"
**Solution**: Migration 003 didn't apply. Check:
```bash
psql $DATABASE_URL -c "SELECT version FROM alembic_version ORDER BY installed_on DESC LIMIT 1;"
# Should show: 003
```

### Error: "Application not responding"
**Solution**: Wait 5 minutes for full deployment, or redeploy from Railway dashboard.

---

## 📞 Quick Reference

**Railway Project**: https://dashboard.railway.app
**GitHub Repo**: https://github.com/Div0011/LeadGen
**Frontend URL**: https://lead-gen-iota-flame.vercel.app
**API Docs**: https://YOUR_API_URL/docs (after deployment)

---

**Last Updated**: 2026-04-14 13:30 UTC
**Migration Version**: 003 (add_missing_tables_and_columns)
