"""FastAPI server — serves agent data to the React dashboard."""

import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import database as db

app = FastAPI(title="Agent Command Center API")

_default_origins = "http://localhost:5173,http://localhost:3000"
allowed_origins = os.getenv("ALLOWED_ORIGINS", _default_origins).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/status")
def get_status():
    """Overall agent status for the dashboard header."""
    return db.get_agent_status()


@app.get("/api/activity")
def get_activity(limit: int = 50):
    """Recent activity feed across all agents."""
    return db.get_recent_activity(limit)


@app.get("/api/jobs")
def get_jobs():
    """Job pipeline data."""
    return db.get_jobs()


@app.get("/api/content")
def get_content():
    """Content queue data."""
    return db.get_content()


@app.post("/api/agents/{agent_id}/run")
def trigger_agent(agent_id: str):
    """Manually trigger an agent run from the dashboard."""
    from main import run_agent
    run_agent(agent_id)
    return {"status": "triggered", "agent_id": agent_id}


@app.post("/api/jobs")
def create_job(data: dict):
    """Manually add a job to the pipeline."""
    company = data.get("company")
    role = data.get("role")
    if not company or not role:
        raise HTTPException(status_code=422, detail="company and role are required")
    job_id = db.add_job(company, role, data.get("url"))
    return {"id": job_id}


@app.patch("/api/jobs/{job_id}")
def update_job(job_id: int, data: dict):
    """Update job stage."""
    stage = data.get("stage")
    if not stage:
        raise HTTPException(status_code=422, detail="stage is required")
    db.update_job_stage(job_id, stage, data.get("notes"))
    return {"status": "updated"}


@app.post("/api/content")
def create_content(data: dict):
    """Manually add content to the queue."""
    platform = data.get("platform")
    title = data.get("title")
    if not platform or not title:
        raise HTTPException(status_code=422, detail="platform and title are required")
    content_id = db.add_content(platform, title, data.get("body"))
    return {"id": content_id}


@app.patch("/api/content/{content_id}")
def update_content(content_id: int, data: dict):
    """Update content status."""
    status = data.get("status")
    if not status:
        raise HTTPException(status_code=422, detail="status is required")
    db.update_content_status(content_id, status)
    return {"status": "updated"}
