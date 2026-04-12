import os
from typing import Optional, List


class Settings:
    APP_NAME: str = "Lead Gen Automation"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False

    DATABASE_URL: str = "postgresql+psycopg2://postgres:postgres@localhost:5432/leadgen"
    DATABASE_POOL_SIZE: int = 10
    DATABASE_MAX_OVERFLOW: int = 20

    REDIS_URL: str = "redis://localhost:6379/0"

    CELERY_BROKER_URL: str = "redis://localhost:6379/1"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/2"

    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_USE_TLS: bool = True
    EMAIL_FROM: str = "noreply@leadgen.com"

    IMAP_HOST: str = "imap.gmail.com"
    IMAP_PORT: int = 993
    IMAP_USER: str = ""
    IMAP_PASSWORD: str = ""

    HUNTER_IO_API_KEY: str = ""
    ZEROBOUNCE_API_KEY: str = ""

    TARGET_INDUSTRY: str = "E-commerce startups"
    TARGET_LOCATION: str = "United States"

    DUCKDUCKGO_MAX_RESULTS: int = 20
    REQUEST_TIMEOUT: int = 30

    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:8000",
        "https://*.railway.app",
        "https://*.vercel.app",
    ]

    AGENCY_NAME: str = "My Agency"
    AGENCY_EMAIL: str = ""

    GOOGLE_SHEETS_CREDENTIALS_PATH: str = "config/credentials.json"
    GOOGLE_SHEETS_SPREADSHEET_ID: str = ""

    FRONTEND_URL: str = "http://localhost:3000"

    def __init__(self):
        self.APP_NAME = os.getenv("APP_NAME", self.APP_NAME)
        self.APP_VERSION = os.getenv("APP_VERSION", self.APP_VERSION)
        self.DEBUG = os.getenv("DEBUG", "false").lower() == "true"

        db_url = os.getenv("DATABASE_URL", self.DATABASE_URL)
        print(f"[DEBUG] Raw DATABASE_URL: {db_url}")

        if db_url and not db_url.startswith("sqlite"):
            if db_url.startswith("postgresql://"):
                db_url = "postgresql+asyncpg://" + db_url[12:]
            elif db_url.startswith("postgres://"):
                db_url = "postgresql+asyncpg://" + db_url[11:]

        print(f"[DEBUG] Converted DATABASE_URL: {db_url}")
        self.DATABASE_URL = db_url
        self.REDIS_URL = os.getenv("REDIS_URL", self.REDIS_URL)
        self.CELERY_BROKER_URL = os.getenv("CELERY_BROKER_URL", self.CELERY_BROKER_URL)
        self.CELERY_RESULT_BACKEND = os.getenv(
            "CELERY_RESULT_BACKEND", self.CELERY_RESULT_BACKEND
        )
        self.SMTP_HOST = os.getenv("SMTP_HOST", self.SMTP_HOST)
        self.SMTP_PORT = int(os.getenv("SMTP_PORT", str(self.SMTP_PORT)))
        self.SMTP_USER = os.getenv("SMTP_USER", self.SMTP_USER)
        self.SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", self.SMTP_PASSWORD)
        self.SMTP_USE_TLS = os.getenv("SMTP_USE_TLS", "true").lower() == "true"
        self.EMAIL_FROM = os.getenv("EMAIL_FROM", self.EMAIL_FROM)
        self.HUNTER_IO_API_KEY = os.getenv("HUNTER_IO_API_KEY", self.HUNTER_IO_API_KEY)
        self.ZEROBOUNCE_API_KEY = os.getenv(
            "ZEROBOUNCE_API_KEY", self.ZEROBOUNCE_API_KEY
        )
        self.TARGET_INDUSTRY = os.getenv("TARGET_INDUSTRY", self.TARGET_INDUSTRY)
        self.TARGET_LOCATION = os.getenv("TARGET_LOCATION", self.TARGET_LOCATION)
        self.AGENCY_NAME = os.getenv("AGENCY_NAME", self.AGENCY_NAME)
        self.AGENCY_EMAIL = os.getenv("AGENCY_EMAIL", self.AGENCY_EMAIL)
        self.FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")


_settings: Optional[Settings] = None


def get_settings() -> Settings:
    global _settings
    if _settings is None:
        _settings = Settings()
    return _settings
