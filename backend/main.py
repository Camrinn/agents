"""Agent Command Center — Main Entry Point

Starts the API server and scheduler.
Run with: python3 main.py
"""

import os
import uvicorn
from dotenv import load_dotenv
from apscheduler.schedulers.background import BackgroundScheduler

load_dotenv()

import database as db
from agents.content_engine import run_content_engine
from agents.job_radar import run_job_radar
from agents.signal_boost import run_signal_boost


AGENT_MAP = {
    "content_engine": run_content_engine,
    "job_radar": run_job_radar,
    "signal_boost": run_signal_boost,
}


def run_agent(agent_id):
    """Run an agent by ID. Called by scheduler or API trigger."""
    func = AGENT_MAP.get(agent_id)
    if func:
        print(f"[AGENT] Running {agent_id}...")
        try:
            func()
            print(f"[AGENT] {agent_id} completed successfully")
        except Exception as e:
            print(f"[AGENT] {agent_id} failed: {e}")
    else:
        print(f"[AGENT] Unknown agent: {agent_id}")


def start_scheduler():
    """Start the background scheduler for automated agent runs."""
    scheduler = BackgroundScheduler()

    scheduler.add_job(run_agent, "cron", args=["job_radar"], hour=8, minute=0, id="job_radar")
    scheduler.add_job(run_agent, "cron", args=["content_engine"], hour=9, minute=0, id="content_engine")
    scheduler.add_job(run_agent, "cron", args=["signal_boost"], hour=10, minute=0, id="signal_boost")

    scheduler.start()
    print("[SCHEDULER] Started — agents scheduled for daily runs")
    print("  Job Radar:       8:00 AM")
    print("  Content Engine:  9:00 AM")
    print("  Signal Boost:   10:00 AM")
    return scheduler


def main():
    print("=" * 50)
    print("  AGENT COMMAND CENTER")
    print("=" * 50)

    # Initialize database
    db.init_db()
    print("[DB] Database initialized")

    # Verify Gemini key
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key or api_key == "your_gemini_api_key_here":
        print("[WARNING] No Gemini API key set! Agents won't work.")
        print("  1. Get a free key at https://aistudio.google.com/apikey")
        print("  2. Add it to backend/.env")
    else:
        print(f"[LLM] Gemini configured (key: ...{api_key[-6:]})")

    # Start scheduler
    scheduler = start_scheduler()

    # Start API server — Render injects PORT, fallback to API_PORT for local dev
    port = int(os.getenv("PORT", os.getenv("API_PORT", 8000)))
    print(f"[API] Starting server on http://localhost:{port}")
    print("[API] Dashboard should connect to this server")
    print()
    print("Press Ctrl+C to stop")

    try:
        uvicorn.run(
            "server:app",
            host="0.0.0.0",
            port=port,
            reload=False,
        )
    except KeyboardInterrupt:
        scheduler.shutdown()
        print("\n[SHUTDOWN] Goodbye!")


if __name__ == "__main__":
    main()
