import React, { useState } from 'react';

const STATUS_OPTIONS = ['idea', 'draft', 'scheduled', 'posted'];

const STATUS_COLORS = {
  idea:      '#64748b',
  draft:     '#f59e0b',
  scheduled: '#3b82f6',
  posted:    '#10b981',
};

const NEXT_ACTION = {
  idea:      { label: 'MARK DRAFT', next: 'draft' },
  draft:     { label: 'MARK POSTED', next: 'posted' },
  scheduled: { label: 'MARK POSTED', next: 'posted' },
  posted:    null,
};

export default function Content({ content = [], onUpdateContent }) {
  const [expanded, setExpanded] = useState(null);
  const [updating, setUpdating] = useState(null);

  const handleStatusChange = async (contentId, newStatus) => {
    setUpdating(contentId);
    await onUpdateContent(contentId, newStatus);
    setUpdating(null);
  };

  return (
    <div>
      <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 6 }}>
        Content Queue
      </div>
      <div style={{ fontSize: 12.5, color: 'var(--text-muted)', marginBottom: 16 }}>
        Managed by Content Engine — expand to read, update status when published
      </div>

      {content.length === 0 ? (
        <div style={{ padding: '32px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
          No content in queue yet. Run the Content Engine to generate post ideas.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {content.map((c, i) => {
            const isExpanded = expanded === c.id;
            const isUpdating = updating === c.id;
            const action = NEXT_ACTION[c.status];

            return (
              <div key={c.id || i} style={{
                background: 'var(--bg-secondary)',
                borderRadius: 8,
                border: '1px solid var(--border)',
                overflow: 'hidden',
              }}>
                {/* Main row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px' }}>
                  <span style={{
                    fontSize: 10,
                    fontWeight: 700,
                    fontFamily: 'var(--font-mono)',
                    color: c.platform?.toLowerCase() === 'linkedin' ? '#0a66c2' : '#e1306c',
                    background: c.platform?.toLowerCase() === 'linkedin' ? 'rgba(10,102,194,0.1)' : 'rgba(225,48,108,0.1)',
                    padding: '3px 8px',
                    borderRadius: 4,
                    minWidth: 60,
                    textAlign: 'center',
                    flexShrink: 0,
                  }}>
                    {(c.platform || 'N/A').toUpperCase()}
                  </span>

                  <div style={{ flex: 1, minWidth: 0, fontSize: 13, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {c.title}
                  </div>

                  <div style={{ fontSize: 11, color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', flexShrink: 0 }}>
                    {c.scheduled_for || (c.updated_at ? new Date(c.updated_at).toLocaleDateString() : '—')}
                  </div>

                  {/* Status selector */}
                  <select
                    value={c.status || 'idea'}
                    disabled={isUpdating}
                    onChange={(e) => handleStatusChange(c.id, e.target.value)}
                    style={{
                      background: 'rgba(0,0,0,0.4)',
                      border: `1px solid ${STATUS_COLORS[c.status] || '#64748b'}40`,
                      borderRadius: 5,
                      padding: '3px 8px',
                      fontSize: 10,
                      fontWeight: 700,
                      fontFamily: 'var(--font-mono)',
                      color: STATUS_COLORS[c.status] || '#94a3b8',
                      letterSpacing: '0.06em',
                      cursor: isUpdating ? 'wait' : 'pointer',
                      outline: 'none',
                      flexShrink: 0,
                      textTransform: 'uppercase',
                    }}
                  >
                    {STATUS_OPTIONS.map(s => (
                      <option key={s} value={s} style={{ background: '#0d1117', color: '#e2e8f0', textTransform: 'uppercase' }}>
                        {s.toUpperCase()}
                      </option>
                    ))}
                  </select>

                  {/* Quick action button */}
                  {action && (
                    <button
                      disabled={isUpdating}
                      onClick={() => handleStatusChange(c.id, action.next)}
                      style={{
                        background: action.next === 'posted' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
                        border: `1px solid ${action.next === 'posted' ? 'rgba(16,185,129,0.25)' : 'rgba(245,158,11,0.25)'}`,
                        borderRadius: 5,
                        padding: '3px 10px',
                        fontSize: 10,
                        fontWeight: 700,
                        color: action.next === 'posted' ? 'var(--accent-green)' : 'var(--accent-yellow)',
                        fontFamily: 'var(--font-mono)',
                        letterSpacing: '0.06em',
                        flexShrink: 0,
                        cursor: isUpdating ? 'wait' : 'pointer',
                      }}
                    >
                      {action.label}
                    </button>
                  )}

                  {/* Expand toggle — only if there's body content */}
                  {c.body && (
                    <button
                      onClick={() => setExpanded(isExpanded ? null : c.id)}
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
                      {isExpanded ? 'HIDE ▲' : 'READ ▼'}
                    </button>
                  )}
                </div>

                {/* Body content panel */}
                {isExpanded && c.body && (
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
                      {c.platform?.toUpperCase()} — {c.title}
                    </div>
                    <pre style={{
                      fontSize: 13,
                      color: 'var(--text-secondary)',
                      fontFamily: 'var(--font-body)',
                      lineHeight: 1.75,
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      margin: 0,
                    }}>
                      {c.body}
                    </pre>
                    <button
                      onClick={() => navigator.clipboard.writeText(c.body)}
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
