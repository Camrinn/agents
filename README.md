# Agent Command Center

A free, locally-run AI agent system with three agents and a live dashboard.

## Agents

| Agent | Role | What it does |
|-------|------|-------------|
| **Content Engine** | Social Media | Drafts & schedules LinkedIn + Instagram posts |
| **Job Radar** | Job Hunter | Finds jobs, tailors resumes, applies, tracks pipeline |
| **Signal Boost** | Personal Brand | Networking, visibility, ties social content to job targets |

## Tech Stack (All Free)

- **LLM**: Google Gemini 2.0 Flash (free tier — 15 req/min)
- **Agent Framework**: CrewAI (open source)
- **Scheduler**: APScheduler (Python)
- **Dashboard**: React + Vite
- **Database**: SQLite
- **APIs**: Gmail, Google Calendar, LinkedIn

## Quick Start

### 1. Get your Gemini API key (free)

1. Go to https://aistudio.google.com/apikey
2. Click "Create API Key"
3. Copy it

### 2. Backend setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env and paste your Gemini API key
python main.py
```

### 3. Frontend setup

```bash
cd frontend
npm install
npm run dev
```

Dashboard opens at http://localhost:5173

### 4. Google API Setup (for Gmail + Calendar)

1. Go to https://console.cloud.google.com
2. Create a new project
3. Enable Gmail API and Google Calendar API
4. Create OAuth 2.0 credentials (Desktop app)
5. Download `credentials.json` and place in `backend/config/`
6. First run will open a browser for OAuth consent

## Project Structure

```
agent-command-center/
├── backend/
│   ├── main.py              # Entry point + scheduler
│   ├── server.py            # FastAPI server for dashboard
│   ├── database.py          # SQLite models + queries
│   ├── requirements.txt
│   ├── .env.example
│   ├── agents/
│   │   ├── content_engine.py    # Social media agent
│   │   ├── job_radar.py         # Job hunting agent
│   │   └── signal_boost.py      # Personal brand agent
│   ├── tools/
│   │   ├── gmail_tool.py        # Gmail API wrapper
│   │   ├── calendar_tool.py     # Google Calendar wrapper
│   │   ├── linkedin_tool.py     # LinkedIn posting
│   │   └── job_scraper.py       # Job board scraper
│   └── config/
│       └── credentials.json     # (you add this)
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── index.css
│       ├── lib/
│       │   └── api.js           # Backend API client
│       ├── components/
│       │   ├── AgentCard.jsx
│       │   ├── StatusBadge.jsx
│       │   ├── TaskList.jsx
│       │   └── Header.jsx
│       └── pages/
│           ├── Dashboard.jsx
│           ├── Pipeline.jsx
│           ├── Content.jsx
│           └── Architecture.jsx
└── README.md
```

## How It Works

1. **Scheduler** (APScheduler) triggers agents on a cron schedule or manual trigger
2. **Agents** (CrewAI) use Gemini for reasoning and your tool wrappers for actions
3. **Tools** call Gmail, Calendar, LinkedIn, and job board APIs
4. **Database** (SQLite) logs all activity, job pipeline state, and content queue
5. **Dashboard** (React) polls the FastAPI server to display live agent status

## Customization

- Edit agent goals/backstories in `backend/agents/`
- Adjust schedules in `backend/main.py`
- Add new tools in `backend/tools/`
- Modify dashboard in `frontend/src/`
