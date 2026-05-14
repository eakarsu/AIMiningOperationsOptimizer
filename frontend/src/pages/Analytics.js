import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';

function Analytics() {
  const [overview, setOverview] = useState(null);
  const [safetySummary, setSafetySummary] = useState(null);
  const [equipmentStatus, setEquipmentStatus] = useState(null);
  const [productionSummary, setProductionSummary] = useState(null);
  const [alertsSummary, setAlertsSummary] = useState(null);
  const [correlations, setCorrelations] = useState(null);
  const [correlationLoading, setCorrelationLoading] = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [ov, ss, es, ps, as_] = await Promise.all([
          api.get('/analytics/overview').catch(() => ({ data: null })),
          api.get('/analytics/safety-summary').catch(() => ({ data: null })),
          api.get('/analytics/equipment-status').catch(() => ({ data: null })),
          api.get('/analytics/production-summary').catch(() => ({ data: null })),
          api.get('/analytics/alerts-summary').catch(() => ({ data: null }))
        ]);
        setOverview(ov.data);
        setSafetySummary(ss.data);
        setEquipmentStatus(es.data);
        setProductionSummary(ps.data);
        setAlertsSummary(as_.data);
      } catch (e) { toast.error('Failed to load analytics'); }
    };
    fetchAll();
  }, []);

  const fetchCorrelations = async () => {
    setCorrelationLoading(true);
    try {
      const res = await api.get('/analytics/correlations');
      setCorrelations(res.data);
      toast.success('Correlation analysis complete');
    } catch (e) { toast.error('Correlation analysis failed'); }
    finally { setCorrelationLoading(false); }
  };

  const correlationColor = (corr, strength) => {
    if (corr === 'positive') return strength === 'strong' ? '#10b981' : '#6ee7b7';
    if (corr === 'negative') return strength === 'strong' ? '#ef4444' : '#fca5a5';
    return '#94a3b8';
  };

  const barStyle = (pct, color) => ({
    height: '24px',
    width: `${Math.max(pct, 2)}%`,
    backgroundColor: color,
    borderRadius: '4px',
    display: 'inline-block',
    transition: 'width 0.5s ease'
  });

  const barContainerStyle = {
    display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px'
  };

  const barLabelStyle = {
    minWidth: '140px', fontSize: '14px', color: '#94a3b8', textAlign: 'right'
  };

  const barTrackStyle = {
    flex: 1, backgroundColor: '#1e293b', borderRadius: '4px', height: '24px', overflow: 'hidden'
  };

  const barValueStyle = {
    fontSize: '14px', color: '#e2e8f0', minWidth: '50px'
  };

  const cardStyle = {
    backgroundColor: '#1e293b', borderRadius: '12px', padding: '24px', textAlign: 'center', border: '1px solid #334155'
  };

  const cardValueStyle = (color) => ({
    fontSize: '36px', fontWeight: '700', color: color, marginBottom: '4px'
  });

  const cardLabelStyle = {
    fontSize: '14px', color: '#94a3b8'
  };

  const sectionStyle = {
    backgroundColor: '#1e293b', borderRadius: '12px', padding: '24px', border: '1px solid #334155', marginBottom: '24px'
  };

  const sectionTitleStyle = {
    fontSize: '18px', fontWeight: '600', color: '#e2e8f0', marginBottom: '20px'
  };

  return (
    <div className="feature-page">
      <div className="page-header">
        <h1>Dashboard Analytics</h1>
        <p>Real-time overview of mining operations performance</p>
      </div>

      {/* Overview Cards */}
      {overview && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <div style={cardStyle}>
            <div style={cardValueStyle('#3b82f6')}>{overview.equipment ?? 0}</div>
            <div style={cardLabelStyle}>Equipment</div>
          </div>
          <div style={cardStyle}>
            <div style={cardValueStyle('#ef4444')}>{overview.safetyIncidents ?? 0}</div>
            <div style={cardLabelStyle}>Safety Incidents</div>
          </div>
          <div style={cardStyle}>
            <div style={cardValueStyle('#10b981')}>{overview.productionLogs ?? 0}</div>
            <div style={cardLabelStyle}>Production Logs</div>
          </div>
          <div style={cardStyle}>
            <div style={cardValueStyle('#f59e0b')}>{overview.alerts ?? 0}</div>
            <div style={cardLabelStyle}>Alerts</div>
          </div>
          <div style={cardStyle}>
            <div style={cardValueStyle('#8b5cf6')}>{overview.workforce ?? 0}</div>
            <div style={cardLabelStyle}>Workers</div>
          </div>
          <div style={cardStyle}>
            <div style={cardValueStyle('#06b6d4')}>{overview.inventory ?? 0}</div>
            <div style={cardLabelStyle}>Inventory Items</div>
          </div>
          <div style={cardStyle}>
            <div style={cardValueStyle('#ec4899')}>{overview.shifts ?? 0}</div>
            <div style={cardLabelStyle}>Shift Schedules</div>
          </div>
          <div style={cardStyle}>
            <div style={cardValueStyle('#a855f7')}>{overview.maintenance ?? 0}</div>
            <div style={cardLabelStyle}>Maintenance Tasks</div>
          </div>
        </div>
      )}

      {/* Safety Summary Bar Chart */}
      {safetySummary && (
        <div style={sectionStyle}>
          <div style={sectionTitleStyle}>Safety Incidents by Severity</div>
          {(() => {
            const items = Array.isArray(safetySummary) ? safetySummary : [
              { label: 'Critical', value: safetySummary.critical ?? 0 },
              { label: 'High', value: safetySummary.high ?? 0 },
              { label: 'Medium', value: safetySummary.medium ?? 0 },
              { label: 'Low', value: safetySummary.low ?? 0 }
            ];
            const max = Math.max(...items.map(i => i.value || i.count || 0), 1);
            const colorMap = { Critical: '#ef4444', High: '#f59e0b', Medium: '#3b82f6', Low: '#10b981' };
            return items.map((item, idx) => {
              const val = item.value || item.count || 0;
              const label = item.label || item.severity || item.name || `Item ${idx + 1}`;
              return (
                <div key={idx} style={barContainerStyle}>
                  <div style={barLabelStyle}>{label}</div>
                  <div style={barTrackStyle}>
                    <div style={barStyle((val / max) * 100, colorMap[label] || '#3b82f6')} />
                  </div>
                  <div style={barValueStyle}>{val}</div>
                </div>
              );
            });
          })()}
        </div>
      )}

      {/* Equipment Status Breakdown */}
      {equipmentStatus && (
        <div style={sectionStyle}>
          <div style={sectionTitleStyle}>Equipment Status Breakdown</div>
          {(() => {
            const items = Array.isArray(equipmentStatus) ? equipmentStatus : [
              { label: 'Operational', value: equipmentStatus.operational ?? 0 },
              { label: 'Maintenance', value: equipmentStatus.maintenance ?? 0 },
              { label: 'Breakdown', value: equipmentStatus.breakdown ?? 0 },
              { label: 'Idle', value: equipmentStatus.idle ?? 0 }
            ];
            const max = Math.max(...items.map(i => i.value || i.count || 0), 1);
            const colorMap = { Operational: '#10b981', Maintenance: '#f59e0b', Breakdown: '#ef4444', Idle: '#94a3b8' };
            return items.map((item, idx) => {
              const val = item.value || item.count || 0;
              const label = item.label || item.status || item.name || `Item ${idx + 1}`;
              return (
                <div key={idx} style={barContainerStyle}>
                  <div style={barLabelStyle}>{label}</div>
                  <div style={barTrackStyle}>
                    <div style={barStyle((val / max) * 100, colorMap[label] || '#3b82f6')} />
                  </div>
                  <div style={barValueStyle}>{val}</div>
                </div>
              );
            });
          })()}
        </div>
      )}

      {/* Production Summary */}
      {productionSummary && (
        <div style={sectionStyle}>
          <div style={sectionTitleStyle}>Production Summary</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div style={{ ...cardStyle, backgroundColor: '#0f172a' }}>
              <div style={cardValueStyle('#10b981')}>{productionSummary.totalTonnage?.toLocaleString() ?? productionSummary.totalOutput?.toLocaleString() ?? 0}</div>
              <div style={cardLabelStyle}>Total Tonnage</div>
            </div>
            <div style={{ ...cardStyle, backgroundColor: '#0f172a' }}>
              <div style={cardValueStyle('#3b82f6')}>{productionSummary.averageEfficiency ?? productionSummary.avgEfficiency ?? 0}%</div>
              <div style={cardLabelStyle}>Avg Efficiency</div>
            </div>
            <div style={{ ...cardStyle, backgroundColor: '#0f172a' }}>
              <div style={cardValueStyle('#8b5cf6')}>{productionSummary.totalShifts ?? productionSummary.shiftsCompleted ?? 0}</div>
              <div style={cardLabelStyle}>Shifts Completed</div>
            </div>
            <div style={{ ...cardStyle, backgroundColor: '#0f172a' }}>
              <div style={cardValueStyle('#f59e0b')}>{productionSummary.downtime ?? productionSummary.totalDowntime ?? 0}h</div>
              <div style={cardLabelStyle}>Downtime</div>
            </div>
          </div>
        </div>
      )}

      {/* Alerts by Severity */}
      {alertsSummary && (
        <div style={sectionStyle}>
          <div style={sectionTitleStyle}>Active Alerts by Severity</div>
          {(() => {
            const items = Array.isArray(alertsSummary) ? alertsSummary : [
              { label: 'Critical', value: alertsSummary.critical ?? 0 },
              { label: 'High', value: alertsSummary.high ?? 0 },
              { label: 'Medium', value: alertsSummary.medium ?? 0 },
              { label: 'Low', value: alertsSummary.low ?? 0 }
            ];
            const max = Math.max(...items.map(i => i.value || i.count || 0), 1);
            const colorMap = { Critical: '#ef4444', High: '#f59e0b', Medium: '#3b82f6', Low: '#10b981' };
            return items.map((item, idx) => {
              const val = item.value || item.count || 0;
              const label = item.label || item.severity || item.name || `Item ${idx + 1}`;
              return (
                <div key={idx} style={barContainerStyle}>
                  <div style={barLabelStyle}>{label}</div>
                  <div style={barTrackStyle}>
                    <div style={barStyle((val / max) * 100, colorMap[label] || '#3b82f6')} />
                  </div>
                  <div style={barValueStyle}>{val}</div>
                </div>
              );
            });
          })()}
        </div>
      )}

      {!overview && !safetySummary && !equipmentStatus && !productionSummary && !alertsSummary && (
        <div className="empty-state">
          <div className="empty-icon">{'\u{1F4CA}'}</div>
          <h3>Loading analytics data...</h3>
        </div>
      )}

      {/* Correlation Analysis Section */}
      <div style={sectionStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={sectionTitleStyle}>Correlation Analysis</div>
          <button
            className="btn btn-success"
            onClick={fetchCorrelations}
            disabled={correlationLoading}
          >
            {correlationLoading ? 'Analyzing...' : 'Run Correlation Analysis'}
          </button>
        </div>

        {correlationLoading && (
          <div style={{ textAlign: 'center', color: '#94a3b8', padding: '24px' }}>
            <div className="spinner" style={{ margin: '0 auto 12px' }}></div>
            AI is analyzing cross-domain correlations...
          </div>
        )}

        {correlations && !correlationLoading && (() => {
          const analysis = correlations.analysis;
          const corrs = analysis?.correlations || [];
          return (
            <div>
              {/* Summary metrics */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginBottom: '20px' }}>
                <div style={{ ...cardStyle, backgroundColor: '#0f172a' }}>
                  <div style={cardValueStyle('#3b82f6')}>{correlations.summary?.avgOreGrade}%</div>
                  <div style={cardLabelStyle}>Avg Ore Grade</div>
                </div>
                <div style={{ ...cardStyle, backgroundColor: '#0f172a' }}>
                  <div style={cardValueStyle('#ef4444')}>{correlations.summary?.safetyIncidents}</div>
                  <div style={cardLabelStyle}>Safety Incidents (30d)</div>
                </div>
                <div style={{ ...cardStyle, backgroundColor: '#0f172a' }}>
                  <div style={cardValueStyle('#f59e0b')}>{correlations.summary?.equipmentDowntime}</div>
                  <div style={cardLabelStyle}>Equipment Downtime</div>
                </div>
                <div style={{ ...cardStyle, backgroundColor: '#0f172a' }}>
                  <div style={cardValueStyle('#8b5cf6')}>{correlations.summary?.avgFatigueHours}h</div>
                  <div style={cardLabelStyle}>Avg Fatigue Hours</div>
                </div>
              </div>

              {/* Correlation cards */}
              {corrs.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '12px', marginBottom: '20px' }}>
                  {corrs.map((c, i) => (
                    <div key={i} style={{ backgroundColor: '#0f172a', border: `2px solid ${correlationColor(c.correlation, c.strength)}33`, borderRadius: '10px', padding: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <span style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: correlationColor(c.correlation, c.strength), padding: '2px 8px', borderRadius: '9999px', border: `1px solid ${correlationColor(c.correlation, c.strength)}` }}>
                          {c.correlation} {c.strength}
                        </span>
                      </div>
                      <div style={{ fontSize: '13px', color: '#e2e8f0', fontWeight: '600', marginBottom: '4px' }}>
                        {c.metric_a} ↔ {c.metric_b}
                      </div>
                      <div style={{ fontSize: '12px', color: '#94a3b8', lineHeight: '1.5' }}>{c.insight}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Top production risk */}
              {analysis?.top_production_risk && (
                <div style={{ backgroundColor: '#1e293b', border: '1px solid #ef444433', borderRadius: '8px', padding: '12px', marginBottom: '12px' }}>
                  <div style={{ fontSize: '11px', color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Top Production Risk</div>
                  <div style={{ color: '#e2e8f0', fontSize: '14px' }}>{analysis.top_production_risk}</div>
                </div>
              )}

              {/* Recommendations */}
              {analysis?.recommendations && analysis.recommendations.length > 0 && (
                <div style={{ backgroundColor: '#1e293b', border: '1px solid #10b98133', borderRadius: '8px', padding: '12px' }}>
                  <div style={{ fontSize: '11px', color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Recommendations</div>
                  <ul style={{ margin: 0, paddingLeft: '16px', color: '#cbd5e1', fontSize: '14px' }}>
                    {analysis.recommendations.map((r, i) => <li key={i} style={{ marginBottom: '4px' }}>{r}</li>)}
                  </ul>
                </div>
              )}
            </div>
          );
        })()}
      </div>
    </div>
  );
}

export default Analytics;
