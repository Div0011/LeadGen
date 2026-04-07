import logging
from typing import Dict
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.schemas.pipeline import PipelineRunRequest, PipelineStatus
from app.services.pipeline import PipelineOrchestrator
from app.services.outreach import EmailOutreach
from app.api.auth import get_current_user
from app.models.user import User

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/pipeline", tags=["pipeline"])

_active_pipelines: Dict[str, PipelineStatus] = {}


@router.post("/run")
async def run_pipeline(
    request: PipelineRunRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    # Get user's SMTP settings
    user_smtp_settings = None
    if current_user.smtp_username and current_user.smtp_password:
        user_smtp_settings = {
            "smtp_host": current_user.smtp_host or "smtp.gmail.com",
            "smtp_port": int(current_user.smtp_port) if current_user.smtp_port else 587,
            "smtp_user": current_user.smtp_username,
            "smtp_password": current_user.smtp_password,
            "smtp_use_tls": current_user.smtp_use_tls
            if current_user.smtp_use_tls is not None
            else True,
            "email_from": current_user.smtp_username,
        }

    orchestrator = PipelineOrchestrator(db, user_smtp_settings=user_smtp_settings)
    result = await orchestrator.run_full_pipeline(
        target_industry=request.target_industry,
        target_location=request.target_location,
        max_leads=request.max_leads,
        campaign_id=request.campaign_id,
        template_id=request.template_id,
        send_emails=request.send_emails,
    )
    return result


# Async routes (require Celery to be properly configured)
# Uncomment when Celery is set up
# @router.post("/run/async")
# async def run_pipeline_async(request: PipelineRunRequest) -> dict:
#     from app.tasks.pipeline_tasks import run_full_pipeline_task
#     task = run_full_pipeline_task.delay(
#         target_industry=request.target_industry,
#         target_location=request.target_location,
#         max_leads=request.max_leads,
#     )
#     _active_pipelines[task.id] = PipelineStatus(
#         task_id=task.id,
#         stage="queued",
#         is_running=True,
#     )
#     return {"task_id": task.id, "status": "queued"}


@router.get("/status")
async def get_pipeline_status(task_id: str = None) -> dict:
    if task_id:
        if task_id in _active_pipelines:
            return _active_pipelines[task_id].model_dump()
    all_status = {tid: status.model_dump() for tid, status in _active_pipelines.items()}
    return {"pipelines": all_status, "message": "Pipeline status"}


# Monitoring routes (require Celery)
# @router.post("/monitor/start")
# async def start_monitoring() -> dict:
#     from app.tasks.pipeline_tasks import run_monitor_task
#     task = run_monitor_task.delay()
#     return {"task_id": task.id, "status": "monitoring_started"}


@router.post("/monitor/stop")
async def stop_monitoring() -> dict:
    return {"status": "monitoring_stopped", "message": "Monitor cycle complete"}
