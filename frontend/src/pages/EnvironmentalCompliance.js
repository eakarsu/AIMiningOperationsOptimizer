import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';
import AIResultDisplay from '../components/AIResultDisplay';
import { toast } from 'react-toastify';

const emptyForm = {
  reportId: '', category: '', parameter: '', measuredValue: '', unit: '',
  regulatoryLimit: '', location: '', monitoringDate: '', complianceStatus: 'compliant', inspector: '', notes: ''
};

function EnvironmentalCompliance() {
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);

  const fetchItems = async () => {
    try { const res = await api.get('/environmental'); setItems(res.data); } catch (e) { toast.error('Failed to load'); }
  };
  useEffect(() => { fetchItems(); }, []);

  const handleRowClick = (item) => { setSelected(item); setAiResult(item.aiAssessment); setShowDetail(true); };
  const handleNew = () => { setForm(emptyForm); setEditMode(false); setShowForm(true); };

  const handleEdit = () => {
    setForm({
      reportId: selected.reportId, category: selected.category, parameter: selected.parameter,
      measuredValue: selected.measuredValue, unit: selected.unit, regulatoryLimit: selected.regulatoryLimit,
      location: selected.location, monitoringDate: selected.monitoringDate?.split('T')[0] || '',
      complianceStatus: selected.complianceStatus, inspector: selected.inspector, notes: selected.notes || ''
    });
    setEditMode(true); setShowDetail(false); setShowForm(true);
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this report?')) return;
    try { await api.delete(`/environmental/${selected.id}`); toast.success('Deleted'); setShowDetail(false); fetchItems(); }
    catch (e) { toast.error('Failed'); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode) { await api.put(`/environmental/${selected.id}`, form); toast.success('Updated'); }
      else { await api.post('/environmental', form); toast.success('Created'); }
      setShowForm(false); fetchItems();
    } catch (e) { toast.error(e.response?.data?.error || 'Failed'); }
  };

  const handleAIAssess = async () => {
    setAiLoading(true); setAiResult(null);
    try {
      const res = await api.post(`/environmental/${selected.id}/assess`);
      setAiResult(res.data.aiResult); setSelected(res.data.item); toast.success('AI assessment complete'); fetchItems();
    } catch (e) { toast.error('AI assessment failed'); } finally { setAiLoading(false); }
  };

  const updateForm = (f, v) => setForm(prev => ({ ...prev, [f]: v }));
  const getComplianceBadge = (s) => ({ compliant: 'badge-success', warning: 'badge-warning', 'non-compliant': 'badge-danger', assessed: 'badge-info' }[s] || 'badge-secondary');

  return (
    <div className="feature-page">
      <div className="page-header">
        <h1>Environmental Compliance</h1>
        <p>AI-powered regulatory monitoring and compliance assessment</p>
      </div>
      <div className="page-actions"><button className="btn btn-primary" onClick={handleNew}>+ New Report</button></div>
      <div className="data-table-container">
        <table className="data-table">
          <thead><tr><th>Report ID</th><th>Category</th><th>Parameter</th><th>Measured</th><th>Limit</th><th>Location</th><th>Date</th><th>Status</th></tr></thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id} onClick={() => handleRowClick(item)}>
                <td><strong>{item.reportId}</strong></td><td>{item.category}</td><td>{item.parameter}</td>
                <td>{item.measuredValue} {item.unit}</td><td>{item.regulatoryLimit} {item.unit}</td>
                <td>{item.location}</td><td>{item.monitoringDate?.split('T')[0]}</td>
                <td><span className={`badge ${getComplianceBadge(item.complianceStatus)}`}>{item.complianceStatus}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
        {items.length === 0 && <div className="empty-state"><div className="empty-icon">{'\u2618'}</div><h3>No reports yet</h3></div>}
      </div>

      <Modal isOpen={showDetail} onClose={() => setShowDetail(false)} title="Environmental Report Details">
        {selected && (
          <>
            <div className="detail-section">
              <h3>Report Information</h3>
              <div className="detail-grid">
                <div className="detail-item"><span className="detail-label">Report ID</span><span className="detail-value">{selected.reportId}</span></div>
                <div className="detail-item"><span className="detail-label">Category</span><span className="detail-value">{selected.category}</span></div>
                <div className="detail-item"><span className="detail-label">Parameter</span><span className="detail-value">{selected.parameter}</span></div>
                <div className="detail-item"><span className="detail-label">Measured Value</span><span className="detail-value">{selected.measuredValue} {selected.unit}</span></div>
                <div className="detail-item"><span className="detail-label">Regulatory Limit</span><span className="detail-value">{selected.regulatoryLimit} {selected.unit}</span></div>
                <div className="detail-item"><span className="detail-label">Location</span><span className="detail-value">{selected.location}</span></div>
                <div className="detail-item"><span className="detail-label">Date</span><span className="detail-value">{selected.monitoringDate?.split('T')[0]}</span></div>
                <div className="detail-item"><span className="detail-label">Inspector</span><span className="detail-value">{selected.inspector}</span></div>
                <div className="detail-item"><span className="detail-label">Status</span><span className={`badge ${getComplianceBadge(selected.complianceStatus)}`}>{selected.complianceStatus}</span></div>
              </div>
            </div>
            {selected.notes && <div className="detail-section"><h3>Notes</h3><p style={{ fontSize: '14px', color: '#94a3b8' }}>{selected.notes}</p></div>}
            <div className="detail-actions">
              <button className="btn btn-warning" onClick={handleEdit}>Edit</button>
              <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
              <button className="btn btn-success" onClick={handleAIAssess} disabled={aiLoading}>{aiLoading ? 'Assessing...' : 'AI Compliance Assessment'}</button>
            </div>
            <AIResultDisplay result={aiResult} loading={aiLoading} />
          </>
        )}
      </Modal>

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editMode ? 'Edit Report' : 'New Environmental Report'}
        footer={<><button className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button><button className="btn btn-primary" onClick={handleSubmit}>{editMode ? 'Update' : 'Create'}</button></>}>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group"><label>Report ID</label><input value={form.reportId} onChange={e => updateForm('reportId', e.target.value)} required placeholder="e.g. ENV-016" /></div>
            <div className="form-group"><label>Category</label><select value={form.category} onChange={e => updateForm('category', e.target.value)} required>
              <option value="">Select...</option><option>Air Quality</option><option>Water Quality</option><option>Noise</option><option>Vibration</option><option>Soil Quality</option><option>Biodiversity</option>
            </select></div>
            <div className="form-group"><label>Parameter</label><input value={form.parameter} onChange={e => updateForm('parameter', e.target.value)} required /></div>
            <div className="form-group"><label>Measured Value</label><input type="number" step="0.001" value={form.measuredValue} onChange={e => updateForm('measuredValue', e.target.value)} required /></div>
            <div className="form-group"><label>Unit</label><input value={form.unit} onChange={e => updateForm('unit', e.target.value)} required placeholder="e.g. mg/L, dB, ppm" /></div>
            <div className="form-group"><label>Regulatory Limit</label><input type="number" step="0.001" value={form.regulatoryLimit} onChange={e => updateForm('regulatoryLimit', e.target.value)} required /></div>
            <div className="form-group"><label>Location</label><input value={form.location} onChange={e => updateForm('location', e.target.value)} required /></div>
            <div className="form-group"><label>Monitoring Date</label><input type="date" value={form.monitoringDate} onChange={e => updateForm('monitoringDate', e.target.value)} required /></div>
            <div className="form-group"><label>Inspector</label><input value={form.inspector} onChange={e => updateForm('inspector', e.target.value)} required /></div>
            <div className="form-group"><label>Compliance Status</label><select value={form.complianceStatus} onChange={e => updateForm('complianceStatus', e.target.value)}>
              <option>compliant</option><option>warning</option><option>non-compliant</option>
            </select></div>
            <div className="form-group full-width"><label>Notes</label><textarea value={form.notes} onChange={e => updateForm('notes', e.target.value)} /></div>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default EnvironmentalCompliance;
