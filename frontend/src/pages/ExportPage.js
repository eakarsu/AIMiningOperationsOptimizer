import React, { useState } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';

const resources = [
  { key: 'equipment', name: 'Equipment', icon: '\u2699', description: 'Export all equipment records including utilization and maintenance data', color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.15)' },
  { key: 'ore-grades', name: 'Ore Grades', icon: '\u25C7', description: 'Export ore grade samples with mineral compositions and recovery rates', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)' },
  { key: 'safety-incidents', name: 'Safety Incidents', icon: '\u26A0', description: 'Export safety incident records, root causes, and corrective actions', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)' },
  { key: 'drill-patterns', name: 'Drill Patterns', icon: '\u2316', description: 'Export drill pattern configurations and blast design parameters', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.15)' },
  { key: 'environmental', name: 'Environmental', icon: '\u2618', description: 'Export environmental monitoring data and compliance records', color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)' },
  { key: 'production-logs', name: 'Production Logs', icon: '\u2263', description: 'Export production throughput, efficiency, and shift performance data', color: '#06b6d4', bg: 'rgba(6, 182, 212, 0.15)' },
  { key: 'workforce', name: 'Workforce', icon: '\u263A', description: 'Export workforce records, certifications, and safety scores', color: '#ec4899', bg: 'rgba(236, 72, 153, 0.15)' },
  { key: 'cost-analysis', name: 'Cost Analysis', icon: '$', description: 'Export cost breakdown, budget variance, and financial data', color: '#14b8a6', bg: 'rgba(20, 184, 166, 0.15)' },
  { key: 'geology-maps', name: 'Geology Maps', icon: '\u2690', description: 'Export geological survey data and mineralization assessments', color: '#a855f7', bg: 'rgba(168, 85, 247, 0.15)' },
  { key: 'hauling', name: 'Hauling', icon: '\u2708', description: 'Export hauling trip records, routes, and fuel consumption data', color: '#f97316', bg: 'rgba(249, 115, 22, 0.15)' },
  { key: 'alerts', name: 'Alerts', icon: '\u{1F514}', description: 'Export system alerts and notifications history', color: '#eab308', bg: 'rgba(234, 179, 8, 0.15)' },
  { key: 'maintenance', name: 'Maintenance', icon: '\u{1F527}', description: 'Export maintenance schedules, costs, and completion records', color: '#64748b', bg: 'rgba(100, 116, 139, 0.15)' },
  { key: 'inventory', name: 'Inventory', icon: '\u{1F4E6}', description: 'Export inventory levels, stock status, and supplier information', color: '#0ea5e9', bg: 'rgba(14, 165, 233, 0.15)' },
  { key: 'shifts', name: 'Shifts', icon: '\u{1F553}', description: 'Export shift schedules, assignments, and attendance data', color: '#d946ef', bg: 'rgba(217, 70, 239, 0.15)' }
];

function ExportPage() {
  const [loadingKey, setLoadingKey] = useState(null);

  const handleExport = async (resource) => {
    setLoadingKey(resource.key);
    try {
      const response = await api.get(`/export/${resource.key}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a'); link.href = url;
      link.setAttribute('download', `${resource.key}-report.csv`);
      document.body.appendChild(link); link.click(); link.remove();
      window.URL.revokeObjectURL(url);
      toast.success(`${resource.name} data exported successfully`);
    } catch (e) { toast.error(`Failed to export ${resource.name} data`); } finally { setLoadingKey(null); }
  };

  return (
    <div className="feature-page">
      <div className="page-header">
        <h1>Data Export</h1>
        <p>Export mining operations data as CSV files</p>
      </div>
      <div className="dashboard-cards">
        {resources.map(resource => (
          <div key={resource.key} className="feature-card" style={{ '--card-color': resource.color }}>
            <div className="card-header">
              <div className="card-icon" style={{ background: resource.bg, color: resource.color }}>
                {resource.icon}
              </div>
              <div>
                <div className="card-title">{resource.name}</div>
              </div>
            </div>
            <div className="card-description">{resource.description}</div>
            <div style={{ marginTop: '1rem' }}>
              <button
                className="btn btn-primary"
                onClick={() => handleExport(resource)}
                disabled={loadingKey === resource.key}
                style={{ width: '100%' }}
              >
                {loadingKey === resource.key ? 'Exporting...' : 'Export CSV'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ExportPage;
