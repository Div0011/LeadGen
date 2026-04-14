# URGENT: Execute Database Migrations on Railway

## Current Status
- ✅ Code deployed to Railway
- ❌ **Database migrations NOT executed** ← This is why errors occur
- The application is trying to use columns that don't exist in the database yet

## Error Explanation
```
UndefinedColumnError: column users.brochure_data does not exist
```
The User model includes `brochure_data`, but it hasn't been created in the database because migrations haven't run.

## Solution: Run Migrations on Railway

### Step 1: Open Railway Dashboard Shell
1. Go to https://dashboard.railway.app
2. Select your LeadGen project
3. Click the **Backend** service
4. Go to the **Logs** tab → **Shell** button (top right)
5. You should see a bash terminal

### Step 2: Execute Migrations
Run this command in the Railway shell:
```bash
cd /app && alembic upgrade head
```

Expected output:
```
INFO  [alembic.runtime.migration] Context impl PostgresqlImpl with PostgreSQL 16.x
INFO  [alembic.runtime.migration] Will assume transactional DDL is supported
INFO  [alembic.runtime.migration] Running upgrade  -> 001, initial migration
INFO  [alembic.runtime.migration] Running upgrade 001 -> 002, add_settings_verified
INFO  [alembic.runtime.migration] Running upgrade 002 -> 003, add_missing_tables_and_columns
INFO  [alembic.runtime.migration] Done.
```

### Step 3: Verify Migrations Completed
```bash
cd /app && alembic current
```
Should output: `001` (or the latest revision number)

### Step 4: Test the API
Once migrations complete, try registering again at:
```
POST https://your-railway-url/api/auth/register
{
  "email": "test@example.com",
  "password": "Test123!",
  "company_name": "Test Company"
}
```

## If Migrations Fail
Run this to check migration history:
```bash
cd /app && alembic history
```

Run this to see current schema:
```bash
cd /app && alembic current
```

## Why This Matters
- The 001_initial.py migration **already includes** brochure_data
- The migrations file was already pushed to GitHub
- But PostgreSQL doesn't execute migrations automatically
- Alembic must be run explicitly to apply schema changes to the database

**DO THIS NOW** - The app won't work until migrations are executed on the database!
