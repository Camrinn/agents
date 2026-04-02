import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import AgentCard from './components/AgentCard';
import DashboardPage from './pages/Dashboard';
import PipelinePage from './pages/Pipeline';
import ContentPage from './pages/Content';
import ArchitecturePage from './pages/Architecture';
import * as api from './lib/api';

const TABS = [
  { id: 'agents', label: 'Agent Activity' },
  { id: 'pipeline', label: 'Job Pipeline' },
  { id: 'content', label: 'Content Queue' },
  { id: 'arch', label: 'Architecture' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('agents');
  const [selectedAgent, setSelectedAgent] = useState('content_engine');
  const [agentData, setAgentData] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [content, setContent] = useState([]);
  const [connected, setConnected] = useState(false);

  const fetchData = useCallback(async () => {
    const [statusData, jobsData, contentData] = await Promise.all([
      api.getAgentStatus(),
      api.getJobs(),
      api.getContent(),
    ]);
    if (statusData) {
      setAgentData(statusData);
      setConnected(true);
    }
    if (jobsData) setJobs(jobsData);
    if (contentData) setContent(contentData);
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000); // Poll every 5s
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleTrigger = async (agentId) => {
    await api.triggerAgent(agentId);
    setTimeout(fetchData, 1000);
  };

  const handleUpdateJob = async (jobId, stage) => {
    await api.updateJob(jobId, stage);
    await fetchData();
  };

  const handleUpdateContent = async (contentId, status) => {
    await api.updateContent(contentId, status);
    await fetchData();
  };

  const agentIds = ['content_engine', 'job_radar', 'signal_boost'];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Subtle scanline texture */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none', zIndex: 0,
        background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.008) 2px, rgba(255,255,255,0.008) 4px)',
      }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <Header connected={connected} />

        <div style={{ display: 'flex', minHeight: 'calc(100vh - 62px)' }}>
          {/* Sidebar */}
          <div style={{
            width: 300,
            flexShrink: 0,
            borderRight: '1px solid var(--border)',
            padding: '18px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            background: 'rgba(255,255,255,0.01)',
          }}>
            <div style={{
              fontSize: 10,
              fontWeight: 700,
              color: 'var(--text-dim)',
              letterSpacing: '0.1em',
              fontFamily: 'var(--font-mono)',
              padding: '0 4px 8px',
              textTransform: 'uppercase',
            }}>
              Agents
            </div>

            {agentIds.map((id) => (
              <AgentCard
                key={id}
                agentId={id}
                data={agentData?.[id]}
                isSelected={selectedAgent === id}
                onClick={() => { setSelectedAgent(id); setActiveTab('agents'); }}
                onTrigger={handleTrigger}
              />
            ))}

            {/* Summary stats */}
            <div style={{
              marginTop: 'auto',
              padding: '14px 16px',
              borderRadius: 10,
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border)',
            }}>
              <div style={{
                fontSize: 10, fontWeight: 700, color: 'var(--text-dim)',
                letterSpacing: '0.08em', fontFamily: 'var(--font-mono)', marginBottom: 10,
              }}>
                TODAY'S SUMMARY
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {[
                  { label: 'Jobs in pipeline', value: jobs.length, color: 'var(--accent-blue)' },
                  { label: 'Content items', value: content.length, color: 'var(--accent-green)' },
                  { label: 'Backend', value: connected ? 'Online' : 'Offline', color: connected ? 'var(--accent-green)' : 'var(--accent-red)' },
                ].map((stat, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-secondary)' }}>
                    <span>{stat.label}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', color: stat.color }}>{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {!connected && (
              <div style={{
                padding: '12px 14px',
                borderRadius: 10,
                background: 'rgba(239,68,68,0.06)',
                border: '1px solid rgba(239,68,68,0.15)',
                fontSize: 12,
                color: '#f87171',
                lineHeight: 1.5,
              }}>
                Backend not connected. Run <code style={{ fontFamily: 'var(--font-mono)', background: 'rgba(0,0,0,0.3)', padding: '1px 4px', borderRadius: 3 }}>python main.py</code> in the backend folder.
              </div>
            )}
          </div>

          {/* Main content area */}
          <div style={{ flex: 1, padding: '18px 24px', overflow: 'auto' }}>
            {/* Tabs */}
            <div style={{
              display: 'flex', gap: 4, marginBottom: 20,
              borderBottom: '1px solid var(--border)', paddingBottom: 12,
            }}>
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    background: activeTab === tab.id ? 'rgba(255,255,255,0.06)' : 'transparent',
                    border: 'none',
                    borderRadius: 6,
                    padding: '7px 14px',
                    color: activeTab === tab.id ? 'var(--text-primary)' : 'var(--text-muted)',
                    fontSize: 12.5,
                    fontWeight: 600,
                    transition: 'all 0.15s ease',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Page content */}
            {activeTab === 'agents' && (
              <DashboardPage selectedAgent={selectedAgent} agentData={agentData} />
            )}
            {activeTab === 'pipeline' && <PipelinePage jobs={jobs} onUpdateJob={handleUpdateJob} />}
            {activeTab === 'content' && <ContentPage content={content} onUpdateContent={handleUpdateContent} />}
            {activeTab === 'arch' && <ArchitecturePage />}
          </div>
        </div>
      </div>
    </div>
  );
}
