import React, { useState } from 'react';

const STAGES = ['discovered', 'applied', 'follow-up', 'interview', 'offer', 'rejected'];

const STAGE_COLORS = {
  discovered: '#f59e0b',
  applied:    '#3b82f6',
  'follow-up':'#a855f7',
  interview:  '#10b981',
  offer:      '#10b981',
  rejected:   '#ef4444',
};

export default function Pipeline({ jobs = [], onUpdateJob }) {
  const [expanded, setExpanded] = useState(null);
  const [updating, setUpdating] = useState(null);

  const handleStageChange = async (jobId, newStage) => {
    setUpdating(jobId);
    await onUpdateJob(jobId, newStage);
    setUpdating(null);
  };

  return (
    <div>
      <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 6 }}>
        Job Pipeline
      </div>
      <div style={{ fontSize: 12.5, color: 'var(--text-muted)', marginBottom: 16 }}>
        Tracked by Job Radar — click a stage to update, expand to view application package
      </div>

      {jobs.length === 0 ? (
        <div style={{ padding: '32px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
          No jobs in pipeline yet. Run the Job Radar agent to start searching.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {jobs.map((j, i) => {
            const isExpanded = expanded === j.id;
            const isUpdating = updating === j.id;

            return (
              <div key={j.id || i} style={{
                background: 'var(--bg-secondary)',
                borderRadius: 8,
                border: '1px solid var(--border)',
                overflow: 'hidden',
                animation: 'fadeIn 0.3s ease-out',
                animationDelay: `${i * 40}ms`,
                animationFillMode: 'backwards',
              }}>
                {/* Main row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)' }}>{j.company}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{j.role}</div>
                  </div>

                  {j.url && (
                    <a
                      href={j.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontSize: 11, color: 'var(--accent-blue)', fontFamily: 'var(--font-mono)', textDecoration: 'none', flexShrink: 0 }}
                    >
                      Link ↗
                    </a>
                  )}

                  <div style={{ fontSize: 11, color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', flexShrink: 0 }}>
                    {j.updated_at ? new Date(j.updated_at).toLocaleDateString() : '—'}
                  </div>

                  {/* Stage selector */}
                  <select
                    value={j.stage || 'discovered'}
                    disabled={isUpdating}
                    onChange={(e) => handleStageChange(j.id, e.target.value)}
                    style={{
                      background: 'rgba(0,0,0,0.4)',
                      border: `1px solid ${STAGE_COLORS[j.stage] || '#64748b'}40`,
                      borderRadius: 5,
                      padding: '3px 8px',
                      fontSize: 10,
                      fontWeight: 700,
                      fontFamily: 'var(--font-mono)',
                      color: STAGE_COLORS[j.stage] || '#94a3b8',
                      letterSpacing: '0.06em',
                      cursor: isUpdating ? 'wait' : 'pointer',
                      outline: 'none',
                      flexShrink: 0,
                      textTransform: 'uppercase',
                    }}
                  >
                    {STAGES.map(s => (
                      <option key={s} value={s} style={{ background: '#0d1117', color: '#e2e8f0', textTransform: 'uppercase' }}>
                        {s.toUpperCase()}
                      </option>
                    ))}
                  </select>

                  {/* Expand toggle — only if there's a package */}
                  {j.notes && (
                    <button
                      onClick={() => setExpanded(isExpanded ? null : j.id)}
                      style={{
                        background: isExpanded ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: 5,
                        padding: '3px 10px',
                        fontSize: 10,
                        fontWeight: 700,
                        color: isExpanded ? 'var(--accent-blue)' : 'var(--text-muted)',
                        fontFamily: 'var(--font-mono)',
                        flexShrink: 0,
                      }}
                    >
                      {isExpanded ? 'HIDE ▲' : 'PACKAGE ▼'}
                    </button>
                  )}
                </div>

                {/* Application package panel */}
                {isExpanded && j.notes && (
                  <div style={{
                    borderTop: '1px solid var(--border)',
                    padding: '16px 14px',
                    background: 'rgba(0,0,0,0.2)',
                  }}>
                    <div style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: 'var(--text-dim)',
                      letterSpacing: '0.1em',
                      fontFamily: 'var(--font-mono)',
                      marginBottom: 10,
                      textTransform: 'uppercase',
                    }}>
                      Application Package — {j.company} / {j.role}
                    </div>
                    <pre style={{
                      fontSize: 12,
                      color: 'var(--text-secondary)',
                      fontFamily: 'var(--font-mono)',
                      lineHeight: 1.7,
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      margin: 0,
                    }}>
                      {j.notes}
                    </pre>
                    <button
                      onClick={() => navigator.clipboard.writeText(j.notes)}
                      style={{
                        marginTop: 12,
                        background: 'rgba(59,130,246,0.1)',
                        border: '1px solid rgba(59,130,246,0.25)',
                        borderRadius: 5,
                        padding: '5px 12px',
                        fontSize: 10,
                        fontWeight: 700,
                        color: 'var(--accent-blue)',
                        fontFamily: 'var(--font-mono)',
                        letterSpacing: '0.06em',
                      }}
                    >
                      COPY TO CLIPBOARD
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
