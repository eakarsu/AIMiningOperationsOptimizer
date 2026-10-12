import NativeAIControls from '../components/NativeAIControls';
import useNativeAIRequest from '../components/useNativeAIRequest';
import FormattedAIReport from '../components/FormattedAIReport';
import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../services/api';

const PRESET_LABELS = ['Current shift', 'Planning review', 'Risk scenario'];
const recordSource = (endpoint, valueKey, label) => ({ endpoint, valueKey, label });

export const TOOLS = [
  {
    key: 'production-forecast',
    label: 'Production Forecast',
    icon: '≡',
    endpoint: '/ai/production-forecast',
    description: 'Forecast production by wrapping drill optimization with recent ProductionLog context.',
    fields: [
      { key: 'drillPatternId', label: 'Drill Pattern', type: 'select', source: recordSource('/drill-patterns', 'id', item => `${item.patternId} · ${item.blastZone}`) },
      { key: 'lookbackDays', label: 'Lookback Days', type: 'number', examples: ['30', '60', '90'] },
    ],
  },
  {
    key: 'equipment-failure-predict',
    label: 'Equipment Failure Predict',
    icon: '⚙',
    endpoint: '/ai/equipment-failure-predict',
    description: 'Predict failure risk for an Equipment row.',
    fields: [
      { key: 'equipmentId', label: 'Equipment (optional)', type: 'select', source: recordSource('/equipment', 'id', item => `${item.equipmentId} · ${item.name}`) },
    ],
  },
  {
    key: 'safety-risk-assess',
    label: 'Safety Risk Assess',
    icon: '⚠',
    endpoint: '/ai/safety-risk-assess',
    description: 'Assess safety risk with cluster context across recent incidents.',
    fields: [
      { key: 'incidentId', label: 'Incident (optional)', type: 'select', source: recordSource('/safety-incidents', 'id', item => `${item.incidentId} · ${item.severity} · ${item.location}`) },
      { key: 'lookbackDays', label: 'Lookback Days', type: 'number', examples: ['30', '60', '90'] },
    ],
  },
  {
    key: 'cost-optimize',
    label: 'Cost Optimize',
    icon: '$',
    endpoint: '/ai/cost-optimize',
    description: 'Wrap analyzeCost with portfolio-level context across recent CostAnalysis rows.',
    fields: [
      { key: 'cost', label: 'Cost Snapshot (JSON, optional)', type: 'textarea', examples: [
        '{"costId":"CST-DEMO-001","category":"Fuel","subcategory":"Diesel","amount":1240000,"budgeted":1100000,"period":"2026-Q3","zone":"All Zones","costPerTon":12.4}',
        '{"costId":"CST-DEMO-002","category":"Maintenance","subcategory":"Unplanned repairs","amount":185000,"budgeted":50000,"period":"2026-Q3","zone":"Zone B","costPerTon":1.85}',
        '{"costId":"CST-DEMO-003","category":"Processing","subcategory":"Electricity","amount":310000,"budgeted":290000,"period":"2026-Q3","zone":"Zone E","costPerTon":3.1}'
      ] },
    ],
  },
  {
    key: 'environmental-risk',
    label: 'Environmental Risk',
    icon: '🌿',
    endpoint: '/ai/environmental-risk',
    description: 'Assess environmental compliance risk with cluster context across recent reports.',
    fields: [
      { key: 'report', label: 'Report (JSON, optional)', type: 'textarea', examples: [
        '{"reportId":"ENV-DEMO-001","category":"Water Quality","parameter":"Turbidity","measuredValue":55,"unit":"NTU","regulatoryLimit":50,"location":"Settling Pond Overflow","findings":"Heavy rainfall preceded the exceedance."}',
        '{"reportId":"ENV-DEMO-002","category":"Noise","parameter":"Ambient Noise Level","measuredValue":72,"unit":"dB(A)","regulatoryLimit":70,"location":"Community Boundary East","findings":"Night-shift blasting coincided with the exceedance."}',
        '{"reportId":"ENV-DEMO-003","category":"Air Quality","parameter":"PM10","measuredValue":145,"unit":"µg/m³","regulatoryLimit":150,"location":"North Pit Boundary","findings":"Reading is near the operating limit; verify calibration and wind conditions."}'
      ] },
    ],
  },
  {
    key: 'geology-interpret',
    label: 'Geology Interpret',
    icon: '⛏',
    endpoint: '/ai/geology-interpret',
    description: 'Interpret a geology survey (assay / borehole / lithology summary).',
    fields: [
      { key: 'survey', label: 'Survey (JSON or text) *', type: 'textarea', required: true, examples: [
        '{"surveyId":"GEO-DEMO-001","borehole":"BH-12","depth_m":[0,50,100],"lithology":["overburden","sandstone","ore_zone"],"assay":{"Cu_pct":[0.1,0.4,1.8]},"confidence_pct":82}',
        '{"surveyId":"GEO-DEMO-002","location":"East Ridge","method":"diamond drilling","intervals":[{"from_m":20,"to_m":36,"rock":"banded iron formation","Fe_pct":48.2},{"from_m":36,"to_m":52,"rock":"hematite-magnetite","Fe_pct":57.6}],"confidence_pct":91}',
        '{"surveyId":"GEO-DEMO-003","location":"Deep Shaft","structural_feature":"plunging anticline","strike_deg":60,"dip_deg":80,"depth_range_m":[200,350],"dominant_mineral":"gold-sulfide","confidence_pct":65}'
      ] },
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
      { key: 'upstream', label: 'Upstream (JSON, optional)', type: 'textarea', examples: [
        '{"source":"North Pit","mine_throughput_tph":600,"ore_grade_pct":0.62,"stockpile_tons":8400}',
        '{"source":"South Pit","mine_throughput_tph":720,"ore_grade_pct":0.48,"stockpile_tons":11600}',
        '{"source":"East Ridge","mine_throughput_tph":510,"ore_grade_pct":0.71,"stockpile_tons":6200}'
      ] },
      { key: 'downstream', label: 'Downstream (JSON, optional)', type: 'textarea', examples: [
        '{"processor":"Primary Crusher A","target_throughput_tph":650,"availability_pct":92,"recovery_target_pct":88}',
        '{"processor":"SAG Mill 1","target_throughput_tph":700,"availability_pct":86,"recovery_target_pct":90}',
        '{"processor":"Crusher B","target_throughput_tph":560,"availability_pct":78,"recovery_target_pct":87}'
      ] },
      { key: 'constraints', label: 'Constraints (JSON, optional)', type: 'textarea', examples: [
        '{"max_blend_variance_pct":5,"shift_hours":8,"max_stockpile_draw_tons":4000}',
        '{"max_blend_variance_pct":4,"shift_hours":12,"planned_downtime_hours":2}',
        '{"max_blend_variance_pct":3,"shift_hours":8,"haul_capacity_tph":520,"maintenance_window":"14:00-16:00"}'
      ] },
    ],
  },
  {
    key: 'safety-anomaly-detect',
    label: 'Safety Anomaly Detect',
    icon: '🛑',
    endpoint: '/ai/safety-anomaly-detect',
    description: 'Detect anomaly clusters in recent safety incidents (synchronous fallback).',
    fields: [
      { key: 'window_size', label: 'Window Size', type: 'number', examples: ['30', '60', '90'] },
    ],
  },
  {
    key: 'regulatory-incident-report',
    label: 'Regulatory Incident Report',
    icon: '📜',
    endpoint: '/ai/regulatory-incident-report',
    description: 'Draft a regulatory notice for a safety incident (default jurisdiction MSHA).',
    fields: [
      { key: 'incident_id', label: 'Incident (optional)', type: 'select', source: recordSource('/safety-incidents', 'id', item => `${item.incidentId} · ${item.severity} · ${item.location}`) },
      { key: 'jurisdiction', label: 'Jurisdiction', type: 'text', examples: ['MSHA', 'State mine safety authority', 'MSHA and state environmental authority'] },
    ],
  },
  {
    key: 'gps-telematics',
    label: 'GPS Telematics',
    icon: '📡',
    endpoint: '/ai/gps-telematics',
    description: 'Fleet/equipment GPS lookup (requires GPS_TELEMATICS_API_KEY).',
    fields: [
      { key: 'equipment_id', label: 'Equipment ID', type: 'select', source: recordSource('/equipment', 'equipmentId', item => `${item.equipmentId} · ${item.name}`) },
      { key: 'mode', label: 'Mode', type: 'text', examples: ['snapshot', 'recent-track', 'utilization-summary'] },
    ],
  },
  {
    key: 'drone-survey-ingest',
    label: 'Drone Survey Ingest',
    icon: '🚁',
    endpoint: '/ai/drone-survey-ingest',
    description: 'Drone imagery / lab assay ingest (requires DRONE_SURVEY_API_KEY).',
    fields: [
      { key: 'survey_id', label: 'Survey ID', type: 'text', examples: ['SURVEY-DEMO-001', 'SURVEY-DEMO-002', 'SURVEY-DEMO-003'] },
      { key: 'mode', label: 'Mode', type: 'text', examples: ['imagery', 'assay', 'orthomosaic-metadata'] },
    ],
  },
];

const responseItems = (data) => Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];

export function buildPresetValues(tool, variant, references = {}, current = {}) {
  const values = {};
  const manual = [];

  tool.fields.forEach((field) => {
    if (field.source) {
      const options = references[field.key] || [];
      const selected = options[variant % Math.max(options.length, 1)];
      if (!selected) {
        manual.push(field.label);
        values[field.key] = current[field.key] || '';
        return;
      }
      values[field.key] = String(selected[field.source.valueKey]);
      return;
    }

    const example = field.examples?.[variant];
    if (example === undefined || example === null || example === '') {
      manual.push(field.label);
      values[field.key] = current[field.key] || '';
      return;
    }
    values[field.key] = typeof example === 'string' ? example : JSON.stringify(example, null, 2);
  });

  return {
    values,
    filled: tool.fields.filter(field => values[field.key] !== '').length,
    manual,
  };
}

function AIToolsPage() {
  const nativeAIRequest = useNativeAIRequest();

  const [activeKey, setActiveKey] = useState(TOOLS[0].key);
  const [inputs, setInputs] = useState({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [references, setReferences] = useState({});
  const [referencesLoading, setReferencesLoading] = useState(false);
  const [referenceError, setReferenceError] = useState('');

  const tool = TOOLS.find(t => t.key === activeKey);

  useEffect(() => {
    const sourceFields = tool.fields.filter(field => field.source);
    setReferences({});
    setReferenceError('');
    if (!sourceFields.length) {
      setReferencesLoading(false);
      return undefined;
    }

    const controller = new AbortController();
    setReferencesLoading(true);
    Promise.all(sourceFields.map(async (field) => {
      const response = await api.get(field.source.endpoint, {
        params: { page: 1, pageSize: 100 },
        signal: controller.signal,
      });
      return [field.key, responseItems(response.data)];
    }))
      .then(entries => setReferences(Object.fromEntries(entries)))
      .catch(failure => {
        if (failure.name !== 'CanceledError' && failure.name !== 'AbortError') {
          setReferenceError('Reference records could not be loaded. Existing selections are preserved; retry before running this tool.');
        }
      })
      .finally(() => setReferencesLoading(false));

    return () => controller.abort();
  }, [tool]);

  const presetControls = useMemo(() => PRESET_LABELS.map((name, variant) => ({
    name,
    fill: () => {
      const preset = buildPresetValues(tool, variant, references, inputs);
      setInputs(preset.values);
      setResult(null);
      setError(null);
      return preset;
    },
  })), [inputs, references, tool]);

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
      const res = await nativeAIRequest.run((signal) => api.post(tool.endpoint, payload, { signal }));
      setResult(res.data);
      toast.success(`${tool.label} completed`);
    } catch (err) {
      if (err?.name === 'AbortError') return;
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
    <NativeAIControls
      busy={loading || nativeAIRequest.busy || referencesLoading}
      onCancel={nativeAIRequest.cancel}
      context={`${tool.label} in Mining Operations Optimizer`}
      presets={presetControls}
    ><div className="page-container" style={{ padding: 20 }}>
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
        {referencesLoading && <p role="status" style={{ color: '#94a3b8' }}>Loading current reference records…</p>}
        {referenceError && <div role="alert" style={{ marginBottom: 12, padding: 10, background: 'rgba(245,158,11,0.1)', border: '1px solid #f59e0b', color: '#fde68a', borderRadius: 6 }}>{referenceError}</div>}
        <form onSubmit={submit}>
          {tool.fields.map(field => (
            <div key={field.key} style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontWeight: 600, fontSize: 13, marginBottom: 4 }}>
                {field.label}
              </label>
              {field.type === 'select' ? (
                <select
                  data-ai-field={field.key}
                  value={inputs[field.key] || ''}
                  onChange={e => setField(field.key, e.target.value)}
                  disabled={referencesLoading}
                  style={{ width: '100%', padding: 8, background: '#0f172a', color: '#e2e8f0', border: '1px solid #334155', borderRadius: 6 }}
                >
                  <option value="">{referencesLoading ? 'Loading records…' : 'Select a current record…'}</option>
                  {(references[field.key] || []).map(item => (
                    <option key={String(item[field.source.valueKey])} value={String(item[field.source.valueKey])}>
                      {field.source.label(item)}
                    </option>
                  ))}
                </select>
              ) : field.type === 'textarea' ? (
                <textarea data-ai-field={field.key}
                  value={inputs[field.key] || ''}
                  onChange={e => setField(field.key, e.target.value)}
                  placeholder={field.placeholder || ''}
                  required={field.required}
                  rows={6}
                  style={{ width: '100%', padding: 8, background: '#0f172a', color: '#e2e8f0', border: '1px solid #334155', borderRadius: 6, fontFamily: 'monospace', fontSize: 12 }}
                />
              ) : (
                <input data-ai-field={field.key}
                  type={field.type || 'text'}
                  value={inputs[field.key] || ''}
                  onChange={e => setField(field.key, e.target.value)}
                  placeholder={field.placeholder || ''}
                  required={field.required}
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
            <FormattedAIReport response={result} title={`${tool.label} result`} />
          </div>
        )}
      </div>
    </div></NativeAIControls>
  );
}

export default AIToolsPage;
