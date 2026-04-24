import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';
import { toast } from 'react-toastify';

const emptyForm = {
  alertId: '', title: '', type: '', severity: 'medium', message: '', source: '', threshold: '', currentValue: ''
};

function AlertsPage() {
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [filterType, setFilterType] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const fetchItems = async () => {
    try { const res = await api.get('/alerts'); setItems(res.data); } catch (e) { toast.error('Failed to load alerts'); }
  };
  useEffect(() => { fetchItems(); }, []);

  const handleRowClick = (item) => { setSelected(item); setShowDetail(true); };
  const handleNew = () => { setForm(emptyForm); setEditMode(false); setShowForm(true); };

  const handleEdit = () => {
    setForm({
      alertId: selected.alertId, title: selected.title, type: selected.type,
      severity: selected.severity, message: selected.message || '',
      source: selected.source || '', threshold: selected.threshold || '', currentValue: selected.currentValue || ''
    });
    setEditMode(true); setShowDetail(false); setShowForm(true);
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this alert?')) return;
    try { await api.delete(`/alerts/${selected.id}`); toast.success('Deleted'); setShowDetail(false); fetchItems(); }
    catch (e) { toast.error('Failed'); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode) { await api.put(`/alerts/${selected.id}`, form); toast.success('Updated'); }
      else { await api.post('/alerts', form); toast.success('Created'); }
      setShowForm(false); fetchItems();
    } catch (e) { toast.error(e.response?.data?.error || 'Failed'); }
  };

  const handleAcknowledge = async () => {
    try { await api.put(`/alerts/${selected.id}/acknowledge`); toast.success('Alert acknowledged'); setShowDetail(false); fetchItems(); }
    catch (e) { toast.error('Failed to acknowledge'); }
  };

  const handleResolve = async () => {
    try { await api.put(`/alerts/${selected.id}/resolve`); toast.success('Alert resolved'); setShowDetail(false); fetchItems(); }
    catch (e) { toast.error('Failed to resolve'); }
  };

  const updateForm = (f, v) => setForm(prev => ({ ...prev, [f]: v }));

  const getSeverityBadge = (s) => ({ critical: 'badge-danger', high: 'badge-warning', medium: 'badge-info', low: 'badge-secondary' }[s] || 'badge-secondary');
  const getStatusBadge = (s) => ({ active: 'badge-danger', acknowledged: 'badge-warning', resolved: 'badge-success', dismissed: 'badge-secondary' }[s] || 'badge-secondary');

  const filtered = items.filter(item =>
    (!filterType || item.type === filterType) &&
    (!filterSeverity || item.severity === filterSeverity) &&
    (!filterStatus || item.status === filterStatus)
  );

  return (
    <div className="feature-page">
      <div className="page-header">
        <h1>Alert Management</h1>
        <p>Monitor and manage operational alerts across the mine</p>
      </div>
      <div className="page-actions">
        <select className="btn btn-secondary" value={filterType} onChange={e => setFilterType(e.target.value)}>
          <option value="">All Types</option>
          <option value="safety">Safety</option><option value="equipment">Equipment</option>
          <option value="environmental">Environmental</option><option value="production">Production</option><option value="cost">Cost</option>
        </select>
        <select className="btn btn-secondary" value={filterSeverity} onChange={e => setFilterSeverity(e.target.value)} style={{ marginLeft: '8px' }}>
          <option value="">All Severities</option>
          <option value="critical">Critical</option><option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option>
        </select>
        <select className="btn btn-secondary" value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ marginLeft: '8px' }}>
          <option value="">All Statuses</option>
          <option value="active">Active</option><option value="acknowledged">Acknowledged</option><option value="resolved">Resolved</option><option value="dismissed">Dismissed</option>
        </select>
        <button className="btn btn-primary" onClick={handleNew} style={{ marginLeft: '8px' }}>+ Create Alert</button>
      </div>
      <div className="data-table-container">
        <table className="data-table">
          <thead><tr><th>Alert ID</th><th>Title</th><th>Type</th><th>Severity</th><th>Status</th><th>Source</th><th>Created</th></tr></thead>
          <tbody>
            {filtered.map(item => (
              <tr key={item.id} onClick={() => handleRowClick(item)}>
                <td><strong>{item.alertId}</strong></td><td>{item.title}</td><td>{item.type}</td>
                <td><span className={`badge ${getSeverityBadge(item.severity)}`}>{item.severity}</span></td>
                <td><span className={`badge ${getStatusBadge(item.status)}`}>{item.status}</span></td>
                <td>{item.source}</td><td>{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="empty-state"><div className="empty-icon">{'\u{1F514}'}</div><h3>No alerts found</h3></div>}
      </div>

      <Modal isOpen={showDetail} onClose={() => setShowDetail(false)} title="Alert Details">
        {selected && (
          <>
            <div className="detail-section">
              <h3>Alert Information</h3>
              <div className="detail-grid">
                <div className="detail-item"><span className="detail-label">Alert ID</span><span className="detail-value">{selected.alertId}</span></div>
                <div className="detail-item"><span className="detail-label">Title</span><span className="detail-value">{selected.title}</span></div>
                <div className="detail-item"><span className="detail-label">Type</span><span className="detail-value">{selected.type}</span></div>
                <div className="detail-item"><span className="detail-label">Severity</span><span className={`badge ${getSeverityBadge(selected.severity)}`}>{selected.severity}</span></div>
                <div className="detail-item"><span className="detail-label">Status</span><span className={`badge ${getStatusBadge(selected.status)}`}>{selected.status}</span></div>
                <div className="detail-item"><span className="detail-label">Source</span><span className="detail-value">{selected.source}</span></div>
                <div className="detail-item"><span className="detail-label">Threshold</span><span className="detail-value">{selected.threshold || 'N/A'}</span></div>
                <div className="detail-item"><span className="detail-label">Current Value</span><span className="detail-value">{selected.currentValue || 'N/A'}</span></div>
                <div className="detail-item"><span className="detail-label">Created</span><span className="detail-value">{selected.createdAt ? new Date(selected.createdAt).toLocaleString() : 'N/A'}</span></div>
              </div>
            </div>
            {selected.message && (
              <div className="detail-section">
                <h3>Message</h3>
                <p style={{ fontSize: '14px', lineHeight: 1.6, color: '#94a3b8' }}>{selected.message}</p>
              </div>
            )}
            <div className="detail-actions">
              <button className="btn btn-warning" onClick={handleEdit}>Edit</button>
              <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
              {selected.status === 'active' && <button className="btn btn-info" onClick={handleAcknowledge}>Acknowledge</button>}
              {(selected.status === 'active' || selected.status === 'acknowledged') && <button className="btn btn-success" onClick={handleResolve}>Resolve</button>}
            </div>
          </>
        )}
      </Modal>

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editMode ? 'Edit Alert' : 'Create New Alert'}
        footer={<><button className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button><button className="btn btn-primary" onClick={handleSubmit}>{editMode ? 'Update' : 'Create'}</button></>}>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group"><label>Alert ID</label><input value={form.alertId} onChange={e => updateForm('alertId', e.target.value)} required placeholder="e.g. ALT-001" /></div>
            <div className="form-group"><label>Title</label><input value={form.title} onChange={e => updateForm('title', e.target.value)} required /></div>
            <div className="form-group"><label>Type</label><select value={form.type} onChange={e => updateForm('type', e.target.value)} required>
              <option value="">Select...</option><option value="safety">Safety</option><option value="equipment">Equipment</option>
              <option value="environmental">Environmental</option><option value="production">Production</option><option value="cost">Cost</option>
            </select></div>
            <div className="form-group"><label>Severity</label><select value={form.severity} onChange={e => updateForm('severity', e.target.value)} required>
              <option value="critical">Critical</option><option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option>
            </select></div>
            <div className="form-group"><label>Source</label><input value={form.source} onChange={e => updateForm('source', e.target.value)} placeholder="e.g. Sensor A-12" /></div>
            <div className="form-group"><label>Threshold</label><input value={form.threshold} onChange={e => updateForm('threshold', e.target.value)} placeholder="e.g. 85" /></div>
            <div className="form-group"><label>Current Value</label><input value={form.currentValue} onChange={e => updateForm('currentValue', e.target.value)} placeholder="e.g. 92" /></div>
            <div className="form-group full-width"><label>Message</label><textarea value={form.message} onChange={e => updateForm('message', e.target.value)} required /></div>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default AlertsPage;
