"""Load user profile from config/profile.yaml"""

import os
import yaml

PROFILE_PATH = os.path.join(os.path.dirname(__file__), "config", "profile.yaml")

_profile = None


def get_profile():
    """Load and cache the user profile."""
    global _profile
    if _profile is None:
        if not os.path.exists(PROFILE_PATH):
            raise FileNotFoundError(
                f"Missing {PROFILE_PATH}. Copy profile.yaml.example and fill in your info."
            )
        with open(PROFILE_PATH, "r") as f:
            _profile = yaml.safe_load(f)
    return _profile


def get_resume_text():
    """Return a formatted resume string for AI context."""
    p = get_profile()
    lines = [
        f"{p['name']} — {p['headline']}",
        f"{p['location']} | {p['email']} | {p.get('website', '')}",
        "",
        "SKILLS",
    ]
    for category, skills in p.get("skills", {}).items():
        lines.append(f"  {category.title()}: {', '.join(skills)}")

    lines.append("\nEXPERIENCE")
    for job in p.get("experience", []):
        lines.append(f"\n  {job['title']} — {job['company']} ({job['dates']})")
        for h in job.get("highlights", []):
            lines.append(f"    • {h}")

    lines.append(f"\nEDUCATION: {p.get('education', 'N/A')}")
    lines.append(f"CERTIFICATIONS: {p.get('certifications', 'N/A')}")

    return "\n".join(lines)


def get_application_answers():
    """Return standard application answers dict."""
    p = get_profile()
    return p.get("application_answers", {})


def get_target_roles():
    """Return list of target role titles."""
    p = get_profile()
    return p.get("target_roles", ["Software Engineer"])


def get_target_companies():
    """Return list of target companies (may be empty)."""
    p = get_profile()
    return p.get("target_companies", [])
