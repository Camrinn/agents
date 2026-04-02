"""LinkedIn Tool — Post content and manage connections.

NOTE: LinkedIn's API has strict access requirements.
For personal use, you have two practical options:

Option A: LinkedIn API (recommended for posting)
1. Create a LinkedIn app at https://www.linkedin.com/developers/
2. Request "Share on LinkedIn" permission
3. Use OAuth 2.0 to authenticate

Option B: Browser automation (for connection requests)
- Use Playwright or Selenium (use responsibly, respect rate limits)
- LinkedIn may restrict accounts that automate too aggressively

This file provides the API approach. Expand as needed.
"""

import httpx
import os

LINKEDIN_ACCESS_TOKEN = os.getenv("LINKEDIN_ACCESS_TOKEN", "")


def post_to_linkedin(text: str) -> dict:
    """Share a text post on LinkedIn.

    Requires a valid access token with w_member_social scope.
    """
    if not LINKEDIN_ACCESS_TOKEN:
        return {"status": "skipped", "reason": "No LinkedIn access token configured"}

    # First, get the user's LinkedIn ID
    headers = {"Authorization": f"Bearer {LINKEDIN_ACCESS_TOKEN}"}

    profile_response = httpx.get("https://api.linkedin.com/v2/userinfo", headers=headers)
    if profile_response.status_code != 200:
        return {"status": "error", "reason": f"Failed to get profile: {profile_response.status_code}"}

    user_id = profile_response.json().get("sub")

    # Create the post
    post_data = {
        "author": f"urn:li:person:{user_id}",
        "lifecycleState": "PUBLISHED",
        "specificContent": {
            "com.linkedin.ugc.ShareContent": {
                "shareCommentary": {"text": text},
                "shareMediaCategory": "NONE",
            }
        },
        "visibility": {"com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"},
    }

    response = httpx.post(
        "https://api.linkedin.com/v2/ugcPosts",
        json=post_data,
        headers={**headers, "Content-Type": "application/json"},
    )

    if response.status_code == 201:
        return {"status": "posted", "id": response.json().get("id")}
    else:
        return {"status": "error", "reason": response.text}


def get_profile_stats() -> dict:
    """Get basic profile stats (if available)."""
    if not LINKEDIN_ACCESS_TOKEN:
        return {"status": "skipped", "reason": "No LinkedIn access token configured"}

    headers = {"Authorization": f"Bearer {LINKEDIN_ACCESS_TOKEN}"}
    response = httpx.get("https://api.linkedin.com/v2/userinfo", headers=headers)

    if response.status_code == 200:
        data = response.json()
        return {
            "name": data.get("name", "Unknown"),
            "email": data.get("email", "Unknown"),
        }
    return {"status": "error", "reason": response.text}
