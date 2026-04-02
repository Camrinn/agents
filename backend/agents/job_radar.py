"""Job Radar — Job Hunting Agent

Reads your real resume from profile.yaml and generates
ready-to-paste application packages for each job.
"""

import os
import json
from google import genai
import database as db
from profile_loader import get_profile, get_resume_text, get_application_answers, get_target_roles

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
MODEL = "gemini-2.0-flash"


def search_jobs(criteria):
    """Search for jobs matching your profile."""
    profile = get_profile()
    skills_flat = []
    for cat_skills in profile.get("skills", {}).values():
        skills_flat.extend(cat_skills)

    prompt = f"""You are a job search agent for {profile['name']}.

Their profile:
- Headline: {profile['headline']}
- Target roles: {criteria.get('roles', get_target_roles())}
- Skills: {', '.join(skills_flat[:15])}
- Location: {profile.get('location_preference', 'Remote')}
- Experience level: {profile.get('experience_level', 'Mid-Senior')}
- Industries: {profile.get('industries', ['Tech'])}

Search for 10 specific, real companies that are likely hiring for these roles right now.
Prioritize companies known for hiring this type of hybrid marketing/developer profile.

For each, provide:
1. company: Company name
2. role: Specific role title
3. why: Why it's a great fit for this person (1 sentence)
4. where: Where to find the listing

Return ONLY a JSON array, no other text."""

    response = client.models.generate_content(model=MODEL, contents=prompt)
    db.log_activity("job_radar", "searched_jobs", f"Searched for {len(criteria.get('roles', []))} role types")
    return response.text


def generate_application_package(job):
    """Generate a complete application package: tailored resume bullets + cover letter."""
    resume_text = get_resume_text()
    profile = get_profile()

    prompt = f"""You are preparing a job application package for {profile['name']}.

TARGET JOB:
Company: {job.get('company', 'Unknown')}
Role: {job.get('role', 'Unknown')}
Requirements: {job.get('requirements', 'Not specified')}

CANDIDATE RESUME:
{resume_text}

Generate a complete application package with these sections:

## TAILORED RESUME BULLETS
Rewrite the most relevant 8-10 resume bullet points, optimized for this specific role.
Reorder by relevance to the job. Add keywords from the requirements.

## COVER LETTER
Write a concise cover letter (under 250 words). Reference specific things about the
company. Highlight the candidate's unique value: they can do BOTH marketing AND development.
Be professional but authentic — no corporate fluff.

## APPLICATION EMAIL
A short email to send with the application (under 100 words).
Include subject line.

## KEY TALKING POINTS
3-4 bullet points for why this candidate is uniquely qualified for this role.

Return everything formatted clearly with the section headers above."""

    response = client.models.generate_content(model=MODEL, contents=prompt)
    db.log_activity("job_radar", "generated_package", f"Package for {job.get('company')} - {job.get('role')}")
    return response.text


def run_job_radar():
    """Execute a full Job Radar cycle using your real profile."""
    run_id = db.start_run("job_radar")

    try:
        # Step 1: Load profile
        task_id = db.add_task(run_id, "job_radar", "Loading your profile and resume")
        profile = get_profile()
        target_roles = get_target_roles()
        db.complete_task(task_id, "done", f"Loaded profile for {profile['name']}, targeting {len(target_roles)} roles")

        # Step 2: Search for jobs
        task_id = db.add_task(run_id, "job_radar", "Searching for matching jobs")
        criteria = {"roles": target_roles, "location": profile.get("location_preference", "Remote")}
        results = search_jobs(criteria)
        db.complete_task(task_id, "done", "Found potential matches")

        # Step 3: Parse and add to pipeline
        task_id = db.add_task(run_id, "job_radar", "Adding jobs to pipeline")
        try:
            cleaned = results.strip().replace("```json", "").replace("```", "")
            jobs_list = json.loads(cleaned)
            job_ids = []
            for job in jobs_list[:5]:
                jid = db.add_job(job.get("company", "Unknown"), job.get("role", "Unknown"), job.get("where", ""))
                job_ids.append(jid)
            db.complete_task(task_id, "done", f"Added {min(len(jobs_list), 5)} jobs to pipeline")
        except (json.JSONDecodeError, TypeError):
            jobs_list = []
            job_ids = []
            db.complete_task(task_id, "done", "Added jobs (some parsing issues)")

        # Step 4: Generate application package for top match
        task_id = db.add_task(run_id, "job_radar", "Generating application package for top match")
        top_job = jobs_list[0] if jobs_list else {"company": "General", "role": target_roles[0]}
        package = generate_application_package(top_job)
        # Store full package as notes on the top job so it's viewable in the dashboard
        if job_ids:
            db.update_job_notes(job_ids[0], package)
        db.complete_task(task_id, "done", f"Application package ready for {top_job.get('company')}")

        db.log_activity("job_radar", "application_package", package)
        db.finish_run(run_id, "done", f"Found jobs and prepared package for {top_job.get('company')}")

    except Exception as e:
        db.finish_run(run_id, "error", error=str(e))
        db.log_activity("job_radar", "error", str(e))
        raise
