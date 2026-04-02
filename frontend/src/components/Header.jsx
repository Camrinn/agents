import React, { useState, useEffect } from 'react';

export default function Header({ connected }) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{
      padding: '18px 28px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottom: '1px solid var(--border)',
      background: 'rgba(8,10,16,0.9)',
      backdropFilter: 'blur(12px)',
      position: 'sticky',
      top: 0,
      zIndex: 10,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{
          width: 10,
          height: 10,
          borderRadius: '50%',
          background: connected ? '#10b981' : '#ef4444',
          boxShadow: `0 0 10px ${connected ? 'rgba(16,185,129,0.4)' : 'rgba(239,68,68,0.4)'}`,
          animation: connected ? 'none' : 'pulse 1.5s ease-in-out infinite',
        }} />
        <div>
          <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-0.03em' }}>
            AGENT COMMAND CENTER
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
            {connected ? '3 agents · local runtime · gemini-2.0-flash' : 'Connecting to backend...'}
          </div>
        </div>
      </div>
      <div style={{
        fontSize: 13,
        fontFamily: 'var(--font-mono)',
        color: 'var(--text-muted)',
        letterSpacing: '0.04em',
      }}>
        {time.toLocaleTimeString()} · {time.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
      </div>
    </div>
  );
}
