# LeadGenius - Complete Project Explanation

## 📌 Project Overview

**LeadGenius** is a production-grade, fully automated lead generation and email outreach platform designed for agencies and businesses. It operates 24/7 to discover potential clients, validate their contact information, send personalized outreach emails, monitor replies, and provide comprehensive analytics.

### Core Purpose
The platform automates the entire lead generation workflow:
1. **Discovers** potential clients based on industry and location
2. **Validates** email addresses to ensure deliverability
3. **Sends** personalized outreach emails automatically
4. **Monitors** replies and tracks engagement
5. **Reports** daily analytics and campaign performance

---

## 🏗️ System Architecture

### Technology Stack

#### Backend
- **Framework**: FastAPI (Python 3.11+) - Modern async web framework
- **Database**: PostgreSQL 16 - Primary data storage
- **ORM**: SQLAlchemy (async) - Database abstraction layer
- **Task Queue**: Celery - Background job processing
- **Message Broker**: Redis - Task queue and caching
- **Scheduler**: Celery Beat - Automated task scheduling
- **Email**: SMTP/IMAP (Gmail) - Email sending and monitoring

#### Frontend
- **Framework**: Next.js 16.2.2 (React 19.2.4)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4.0
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **HTTP Client**: Axios

#### Infrastructure
- **Containerization**: Docker & Docker Compose
- **Services**: 6 containerized services (Backend, Frontend, Database, Redis, Celery Worker, Celery Beat)
- **Deployment**: Production-ready with health checks

### Service Architecture

```
┌─────────────────────────────────────────────────┐
│           USER BROWSER (Port 3000)              │
│              Next.js Frontend                    │
└────────────────────┬────────────────────────────┘
                     │ HTTP REST API
┌────────────────────┴────────────────────────────┐
│         FastAPI Backend (Port 8000)             │
│    - API Endpoints                              │
│    - Business Logic                             │
│    - Authentication                             │
└────────┬───────────────────────┬────────────────┘
         │                       │
    ┌────▼────┐            ┌────▼────────┐
    │PostgreSQL│            │   Redis     │
    │Database │            │Message Broker│
    │(Port    │            │(Port 6379)  │
    │ 5432)   │            └────┬────────┘
    └─────────┘                 │
                    ┌───────────┴──────────┐
              ┌─────▼──────┐      ┌───────▼──────┐
              │   Celery   │      │ Celery Beat  │
              │   Worker   │      │  (Scheduler) │
              │(Background)│      │(Automation)  │
              └────────────┘      └──────────────┘
```

---

## 📊 Database Models & Data Structure

### 1. User Model
Stores user account information and configuration.

**Key Fields**:
- `id`: Unique identifier (UUID)
- `email`: User login email (unique)
- `password_hash`: Encrypted password
- `company_name`: User's company name
- `agency_type`: Type of agency (web_dev, consulting, saas, etc.)
- `services`: Comma-separated services offered
- `target_location`: Geographic focus area
- `smtp_host/port/username/password`: Email sending configuration
- `brochure_path`: Path to PDF brochure for attachments
- `max_leads_per_day`: Daily lead generation limit
- `api_key`: API authentication key
- `lead_quota`: Total leads allowed
- `leads_used`: Leads consumed

**Security Features**:
- Password hashing using PBKDF2-HMAC-SHA256 with salt
- API key generation using secure random tokens
- Quota management to prevent abuse

### 2. Lead Model
Stores discovered prospects and their status.

**Key Fields**:
- `id`: Unique identifier
- `business_name`: Company name
- `website`: Company website URL
- `contact_person`: Contact name (if found)
- `email`: Validated email address (unique)
- `status`: Current stage (scraped, validated, sent, replied, bounced)
- `date_sent`: When outreach email was sent
- `date_replied`: When prospect replied
- `reply_content`: Content of the reply
- `brochure_sent`: Whether brochure was attached
- `source`: Where lead was discovered (duckduckgo, manual, etc.)

**Status Flow**:
```
scraped → validated → sent → replied/bounced
```

### 3. Campaign Model
Tracks email campaigns and their performance.

**Key Fields**:
- `id`: Unique identifier
- `name`: Campaign name
- `target_industry`: Industry to target
- `target_location`: Geographic location
- `status`: Campaign state (draft, running, completed)
- `leads_count`: Total leads in campaign
- `emails_sent`: Number of emails sent
- `replies`: Number of replies received
- `created_at`: Campaign creation date

### 4. EmailTemplate Model
Stores reusable email templates.

**Key Fields**:
- `id`: Unique identifier
- `user_id`: Owner of the template
- `name`: Template name
- `subject`: Email subject line (supports placeholders)
- `body`: Email body (supports placeholders like {company_name}, {contact_person})
- `include_brochure`: Whether to attach PDF brochure
- `status`: active or archived

### 5. Task Model
Tracks background task execution.

**Key Fields**:
- `id`: Unique identifier
- `campaign_id`: Associated campaign
- `task_type`: Type of task (collect, validate, send_email, monitor_replies)
- `status`: Task state (pending, running, completed, failed)
- `progress`: Completion percentage (0-100)
- `celery_task_id`: Celery task identifier
- `error_message`: Error details if failed

---

## 🔄 Core Services & Business Logic

### 1. Agency Discovery Service (`agency_discovery.py`)

**Purpose**: Discovers potential client businesses using web search.

**How It Works**:
1. Constructs search queries based on agency type and location
   - Example: "web development agencies in California"
2. Performs DuckDuckGo searches to find business websites
3. Scrapes each website to extract:
   - Business name
   - Email addresses (using regex patterns)
   - Phone numbers
   - Contact person names
   - Industry classification
4. Filters out invalid results:
   - Blocks generic emails (noreply@, admin@, etc.)
   - Skips job boards and competitor sites
   - Validates website structure
5. Returns structured lead data

**Key Methods**:
- `search_businesses()`: Main entry point for lead discovery
- `_search_google()`: Performs web search
- `_extract_business_info()`: Scrapes website for contact info
- `_extract_emails()`: Finds email addresses using regex
- `_is_blocked_email()`: Filters out unwanted email patterns

### 2. Email Validator Service (`email_validator.py`)

**Purpose**: Validates email addresses before sending.

**Validation Steps**:
1. **Format Validation**: Checks RFC 5322 compliance
2. **Domain Validation**: Verifies domain exists and has MX records
3. **SMTP Validation** (optional): Tests if mailbox accepts mail
4. **External API Validation** (optional): Uses Hunter.io or ZeroBounce APIs

**Returns**:
```python
{
    "is_valid": True/False,
    "email": "contact@example.com",
    "reason": "Valid email" or error message
}
```

### 3. Email Outreach Service (`outreach.py`)

**Purpose**: Sends personalized outreach emails.

**Features**:
- Template personalization with placeholders
- HTML and plain text email support
- PDF attachment support (brochures)
- SMTP authentication with TLS
- Error handling and retry logic

**Key Methods**:
- `personalize_template()`: Replaces placeholders like {company_name}
- `send_email()`: Sends email via SMTP
- `send_campaign_email()`: Combines personalization and sending

**Email Flow**:
```
Template → Personalize → Attach PDF → Send via SMTP → Log Result
```

### 4. Response Monitor Service (`response_monitor.py`)

**Purpose**: Monitors inbox for replies from prospects.

**How It Works**:
1. Connects to Gmail via IMAP (SSL)
2. Searches for unread emails
3. Extracts sender email address
4. Matches sender against sent leads database
5. Parses email body and subject
6. Updates lead status to "replied"
7. Stores reply content for analysis

**Runs**: Every 2 hours via Celery Beat scheduler

### 5. Pipeline Orchestrator Service (`pipeline.py`)

**Purpose**: Coordinates the entire lead generation workflow.

**Full Pipeline Stages**:

1. **Collection Stage** (Progress: 10%)
   - Calls `LeadCollector` to discover businesses
   - Updates progress tracking

2. **Validation Stage** (Progress: 40%)
   - Validates each email address
   - Filters out invalid emails
   - Updates progress for each lead

3. **Saving Stage** (Progress: 60%)
   - Checks for duplicate leads
   - Saves new leads to database
   - Updates campaign statistics

4. **Sending Stage** (Progress: 75%)
   - Retrieves email template
   - Personalizes emails for each lead
   - Sends via SMTP
   - Updates lead status to "sent"

5. **Completion** (Progress: 100%)
   - Returns final statistics
   - Logs completion

**Progress Tracking**:
```python
{
    "stage": "validating",
    "progress": 40.0,
    "leads_collected": 50,
    "leads_validated": 42,
    "emails_sent": 0,
    "errors": [],
    "is_running": True
}
```

---

## ⚙️ Background Task Automation (Celery)

### Celery Configuration

**Broker**: Redis (stores task queue)
**Backend**: Redis (stores task results)
**Workers**: Process tasks asynchronously
**Beat**: Schedules recurring tasks

### Task Definitions (`pipeline_tasks.py`)

#### 1. `run_collection_task`
- **Purpose**: Discover leads for a specific industry/location
- **Trigger**: Manual or scheduled
- **Returns**: List of discovered leads

#### 2. `run_validation_task`
- **Purpose**: Validate email addresses
- **Input**: List of leads
- **Returns**: Filtered list of valid leads

#### 3. `run_outreach_task`
- **Purpose**: Send emails to leads
- **Input**: Leads + email template
- **Returns**: Count of sent/failed emails

#### 4. `run_full_pipeline_task`
- **Purpose**: Execute complete workflow (collect → validate → send)
- **Updates**: Task state with progress
- **Returns**: Complete statistics

#### 5. `run_monitor_task`
- **Purpose**: Check inbox for replies
- **Trigger**: Every 2 hours (Celery Beat)
- **Returns**: List of new replies

#### 6. `send_daily_report`
- **Purpose**: Generate and email daily analytics
- **Trigger**: Every 24 hours at 9 AM UTC
- **Content**:
  - Total leads generated today
  - Validation rate
  - Emails sent
  - Replies received
  - Conversion rate
- **Delivery**: HTML email to agency email address

#### 7. `process_pending_brochures`
- **Purpose**: Send PDF brochures to validated leads
- **Trigger**: Every 15 minutes
- **Batch Size**: 10 leads per run
- **Attachment**: `data/brochure.pdf`

### Celery Beat Schedule

```python
# Every 24 hours at 9 AM UTC
send_daily_report.apply_async()

# Every 2 hours
run_monitor_task.apply_async()

# Every 15 minutes
process_pending_brochures.apply_async()
```

---

## 🌐 API Endpoints

### Authentication Endpoints

#### `POST /api/auth/register`
Creates new user account.
- **Input**: email, password, name, company_name
- **Output**: User object with API key
- **Security**: Password hashed with PBKDF2

#### `POST /api/auth/login`
Authenticates user and returns API key.
- **Input**: email, password
- **Output**: API key for subsequent requests
- **Security**: Password verification

#### `GET /api/auth/profile`
Retrieves current user profile.
- **Auth**: Requires API key header
- **Output**: Full user details

#### `PUT /api/auth/profile`
Updates user profile settings.
- **Auth**: Requires API key
- **Input**: Fields to update
- **Output**: Updated user object

### Lead Endpoints

#### `GET /api/leads`
Lists all leads for authenticated user.
- **Query Params**: status, sort, page, limit
- **Output**: Paginated lead list
- **Filters**: By status, industry, date range

#### `GET /api/leads/{id}`
Retrieves specific lead details.
- **Output**: Complete lead information including reply history

#### `POST /api/leads`
Manually creates a lead.
- **Input**: company_name, email, industry, location
- **Output**: Created lead object

#### `PUT /api/leads/{id}`
Updates lead information.
- **Input**: Fields to update (status, notes, etc.)
- **Output**: Updated lead

#### `DELETE /api/leads/{id}`
Deletes a lead.
- **Output**: 204 No Content

### Campaign Endpoints

#### `POST /api/campaigns`
Creates new campaign.
- **Input**: name, agency_type, target_location, max_leads, template_id
- **Output**: Campaign object with status "pending"

#### `GET /api/campaigns`
Lists all campaigns.
- **Output**: Array of campaigns with statistics

#### `GET /api/campaigns/{id}`
Retrieves campaign details.
- **Output**: Campaign with performance metrics (reply rate, conversion rate)

#### `POST /api/campaigns/{id}/run`
Executes campaign asynchronously.
- **Output**: Celery task ID
- **Status**: 202 Accepted (queued)

#### `GET /api/campaigns/{id}/status`
Checks campaign execution progress.
- **Output**: Current stage, progress percentage, statistics

### Pipeline Endpoints

#### `POST /api/pipeline/run`
Runs full pipeline synchronously (waits for completion).
- **Input**: agency_type, location, max_leads
- **Output**: Complete results after execution

#### `POST /api/pipeline/run/async`
Runs pipeline in background.
- **Output**: Task ID for status checking
- **Status**: 202 Accepted

#### `GET /api/pipeline/status/{task_id}`
Checks pipeline execution status.
- **Output**: Progress, current stage, statistics

### System Endpoints

#### `GET /health`
Health check endpoint.
- **Output**: System status, database connection, Redis connection

#### `GET /`
API root endpoint.
- **Output**: API name, version, status

---

## 🎨 Frontend Architecture

### Technology & Design

**Framework**: Next.js 16 with App Router
**Styling**: Tailwind CSS 4.0 with custom glass morphism design
**State Management**: React hooks (useState, useEffect)
**Animations**: Framer Motion + custom CSS animations
**Color Scheme**: Teal (#14b8a6), Amber (#f59e0b), Slate (#64748b)

### Page Structure

#### 1. Landing Page (`/`)
**Purpose**: Marketing page to attract users

**Sections**:
- Hero with animated background and metrics
- Ticker banner with platform features
- "How It Works" - 5-step process explanation
- Dashboard preview with mock data
- Campaigns showcase
- Automation schedule display
- Footer with links

**Animations**:
- Pipeline node animation (cycles through stages)
- Counter animations for metrics
- Scroll-triggered reveals
- Ticker tape animation

#### 2. Login Page (`/auth/login`)
- Email/password form
- Remember me checkbox
- Link to registration
- Glass morphism card design

#### 3. Register Page (`/auth/register`)
- Multi-field registration form
- Password validation
- Terms acceptance
- Redirects to onboarding after signup

#### 4. Dashboard Page (`/dashboard`)
**Purpose**: Main user workspace

**Components**:
- Top stats cards (leads, contacted, reply rate, conversion rate)
- Pipeline runner panel (start new campaigns)
- Automation status (next scheduled tasks)
- Recent activity timeline
- Quick actions

#### 5. Leads Page (`/leads`)
**Purpose**: View and manage all leads

**Features**:
- Advanced filtering (status, industry, date)
- Sortable table
- Lead detail modal
- Bulk actions
- CSV export
- Email conversation history

#### 6. Campaigns Page (`/campaigns`)
**Purpose**: Create and manage campaigns

**Features**:
- Campaign creation form
- Campaign cards with statistics
- Progress bars
- Status badges (active, completed, paused)
- Performance metrics

#### 7. Settings Page (`/settings`)
**Purpose**: Configure system preferences

**Sections**:
- Account settings
- Email configuration (SMTP/IMAP)
- Lead generation preferences
- Notification settings
- API keys
- Billing information
- Danger zone (delete account)

---

## 🔐 Security & Configuration

### Environment Variables

**Backend (.env)**:
```bash
# Database
DATABASE_URL=postgresql+asyncpg://user:pass@db:5432/leadgen

# Email Sending (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_16_char_app_password
SMTP_USE_TLS=true
EMAIL_FROM=noreply@company.com

# Email Receiving (IMAP)
IMAP_HOST=imap.gmail.com
IMAP_PORT=993
IMAP_USER=your_email@gmail.com
IMAP_PASSWORD=your_16_char_app_password

# Redis
REDIS_URL=redis://redis:6379/0
CELERY_BROKER_URL=redis://redis:6379/1
CELERY_RESULT_BACKEND=redis://redis:6379/2

# API Keys (Optional)
HUNTER_IO_API_KEY=your_key
ZEROBOUNCE_API_KEY=your_key

# Google Sheets (Optional)
GOOGLE_SHEETS_CREDENTIALS_PATH=config/credentials.json
GOOGLE_SHEETS_SPREADSHEET_ID=your_sheet_id

# Application
DEBUG=false
CORS_ORIGINS=["http://localhost:3000"]
```

**Frontend (.env.local)**:
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Gmail App Password Setup

**Required for SMTP/IMAP**:
1. Enable 2-Factor Authentication on Gmail
2. Go to Google Account → Security → App Passwords
3. Generate 16-character app password
4. Use this password (not regular Gmail password) in .env

### Security Features

1. **Password Hashing**: PBKDF2-HMAC-SHA256 with salt
2. **API Key Authentication**: Secure random tokens
3. **CORS Protection**: Configured allowed origins
4. **Input Validation**: Pydantic schemas validate all inputs
5. **SQL Injection Prevention**: SQLAlchemy ORM parameterized queries
6. **Rate Limiting**: Daily quotas prevent abuse
7. **TLS Encryption**: All email communication encrypted

---

## 🚀 Deployment & Operations

### Docker Compose Deployment

**Services**:
1. **db** (PostgreSQL 16): Database storage
2. **redis** (Redis 7): Message broker and cache
3. **backend** (FastAPI): API server on port 8000
4. **celery_worker**: Background task processor
5. **celery_beat**: Task scheduler
6. **frontend** (Next.js): Web UI on port 3000

**Commands**:
```bash
# Start all services
docker-compose up -d --build

# View logs
docker-compose logs -f backend

# Stop services
docker-compose down

# Stop and remove data
docker-compose down -v
```

### Health Checks

All services include health checks:
- **Database**: `pg_isready` command
- **Redis**: `redis-cli ping`
- **Backend**: HTTP GET `/health`
- **Dependencies**: Services wait for dependencies to be healthy

### Monitoring

**Backend Logs**:
```bash
docker-compose logs -f backend
```

**Celery Task Monitoring**:
```bash
# View active tasks
celery -A app.tasks inspect active

# View task statistics
celery -A app.tasks inspect stats
```

**Database Monitoring**:
```bash
# Connect to database
docker-compose exec db psql -U postgres -d leadgen

# Check table sizes
SELECT tablename, pg_size_pretty(pg_total_relation_size(tablename::text))
FROM pg_tables WHERE schemaname = 'public';
```

---

## 📈 Data Flow Examples

### Example 1: Complete Lead Generation Flow

```
1. User creates campaign via frontend
   POST /api/campaigns
   {
     "name": "Q2 Tech Startups",
     "agency_type": "web_development",
     "target_location": "California",
     "max_leads": 100
   }

2. User clicks "Run Campaign"
   POST /api/campaigns/{id}/run
   → Backend creates Celery task
   → Returns task_id

3. Celery Worker executes pipeline:
   a. AgencyDiscovery.search_businesses()
      - Searches DuckDuckGo for "web development agencies California"
      - Scrapes 100 websites
      - Extracts emails, names, phones
      
   b. EmailValidator.validate_email()
      - Validates 100 emails
      - 85 pass validation
      
   c. Pipeline saves 85 leads to database
      - Status: "validated"
      
   d. EmailOutreach.send_campaign_email()
      - Personalizes template for each lead
      - Sends 85 emails via SMTP
      - Updates status to "sent"

4. Frontend polls for status
   GET /api/campaigns/{id}/status
   → Returns progress: 100%, leads: 85, sent: 85

5. User views leads
   GET /api/leads?campaign_id={id}
   → Returns list of 85 leads
```

### Example 2: Reply Monitoring Flow

```
1. Celery Beat triggers (every 2 hours)
   run_monitor_task.apply_async()

2. ResponseMonitor.check_inbox()
   - Connects to Gmail IMAP
   - Searches for UNSEEN emails
   - Finds 3 new emails

3. For each email:
   - Extracts sender: "contact@techstartup.com"
   - Matches against sent leads database
   - Finds matching lead

4. Updates lead in database:
   - status: "replied"
   - date_replied: current timestamp
   - reply_content: email body

5. User sees updated lead in dashboard
   - Lead card shows "replied" badge
   - Reply content displayed in detail view
```

### Example 3: Daily Report Generation

```
1. Celery Beat triggers (9 AM UTC daily)
   send_daily_report.apply_async()

2. Task queries database:
   - Leads created today: 127
   - Validated: 108
   - Sent: 95
   - Replied: 18
   - Conversion rate: 18.9%

3. Generates HTML email report:
   - Formats statistics in table
   - Adds charts/graphs
   - Includes top performing campaigns

4. Sends email via SMTP:
   - To: agency_email from settings
   - Subject: "Daily Lead Report - 2026-04-07"
   - Attachment: CSV export of today's leads

5. Optional: Exports to Google Sheets
   - Creates new sheet for the day
   - Populates with lead data
   - Shares link via email
```

---

## 🎯 Key Features Summary

### Automation Features
✅ 24/7 lead discovery
✅ Automatic email validation
✅ Scheduled email campaigns
✅ Reply monitoring every 2 hours
✅ Daily analytics reports
✅ Brochure distribution every 15 minutes

### Lead Management
✅ Duplicate detection
✅ Status tracking (discovered → validated → sent → replied)
✅ Email conversation history
✅ Custom notes and tags
✅ Bulk operations
✅ CSV export

### Campaign Management
✅ Multi-campaign support
✅ Template personalization
✅ Progress tracking
✅ Performance analytics
✅ Pause/resume functionality

### Analytics & Reporting
✅ Real-time dashboard
✅ Reply rate tracking
✅ Conversion rate calculation
✅ Daily email reports
✅ Google Sheets integration
✅ Campaign comparison

### Email Features
✅ Template system with placeholders
✅ HTML and plain text support
✅ PDF attachment support
✅ SMTP authentication
✅ Bounce detection
✅ Reply parsing

---

## 🔧 Development Workflow

### Local Development Setup

1. **Clone repository**
2. **Backend setup**:
   ```bash
   cd lead_gen_automation/backend
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   cp .env.example .env
   # Edit .env with your settings
   ```

3. **Start services**:
   ```bash
   # Terminal 1: Backend
   uvicorn app.main:app --reload

   # Terminal 2: Celery Worker
   celery -A app.tasks worker --loglevel=info

   # Terminal 3: Celery Beat
   celery -A app.tasks beat --loglevel=info

   # Terminal 4: Frontend
   cd ../frontend
   npm install
   npm run dev
   ```

4. **Access**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

### Testing

**Manual Testing**:
1. Register new user
2. Complete onboarding
3. Create campaign
4. Run pipeline
5. Check leads page
6. Verify emails sent
7. Test reply monitoring

**API Testing**:
- Use Swagger UI at `/docs`
- Test endpoints with Postman
- Check Celery task execution

---

## 📝 Configuration Best Practices

### Gmail Configuration
- Use dedicated Gmail account for automation
- Enable 2FA and generate app password
- Set daily sending limit (500 emails/day for free tier)
- Monitor bounce rate

### Database Optimization
- Regular backups (daily recommended)
- Index on frequently queried fields (email, status, user_id)
- Periodic cleanup of old leads
- Monitor connection pool usage

### Celery Optimization
- Adjust worker concurrency based on CPU cores
- Monitor task queue length
- Set task timeouts to prevent hanging
- Use task retries for transient failures

### Security Checklist
- [ ] Change default passwords
- [ ] Use strong SECRET_KEY
- [ ] Enable HTTPS in production
- [ ] Restrict CORS origins
- [ ] Regular security updates
- [ ] Monitor API usage
- [ ] Implement rate limiting
- [ ] Backup encryption keys

---

## 🎓 Conclusion

LeadGenius is a comprehensive, production-ready lead generation platform that automates the entire outreach workflow. It combines modern web technologies (FastAPI, Next.js, Celery) with robust email automation to provide a scalable solution for agencies and businesses.

The system is designed for:
- **Reliability**: Health checks, error handling, retry logic
- **Scalability**: Async operations, task queues, containerization
- **Maintainability**: Clean architecture, separation of concerns, comprehensive logging
- **Security**: Password hashing, API authentication, input validation
- **User Experience**: Real-time updates, progress tracking, intuitive UI

The platform successfully bridges the gap between manual lead generation and fully automated outreach, allowing businesses to focus on closing deals while the system handles discovery, validation, and initial contact.
