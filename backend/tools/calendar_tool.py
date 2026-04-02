"""Google Calendar Tool — Create and list events.

Uses the same OAuth credentials as Gmail.
Enable Google Calendar API in your Cloud Console project.
"""

import os
from datetime import datetime, timedelta
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build

SCOPES = ["https://www.googleapis.com/auth/calendar"]
CREDS_PATH = os.path.join(os.path.dirname(__file__), "..", "config", "credentials.json")
TOKEN_PATH = os.path.join(os.path.dirname(__file__), "..", "config", "calendar_token.json")


def get_calendar_service():
    """Authenticate and return Calendar API service."""
    creds = None
    if os.path.exists(TOKEN_PATH):
        creds = Credentials.from_authorized_user_file(TOKEN_PATH, SCOPES)
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            if not os.path.exists(CREDS_PATH):
                raise FileNotFoundError(
                    f"Missing {CREDS_PATH}. Download OAuth credentials from Google Cloud Console."
                )
            flow = InstalledAppFlow.from_client_secrets_file(CREDS_PATH, SCOPES)
            creds = flow.run_local_server(port=0)
        with open(TOKEN_PATH, "w") as f:
            f.write(creds.to_json())
    return build("calendar", "v3", credentials=creds)


def create_event(summary: str, start_time: str, duration_minutes: int = 60, description: str = "") -> dict:
    """Create a calendar event.

    Args:
        summary: Event title
        start_time: ISO format datetime string (e.g., "2026-04-02T14:00:00")
        duration_minutes: Duration in minutes
        description: Optional event description
    """
    service = get_calendar_service()
    start = datetime.fromisoformat(start_time)
    end = start + timedelta(minutes=duration_minutes)

    event = {
        "summary": summary,
        "description": description,
        "start": {"dateTime": start.isoformat(), "timeZone": "America/New_York"},
        "end": {"dateTime": end.isoformat(), "timeZone": "America/New_York"},
    }

    result = service.events().insert(calendarId="primary", body=event).execute()
    return {"id": result["id"], "link": result.get("htmlLink", "")}


def list_upcoming_events(max_results: int = 10) -> list:
    """List upcoming calendar events."""
    service = get_calendar_service()
    now = datetime.utcnow().isoformat() + "Z"

    result = service.events().list(
        calendarId="primary",
        timeMin=now,
        maxResults=max_results,
        singleEvents=True,
        orderBy="startTime",
    ).execute()

    events = []
    for event in result.get("items", []):
        start = event["start"].get("dateTime", event["start"].get("date"))
        events.append({
            "id": event["id"],
            "summary": event.get("summary", "No title"),
            "start": start,
            "description": event.get("description", ""),
        })
    return events
