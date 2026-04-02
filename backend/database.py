import sqlite3
import json
import os
from datetime import datetime
from contextlib import contextmanager

DB_PATH = os.getenv("DB_PATH", "./data/agents.db")


def init_db():
    """Create tables if they don't exist."""
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    with get_db() as db:
        db.executescript("""
            CREATE TABLE IF NOT EXISTS agent_runs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                agent_id TEXT NOT NULL,
                status TEXT NOT NULL DEFAULT 'running',
                started_at TEXT NOT NULL,
                finished_at TEXT,
                summary TEXT,
                error TEXT
            );

            CREATE TABLE IF NOT EXISTS tasks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                run_id INTEGER REFERENCES agent_runs(id),
                agent_id TEXT NOT NULL,
                description TEXT NOT NULL,
                status TEXT NOT NULL DEFAULT 'queued',
                result TEXT,
                created_at TEXT NOT NULL,
                completed_at TEXT
            );

            CREATE TABLE IF NOT EXISTS job_pipeline (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                company TEXT NOT NULL,
                role TEXT NOT NULL,
                url TEXT,
                stage TEXT NOT NULL DEFAULT 'discovered',
                applied_at TEXT,
                notes TEXT,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS content_queue (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                platform TEXT NOT NULL,
                title TEXT NOT NULL,
                body TEXT,
                status TEXT NOT NULL DEFAULT 'idea',
                scheduled_for TEXT,
                posted_at TEXT,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS activity_log (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                agent_id TEXT NOT NULL,
                action TEXT NOT NULL,
                details TEXT,
                timestamp TEXT NOT NULL
            );
        """)


@contextmanager
def get_db():
    """Context manager for database connections."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
        conn.commit()
    finally:
        conn.close()


# ── Agent Runs ───────────────────────────────────────────────────────────────

def start_run(agent_id: str) -> int:
    with get_db() as db:
        cursor = db.execute(
            "INSERT INTO agent_runs (agent_id, status, started_at) VALUES (?, 'running', ?)",
            (agent_id, datetime.now().isoformat()),
        )
        return cursor.lastrowid


def finish_run(run_id: int, status: str = "done", summary: str = None, error: str = None):
    with get_db() as db:
        db.execute(
            "UPDATE agent_runs SET status=?, finished_at=?, summary=?, error=? WHERE id=?",
            (status, datetime.now().isoformat(), summary, error, run_id),
        )


# ── Tasks ────────────────────────────────────────────────────────────────────

def add_task(run_id: int, agent_id: str, description: str) -> int:
    with get_db() as db:
        cursor = db.execute(
            "INSERT INTO tasks (run_id, agent_id, description, status, created_at) VALUES (?, ?, ?, 'running', ?)",
            (run_id, agent_id, description, datetime.now().isoformat()),
        )
        return cursor.lastrowid


def complete_task(task_id: int, status: str = "done", result: str = None):
    with get_db() as db:
        db.execute(
            "UPDATE tasks SET status=?, result=?, completed_at=? WHERE id=?",
            (status, result, datetime.now().isoformat(), task_id),
        )


# ── Job Pipeline ─────────────────────────────────────────────────────────────

def add_job(company: str, role: str, url: str = None) -> int:
    now = datetime.now().isoformat()
    with get_db() as db:
        cursor = db.execute(
            "INSERT INTO job_pipeline (company, role, url, stage, created_at, updated_at) VALUES (?, ?, ?, 'discovered', ?, ?)",
            (company, role, url, now, now),
        )
        return cursor.lastrowid


def update_job_stage(job_id: int, stage: str, notes: str = None):
    with get_db() as db:
        db.execute(
            "UPDATE job_pipeline SET stage=?, notes=?, updated_at=? WHERE id=?",
            (stage, notes, datetime.now().isoformat(), job_id),
        )


def update_job_notes(job_id: int, notes: str):
    with get_db() as db:
        db.execute(
            "UPDATE job_pipeline SET notes=?, updated_at=? WHERE id=?",
            (notes, datetime.now().isoformat(), job_id),
        )


def get_jobs():
    with get_db() as db:
        return [dict(row) for row in db.execute("SELECT * FROM job_pipeline ORDER BY updated_at DESC").fetchall()]


# ── Content Queue ────────────────────────────────────────────────────────────

def add_content(platform: str, title: str, body: str = None, status: str = "idea") -> int:
    now = datetime.now().isoformat()
    with get_db() as db:
        cursor = db.execute(
            "INSERT INTO content_queue (platform, title, body, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
            (platform, title, body, status, now, now),
        )
        return cursor.lastrowid


def get_content():
    with get_db() as db:
        return [dict(row) for row in db.execute("SELECT * FROM content_queue ORDER BY updated_at DESC").fetchall()]


def update_content_status(content_id: int, status: str):
    with get_db() as db:
        db.execute(
            "UPDATE content_queue SET status=?, updated_at=? WHERE id=?",
            (status, datetime.now().isoformat(), content_id),
        )


# ── Activity Log ─────────────────────────────────────────────────────────────

def log_activity(agent_id: str, action: str, details: str = None):
    with get_db() as db:
        db.execute(
            "INSERT INTO activity_log (agent_id, action, details, timestamp) VALUES (?, ?, ?, ?)",
            (agent_id, action, details, datetime.now().isoformat()),
        )


def get_recent_activity(limit: int = 50):
    with get_db() as db:
        return [dict(row) for row in db.execute(
            "SELECT * FROM activity_log ORDER BY timestamp DESC LIMIT ?", (limit,)
        ).fetchall()]


def get_agent_status():
    """Get latest run info for each agent."""
    with get_db() as db:
        agents = {}
        for agent_id in ["content_engine", "job_radar", "signal_boost"]:
            run = db.execute(
                "SELECT * FROM agent_runs WHERE agent_id=? ORDER BY started_at DESC LIMIT 1",
                (agent_id,),
            ).fetchone()
            tasks = db.execute(
                "SELECT * FROM tasks WHERE agent_id=? ORDER BY created_at DESC LIMIT 10",
                (agent_id,),
            ).fetchall()
            agents[agent_id] = {
                "last_run": dict(run) if run else None,
                "recent_tasks": [dict(t) for t in tasks],
            }
        return agents
