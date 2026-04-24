import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';

const tabs = [
  { key: 'production', label: 'Production', endpoint: '/reports/production', exportResource: 'production-logs' },
  { key: 'safety', label: 'Safety', endpoint: '/reports/safety', exportResource: 'safety-incidents' },
  { key: 'cost', label: 'Cost', endpoint: '/reports/cost', exportResource: 'cost-analysis' },
  { key: 'equipment', label: 'Equipment', endpoint: '/reports/equipment', exportResource: 'equipment' },
  { key: 'environmental', label: 'Environmental', endpoint: '/reports/environmental', exportResource: 'environmental' }
];

function ReportsPage() {
  const [activeTab, setActiveTab] = useState('production');
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const fetchReport = async () => {
      const tab = tabs.find(t => t.key === activeTab);
      if (data[activeTab]) return;
      setLoading(true);
      try {
        const res = await api.get(tab.endpoint);
        setData(prev => ({ ...prev, [activeTab]: res.data }));
      } catch (e) { toast.error(`Failed to load ${activeTab} report`); } finally { setLoading(false); }
    };
    fetchReport();
  }, [activeTab, data]);

  const handleExport = async () => {
    const tab = tabs.find(t => t.key === activeTab);
    setExporting(true);
    try {
      const response = await api.get(`/export/${tab.exportResource}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a'); link.href = url;
      link.setAttribute('download', `${tab.exportResource}-report.csv`);
      document.body.appendChild(link); link.click(); link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Export downloaded');
    } catch (e) { toast.error('Export failed'); } finally { setExporting(false); }
  };

  const report = data[activeTab] || {};

  const renderBar = (label, value, max, color) => {
    const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
    return (
      <div key={label} style={{ marginBottom: '0.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
          <span style={{ color: '#cbd5e1', fontSize: '0.85rem' }}>{label}</span>
          <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{typeof value === 'number' ? value.toLocaleString() : value}</span>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '4px', height: '8px', overflow: 'hidden' }}>
          <div style={{ width: `${pct}%`, background: color || '#3b82f6', height: '100%', borderRadius: '4px', transition: 'width 0.5s ease' }} />
        </div>
      </div>
    );
  };

  const renderProduction = () => {
    const d = report;
    const stats = [
      { label: 'Total Tonnage', value: d.totalTonnage || 0 },
      { label: 'Avg Efficiency', value: d.avgEfficiency ? `${d.avgEfficiency}%` : 'N/A' },
      { label: 'Total Hours', value: d.totalHours || 0 },
      { label: 'Records', value: d.recordsCount || 0 }
    ];
    const maxTonnage = d.totalTonnage || 1;
    return (
      <>
        <div className="detail-grid" style={{ marginBottom: '2rem' }}>
          {stats.map(s => (
            <div className="detail-item" key={s.label}>
              <span className="detail-label">{s.label}</span>
              <span className="detail-value" style={{ fontSize: '1.3rem', color: '#3b82f6' }}>{typeof s.value === 'number' ? s.value.toLocaleString() : s.value}</span>
            </div>
          ))}
        </div>
        {d.byShift && Object.entries(d.byShift).map(([shift, val]) => renderBar(shift, val, maxTonnage, '#3b82f6'))}
        {d.byMaterial && Object.entries(d.byMaterial).map(([mat, val]) => renderBar(mat, val, maxTonnage, '#06b6d4'))}
      </>
    );
  };

  const renderSafety = () => {
    const d = report;
    const maxSeverity = d.bySeverity ? Math.max(...Object.values(d.bySeverity), 1) : 1;
    const maxType = d.byType ? Math.max(...Object.values(d.byType), 1) : 1;
    return (
      <>
        {d.bySeverity && (
          <div className="detail-section">
            <h3>Incidents by Severity</h3>
            {Object.entries(d.bySeverity).map(([sev, count]) => renderBar(sev, count, maxSeverity, { critical: '#ef4444', high: '#f59e0b', medium: '#3b82f6', low: '#6b7280' }[sev] || '#6b7280'))}
          </div>
        )}
        {d.byType && (
          <div className="detail-section">
            <h3>Incidents by Type</h3>
            {Object.entries(d.byType).map(([type, count]) => renderBar(type, count, maxType, '#8b5cf6'))}
          </div>
        )}
        {d.recentIncidents && d.recentIncidents.length > 0 && (
          <div className="detail-section">
            <h3>Recent Incidents</h3>
            <div className="data-table-container">
              <table className="data-table">
                <thead><tr><th>ID</th><th>Type</th><th>Severity</th><th>Date</th><th>Location</th></tr></thead>
                <tbody>
                  {d.recentIncidents.map((inc, i) => (
                    <tr key={i}><td>{inc.incidentId}</td><td>{inc.type}</td><td><span className={`badge ${({ critical: 'badge-danger', high: 'badge-warning', medium: 'badge-info', low: 'badge-secondary' }[inc.severity] || 'badge-secondary')}`}>{inc.severity}</span></td><td>{inc.date?.split('T')[0]}</td><td>{inc.location}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </>
    );
  };

  const renderCost = () => {
    const d = report;
    const maxCat = d.byCategory ? Math.max(...Object.values(d.byCategory), 1) : 1;
    return (
      <>
        <div className="detail-grid" style={{ marginBottom: '2rem' }}>
          <div className="detail-item"><span className="detail-label">Total Costs</span><span className="detail-value" style={{ fontSize: '1.3rem', color: '#10b981' }}>${(d.totalCosts || 0).toLocaleString()}</span></div>
          <div className="detail-item"><span className="detail-label">Budget Variance</span><span className="detail-value" style={{ fontSize: '1.3rem', color: (d.budgetVariance || 0) >= 0 ? '#10b981' : '#ef4444' }}>{(d.budgetVariance || 0) >= 0 ? '+' : ''}${(d.budgetVariance || 0).toLocaleString()}</span></div>
          <div className="detail-item"><span className="detail-label">Avg Cost/Unit</span><span className="detail-value" style={{ fontSize: '1.3rem', color: '#14b8a6' }}>${(d.avgCostPerUnit || 0).toLocaleString()}</span></div>
          <div className="detail-item"><span className="detail-label">Records</span><span className="detail-value" style={{ fontSize: '1.3rem', color: '#14b8a6' }}>{d.recordsCount || 0}</span></div>
        </div>
        {d.byCategory && (
          <div className="detail-section">
            <h3>Costs by Category</h3>
            {Object.entries(d.byCategory).map(([cat, val]) => renderBar(cat, val, maxCat, '#14b8a6'))}
          </div>
        )}
      </>
    );
  };

  const renderEquipment = () => {
    const d = report;
    const maxStatus = d.byStatus ? Math.max(...Object.values(d.byStatus), 1) : 1;
    return (
      <>
        <div className="detail-grid" style={{ marginBottom: '2rem' }}>
          <div className="detail-item"><span className="detail-label">Avg Utilization</span><span className="detail-value" style={{ fontSize: '1.3rem', color: '#8b5cf6' }}>{d.avgUtilization || 0}%</span></div>
          <div className="detail-item"><span className="detail-label">Total Equipment</span><span className="detail-value" style={{ fontSize: '1.3rem', color: '#8b5cf6' }}>{d.totalEquipment || 0}</span></div>
          <div className="detail-item"><span className="detail-label">Maintenance Costs</span><span className="detail-value" style={{ fontSize: '1.3rem', color: '#f59e0b' }}>${(d.maintenanceCosts || 0).toLocaleString()}</span></div>
          <div className="detail-item"><span className="detail-label">Avg Hours</span><span className="detail-value" style={{ fontSize: '1.3rem', color: '#8b5cf6' }}>{(d.avgHours || 0).toLocaleString()}</span></div>
        </div>
        {d.byStatus && (
          <div className="detail-section">
            <h3>Equipment by Status</h3>
            {Object.entries(d.byStatus).map(([status, count]) => renderBar(status, count, maxStatus, { operational: '#10b981', maintenance: '#f59e0b', breakdown: '#ef4444', idle: '#6b7280' }[status] || '#6b7280'))}
          </div>
        )}
        {d.utilizationRates && (
          <div className="detail-section">
            <h3>Utilization Rates</h3>
            {Object.entries(d.utilizationRates).map(([name, rate]) => renderBar(name, `${rate}%`, 100, '#8b5cf6'))}
          </div>
        )}
      </>
    );
  };

  const renderEnvironmental = () => {
    const d = report;
    return (
      <>
        <div className="detail-grid" style={{ marginBottom: '2rem' }}>
          <div className="detail-item"><span className="detail-label">Compliance Rate</span><span className="detail-value" style={{ fontSize: '1.3rem', color: (d.complianceRate || 0) >= 90 ? '#10b981' : '#ef4444' }}>{d.complianceRate || 0}%</span></div>
          <div className="detail-item"><span className="detail-label">Total Violations</span><span className="detail-value" style={{ fontSize: '1.3rem', color: (d.totalViolations || 0) > 0 ? '#ef4444' : '#10b981' }}>{d.totalViolations || 0}</span></div>
          <div className="detail-item"><span className="detail-label">Monitoring Points</span><span className="detail-value" style={{ fontSize: '1.3rem', color: '#10b981' }}>{d.monitoringPoints || 0}</span></div>
          <div className="detail-item"><span className="detail-label">Records</span><span className="detail-value" style={{ fontSize: '1.3rem', color: '#10b981' }}>{d.recordsCount || 0}</span></div>
        </div>
        {d.byParameter && (
          <div className="detail-section">
            <h3>Monitoring by Parameter</h3>
            {Object.entries(d.byParameter).map(([param, val]) => renderBar(param, val, Math.max(...Object.values(d.byParameter), 1), '#10b981'))}
          </div>
        )}
        {d.byRiskLevel && (
          <div className="detail-section">
            <h3>By Risk Level</h3>
            {Object.entries(d.byRiskLevel).map(([level, count]) => renderBar(level, count, Math.max(...Object.values(d.byRiskLevel), 1), { high: '#ef4444', medium: '#f59e0b', low: '#10b981' }[level] || '#6b7280'))}
          </div>
        )}
      </>
    );
  };

  const renderContent = () => {
    if (loading) return <div className="empty-state"><h3>Loading report...</h3></div>;
    if (!report || Object.keys(report).length === 0) return <div className="empty-state"><div className="empty-icon">{'\u{1F4CA}'}</div><h3>No report data available</h3></div>;
    switch (activeTab) {
      case 'production': return renderProduction();
      case 'safety': return renderSafety();
      case 'cost': return renderCost();
      case 'equipment': return renderEquipment();
      case 'environmental': return renderEnvironmental();
      default: return null;
    }
  };

  return (
    <div className="feature-page">
      <div className="page-header">
        <h1>Reports</h1>
        <p>Comprehensive mining operations reports and analytics</p>
      </div>
      <div className="page-actions">
        {tabs.map(tab => (
          <button key={tab.key} className={`btn ${activeTab === tab.key ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab(tab.key)}>{tab.label}</button>
        ))}
        <button className="btn btn-success" onClick={handleExport} disabled={exporting}>{exporting ? 'Exporting...' : 'Export CSV'}</button>
      </div>
      <div className="detail-section">
        {renderContent()}
      </div>
    </div>
  );
}

export default ReportsPage;
