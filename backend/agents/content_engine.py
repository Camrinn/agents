"""Content Engine — Social Media Agent

Reads your profile to match your voice, skills, and content preferences.
"""

import os
from google import genai
import database as db
from profile_loader import get_profile, get_resume_text

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
MODEL = "gemini-2.0-flash"


def generate_post_ideas(context=None):
    """Generate content ideas based on your profile and job search."""
    context = context or {}
    profile = get_profile()

    prompt = f"""Generate 5 social media post ideas for {profile['name']}.

About them: {profile['headline']}

Content voice: {profile.get('content_voice', 'Professional but approachable')}
Preferred topics: {profile.get('content_topics', ['Career growth', 'Tech'])}
Platforms: {profile.get('platforms', ['LinkedIn'])}
Current job targets: {context.get('recent_applications', 'N/A')}

For each post, provide:
1. Platform (LinkedIn or Instagram)
2. Post title/hook (make it scroll-stopping)
3. Brief outline (3-4 bullet points)
4. Best posting day/time

Format as JSON array. Make these feel authentic to someone who actually builds things, not generic career advice."""

    response = client.models.generate_content(model=MODEL, contents=prompt)
    db.log_activity("content_engine", "generated_ideas", "Generated 5 post ideas")
    return response.text


def draft_post(platform, topic, context=None):
    """Draft a full post in your voice."""
    profile = get_profile()

    platform_guidance = {
        "linkedin": "Professional but real. 1300 chars max. Hook in first line. Line breaks for readability. End with a question.",
        "instagram": "Casual, visual-first. 200 words max. Light emoji use. 5-10 hashtags. Storytelling angle.",
    }

    prompt = f"""Write a {platform} post for {profile['name']} about: {topic}

Their voice: {profile.get('content_voice', 'Knowledgeable but approachable')}
Their background: {profile['headline']}
Style: {platform_guidance.get(platform.lower(), platform_guidance['linkedin'])}

Write ONLY the post content, ready to publish. Sound like a real person sharing real experience, not an AI."""

    response = client.models.generate_content(model=MODEL, contents=prompt)
    db.add_content(platform, topic, response.text, "draft")
    db.log_activity("content_engine", "drafted_post", f"{platform}: {topic}")
    return response.text


def run_content_engine():
    """Execute a full Content Engine cycle."""
    run_id = db.start_run("content_engine")

    try:
        task_id = db.add_task(run_id, "content_engine", "Loading profile and checking job pipeline")
        profile = get_profile()
        jobs = db.get_jobs()
        target_companies = [j["company"] for j in jobs if j["stage"] in ("applied", "interview")]
        db.complete_task(task_id, "done", f"Profile loaded, {len(target_companies)} active job targets")

        task_id = db.add_task(run_id, "content_engine", "Generating post ideas aligned with your brand")
        context = {"recent_applications": ", ".join(target_companies) if target_companies else "None yet"}
        ideas = generate_post_ideas(context)
        db.complete_task(task_id, "done", "Generated 5 ideas")

        task_id = db.add_task(run_id, "content_engine", "Drafting top-priority post")
        topics = profile.get("content_topics", ["Building things as a marketer"])
        post = draft_post("linkedin", topics[0], context)
        db.complete_task(task_id, "done", "Post drafted and added to queue")

        db.finish_run(run_id, "done", "Generated ideas and drafted 1 post")

    except Exception as e:
        db.finish_run(run_id, "error", error=str(e))
        db.log_activity("content_engine", "error", str(e))
        raise
