import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const features = [
  {
    path: '/ore-grades',
    title: 'Ore Grade Prediction',
    subtitle: 'AI-powered mineral grade analysis',
    description: 'Predict ore quality, recovery rates, and economic viability using advanced AI analysis of geological samples.',
    icon: '\u25C7',
    color: '#f59e0b',
    bg: 'rgba(245, 158, 11, 0.15)',
    endpoint: '/ore-grades'
  },
  {
    path: '/drill-patterns',
    title: 'Drill Pattern Optimization',
    subtitle: 'Blast design & fragmentation AI',
    description: 'Optimize drill spacing, burden, and explosive charge patterns for maximum efficiency and safety.',
    icon: '\u2316',
    color: '#3b82f6',
    bg: 'rgba(59, 130, 246, 0.15)',
    endpoint: '/drill-patterns'
  },
  {
    path: '/safety-incidents',
    title: 'Safety Monitoring',
    subtitle: 'Incident analysis & prevention',
    description: 'Track safety incidents, analyze root causes with AI, and generate preventive recommendations.',
    icon: '\u26A0',
    color: '#ef4444',
    bg: 'rgba(239, 68, 68, 0.15)',
    endpoint: '/safety-incidents'
  },
  {
    path: '/equipment',
    title: 'Equipment Utilization',
    subtitle: 'Fleet management & predictive maintenance',
    description: 'Monitor equipment health, predict maintenance needs, and optimize fleet utilization rates.',
    icon: '\u2699',
    color: '#8b5cf6',
    bg: 'rgba(139, 92, 246, 0.15)',
    endpoint: '/equipment'
  },
  {
    path: '/environmental',
    title: 'Environmental Compliance',
    subtitle: 'Regulatory monitoring & assessment',
    description: 'Track environmental parameters, ensure regulatory compliance, and get AI risk assessments.',
    icon: '\u2618',
    color: '#10b981',
    bg: 'rgba(16, 185, 129, 0.15)',
    endpoint: '/environmental'
  },
  {
    path: '/production-logs',
    title: 'Production Analytics',
    subtitle: 'Throughput & efficiency analysis',
    description: 'Analyze production data, identify bottlenecks, and optimize shift performance with AI insights.',
    icon: '\u2263',
    color: '#06b6d4',
    bg: 'rgba(6, 182, 212, 0.15)',
    endpoint: '/production-logs'
  },
  {
    path: '/workforce',
    title: 'Workforce Management',
    subtitle: 'Safety scoring & fatigue management',
    description: 'Manage worker certifications, monitor fatigue risk, and optimize shift assignments with AI analysis.',
    icon: '\u263A',
    color: '#ec4899',
    bg: 'rgba(236, 72, 153, 0.15)',
    endpoint: '/workforce'
  },
  {
    path: '/cost-analysis',
    title: 'Cost Analysis',
    subtitle: 'Budget optimization & forecasting',
    description: 'Track operational costs, analyze budget variance, and get AI-powered cost reduction recommendations.',
    icon: '$',
    color: '#14b8a6',
    bg: 'rgba(20, 184, 166, 0.15)',
    endpoint: '/cost-analysis'
  },
  {
    path: '/geology-maps',
    title: 'Geology Mapping',
    subtitle: 'Geological interpretation & resource assessment',
    description: 'Manage geological surveys, interpret structural data, and assess mineralization potential with AI.',
    icon: '\u2690',
    color: '#a855f7',
    bg: 'rgba(168, 85, 247, 0.15)',
    endpoint: '/geology-maps'
  },
  {
    path: '/hauling',
    title: 'Hauling & Logistics',
    subtitle: 'Route optimization & fleet dispatch',
    description: 'Track hauling trips, optimize routes, and improve fuel efficiency with AI logistics analysis.',
    icon: '\u2708',
    color: '#f97316',
    bg: 'rgba(249, 115, 22, 0.15)',
    endpoint: '/hauling'
  },
  {
    path: '/analytics',
    title: 'Dashboard Analytics',
    subtitle: 'Charts & performance metrics',
    description: 'View real-time charts, graphs, and KPIs across all mining operations with visual data breakdowns.',
    icon: '\u2261',
    color: '#0ea5e9',
    bg: 'rgba(14, 165, 233, 0.15)',
    endpoint: null
  },
  {
    path: '/alerts',
    title: 'Alert System',
    subtitle: 'Threshold-based monitoring',
    description: 'Set up and manage threshold-based alerts for safety, equipment, environmental, and production metrics.',
    icon: '\u2623',
    color: '#f43f5e',
    bg: 'rgba(244, 63, 94, 0.15)',
    endpoint: '/alerts'
  },
  {
    path: '/shift-schedules',
    title: 'Shift Scheduling',
    subtitle: 'Workforce calendar & assignments',
    description: 'Schedule and manage workforce shifts, track attendance, and organize daily mining crew assignments.',
    icon: '\u2637',
    color: '#8b5cf6',
    bg: 'rgba(139, 92, 246, 0.15)',
    endpoint: '/shift-schedules'
  },
  {
    path: '/maintenance',
    title: 'Maintenance Scheduler',
    subtitle: 'Equipment maintenance calendar',
    description: 'Plan preventive, corrective, and predictive maintenance with scheduling, parts tracking, and cost management.',
    icon: '\u2692',
    color: '#d97706',
    bg: 'rgba(217, 119, 6, 0.15)',
    endpoint: '/maintenance'
  },
  {
    path: '/inventory',
    title: 'Inventory Tracking',
    subtitle: 'Supplies, explosives & fuel management',
    description: 'Track stock levels for explosives, fuel, spare parts, and safety equipment with low-stock alerts.',
    icon: '\u2612',
    color: '#059669',
    bg: 'rgba(5, 150, 105, 0.15)',
    endpoint: '/inventory'
  },
  {
    path: '/reports',
    title: 'Report Builder',
    subtitle: 'Summary reports & data analysis',
    description: 'Generate comprehensive reports on production, safety, costs, equipment, and environmental compliance.',
    icon: '\u2630',
    color: '#6366f1',
    bg: 'rgba(99, 102, 241, 0.15)',
    endpoint: null
  },
  {
    path: '/export',
    title: 'Data Export',
    subtitle: 'CSV export for all modules',
    description: 'Export data from any module to CSV format for external analysis, reporting, and record keeping.',
    icon: '\u21E9',
    color: '#0d9488',
    bg: 'rgba(13, 148, 136, 0.15)',
    endpoint: null
  },
  {
    path: '/search',
    title: 'Global Search',
    subtitle: 'Search across all data',
    description: 'Search across all mining operation modules to quickly find equipment, incidents, workers, and records.',
    icon: '\u2315',
    color: '#7c3aed',
    bg: 'rgba(124, 58, 237, 0.15)',
    endpoint: null
  },
  {
    path: '/audit-logs',
    title: 'Audit Log',
    subtitle: 'Activity tracking & history',
    description: 'View a complete audit trail of all user actions including creates, updates, deletes, and data exports.',
    icon: '\u2611',
    color: '#475569',
    bg: 'rgba(71, 85, 105, 0.15)',
    endpoint: '/audit-logs'
  },
  {
    path: '/user-management',
    title: 'User Management',
    subtitle: 'Admin panel for users & roles',
    description: 'Manage user accounts, assign roles (admin, engineer, operator), and control access to the platform.',
    icon: '\u2603',
    color: '#be185d',
    bg: 'rgba(190, 24, 93, 0.15)',
    endpoint: '/users'
  }
];

function Dashboard() {
  const navigate = useNavigate();
  const [counts, setCounts] = useState({});

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const endpointFeatures = features.filter(f => f.endpoint);
        const results = await Promise.all(
          endpointFeatures.map(f => api.get(f.endpoint).catch(() => ({ data: [] })))
        );
        const newCounts = {};
        endpointFeatures.forEach((f, i) => {
          newCounts[f.endpoint] = Array.isArray(results[i].data) ? results[i].data.length : 0;
        });
        setCounts(newCounts);
      } catch (e) {
        // ignore
      }
    };
    fetchCounts();
  }, []);

  return (
    <div className="dashboard">
      <div className="page-header">
        <h1>Mining Operations Dashboard</h1>
        <p>AI-powered optimization for billion-dollar mining operations</p>
      </div>
      <div className="dashboard-cards">
        {features.map((feature) => (
          <div
            key={feature.path}
            className="feature-card"
            style={{ '--card-color': feature.color }}
            onClick={() => navigate(feature.path)}
          >
            <div className="card-header">
              <div className="card-icon" style={{ background: feature.bg, color: feature.color }}>
                {feature.icon}
              </div>
              <div>
                <div className="card-title">{feature.title}</div>
                <div className="card-subtitle">{feature.subtitle}</div>
              </div>
            </div>
            <div className="card-description">{feature.description}</div>
            <div className="card-stats">
              {feature.endpoint ? (
                <div className="stat">
                  <span className="stat-value" style={{ color: feature.color }}>
                    {counts[feature.endpoint] || 0}
                  </span>
                  <span className="stat-label">Records</span>
                </div>
              ) : (
                <div className="stat">
                  <span className="stat-value" style={{ color: feature.color }}>Tool</span>
                  <span className="stat-label">Utility</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;
