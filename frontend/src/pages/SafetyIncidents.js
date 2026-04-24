import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';
import AIResultDisplay from '../components/AIResultDisplay';
import { toast } from 'react-toastify';

const emptyForm = {
  incidentId: '', type: '', severity: '', location: '', zone: '', description: '',
  reportedBy: '', date: '', status: 'open', injuriesCount: 0, rootCause: '', correctiveAction: ''
};

function SafetyIncidents() {
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);

  const fetchItems = async () => {
    try { const res = await api.get('/safety-incidents'); setItems(res.data); } catch (e) { toast.error('Failed to load'); }
  };
  useEffect(() => { fetchItems(); }, []);

  const handleRowClick = (item) => { setSelected(item); setAiResult(item.aiAnalysis); setShowDetail(true); };
  const handleNew = () => { setForm(emptyForm); setEditMode(false); setShowForm(true); };

  const handleEdit = () => {
    setForm({
      incidentId: selected.incidentId, type: selected.type, severity: selected.severity,
      location: selected.location, zone: selected.zone, description: selected.description,
      reportedBy: selected.reportedBy, date: selected.date?.split('T')[0] || '', status: selected.status,
      injuriesCount: selected.injuriesCount, rootCause: selected.rootCause || '', correctiveAction: selected.correctiveAction || ''
    });
    setEditMode(true); setShowDetail(false); setShowForm(true);
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this incident?')) return;
    try { await api.delete(`/safety-incidents/${selected.id}`); toast.success('Deleted'); setShowDetail(false); fetchItems(); }
    catch (e) { toast.error('Failed'); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode) { await api.put(`/safety-incidents/${selected.id}`, form); toast.success('Updated'); }
      else { await api.post('/safety-incidents', form); toast.success('Created'); }
      setShowForm(false); fetchItems();
    } catch (e) { toast.error(e.response?.data?.error || 'Failed'); }
  };

  const handleAIAnalyze = async () => {
    setAiLoading(true); setAiResult(null);
    try {
      const res = await api.post(`/safety-incidents/${selected.id}/analyze`);
      setAiResult(res.data.aiResult); setSelected(res.data.item); toast.success('AI analysis complete'); fetchItems();
    } catch (e) { toast.error('AI analysis failed'); } finally { setAiLoading(false); }
  };

  const updateForm = (f, v) => setForm(prev => ({ ...prev, [f]: v }));
  const getSeverityBadge = (s) => ({ Critical: 'badge-danger', High: 'badge-warning', Medium: 'badge-info', Low: 'badge-secondary' }[s] || 'badge-secondary');
  const getStatusBadge = (s) => ({ resolved: 'badge-success', open: 'badge-danger', investigating: 'badge-warning', analyzed: 'badge-info' }[s] || 'badge-secondary');

  return (
    <div className="feature-page">
      <div className="page-header">
        <h1>Safety Monitoring</h1>
        <p>AI-powered incident analysis and prevention recommendations</p>
      </div>
      <div className="page-actions"><button className="btn btn-primary" onClick={handleNew}>+ Report Incident</button></div>
      <div className="data-table-container">
        <table className="data-table">
          <thead><tr><th>ID</th><th>Type</th><th>Severity</th><th>Location</th><th>Date</th><th>Injuries</th><th>Reported By</th><th>Status</th></tr></thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id} onClick={() => handleRowClick(item)}>
                <td><strong>{item.incidentId}</strong></td><td>{item.type}</td>
                <td><span className={`badge ${getSeverityBadge(item.severity)}`}>{item.severity}</span></td>
                <td>{item.location}</td><td>{item.date?.split('T')[0]}</td><td>{item.injuriesCount}</td>
                <td>{item.reportedBy}</td><td><span className={`badge ${getStatusBadge(item.status)}`}>{item.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
        {items.length === 0 && <div className="empty-state"><div className="empty-icon">{'\u26A0'}</div><h3>No incidents recorded</h3></div>}
      </div>

      <Modal isOpen={showDetail} onClose={() => setShowDetail(false)} title="Safety Incident Details">
        {selected && (
          <>
            <div className="detail-section">
              <h3>Incident Information</h3>
              <div className="detail-grid">
                <div className="detail-item"><span className="detail-label">Incident ID</span><span className="detail-value">{selected.incidentId}</span></div>
                <div className="detail-item"><span className="detail-label">Type</span><span className="detail-value">{selected.type}</span></div>
                <div className="detail-item"><span className="detail-label">Severity</span><span className={`badge ${getSeverityBadge(selected.severity)}`}>{selected.severity}</span></div>
                <div className="detail-item"><span className="detail-label">Location</span><span className="detail-value">{selected.location}</span></div>
                <div className="detail-item"><span className="detail-label">Zone</span><span className="detail-value">{selected.zone}</span></div>
                <div className="detail-item"><span className="detail-label">Date</span><span className="detail-value">{selected.date?.split('T')[0]}</span></div>
                <div className="detail-item"><span className="detail-label">Injuries</span><span className="detail-value">{selected.injuriesCount}</span></div>
                <div className="detail-item"><span className="detail-label">Reported By</span><span className="detail-value">{selected.reportedBy}</span></div>
                <div className="detail-item"><span className="detail-label">Status</span><span className={`badge ${getStatusBadge(selected.status)}`}>{selected.status}</span></div>
              </div>
            </div>
            <div className="detail-section">
              <h3>Description</h3>
              <p style={{ fontSize: '14px', lineHeight: 1.6, color: '#94a3b8' }}>{selected.description}</p>
            </div>
            {selected.rootCause && <div className="detail-section"><h3>Root Cause</h3><p style={{ fontSize: '14px', color: '#94a3b8' }}>{selected.rootCause}</p></div>}
            <div className="detail-actions">
              <button className="btn btn-warning" onClick={handleEdit}>Edit</button>
              <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
              <button className="btn btn-success" onClick={handleAIAnalyze} disabled={aiLoading}>{aiLoading ? 'Analyzing...' : 'AI Safety Analysis'}</button>
            </div>
            <AIResultDisplay result={aiResult} loading={aiLoading} />
          </>
        )}
      </Modal>

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editMode ? 'Edit Incident' : 'Report New Incident'}
        footer={<><button className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button><button className="btn btn-primary" onClick={handleSubmit}>{editMode ? 'Update' : 'Report'}</button></>}>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group"><label>Incident ID</label><input value={form.incidentId} onChange={e => updateForm('incidentId', e.target.value)} required placeholder="e.g. SAF-016" /></div>
            <div className="form-group"><label>Type</label><select value={form.type} onChange={e => updateForm('type', e.target.value)} required>
              <option value="">Select...</option><option>Equipment Malfunction</option><option>Ground Instability</option><option>Vehicle Collision</option><option>Rock Fall</option><option>Electrical Hazard</option><option>Dust Exposure</option><option>Blast Misfire</option><option>Slip/Trip/Fall</option><option>Chemical Spill</option><option>Near Miss</option><option>Noise Exposure</option><option>Fire</option>
            </select></div>
            <div className="form-group"><label>Severity</label><select value={form.severity} onChange={e => updateForm('severity', e.target.value)} required>
              <option value="">Select...</option><option>Critical</option><option>High</option><option>Medium</option><option>Low</option>
            </select></div>
            <div className="form-group"><label>Location</label><input value={form.location} onChange={e => updateForm('location', e.target.value)} required /></div>
            <div className="form-group"><label>Zone</label><input value={form.zone} onChange={e => updateForm('zone', e.target.value)} required /></div>
            <div className="form-group"><label>Date</label><input type="date" value={form.date} onChange={e => updateForm('date', e.target.value)} required /></div>
            <div className="form-group"><label>Reported By</label><input value={form.reportedBy} onChange={e => updateForm('reportedBy', e.target.value)} required /></div>
            <div className="form-group"><label>Injuries Count</label><input type="number" value={form.injuriesCount} onChange={e => updateForm('injuriesCount', e.target.value)} /></div>
            <div className="form-group full-width"><label>Description</label><textarea value={form.description} onChange={e => updateForm('description', e.target.value)} required /></div>
            <div className="form-group full-width"><label>Root Cause (if known)</label><textarea value={form.rootCause} onChange={e => updateForm('rootCause', e.target.value)} /></div>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default SafetyIncidents;
