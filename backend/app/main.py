from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import get_settings
from app.core.database import init_db
from app.api import leads, campaigns, pipeline, templates
from app.api import auth, campaign, analytics, settings as settings_router
from app.api import tracking

app_settings = get_settings()

app = FastAPI(
    title="LeadGen Pro API",
    version="1.0.0",
    description="Lead Generation & Outreach Automation API",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Auth & User routes
app.include_router(auth.router, prefix="/api")

# Campaign routes
app.include_router(campaign.router, prefix="/api")

# Standard routes
app.include_router(leads.router, prefix="/api")
app.include_router(campaigns.router, prefix="/api")
app.include_router(pipeline.router, prefix="/api")
app.include_router(templates.router, prefix="/api")
app.include_router(analytics.router, prefix="/api")
app.include_router(settings_router.router, prefix="/api")
app.include_router(tracking.router, prefix="/api")


@app.on_event("startup")
async def startup() -> None:
    await init_db()


@app.get("/")
async def root():
    return {"name": "LeadGen Pro API", "version": "1.0.0", "status": "running"}


@app.get("/api")
async def api_root():
    return {"message": "LeadGen API is running"}


@app.get("/health")
async def health_check() -> dict:
    return {"status": "healthy", "version": app_settings.APP_VERSION}
