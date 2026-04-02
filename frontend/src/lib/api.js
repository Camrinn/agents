/**
 * API client for Agent Command Center backend.
 * All endpoints are proxied through Vite dev server to localhost:8000.
 */

// In local dev, Vite proxies /api → localhost:8000 (see vite.config.js)
// In production (Vercel), set VITE_API_URL to your Render backend URL
const BASE = (import.meta.env.VITE_API_URL || '') + '/api';

async function fetchJSON(path, options = {}) {
  try {
    const res = await fetch(`${BASE}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error(`[API] ${path} failed:`, err);
    return null;
  }
}

/** Get agent status for all three agents */
export async function getAgentStatus() {
  return fetchJSON('/status');
}

/** Get recent activity feed */
export async function getActivity(limit = 50) {
  return fetchJSON(`/activity?limit=${limit}`);
}

/** Get job pipeline */
export async function getJobs() {
  return fetchJSON('/jobs');
}

/** Get content queue */
export async function getContent() {
  return fetchJSON('/content');
}

/** Trigger an agent manually */
export async function triggerAgent(agentId) {
  return fetchJSON(`/agents/${agentId}/run`, { method: 'POST' });
}

/** Add a job to the pipeline */
export async function addJob(company, role, url) {
  return fetchJSON('/jobs', {
    method: 'POST',
    body: JSON.stringify({ company, role, url }),
  });
}

/** Update a job's stage */
export async function updateJob(jobId, stage, notes) {
  return fetchJSON(`/jobs/${jobId}`, {
    method: 'PATCH',
    body: JSON.stringify({ stage, notes }),
  });
}

/** Add content to queue */
export async function addContent(platform, title, body) {
  return fetchJSON('/content', {
    method: 'POST',
    body: JSON.stringify({ platform, title, body }),
  });
}

/** Update content status */
export async function updateContent(contentId, status) {
  return fetchJSON(`/content/${contentId}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}
