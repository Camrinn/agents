"""Signal Boost — Personal Brand & Networking Agent

Uses your profile to find the right people at target companies
and align your content strategy with your job search.
"""

import os
from google import genai
import database as db
from profile_loader import get_profile, get_target_companies

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
MODEL = "gemini-2.0-flash"


def identify_contacts(target_companies):
    """Identify key people to connect with at target companies."""
    profile = get_profile()

    prompt = f"""For {profile['name']} — a {profile['headline'].split('.')[0].lower()} —
identify the best people to connect with at these companies: {', '.join(target_companies)}

For each company, provide:
1. type: The role to target (e.g., "Marketing Director", "Engineering Manager")
2. strategy: How to find them on LinkedIn (specific search terms)
3. message: A personalized connection request (under 300 chars) that references:
   - Something specific about the company
   - The candidate's unique marketing + development combo
   - A genuine reason to connect (not "I'd love to pick your brain")

Format as JSON array. Make messages feel human."""

    response = client.models.generate_content(model=MODEL, contents=prompt)
    db.log_activity("signal_boost", "identified_contacts", f"For {len(target_companies)} companies")
    return response.text


def suggest_content_alignment(jobs, recent_posts=None):
    """Suggest content that would get noticed by target companies."""
    profile = get_profile()
    companies = [j.get("company", "Unknown") for j in jobs]
    roles = [j.get("role", "Unknown") for j in jobs]

    prompt = f"""I'm {profile['name']}, a {profile['headline'].split('.')[0].lower()}.

I'm targeting:
Companies: {', '.join(companies)}
Roles: {', '.join(roles)}

My recent posts: {recent_posts or 'None yet'}
My content voice: {profile.get('content_voice', 'Authentic and practical')}

Suggest 3 LinkedIn posts that would:
1. Demonstrate expertise relevant to these roles
2. Be likely seen by people at these companies
3. Feel authentic, not calculated

For each:
- topic: The angle
- why_aligned: How it connects to my targets
- key_points: What to cover
- hashtags: 5 relevant ones

Format as JSON array."""

    response = client.models.generate_content(model=MODEL, contents=prompt)
    db.log_activity("signal_boost", "content_alignment", f"Aligned with {len(companies)} targets")
    return response.text


def run_signal_boost():
    """Execute a full Signal Boost cycle."""
    run_id = db.start_run("signal_boost")

    try:
        task_id = db.add_task(run_id, "signal_boost", "Analyzing job pipeline for networking targets")
        jobs = db.get_jobs()
        active_jobs = [j for j in jobs if j["stage"] in ("discovered", "applied", "interview")]
        target_companies = [j["company"] for j in active_jobs]

        # Also add manually specified targets
        manual_targets = get_target_companies()
        all_targets = list(set(target_companies + manual_targets))
        db.complete_task(task_id, "done", f"Found {len(all_targets)} targets")

        if not all_targets:
            db.finish_run(run_id, "done", "No active targets — run Job Radar first")
            return

        task_id = db.add_task(run_id, "signal_boost", "Identifying key contacts at target companies")
        contacts = identify_contacts(all_targets[:5])
        db.complete_task(task_id, "done", "Connection strategies generated")

        task_id = db.add_task(run_id, "signal_boost", "Generating aligned content suggestions")
        content = db.get_content()
        recent_titles = [c["title"] for c in content[:5]]
        suggestions = suggest_content_alignment(active_jobs or [{"company": t, "role": "General"} for t in all_targets[:3]], recent_titles)
        db.complete_task(task_id, "done", "Content suggestions generated")

        task_id = db.add_task(run_id, "signal_boost", "Adding content ideas to queue")
        db.add_content("linkedin", f"Strategic post: visibility with {all_targets[0]}", None, "idea")
        db.complete_task(task_id, "done", "Ideas added to content queue")

        db.log_activity("signal_boost", "networking_plan", contacts[:500])
        db.finish_run(run_id, "done", f"Generated networking plan for {len(all_targets)} companies")

    except Exception as e:
        db.finish_run(run_id, "error", error=str(e))
        db.log_activity("signal_boost", "error", str(e))
        raise
