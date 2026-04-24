import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const navItems = [
  { path: '/', label: 'Dashboard', icon: '\u2302' },
  { path: '/analytics', label: 'Analytics', icon: '\u2261' },
  { path: '/ore-grades', label: 'Ore Grade Prediction', icon: '\u25C7' },
  { path: '/drill-patterns', label: 'Drill Optimization', icon: '\u2316' },
  { path: '/safety-incidents', label: 'Safety Monitoring', icon: '\u26A0' },
  { path: '/equipment', label: 'Equipment', icon: '\u2699' },
  { path: '/environmental', label: 'Environmental', icon: '\u2618' },
  { path: '/production-logs', label: 'Production Logs', icon: '\u2263' },
  { path: '/workforce', label: 'Workforce', icon: '\u263A' },
  { path: '/cost-analysis', label: 'Cost Analysis', icon: '\u0024' },
  { path: '/geology-maps', label: 'Geology Mapping', icon: '\u2690' },
  { path: '/hauling', label: 'Hauling & Logistics', icon: '\u2708' },
  { path: '/alerts', label: 'Alerts', icon: '\u2623' },
  { path: '/shift-schedules', label: 'Shift Scheduling', icon: '\u2637' },
  { path: '/maintenance', label: 'Maintenance', icon: '\u2692' },
  { path: '/inventory', label: 'Inventory', icon: '\u2612' },
  { path: '/reports', label: 'Reports', icon: '\u2630' },
  { path: '/export', label: 'Data Export', icon: '\u21E9' },
  { path: '/search', label: 'Search', icon: '\u2315' },
  { path: '/audit-logs', label: 'Audit Log', icon: '\u2611' },
  { path: '/user-management', label: 'User Management', icon: '\u2603' },
];

function Layout({ children, user, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon">M</div>
          <div className="logo-text">
            MineOps AI
            <span>Operations Optimizer</span>
          </div>
        </div>
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <button
              key={item.path}
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="user-details">
              <div className="name">{user?.name || 'User'}</div>
              <div className="role">{user?.role || 'operator'}</div>
            </div>
          </div>
          <button className="logout-btn" onClick={onLogout}>
            Logout
          </button>
        </div>
      </aside>
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}

export default Layout;
