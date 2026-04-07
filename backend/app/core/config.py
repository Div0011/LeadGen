from pydantic_settings import BaseSettings
from pydantic import ConfigDict
from functools import lru_cache


class Settings(BaseSettings):
    model_config = ConfigDict(
        env_file=".env", env_file_encoding="utf-8", extra="ignore"
    )

    APP_NAME: str = "Lead Gen Automation"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False

    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/leadgen"
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

    CORS_ORIGINS: list[str] = ["http://localhost:3000", "http://localhost:8000"]

    AGENCY_NAME: str = "My Agency"
    AGENCY_EMAIL: str = ""

    GOOGLE_SHEETS_CREDENTIALS_PATH: str = "config/credentials.json"
    GOOGLE_SHEETS_SPREADSHEET_ID: str = ""


@lru_cache()
def get_settings() -> Settings:
    return Settings()
