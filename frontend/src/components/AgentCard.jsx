import React from 'react';
import StatusBadge from './StatusBadge';
import AgentSprite from './AgentSprite';

const AGENT_META = {
  content_engine: { icon: '◈', accent: '#10b981', accentBg: 'rgba(16,185,129,0.08)', name: 'Content Engine', role: 'Social Media Agent' },
  job_radar:      { icon: '◉', accent: '#3b82f6', accentBg: 'rgba(59,130,246,0.08)', name: 'Job Radar', role: 'Job Hunter Agent' },
  signal_boost:   { icon: '◆', accent: '#f59e0b', accentBg: 'rgba(245,158,11,0.08)', name: 'Signal Boost', role: 'Personal Brand Agent' },
};

export default function AgentCard({ agentId, data, isSelected, onClick, onTrigger }) {
  const meta = AGENT_META[agentId] || AGENT_META.content_engine;
  const lastRun = data?.last_run;
  const taskCount = data?.recent_tasks?.length || 0;
  const status = lastRun?.status === 'running' ? 'active' : lastRun ? 'idle' : 'idle';

  return (
    <div
      onClick={onClick}
      style={{
        background: isSelected ? meta.accentBg : 'var(--bg-secondary)',
        border: `1px solid ${isSelected ? meta.accent + '40' : 'var(--border)'}`,
        borderRadius: 12,
        padding: '16px 18px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 20, color: meta.accent }}>{meta.icon}</span>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
              {meta.name}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              {meta.role}
            </div>
          </div>
        </div>
        <StatusBadge status={status} />
      </div>

      <AgentSprite color={meta.accent} status={status} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
        <div style={{ display: 'flex', gap: 16, fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          <span>Tasks: {taskCount}</span>
          {lastRun?.started_at && (
            <span>Last: {new Date(lastRun.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          )}
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onTrigger(agentId); }}
          style={{
            background: meta.accent + '20',
            border: `1px solid ${meta.accent}40`,
            borderRadius: 6,
            padding: '4px 10px',
            fontSize: 10,
            fontWeight: 700,
            color: meta.accent,
            fontFamily: 'var(--font-mono)',
            letterSpacing: '0.04em',
          }}
        >
          RUN ▶
        </button>
      </div>
    </div>
  );
}

export { AGENT_META };
