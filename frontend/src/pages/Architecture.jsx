import React from 'react';

const LAYERS = [
  { layer: 'Dashboard', desc: 'React + Vite on localhost:5173 — what you\'re looking at', color: '#e2e8f0' },
  { layer: 'API Server', desc: 'FastAPI on localhost:8000 — serves agent data, accepts triggers', color: '#c084fc' },
  { layer: 'Scheduler', desc: 'APScheduler — triggers agents on cron (8am, 9am, 10am daily)', color: '#a78bfa' },
  { layer: 'Agents', desc: 'CrewAI definitions — Content Engine, Job Radar, Signal Boost', color: '#60a5fa' },
  { layer: 'LLM Brain', desc: 'Google Gemini 2.0 Flash (free tier) — reasoning, writing, decisions', color: '#34d399' },
  { layer: 'Tools', desc: 'Gmail API, Google Calendar, LinkedIn, job board scrapers', color: '#fbbf24' },
  { layer: 'Storage', desc: 'SQLite — job pipeline, content queue, activity logs, agent runs', color: '#f87171' },
];

export default function Architecture() {
  return (
    <div>
      <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 6 }}>
        System Architecture
      </div>
      <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 20 }}>
        Everything runs locally on your machine. Zero cloud costs.
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {LAYERS.map((a, i) => (
          <div key={i}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              padding: '14px 16px',
              background: 'var(--bg-secondary)',
              borderRadius: 10,
              borderLeft: `3px solid ${a.color}`,
            }}>
              <div style={{
                fontSize: 10,
                fontWeight: 700,
                fontFamily: 'var(--font-mono)',
                color: a.color,
                minWidth: 90,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}>
                {a.layer}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {a.desc}
              </div>
            </div>
            {i < LAYERS.length - 1 && (
              <div style={{ textAlign: 'center', color: '#334155', fontSize: 14, lineHeight: '20px' }}>│</div>
            )}
          </div>
        ))}
      </div>

      <div style={{
        marginTop: 28,
        padding: '18px 20px',
        borderRadius: 10,
        background: 'rgba(99,102,241,0.06)',
        border: '1px solid rgba(99,102,241,0.15)',
      }}>
        <div style={{
          fontSize: 12,
          fontWeight: 700,
          color: '#818cf8',
          marginBottom: 10,
          fontFamily: 'var(--font-mono)',
        }}>
          SETUP CHECKLIST
        </div>
        <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.8 }}>
          {[
            '1. Get Gemini API key → aistudio.google.com/apikey (free)',
            '2. pip install -r requirements.txt in backend/',
            '3. Add key to backend/.env',
            '4. Set up Google OAuth → console.cloud.google.com',
            '5. Enable Gmail + Calendar APIs',
            '6. Download credentials.json → backend/config/',
            '7. python main.py (starts backend + scheduler)',
            '8. npm install && npm run dev in frontend/',
          ].map((step, i) => (
            <div key={i} style={{ padding: '2px 0' }}>{step}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
