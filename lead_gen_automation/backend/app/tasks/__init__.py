from celery import Celery
from app.core.config import get_settings

settings = get_settings()

celery_app = Celery(
    "lead_gen_tasks",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=3600,
    worker_prefetch_multiplier=1,
    beat_schedule={
        "daily-lead-analysis": {
            "task": "tasks.send_daily_report",
            "schedule": 86400.0,  # 24 hours
        },
        "check-replies-every-2-hours": {
            "task": "tasks.run_monitor_task",
            "schedule": 7200.0,  # 2 hours
        },
        "send-brochure-every-15-minutes": {
            "task": "tasks.process_pending_brochures",
            "schedule": 900.0,  # 15 minutes
        },
    },
)
