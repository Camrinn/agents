import React from 'react';
import StatusBadge from './StatusBadge';

export default function TaskList({ tasks = [], accent = '#3b82f6' }) {
  if (!tasks.length) {
    return (
      <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
        No tasks yet. Hit the RUN button to trigger this agent.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {tasks.map((t, i) => (
        <div
          key={t.id || i}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '10px 14px',
            background: 'var(--bg-secondary)',
            borderRadius: 8,
            borderLeft: `2px solid ${t.status === 'running' ? accent : t.status === 'done' ? accent + '60' : 'var(--border)'}`,
            animation: 'fadeIn 0.3s ease-out',
            animationDelay: `${i * 50}ms`,
            animationFillMode: 'backwards',
          }}
        >
          <div style={{ flex: 1 }}>
            <div style={{
              fontSize: 13,
              color: t.status === 'queued' ? 'var(--text-muted)' : 'var(--text-secondary)',
              lineHeight: 1.4,
            }}>
              {t.description}
            </div>
            {t.result && (
              <div style={{
                fontSize: 11,
                color: 'var(--text-dim)',
                fontFamily: 'var(--font-mono)',
                marginTop: 4,
              }}>
                → {t.result}
              </div>
            )}
          </div>
          <div style={{
            fontSize: 11,
            color: 'var(--text-dim)',
            fontFamily: 'var(--font-mono)',
            minWidth: 64,
            textAlign: 'right',
          }}>
            {t.completed_at
              ? new Date(t.completed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : '—'}
          </div>
          <StatusBadge status={t.status} />
        </div>
      ))}
    </div>
  );
}
