import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';
import { toast } from 'react-toastify';

function AuditLogPage() {
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [filterAction, setFilterAction] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');

  const fetchItems = async () => {
    try { const res = await api.get('/audit-logs'); setItems(res.data); } catch (e) { toast.error('Failed to load audit logs'); }
  };
  useEffect(() => { fetchItems(); }, []);

  const handleRowClick = (item) => { setSelected(item); setShowDetail(true); };

  const getActionBadge = (a) => {
    const action = (a || '').toLowerCase();
    return { create: 'badge-success', update: 'badge-info', delete: 'badge-danger', login: 'badge-warning', export: 'badge-secondary', view: 'badge-secondary' }[action] || 'badge-secondary';
  };

  const filtered = items.filter(item => {
    if (filterAction && (item.action || '').toLowerCase() !== filterAction) return false;
    if (filterDateFrom && item.createdAt && new Date(item.createdAt) < new Date(filterDateFrom)) return false;
    if (filterDateTo && item.createdAt && new Date(item.createdAt) > new Date(filterDateTo + 'T23:59:59')) return false;
    return true;
  });

  return (
    <div className="feature-page">
      <div className="page-header">
        <h1>Audit Logs</h1>
        <p>View system activity and user action history</p>
      </div>
      <div className="page-actions">
        <select className="btn btn-secondary" value={filterAction} onChange={e => setFilterAction(e.target.value)}>
          <option value="">All Actions</option>
          <option value="create">Create</option><option value="update">Update</option><option value="delete">Delete</option>
          <option value="login">Login</option><option value="export">Export</option><option value="view">View</option>
        </select>
        <input type="date" className="btn btn-secondary" value={filterDateFrom} onChange={e => setFilterDateFrom(e.target.value)} style={{ marginLeft: '8px' }} placeholder="From" />
        <input type="date" className="btn btn-secondary" value={filterDateTo} onChange={e => setFilterDateTo(e.target.value)} style={{ marginLeft: '8px' }} placeholder="To" />
      </div>
      <div className="data-table-container">
        <table className="data-table">
          <thead><tr><th>Time</th><th>User</th><th>Action</th><th>Resource</th><th>Resource ID</th><th>Details</th></tr></thead>
          <tbody>
            {filtered.map(item => (
              <tr key={item.id} onClick={() => handleRowClick(item)}>
                <td>{item.createdAt ? new Date(item.createdAt).toLocaleString() : 'N/A'}</td>
                <td>{item.user || item.userName || 'System'}</td>
                <td><span className={`badge ${getActionBadge(item.action)}`}>{item.action}</span></td>
                <td>{item.resource || item.resourceType || 'N/A'}</td>
                <td>{item.resourceId || 'N/A'}</td>
                <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.details ? (typeof item.details === 'string' ? item.details : JSON.stringify(item.details).substring(0, 50) + '...') : 'N/A'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="empty-state"><div className="empty-icon">{'\u{1F4DD}'}</div><h3>No audit logs found</h3></div>}
      </div>

      <Modal isOpen={showDetail} onClose={() => setShowDetail(false)} title="Audit Log Details">
        {selected && (
          <>
            <div className="detail-section">
              <h3>Log Information</h3>
              <div className="detail-grid">
                <div className="detail-item"><span className="detail-label">Timestamp</span><span className="detail-value">{selected.createdAt ? new Date(selected.createdAt).toLocaleString() : 'N/A'}</span></div>
                <div className="detail-item"><span className="detail-label">User</span><span className="detail-value">{selected.user || selected.userName || 'System'}</span></div>
                <div className="detail-item"><span className="detail-label">Action</span><span className={`badge ${getActionBadge(selected.action)}`}>{selected.action}</span></div>
                <div className="detail-item"><span className="detail-label">Resource</span><span className="detail-value">{selected.resource || selected.resourceType || 'N/A'}</span></div>
                <div className="detail-item"><span className="detail-label">Resource ID</span><span className="detail-value">{selected.resourceId || 'N/A'}</span></div>
                {selected.ipAddress && <div className="detail-item"><span className="detail-label">IP Address</span><span className="detail-value">{selected.ipAddress}</span></div>}
              </div>
            </div>
            {selected.details && (
              <div className="detail-section">
                <h3>Details</h3>
                <pre style={{ fontSize: '13px', color: '#94a3b8', backgroundColor: '#0f172a', padding: '16px', borderRadius: '8px', overflow: 'auto', maxHeight: '300px', whiteSpace: 'pre-wrap' }}>
                  {typeof selected.details === 'string' ? selected.details : JSON.stringify(selected.details, null, 2)}
                </pre>
              </div>
            )}
          </>
        )}
      </Modal>
    </div>
  );
}

export default AuditLogPage;
