import React from 'react';

const STATUS_MAP = {
  active:     { bg: 'rgba(16,185,129,0.12)',  color: '#10b981', label: 'ACTIVE' },
  idle:       { bg: 'rgba(100,116,139,0.12)', color: '#94a3b8', label: 'IDLE' },
  running:    { bg: 'rgba(59,130,246,0.12)',  color: '#3b82f6', label: 'RUNNING' },
  done:       { bg: 'rgba(16,185,129,0.1)',   color: '#10b981', label: '✓ DONE' },
  error:      { bg: 'rgba(239,68,68,0.12)',   color: '#ef4444', label: 'ERROR' },
  queued:     { bg: 'rgba(100,116,139,0.1)',  color: '#64748b', label: 'QUEUED' },
  applied:    { bg: 'rgba(59,130,246,0.12)',  color: '#3b82f6', label: 'APPLIED' },
  drafting:   { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b', label: 'DRAFTING' },
  'follow-up':{ bg: 'rgba(168,85,247,0.12)', color: '#a855f7', label: 'FOLLOW-UP' },
  interview:  { bg: 'rgba(16,185,129,0.12)',  color: '#10b981', label: 'INTERVIEW' },
  rejected:   { bg: 'rgba(239,68,68,0.1)',   color: '#ef4444', label: 'REJECTED' },
  offer:      { bg: 'rgba(16,185,129,0.15)', color: '#10b981', label: 'OFFER' },
  discovered: { bg: 'rgba(245,158,11,0.1)',  color: '#f59e0b', label: 'NEW' },
  scheduled:  { bg: 'rgba(59,130,246,0.1)',  color: '#3b82f6', label: 'SCHEDULED' },
  draft:      { bg: 'rgba(245,158,11,0.1)',  color: '#f59e0b', label: 'DRAFT' },
  idea:       { bg: 'rgba(100,116,139,0.1)', color: '#64748b', label: 'IDEA' },
  posted:     { bg: 'rgba(16,185,129,0.1)',  color: '#10b981', label: 'POSTED' },
};

export default function StatusBadge({ status }) {
  const s = STATUS_MAP[status] || STATUS_MAP.idle;
  return (
    <span style={{
      background: s.bg,
      color: s.color,
      fontSize: 10,
      fontWeight: 700,
      padding: '3px 8px',
      borderRadius: 4,
      letterSpacing: '0.06em',
      fontFamily: 'var(--font-mono)',
      whiteSpace: 'nowrap',
    }}>
      {s.label}
    </span>
  );
}
