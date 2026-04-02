import React from 'react';
import TaskList from '../components/TaskList';
import { AGENT_META } from '../components/AgentCard';

export default function Dashboard({ selectedAgent, agentData }) {
  const meta = AGENT_META[selectedAgent] || AGENT_META.content_engine;
  const data = agentData?.[selectedAgent];
  const tasks = data?.recent_tasks || [];

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <span style={{ fontSize: 22, color: meta.accent }}>{meta.icon}</span>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.02em' }}>{meta.name}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{meta.role} — recent activity</div>
        </div>
      </div>
      <TaskList tasks={tasks} accent={meta.accent} />
    </div>
  );
}
