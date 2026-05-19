import React, { useState } from 'react';
import { toast } from 'react-toastify';
import api from '../services/api';
import AIResultDisplay from '../components/AIResultDisplay';

const TOOLS = [
  {
    key: 'production-forecast',
    label: 'Production Forecast',
    icon: '≡',
    endpoint: '/ai/production-forecast',
    description: 'Forecast production by wrapping drill optimization with recent ProductionLog context.',
    fields: [
      { key: 'drillPatternId', label: 'Drill Pattern ID', type: 'text' },
      { key: 'lookbackDays', label: 'Lookback Days', type: 'number', placeholder: '30' },
    ],
  },
  {
    key: 'equipment-failure-predict',
    label: 'Equipment Failure Predict',
    icon: '⚙',
    endpoint: '/ai/equipment-failure-predict',
    description: 'Predict failure risk for an Equipment row.',
    fields: [
      { key: 'equipmentId', label: 'Equipment ID (optional)', type: 'text' },
    ],
  },
  {
    key: 'safety-risk-assess',
    label: 'Safety Risk Assess',
    icon: '⚠',
    endpoint: '/ai/safety-risk-assess',
    description: 'Assess safety risk with cluster context across recent incidents.',
    fields: [
      { key: 'incidentId', label: 'Incident ID (optional)', type: 'text' },
      { key: 'lookbackDays', label: 'Lookback Days', type: 'number', placeholder: '90' },
    ],
  },
  {
    key: 'cost-optimize',
    label: 'Cost Optimize',
    icon: '$',
    endpoint: '/ai/cost-optimize',
    description: 'Wrap analyzeCost with portfolio-level context across recent CostAnalysis rows.',
    fields: [
      { key: 'cost', label: 'Cost Snapshot (JSON, optional)', type: 'textarea', placeholder: '{"category":"fuel","amount":120000,"period":"2026-Q1"}' },
    ],
  },
  {
    key: 'environmental-risk',
    label: 'Environmental Risk',
    icon: '🌿',
    endpoint: '/ai/environmental-risk',
    description: 'Assess environmental compliance risk with cluster context across recent reports.',
    fields: [
      { key: 'report', label: 'Report (JSON, optional)', type: 'textarea', placeholder: '{"area":"north_pit","findings":"elevated turbidity in runoff"}' },
    ],
  },
  {
    key: 'geology-interpret',
    label: 'Geology Interpret',
    icon: '⛏',
    endpoint: '/ai/geology-interpret',
    description: 'Interpret a geology survey (assay / borehole / lithology summary).',
    fields: [
      { key: 'survey', label: 'Survey (JSON or text) *', type: 'textarea', placeholder: '{"borehole":"BH-12","depth_m":[0,50,100],"lithology":["overburden","sandstone","ore_zone"],"assay":{"Cu_pct":[0.1,0.4,1.8]}}' },
    ],
  },
  // Apply pass 5 — backlog tools
  {
    key: 'mine-to-mill',
    label: 'Mine-to-Mill Coord',
    icon: '⚒',
    endpoint: '/ai/mine-to-mill',
    description: 'Coordinate upstream mining with downstream mill: scheduling, blending, throughput.',
    fields: [
      { key: 'upstream', label: 'Upstream (JSON, optional)', type: 'textarea', placeholder: '{"mine_throughput_tph":600,"ore_grade_pct":0.62}' },
      { key: 'downstream', label: 'Downstream (JSON, optional)', type: 'textarea', placeholder: '{"processor":"crusher_A","target_throughput_tph":650}' },
      { key: 'constraints', label: 'Constraints (JSON, optional)', type: 'textarea', placeholder: '{"max_blend_variance_pct":5,"shift_hours":8}' },
    ],
  },
  {
    key: 'safety-anomaly-detect',
    label: 'Safety Anomaly Detect',
    icon: '🛑',
    endpoint: '/ai/safety-anomaly-detect',
    description: 'Detect anomaly clusters in recent safety incidents (synchronous fallback).',
    fields: [
      { key: 'window_size', label: 'Window Size', type: 'number', placeholder: '30' },
    ],
  },
  {
    key: 'regulatory-incident-report',
    label: 'Regulatory Incident Report',
    icon: '📜',
    endpoint: '/ai/regulatory-incident-report',
    description: 'Draft a regulatory notice for a safety incident (default jurisdiction MSHA).',
    fields: [
      { key: 'incident_id', label: 'Incident ID (optional)', type: 'text' },
      { key: 'jurisdiction', label: 'Jurisdiction', type: 'text', placeholder: 'MSHA' },
    ],
  },
  {
    key: 'gps-telematics',
    label: 'GPS Telematics',
    icon: '📡',
    endpoint: '/ai/gps-telematics',
    description: 'Fleet/equipment GPS lookup (requires GPS_TELEMATICS_API_KEY).',
    fields: [
      { key: 'equipment_id', label: 'Equipment ID', type: 'text' },
      { key: 'mode', label: 'Mode', type: 'text', placeholder: 'snapshot' },
    ],
  },
  {
    key: 'drone-survey-ingest',
    label: 'Drone Survey Ingest',
    icon: '🚁',
    endpoint: '/ai/drone-survey-ingest',
    description: 'Drone imagery / lab assay ingest (requires DRONE_SURVEY_API_KEY).',
    fields: [
      { key: 'survey_id', label: 'Survey ID', type: 'text' },
      { key: 'mode', label: 'Mode', type: 'text', placeholder: 'imagery' },
    ],
  },
];

function AIToolsPage() {
  const [activeKey, setActiveKey] = useState(TOOLS[0].key);
  const [inputs, setInputs] = useState({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const tool = TOOLS.find(t => t.key === activeKey);

  const setField = (key, value) =>
    setInputs(prev => ({ ...prev, [key]: value }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const payload = {};
      tool.fields.forEach(f => {
        const v = inputs[f.key];
        if (v === undefined || v === '') return;
        if (f.type === 'number') {
          payload[f.key] = Number(v);
        } else if (f.type === 'textarea') {
          // Try JSON, otherwise pass as raw string.
          try { payload[f.key] = JSON.parse(v); } catch { payload[f.key] = v; }
        } else {
          payload[f.key] = v;
        }
      });
      const res = await api.post(tool.endpoint, payload);
      setResult(res.data);
      toast.success(`${tool.label} completed`);
    } catch (err) {
      const status = err?.response?.status;
      const baseMsg = err?.response?.data?.error || err.message || 'Request failed';
      const msg = status === 503 ? `AI service unavailable (503): ${baseMsg}` : baseMsg;
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container" style={{ padding: 20 }}>
      <h1 style={{ marginBottom: 4 }}>AI Tools</h1>
      <p style={{ color: '#94a3b8', marginBottom: 20 }}>
        Run namespaced AI flows: production forecast, equipment failure prediction, safety risk assessment.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12, marginBottom: 24 }}>
        {TOOLS.map(t => {
          const active = t.key === activeKey;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => { setActiveKey(t.key); setInputs({}); setResult(null); setError(null); }}
              style={{
                textAlign: 'left',
                padding: 16,
                border: active ? '2px solid #3b82f6' : '1px solid #334155',
                background: active ? 'rgba(59,130,246,0.1)' : '#1e293b',
                borderRadius: 8,
                cursor: 'pointer',
                color: '#e2e8f0',
              }}
            >
              <div style={{ fontSize: 24 }}>{t.icon}</div>
              <div style={{ fontWeight: 600, marginTop: 4 }}>{t.label}</div>
              <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>{t.description}</div>
            </button>
          );
        })}
      </div>

      <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, padding: 20, maxWidth: 760 }}>
        <h2 style={{ marginBottom: 4 }}>{tool.icon} {tool.label}</h2>
        <p style={{ color: '#94a3b8', marginBottom: 16 }}>{tool.description}</p>
        <form onSubmit={submit}>
          {tool.fields.map(field => (
            <div key={field.key} style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontWeight: 600, fontSize: 13, marginBottom: 4 }}>
                {field.label}
              </label>
              {field.type === 'textarea' ? (
                <textarea
                  value={inputs[field.key] || ''}
                  onChange={e => setField(field.key, e.target.value)}
                  placeholder={field.placeholder || ''}
                  rows={6}
                  style={{ width: '100%', padding: 8, background: '#0f172a', color: '#e2e8f0', border: '1px solid #334155', borderRadius: 6, fontFamily: 'monospace', fontSize: 12 }}
                />
              ) : (
                <input
                  type={field.type || 'text'}
                  value={inputs[field.key] || ''}
                  onChange={e => setField(field.key, e.target.value)}
                  placeholder={field.placeholder || ''}
                  style={{ width: '100%', padding: 8, background: '#0f172a', color: '#e2e8f0', border: '1px solid #334155', borderRadius: 6 }}
                />
              )}
            </div>
          ))}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: 12,
              fontSize: 14,
              background: loading ? '#475569' : '#3b82f6',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              cursor: loading ? 'not-allowed' : 'pointer',
              marginTop: 8,
            }}
          >
            {loading ? 'Running…' : `Run ${tool.label}`}
          </button>
        </form>

        {error && (
          <div style={{ marginTop: 16, padding: 12, background: 'rgba(239,68,68,0.1)', border: '1px solid #ef4444', color: '#fecaca', borderRadius: 6 }}>
            {String(error)}
          </div>
        )}

        {result && (
          <div style={{ marginTop: 24 }}>
            <AIResultDisplay
              entityType={tool.key}
              parsed={result.parsed || result}
              rawText={typeof result.text === 'string' ? result.text : ''}
            />
            <details style={{ marginTop: 12 }}>
              <summary style={{ cursor: 'pointer', color: '#94a3b8', fontSize: 13 }}>Show raw JSON</summary>
              <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: 12, color: '#e2e8f0', background: '#0f172a', padding: 12, borderRadius: 6, marginTop: 8 }}>
                {JSON.stringify(result, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </div>
    </div>
  );
}

export default AIToolsPage;
