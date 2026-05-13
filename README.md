# 🚀 LeadGen Pro

**LeadGen Pro** is a high-performance, automated lead generation and outreach platform designed for agencies and sales teams. It combines intelligent scraping, automated outreach pipelines, and a premium glassmorphic dashboard to streamline the lead conversion process.

![LeadGen Pro Demo](https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=2070)

---

## ✨ Key Features

- **🔍 Smart Lead Discovery**: Automated scraping and identification of potential leads from various sources.
- **📧 Outreach Automation**: Dynamic email templates and multi-channel outreach campaigns.
- **📊 Real-time Analytics**: Detailed tracking of open rates, click rates, and conversion metrics.
- **🗂️ CRM Pipeline**: Visual pipeline management for tracking leads from discovery to closing.
- **🏢 Agency Support**: Multi-tenant architecture for managing multiple clients or departments.
- **⚡ Background Processing**: Scalable task execution using Celery and Redis.
- **🎨 Premium UI**: Modern glassmorphic design using Next.js 16 and Framer Motion.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Library**: [React 19](https://reactjs.org/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **HTTP Client**: [Axios](https://axios-http.com/)
- **Icons**: [Lucide React](https://lucide.dev/)

### Backend
- **Framework**: [FastAPI](https://fastapi.tiangolo.com/) (Python)
- **Database**: [PostgreSQL](https://www.postgresql.org/) / [SQLite](https://www.sqlite.org/) (via SQLAlchemy)
- **Migrations**: [Alembic](https://alembic.sqlalchemy.org/)
- **Task Queue**: [Celery](https://docs.celeryq.dev/)
- **Broker**: [Redis](https://redis.io/)
- **Validation**: [Pydantic v2](https://docs.pydantic.dev/)

---

## 📁 Project Structure

```text
LeadGen/
├── frontend/               # Next.js web application
│   ├── src/app/            # App router pages (onboarding, register, dashboard)
│   ├── src/components/     # Reusable UI components (GlassCard, etc.)
│   └── public/             # Static assets
├── backend/                # FastAPI application
│   ├── app/api/            # API endpoints (leads, campaigns, analytics)
│   ├── app/models/         # Database models
│   ├── app/services/       # Business logic & automation
│   └── alembic/            # Database migration scripts
├── lead_gen_automation/    # Specialized automation modules
├── docker/                 # Containerization configuration
└── docker-compose.yml      # Multi-container orchestration
```

---

## 🚀 Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+
- Redis (for background tasks)
- PostgreSQL (optional, defaults to SQLite for local dev)

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # macOS/Linux
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run migrations:
   ```bash
   alembic upgrade head
   ```
5. Start the server:
   ```bash
   uvicorn app.main:app --reload
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)
```env
DATABASE_URL=sqlite+aiosqlite:///./leadgen.db
REDIS_URL=redis://localhost:6379/0
SECRET_KEY=your_secret_key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### Frontend (`frontend/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## 🚢 Deployment

The project is configured for easy deployment on **Railway** or **Render**.

- **Backend**: Deploys via `docker/Dockerfile.backend` or directly from the `backend/` directory.
- **Frontend**: Deploys as a standard Next.js application.
- **Database**: Managed PostgreSQL on Railway is recommended.

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

*Built with ❤️ by [Divyansh](https://github.com/div0011)*
