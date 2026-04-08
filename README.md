# LeadGenius - Complete Lead Generation Automation Platform

A production-grade lead generation automation platform featuring intelligent lead discovery, automated email outreach, reply monitoring, and comprehensive analytics. Runs 24/7 with background task automation.

---

## 📋 Table of Contents
1. [System Architecture](#system-architecture)
2. [Backend Stack](#backend-stack)
3. [Database Models](#database-models)
4. [Task Automation & Scheduling](#task-automation--scheduling)
5. [Email System](#email-system)
6. [Lead Generation Pipeline](#lead-generation-pipeline)
7. [API Endpoints](#api-endpoints)
8. [Frontend Screens](#frontend-screens)
9. [Configuration](#configuration)
10. [Quick Start](#quick-start)
11. [Docker Deployment](#docker-deployment)

---

## System Architecture

### 6-Service Containerized Setup
```
┌─────────────────────────────────────────────────┐
│                  USER BROWSER                    │
│            (Next.js Frontend - Port 3000)        │
└────────────────────┬────────────────────────────┘
                     │ HTTP/WebSocket
┌────────────────────┴────────────────────────────┐
│          NGINX/Reverse Proxy (Optional)         │
└────────────────────┬────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
    ┌───▼───┐   ┌───▼───┐   ┌──▼────┐
    │FastAPI│   │Celery │   │Celery │
    │Backend│   │Worker │   │ Beat  │
    │ :8000 │   │       │   │       │
    └───┬───┘   └───┬───┘   └──┬────┘
        │           │           │
        │      ┌────▼───────────┘
        │      │
    ┌───▼──────▼──┐  ┌──────────┐
    │   Redis     │  │ PostgreSQL
    │   :6379     │  │   :5432
    │ (Message    │  │(Database)
    │  Broker)    │  │
    └────────────┘  └──────────┘
```

---

## Backend Stack

### Framework & Language
- **Framework**: FastAPI (Python 3.11+)
- **Async Runtime**: AsyncIO with Uvicorn
- **Database ORM**: SQLAlchemy (async with asyncpg)
- **Task Queue**: Celery with Redis broker
- **Task Scheduling**: Celery Beat

### Key Technologies
| Component | Technology | Purpose |
|-----------|-----------|---------|
| API Server | FastAPI | RESTful API with OpenAPI docs |
| Database | PostgreSQL 14+ | Production data storage |
| Cache/Queue | Redis 7 | Message broker, results backend |
| Task Worker | Celery | Background job execution |
| Scheduler | Celery Beat | Automated task scheduling |
| Email (Send) | Gmail SMTP | Outbound email delivery |
| Email (Receive) | Gmail IMAP | Incoming reply monitoring |
| Web Scraping | DuckDuckGo | Lead discovery |
| Email Validation | Hunter.io / ZeroBounce | Email verification |
| Data Export | Google Sheets API | Report generation & storage |

### Dependencies
- `fastapi` - Web framework
- `sqlalchemy` - ORM for database
- `asyncpg` - Async PostgreSQL driver
- `celery` - Task queue
- `redis` - Message broker
- `aiosmtplib` - Async SMTP for email sending
- `aiomap` - Async IMAP for monitoring replies
- `google-auth-oauthlib` - Google Sheets authentication
- `python-dotenv` - Environment configuration

---

## Database Models

### User Model
```python
class User:
  id: UUID
  email: str (unique)
  password_hash: str
  name: str
  company_name: str
  agency_type: str (web_dev, consulting, saas, etc)
  services: str (comma-separated)
  target_location: str
  daily_quota: int (default: 50)
  monthly_spent: int
  api_key: str
  is_active: bool
  created_at: datetime
  updated_at: datetime
```

### Lead Model
```python
class Lead:
  id: UUID
  user_id: UUID (Foreign Key -> User)
  company_name: str
  company_email: str
  company_phone: str (optional)
  industry: str
  website: str (optional)
  location: str
  contact_person: str
  status: str (discovered, contacted, replied, not_interested, converted)
  replied_at: datetime (optional)
  reply_content: str (optional)
  email_sent_at: datetime (optional)
  created_at: datetime
  updated_at: datetime
```

### Campaign Model
```python
class Campaign:
  id: UUID
  user_id: UUID (Foreign Key -> User)
  name: str
  agency_type: str
  target_location: str
  max_leads: int
  leads_collected: int
  leads_contacted: int
  leads_replied: int
  conversion_rate: float
  status: str (pending, running, completed, paused)
  email_template_id: UUID (optional)
  brochure_url: str (optional)
  started_at: datetime
  completed_at: datetime (optional)
  created_at: datetime
```

### EmailTemplate Model
```python
class EmailTemplate:
  id: UUID
  user_id: UUID (Foreign Key -> User)
  name: str
  subject: str
  body: str (HTML or plain text)
  include_brochure: bool
  status: str (active, archived)
  created_at: datetime
  updated_at: datetime
```

### Task Model
```python
class Task:
  id: UUID
  campaign_id: UUID (Foreign Key -> Campaign)
  task_type: str (collect, validate, send_email, monitor_replies, generate_report)
  status: str (pending, running, completed, failed)
  progress: int (0-100)
  error_message: str (optional)
  celery_task_id: str
  started_at: datetime
  completed_at: datetime (optional)
  created_at: datetime
```

---

## Task Automation & Scheduling

### Celery Beat Schedule

**Automatic tasks run on schedule:**

| Task | Schedule | Frequency | Purpose |
|------|----------|-----------|---------|
| **Daily Lead Analysis** | Every 24 hours (9 AM UTC) | 1x per day | Generate daily report, export to CSV/Sheets |
| **Reply Monitoring** | Every 2 hours | 12x per day | Check IMAP for incoming replies, update statuses |
| **Brochure Distribution** | Every 15 minutes | 96x per day | Send queued PDF brochures to prospects |
| **Stale Lead Cleanup** | Every 48 hours (Midnight UTC) | 2x per week | Archive old leads without response |
| **Pipeline Orchestration** | On-demand via API | Manual | Collect → Validate → Dedupe → Send |

### Task Flow Architecture
```
┌─────────────────────┐
│  Celery Beat        │
│  (Scheduler)        │
└──────────┬──────────┘
           │
     ┌─────┴──────────────────┐
     │                        │
┌────▼────────┐      ┌───────▼──────┐
│   Every 24h │      │   Every 2h   │
│    Daily    │      │   Reply      │
│   Report    │      │   Check      │
├────────────┤      ├──────────────┤
│ 1. Query   │      │ 1. Connect  │
│    leads   │      │    IMAP     │
│ 2. Gen CSV │      │ 2. Check    │
│ 3. Email    │      │    inbox    │
│ 4. Sheets   │      │ 3. Parse    │
│    export   │      │    replies  │
└────────────┘      │ 4. Update   │
                    │    database │
                    └──────────────┘

Every 15 mins:
┌──────────────────┐
│ Brochure         │
│ Distribution     │
├──────────────────┤
│ 1. Query queued  │
│ 2. Get PDF URL   │
│ 3. Send with     │
│    attachment    │
│ 4. Mark sent     │
└──────────────────┘
```

---

## Email System

### SMTP Configuration (Outbound - Email Sending)
```
Service: Gmail SMTP
Host: smtp.gmail.com
Port: 587
Encryption: TLS
Authentication: OAuth2 OR App Password (16-char)
Rate Limit: 500 emails/day (Gmail free tier)
Retry Logic: 3 attempts with exponential backoff
```

**Environment Variables:**
```env
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your_email@gmail.com
SMTP_PASSWORD=your_16_char_app_password (not regular password!)
FROM_EMAIL=noreply@yourcompany.com
```

### IMAP Configuration (Inbound - Reply Monitoring)
```
Service: Gmail IMAP
Host: imap.gmail.com
Port: 993
Encryption: SSL/TLS
Authentication: Same as SMTP
Check Frequency: Every 2 hours (Celery Beat)
Folder: INBOX
```

**Environment Variables:**
```env
IMAP_SERVER=imap.gmail.com
IMAP_PORT=993
IMAP_USERNAME=your_email@gmail.com
IMAP_PASSWORD=your_16_char_app_password
```

### Email Templates
Templates stored in database with:
- Subject line
- HTML body with placeholders: `{company_name}`, `{contact_person}`, `{website}`
- PDF brochure attachment option
- Personalization logic
- A/B testing variants (future)

**Example Template:**
```html
Subject: Custom Web Development Solutions for {company_name}

Body:
Hi {contact_person},

We specialize in building custom web applications for businesses like {company_name}.

Your Website: {website}
Industry: {industry}

I'd love to discuss how we can help you achieve your digital goals.

Best regards,
Team
```

---

## Lead Generation Pipeline

### Step 1: Lead Discovery
**Trigger**: User runs campaign or scheduled task
**Process**:
```
1. Query DuckDuckGo for: "{industry} companies in {location}"
2. Extract company names and websites
3. Parse company details (size, industry, contact info)
4. Filter by quality rules:
   - No .com/.net generic domains
   - Must have public email or contact form
   - Skip competitors and job boards
5. Store raw leads in database with status: "discovered"
```

### Step 2: Email Validation
**Trigger**: After lead discovery
**Process**:
```
1. Extract email from company website OR query Hunter.io API
2. Validate email format (RFC 5322)
3. Check with ZeroBounce API:
   - Test SMTP connection
   - Check for disposable emails
   - Verify deliverability score
4. Apply business rules:
   - Prefer specific names (contact@, info@, sales@)
   - Filter generic/no-reply emails
   - Avoid catch-all email patterns
5. Update lead status: "validated" or "invalid"
```

### Step 3: Outreach (Email Sending)
**Trigger**: Manual send or scheduled task
**Process**:
```
1. Get template for user's agency_type
2. Personalize email:
   - Replace {company_name}, {contact_person}, etc
   - Dynamic greeting based on time zone
3. Attach PDF brochure if enabled
4. Send via SMTP with authentication
5. Record:
   - email_sent_at timestamp
   - retry status
   - bounce/error info
6. Update lead status: "contacted"
```

### Step 4: Reply Monitoring
**Trigger**: Every 2 hours (Celery Beat)
**Process**:
```
1. Connect to Gmail IMAP
2. Search for recent emails (last 2 hours)
3. Match replies to sent emails:
   - Extract "In-Reply-To" header
   - Match with campaign email list
4. Parse reply content:
   - Store full email body
   - Extract sentiment (interested, not interested, etc)
   - Identify question keywords
5. Update lead:
   - status: "replied"
   - replied_at: timestamp
   - reply_content: full message
6. Flag for user follow-up in dashboard
```

### Step 5: Analysis & Reporting
**Trigger**: Every 24 hours (9 AM UTC)
**Process**:
```
1. Calculate metrics:
   - Total leads: collected, validated, contacted, replied
   - Reply rate: (replied / contacted) * 100
   - Conversion rate: (converted / replied) * 100
   - Cost per lead: monthly_spent / total_collected
2. Generate report:
   - CSV export with all lead data
   - HTML email summary
   - Charts and graphs
3. Export to Google Sheets:
   - Create new sheet for the day
   - Add user API key for access
   - Share via link
4. Email report to user
```

**Metrics Included**:
- Total leads discovered today
- Email validation success rate
- Emails sent count
- Replies received
- Reply rate %
- Top performing industries
- Top performing locations
- Cost analysis

---

## API Endpoints

### Authentication Endpoints

#### POST `/api/auth/register`
Register new user account
```json
Request:
{
  "email": "user@company.com",
  "password": "SecurePass123!",
  "name": "John Doe",
  "company_name": "Digital Agency LLC"
}

Response (201):
{
  "id": "uuid",
  "email": "user@company.com",
  "name": "John Doe",
  "company_name": "Digital Agency LLC",
  "api_key": "sk_live_xxxxx",
  "created_at": "2026-04-05T10:30:00Z"
}
```

#### POST `/api/auth/login`
Login and get API key
```json
Request:
{
  "email": "user@company.com",
  "password": "SecurePass123!"
}

Response (200):
{
  "api_key": "sk_live_xxxxx",
  "email": "user@company.com",
  "name": "John Doe"
}
```

#### GET `/api/auth/profile`
Get current user profile
```
Headers: Authorization: ApiKey YOUR_API_KEY

Response (200):
{
  "id": "uuid",
  "email": "user@company.com",
  "name": "John Doe",
  "company_name": "Digital Agency LLC",
  "agency_type": "web_development",
  "services": "Web Design, Web Dev, SEO",
  "target_location": "USA",
  "daily_quota": 50,
  "monthly_spent": 450,
  "created_at": "2026-04-05T10:30:00Z"
}
```

#### PUT `/api/auth/profile`
Update user profile
```json
Headers: Authorization: ApiKey YOUR_API_KEY

Request:
{
  "agency_type": "web_development",
  "services": "Web Design, SEO, E-commerce",
  "target_location": "India",
  "daily_quota": 75
}

Response (200): Updated user object
```

### Lead Endpoints

#### GET `/api/leads`
Get all leads for authenticated user
```
Headers: Authorization: ApiKey YOUR_API_KEY
Query Params: ?status=contacted&sort=-created_at&page=1&limit=20

Response (200):
{
  "total": 245,
  "page": 1,
  "limit": 20,
  "leads": [
    {
      "id": "uuid",
      "company_name": "Tech Startup Inc",
      "company_email": "contact@techstartup.com",
      "industry": "SaaS",
      "status": "replied",
      "email_sent_at": "2026-04-04T14:20:00Z",
      "replied_at": "2026-04-04T15:45:00Z",
      "reply_content": "Hi, we're interested..."
    }
  ]
}
```

#### GET `/api/leads/{id}`
Get specific lead details
```
Response (200): Lead object with full details
```

#### POST `/api/leads`
Create lead manually
```json
Request:
{
  "company_name": "Acme Corp",
  "company_email": "info@acme.com",
  "industry": "Manufacturing",
  "location": "USA"
}

Response (201): Created lead object
```

#### PUT `/api/leads/{id}`
Update lead status or details
```json
Request:
{
  "status": "converted",
  "notes": "Client signed contract"
}

Response (200): Updated lead object
```

#### DELETE `/api/leads/{id}`
Delete a lead
```
Response (204): No content
```

### Campaign Endpoints

#### POST `/api/campaigns`
Create new campaign
```json
Headers: Authorization: ApiKey YOUR_API_KEY

Request:
{
  "name": "Q2 Tech Startups",
  "agency_type": "web_development",
  "target_location": "Silicon Valley",
  "max_leads": 100,
  "email_template_id": "uuid"
}

Response (201):
{
  "id": "uuid",
  "name": "Q2 Tech Startups",
  "status": "pending",
  "leads_collected": 0,
  "created_at": "2026-04-05T10:30:00Z"
}
```

#### GET `/api/campaigns`
List all campaigns
```
Response (200): Array of campaign objects
```

#### GET `/api/campaigns/{id}`
Get campaign details with stats
```
Response (200):
{
  "id": "uuid",
  "name": "Q2 Tech Startups",
  "status": "completed",
  "leads_collected": 85,
  "leads_contacted": 72,
  "leads_replied": 18,
  "conversion_rate": 25.0,
  "started_at": "2026-04-01T10:00:00Z",
  "completed_at": "2026-04-03T15:30:00Z"
}
```

#### POST `/api/campaigns/{id}/run`
Execute campaign (async)
```
Response (202):
{
  "task_id": "celery-uuid",
  "status": "queued",
  "message": "Campaign execution queued"
}
```

#### GET `/api/campaigns/{id}/status`
Get campaign execution status
```
Response (200):
{
  "task_id": "celery-uuid",
  "status": "running",
  "progress": 45,
  "message": "Collecting leads... 45% complete"
}
```

### Pipeline Endpoints

#### POST `/api/pipeline/run`
Run full pipeline synchronously
```json
Headers: Authorization: ApiKey YOUR_API_KEY

Request:
{
  "agency_type": "web_development",
  "location": "India",
  "max_leads": 50
}

Response (200): Collection of leads (waits for completion)
```

#### POST `/api/pipeline/run/async`
Run pipeline asynchronously (background)
```json
Request: Same parameters

Response (202):
{
  "task_id": "celery-uuid",
  "status": "queued",
  "message": "Pipeline execution started"
}
```

#### GET `/api/pipeline/status/{task_id}`
Check pipeline execution status
```
Response (200):
{
  "task_id": "celery-uuid",
  "status": "running",
  "progress": 65,
  "current_stage": "email_validation",
  "leads_collected": 42,
  "leads_validated": 38
}
```

### Admin Endpoints

#### GET `/api/health`
System health check
```
Response (200):
{
  "status": "healthy",
  "database": "connected",
  "redis": "connected",
  "celery_workers": 1,
  "pending_tasks": 3
}
```

#### GET `/api/stats`
Platform statistics
```
Response (200):
{
  "total_users": 125,
  "total_leads_collected": 12450,
  "total_campaigns_run": 340,
  "avg_reply_rate": 22.5,
  "uptime_hours": 8760,
  "celery_tasks_processed": 45000
}
```

---

## Frontend Screens

The frontend is built with **Next.js 16.2.2**, **React 19.2.4**, **TypeScript**, and **Tailwind CSS 4.0** with glass morphism design system.

### 9 Required Frontend Screens

#### 1. **Landing Page** (/)
- Hero section with particle background animation
- Platform features showcase (6 feature cards)
- Trust indicators and statistics
- Call-to-action sections
- Pricing plans (optional)
- Footer with links
- **Purpose**: Attract visitors and drive signups
- **Public**: Yes (no authentication required)

#### 2. **Login Page** (/login)
- Email and password form
- Remember me checkbox
- "Forgot password?" link
- Sign up link for new users
- Animated glass card design
- Error message display
- **Purpose**: Authenticate returning users
- **Public**: Yes (redirects if authenticated)

#### 3. **Register Page** (/register)
- Multi-field registration form:
  - Full name
  - Email address
  - Company name
  - Password (with validation)
  - Confirm password
- Terms & conditions checkbox
- Marketing opt-in checkbox
- Login link for existing users
- Form validation and error display
- **Purpose**: New user account creation
- **Public**: Yes (redirects if authenticated)

#### 4. **Onboarding/Setup Page** (/onboarding)
- Multi-step wizard (4-5 steps):
  - Step 1: Agency Type Selection (dropdown/cards)
  - Step 2: Services Offered (multi-select)
  - Step 3: Target Location (input/autocomplete)
  - Step 4: Email Configuration (SMTP settings)
  - Step 5: Summary & Confirmation
- Progress indicator bar
- Next/Previous/Skip buttons
- Success confirmation screen
- **Purpose**: First-time user configuration
- **Protected**: Yes (authenticated users only)

#### 5. **Dashboard Page** (/dashboard)
- Header with navigation and user profile menu
- Sidebar with navigation (desktop + mobile)
- Top stats cards (4 cards):
  - Total Leads Collected
  - Leads Contacted (This Month)
  - Reply Rate %
  - Conversion Rate %
- Pipeline runner panel:
  - Agency type selector
  - Location input
  - Max leads slider
  - Run campaign button
  - Progress indicator
- Automation status panel:
  - Next daily report time
  - Next reply check time
  - Active campaigns count
- Recent activity timeline
- Quick action buttons
- **Purpose**: Main user workspace
- **Protected**: Yes

#### 6. **Leads Page** (/leads)
- Advanced filter section:
  - Search by company name/email
  - Filter by status (discovered, contacted, replied, converted, not_interested)
  - Filter by industry
  - Filter by date range
  - Sort options
- Leads table/list with columns:
  - Company name (with link to details)
  - Email address
  - Industry
  - Status (with color badge)
  - Email sent date
  - Last reply date
  - Action buttons (View, Edit, Delete, Email)
- Pagination/infinite scroll
- Bulk actions (bulk email, bulk delete)
- Lead detail modal/sidebar:
  - Full company information
  - Contact person details
  - Email conversation thread
  - Lead history timeline
  - Notes section
  - Custom fields
- Export leads button (CSV)
- **Purpose**: View, filter, and manage all leads
- **Protected**: Yes

#### 7. **Campaigns Page** (/campaigns)
- Campaign creation form (modal/new page):
  - Campaign name
  - Agency type selector
  - Target location
  - Max leads to collect
  - Email template selector
  - Brochure upload (PDF)
  - Schedule options (run now, run later)
- Campaigns list/grid with cards:
  - Campaign name
  - Status badge (pending, running, completed, paused)
  - Stats: leads collected, contacted, replied
  - Reply rate & conversion rate
  - Action buttons (View, Edit, Pause, Resume, Delete)
- Campaign detail view:
  - Full campaign information
  - Performance metrics (charts/graphs)
  - Lead list for this campaign only
  - Email template preview
  - Brochure preview
  - Pause/Resume/Delete buttons
- **Purpose**: Create and manage email campaigns
- **Protected**: Yes

#### 8. **Settings Page** (/settings)
- Tabs or sections:
  
  **Account Settings**:
  - Change email address
  - Change password
  - Update display name
  - Set default agency type
  
  **Email Configuration**:
  - SMTP server settings
  - SMTP username and password
  - IMAP server settings (readonly)
  - Test email button
  - Gmail app password instructions
  - Trusted email list
  
  **Lead Generation Preferences**:
  - Daily lead quota
  - Industries to target/exclude
  - Locations to focus on
  - Preferred email validation level
  - Auto-send brochure toggle
  
  **Notification Settings**:
  - Email notifications toggle
  - Daily report time preference
  - Reply alerts
  - Campaign completion alerts
  
  **API Keys**:
  - Display current API key
  - Generate new API key button
  - API key usage instructions
  
  **Billing & Plan**:
  - Current plan display
  - Monthly usage statistics
  - Upgrade plan button
  - Billing history
  
  **Danger Zone**:
  - Delete all leads button (with confirmation)
  - Delete account button (with confirmation)
  - Export all data button (CSV/JSON)

- **Purpose**: Configure system settings and preferences
- **Protected**: Yes

#### 9. **Company Info Page** (/company-info or /profile/company)
- Company logo upload
- Company name
- Email address
- Phone number
- Website URL
- Industry classification
- Number of employees
- Company description
- Services offered
- Certifications/badges
- Social media links
- Address information
- Save/Cancel buttons
- **Purpose**: Manage company profile details
- **Protected**: Yes (optional, could be integrated into Onboarding or Settings)

### Design System Details
- **Color Palette**: Teal (#14b8a6), Amber (#f59e0b), Slate (#64748b) - No generic black/blue
- **Glass Effects**: All cards use glass morphism with backdrop blur
- **Animations**: Smooth transitions, fade-in animations, scroll effects, particle background
- **Typography**: Professional, readable, dark theme
- **Responsive**: Mobile-first design, works on all screen sizes
- **Icons**: Lucide React icons throughout

### Navigation Flow
```
PUBLIC PAGES:
Landing (/) → Login (/login) or Register (/register)

AUTHENTICATED FLOW:
Login/Register (/register)
    ↓
Onboarding (/onboarding) [First-time only]
    ↓
Dashboard (/dashboard) [Main hub]
    ├→ Leads (/leads) - View all leads
    ├→ Campaigns (/campaigns) - Create & manage campaigns
    ├→ Settings (/settings) - Configure preferences
    └→ Company Info (/company-info) - Update profile
```

---

## Configuration

### Environment Variables - Backend (.env)

```bash
# Database
DATABASE_URL=postgresql://user:pass@db:5432/leadgen
DATABASE_ECHO=false

# SMTP Configuration
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your_email@gmail.com
SMTP_PASSWORD=your_16_char_app_password
FROM_EMAIL=noreply@company.com

# IMAP Configuration
IMAP_SERVER=imap.gmail.com
IMAP_PORT=993
IMAP_USERNAME=your_email@gmail.com
IMAP_PASSWORD=your_16_char_app_password

# Redis
REDIS_URL=redis://redis:6379

# Google Sheets
GOOGLE_SHEETS_CREDENTIALS_FILE=credentials.json
GOOGLE_SHEETS_FOLDER_ID=your_folder_id

# API Keys
HUNTER_IO_API_KEY=your_api_key
ZEROBOUNCE_API_KEY=your_api_key

# JWT
SECRET_KEY=your_secret_key_min_32_chars
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Server
HOST=0.0.0.0
PORT=8000
DEBUG=false
ENVIRONMENT=production
```

### Environment Variables - Frontend (.env.local)

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_API_TIMEOUT=30000

# Frontend Config
NEXT_PUBLIC_APP_NAME=LeadGenius
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Gmail App Password Setup

1. Go to https://myaccount.google.com
2. Enable 2-Factor Authentication
3. Go to App passwords (https://myaccount.google.com/apppasswords)
4. Select "Mail" and "Windows Computer"
5. Copy the generated 16-character password
6. Update `SMTP_PASSWORD` and `IMAP_PASSWORD` in `.env`

---

## Quick Start

### Prerequisites
- Docker & Docker Compose
- OR Python 3.11+ & Node.js 18+
- Gmail account with 2FA enabled

### Local Development (Without Docker)

**Backend Setup:**
```bash
cd lead_gen_automation/backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file with configuration
cp .env.example .env
# Edit .env with your Gmail credentials

# Run migrations
alembic upgrade head

# Start backend server
python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

**Celery Worker (separate terminals):**
```bash
cd lead_gen_automation/backend

# Terminal 1: Celery Worker
celery -A app.tasks worker --loglevel=info

# Terminal 2: Celery Beat (Scheduler)
celery -A app.tasks beat --loglevel=info

# Or in one terminal with concurrency:
celery -A app.tasks worker --beat --loglevel=info
```

**Frontend Setup:**
```bash
cd lead_gen_automation/frontend

# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000 in browser
```

**Redis (if not using Docker):**
```bash
# Install Redis locally or use Docker:
docker run -d -p 6379:6379 redis:7-alpine

# Or on macOS with Homebrew:
brew install redis
redis-server
```

**PostgreSQL (if not using Docker):**
```bash
# Use local PostgreSQL instance
# Create database: createdb leadgen

# Or use Docker:
docker run -d \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=leadgen \
  -p 5432:5432 \
  postgres:16-alpine
```

---

## Docker Deployment

### Using Docker Compose (Recommended)

**Start All Services:**
```bash
cd lead_gen_automation

# Build and start all containers
docker-compose up -d --build

# Check service status
docker-compose ps

# View logs
docker-compose logs -f backend
docker-compose logs -f celery-worker
docker-compose logs -f frontend
```

**Services Running:**
- Backend: http://localhost:8000
- Frontend: http://localhost:3000
- API Docs: http://localhost:8000/docs
- Redis: localhost:6379
- PostgreSQL: localhost:5432

**Stop Services:**
```bash
docker-compose down

# Stop and remove volumes (data loss!)
docker-compose down -v
```

### Health Checks

```bash
# Backend health
curl http://localhost:8000/api/health

# Frontend
curl http://localhost:3000

# Redis
docker-compose exec redis redis-cli ping

# PostgreSQL
docker-compose exec db psql -U postgres -c "SELECT 1;"
```

---

## Troubleshooting

### Email Not Sending
1. Check `SMTP_PASSWORD` is 16-character app password
2. Verify 2FA is enabled on Gmail account
3. Check backend logs for SMTP errors
4. Test connection: `python3 -c "import smtplib; smtplib.SMTP('smtp.gmail.com', 587).starttls()"`

### Celery Tasks Not Running
1. Verify Redis is running: `redis-cli ping`
2. Check Celery worker is running: `celery -A app.tasks inspect active`
3. View task queue: `celery -A app.tasks inspect reserved`
4. Check backend logs for task errors

### Leads Not Being Discovered
1. Verify DuckDuckGo is accessible
2. Check lead validation rules (too strict filters)
3. Check Hunter.io/ZeroBounce API keys if used
4. View backend logs: `docker-compose logs backend`

### Frontend Not Loading
1. Verify backend is running: Check http://localhost:8000/docs
2. Verify `NEXT_PUBLIC_API_URL` is correct
3. Clear Next.js cache: `rm -rf .next && npm run dev`
4. Check browser console for errors

### Database Connection Issues
1. Verify PostgreSQL is running
2. Check `DATABASE_URL` in `.env`
3. Verify migrations are applied: `alembic current`
4. Test connection: `psql -U postgres -d leadgen -c "SELECT 1;"`

---

## Security Best Practices

1. **Never commit .env files** - Add to .gitignore
2. **Use strong passwords** - Min 12 characters, mix of uppercase/lowercase/numbers/symbols
3. **Enable 2FA** - On Gmail account for SMTP/IMAP access
4. **Use app passwords** - Not regular Gmail passwords
5. **API Keys** - Rotate regularly, don't share in code
6. **HTTPS in production** - Use SSL/TLS certificates
7. **Database backups** - Regular automated backups
8. **Monitor logs** - Track suspicious activity
9. **Rate limiting** - Already implemented on API
10. **Input validation** - All user inputs validated server-side

---

## Performance Optimizations

- Async/await for all I/O operations
- Connection pooling for databases
- Redis caching for frequently accessed data
- Batch processing for email operations
- Celery for background task distribution
- Frontend code splitting and lazy loading
- Image optimization and CDN ready

---

## Monitoring & Logging

**Backend Logs Location:**
- Docker: `docker-compose logs backend`
- Local: Check console output

**Celery Task Monitoring:**
```bash
# View active tasks
celery -A app.tasks inspect active

# View task stats
celery -A app.tasks inspect stats

# Purge queue (careful!)
celery -A app.tasks purge
```

**Database Monitoring:**
```bash
# Connect to PostgreSQL
docker-compose exec db psql -U postgres -d leadgen

# Check table sizes
SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) FROM pg_tables;

# View active connections
SELECT datname, usename, application_name, state FROM pg_stat_activity;
```

---

## Support & Documentation

- **API Documentation**: http://localhost:8000/docs (Swagger UI)
- **API Schema**: http://localhost:8000/openapi.json
- **Component Reference**: See `COMPONENTS_API_REFERENCE.md`
- **Design System**: See `DESIGN_SYSTEM_REFERENCE.md`
- **Implementation Guide**: See `FRONTEND_IMPLEMENTATION_GUIDE.md`
- **Enhancement Report**: See `FRONTEND_ENHANCEMENT_REPORT.md`

---

## License & Credits

**LeadGenius** - Lead Generation Automation Platform
- Built with FastAPI, Celery, Next.js, React, Tailwind CSS
- Production-ready architecture
- 24/7 automated lead generation and outreach

**Version**: 1.0  
**Last Updated**: April 5, 2026  
**Status**: Production Ready ✅