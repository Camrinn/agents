"""Job Scraper — Find job listings from various sources.

Uses free APIs and web scraping for job boards.
"""

import os
import json
import httpx
from bs4 import BeautifulSoup
from google import genai

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
MODEL = "gemini-2.0-flash"


def search_remotive(query="software engineer", limit=10):
    """Search Remotive API for remote jobs (free, no auth needed)."""
    try:
        response = httpx.get(
            "https://remotive.com/api/remote-jobs",
            params={"search": query, "limit": limit},
            timeout=15,
        )
        if response.status_code == 200:
            data = response.json()
            jobs = []
            for job in data.get("jobs", [])[:limit]:
                jobs.append({
                    "title": job.get("title", ""),
                    "company": job.get("company_name", ""),
                    "url": job.get("url", ""),
                    "category": job.get("category", ""),
                    "tags": job.get("tags", []),
                    "salary": job.get("salary", "Not listed"),
                    "date": job.get("publication_date", ""),
                })
            return jobs
    except Exception as e:
        return [{"error": str(e)}]
    return []


def analyze_job_fit(job, skills, preferences):
    """Use Gemini to analyze how well a job matches the user's profile."""
    prompt = f"""Analyze this job listing for fit:

Job: {job.get('title', 'Unknown')} at {job.get('company', 'Unknown')}
Tags/Skills required: {job.get('tags', [])}
Category: {job.get('category', 'N/A')}

My skills: {skills}
My preferences: {json.dumps(preferences)}

Rate the fit from 1-10 and explain in 2 sentences.
Format: {{"score": N, "reason": "..."}}
Return ONLY the JSON."""

    response = client.models.generate_content(model=MODEL, contents=prompt)
    try:
        text = response.text.strip().replace("```json", "").replace("```", "")
        return json.loads(text)
    except (json.JSONDecodeError, AttributeError):
        return {"score": 5, "reason": "Could not analyze fit automatically"}


def scrape_job_page(url):
    """Fetch and extract text content from a job listing page."""
    try:
        response = httpx.get(url, timeout=15, follow_redirects=True)
        if response.status_code == 200:
            soup = BeautifulSoup(response.text, "html.parser")
            for tag in soup(["script", "style", "nav", "footer", "header"]):
                tag.decompose()
            text = soup.get_text(separator="\n", strip=True)
            return text[:3000]
    except Exception as e:
        return f"Error fetching page: {e}"
    return "Could not fetch job page"
