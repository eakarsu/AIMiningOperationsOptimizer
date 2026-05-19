import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';
import AIResultDisplay from '../components/AIResultDisplay';
import { toast } from 'react-toastify';

const emptyForm = {
  surveyId: '', surveyType: '', location: '', zone: '', rockFormation: '', dominantMineral: '',
  structuralFeature: '', strikeAngle: '', dipAngle: '', depthRange: '', surveyDate: '', geologist: '', confidence: '', notes: ''
};

function GeologyMaps() {
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 20, total: 0, totalPages: 1 });
  const [selected, setSelected] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);

  const fetchItems = async (page = 1) => {
    try {
      const res = await api.get('/geology-maps', { params: { page, pageSize: pagination.pageSize } });
      const d = res.data;
      if (d.data) { setItems(d.data); setPagination(d.pagination); } else setItems(d);
    } catch (e) { toast.error('Failed to load'); }
  };
  const exportCSV = async () => {
    try {
      const res = await api.get('/export/geology-maps', { responseType: 'blob' });
      const url = URL.createObjectURL(res.data); const a = document.createElement('a'); a.href = url; a.download = 'geology-maps.csv'; a.click();
    } catch (e) { toast.error('Export failed'); }
  };
  useEffect(() => { fetchItems(); }, []);

  const handleRowClick = (item) => { setSelected(item); setAiResult(item.aiInterpretation); setShowDetail(true); };
  const handleNew = () => { setForm(emptyForm); setEditMode(false); setShowForm(true); };

  const handleEdit = () => {
    setForm({
      surveyId: selected.surveyId, surveyType: selected.surveyType, location: selected.location,
      zone: selected.zone, rockFormation: selected.rockFormation, dominantMineral: selected.dominantMineral,
      structuralFeature: selected.structuralFeature, strikeAngle: selected.strikeAngle,
      dipAngle: selected.dipAngle, depthRange: selected.depthRange, surveyDate: selected.surveyDate || '',
      geologist: selected.geologist, confidence: selected.confidence, notes: selected.notes || ''
    });
    setEditMode(true); setShowDetail(false); setShowForm(true);
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this survey?')) return;
    try { await api.delete(`/geology-maps/${selected.id}`); toast.success('Deleted'); setShowDetail(false); fetchItems(); }
    catch (e) { toast.error('Failed'); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode) { await api.put(`/geology-maps/${selected.id}`, form); toast.success('Updated'); }
      else { await api.post('/geology-maps', form); toast.success('Created'); }
      setShowForm(false); fetchItems();
    } catch (e) { toast.error(e.response?.data?.error || 'Failed'); }
  };

  const handleAIInterpret = async () => {
    setAiLoading(true); setAiResult(null);
    try {
      const res = await api.post(`/geology-maps/${selected.id}/interpret`);
      setAiResult(res.data.aiResult); setSelected(res.data.item); toast.success('AI interpretation complete'); fetchItems();
    } catch (e) { toast.error('AI interpretation failed'); } finally { setAiLoading(false); }
  };

  const updateForm = (f, v) => setForm(prev => ({ ...prev, [f]: v }));
  const getConfBadge = (c) => c >= 85 ? 'badge-success' : c >= 70 ? 'badge-warning' : 'badge-danger';

  return (
    <div className="feature-page">
      <div className="page-header">
        <h1>Geology Mapping</h1>
        <p>AI-powered geological interpretation and resource assessment</p>
      </div>
      <div className="page-actions">
        <button className="btn btn-primary" onClick={handleNew}>+ New Survey</button>
        <button className="btn btn-secondary" onClick={exportCSV} style={{ marginLeft: '8px' }}>Export CSV</button>
      </div>
      <div className="data-table-container">
        <table className="data-table">
          <thead><tr><th>Survey ID</th><th>Type</th><th>Location</th><th>Formation</th><th>Mineral</th><th>Structure</th><th>Depth</th><th>Confidence</th></tr></thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id} onClick={() => handleRowClick(item)}>
                <td><strong>{item.surveyId}</strong></td><td>{item.surveyType}</td><td>{item.location}</td>
                <td>{item.rockFormation}</td><td>{item.dominantMineral}</td><td>{item.structuralFeature}</td>
                <td>{item.depthRange}</td>
                <td><span className={`badge ${getConfBadge(item.confidence)}`}>{item.confidence}%</span></td>
              </tr>
            ))}
          </tbody>
        </table>
        {items.length === 0 && <div className="empty-state"><h3>No geology surveys</h3></div>}
      </div>

      {pagination.totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '16px', alignItems: 'center' }}>
          <button className="btn btn-secondary" disabled={pagination.page <= 1} onClick={() => fetchItems(pagination.page - 1)}>Prev</button>
          <span style={{ color: '#94a3b8', fontSize: '14px' }}>Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)</span>
          <button className="btn btn-secondary" disabled={pagination.page >= pagination.totalPages} onClick={() => fetchItems(pagination.page + 1)}>Next</button>
        </div>
      )}

      <Modal isOpen={showDetail} onClose={() => setShowDetail(false)} title="Geological Survey Details">
        {selected && (
          <>
            <div className="detail-section">
              <h3>Survey Information</h3>
              <div className="detail-grid">
                <div className="detail-item"><span className="detail-label">Survey ID</span><span className="detail-value">{selected.surveyId}</span></div>
                <div className="detail-item"><span className="detail-label">Type</span><span className="detail-value">{selected.surveyType}</span></div>
                <div className="detail-item"><span className="detail-label">Location</span><span className="detail-value">{selected.location}</span></div>
                <div className="detail-item"><span className="detail-label">Zone</span><span className="detail-value">{selected.zone}</span></div>
                <div className="detail-item"><span className="detail-label">Rock Formation</span><span className="detail-value">{selected.rockFormation}</span></div>
                <div className="detail-item"><span className="detail-label">Dominant Mineral</span><span className="detail-value">{selected.dominantMineral}</span></div>
                <div className="detail-item"><span className="detail-label">Structural Feature</span><span className="detail-value">{selected.structuralFeature}</span></div>
                <div className="detail-item"><span className="detail-label">Strike</span><span className="detail-value">{selected.strikeAngle}°</span></div>
                <div className="detail-item"><span className="detail-label">Dip</span><span className="detail-value">{selected.dipAngle}°</span></div>
                <div className="detail-item"><span className="detail-label">Depth Range</span><span className="detail-value">{selected.depthRange}</span></div>
                <div className="detail-item"><span className="detail-label">Survey Date</span><span className="detail-value">{selected.surveyDate}</span></div>
                <div className="detail-item"><span className="detail-label">Geologist</span><span className="detail-value">{selected.geologist}</span></div>
                <div className="detail-item"><span className="detail-label">Confidence</span><span className={`badge ${getConfBadge(selected.confidence)}`}>{selected.confidence}%</span></div>
              </div>
            </div>
            {selected.notes && <div className="detail-section"><h3>Notes</h3><p style={{ fontSize: '14px', color: '#94a3b8' }}>{selected.notes}</p></div>}
            <div className="detail-actions">
              <button className="btn btn-warning" onClick={handleEdit}>Edit</button>
              <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
              <button className="btn btn-success" onClick={handleAIInterpret} disabled={aiLoading}>{aiLoading ? 'Interpreting...' : 'AI Geological Interpretation'}</button>
            </div>
            <AIResultDisplay result={aiResult} loading={aiLoading} entityType="geology" />
          </>
        )}
      </Modal>

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editMode ? 'Edit Survey' : 'New Geological Survey'}
        footer={<><button className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button><button className="btn btn-primary" onClick={handleSubmit}>{editMode ? 'Update' : 'Create'}</button></>}>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group"><label>Survey ID</label><input value={form.surveyId} onChange={e => updateForm('surveyId', e.target.value)} required placeholder="e.g. GEO-016" /></div>
            <div className="form-group"><label>Survey Type</label><select value={form.surveyType} onChange={e => updateForm('surveyType', e.target.value)} required>
              <option value="">Select...</option><option>Diamond Drilling</option><option>RC Drilling</option><option>Geological Mapping</option><option>Geophysical Survey</option><option>Geochemical Sampling</option>
            </select></div>
            <div className="form-group"><label>Location</label><input value={form.location} onChange={e => updateForm('location', e.target.value)} required /></div>
            <div className="form-group"><label>Zone</label><input value={form.zone} onChange={e => updateForm('zone', e.target.value)} required /></div>
            <div className="form-group"><label>Rock Formation</label><input value={form.rockFormation} onChange={e => updateForm('rockFormation', e.target.value)} required /></div>
            <div className="form-group"><label>Dominant Mineral</label><input value={form.dominantMineral} onChange={e => updateForm('dominantMineral', e.target.value)} required /></div>
            <div className="form-group"><label>Structural Feature</label><input value={form.structuralFeature} onChange={e => updateForm('structuralFeature', e.target.value)} required /></div>
            <div className="form-group"><label>Strike Angle</label><input type="number" min="0" max="360" value={form.strikeAngle} onChange={e => updateForm('strikeAngle', e.target.value)} required /></div>
            <div className="form-group"><label>Dip Angle</label><input type="number" min="0" max="90" value={form.dipAngle} onChange={e => updateForm('dipAngle', e.target.value)} required /></div>
            <div className="form-group"><label>Depth Range</label><input value={form.depthRange} onChange={e => updateForm('depthRange', e.target.value)} required placeholder="e.g. 20-80m" /></div>
            <div className="form-group"><label>Survey Date</label><input type="date" value={form.surveyDate} onChange={e => updateForm('surveyDate', e.target.value)} required /></div>
            <div className="form-group"><label>Geologist</label><input value={form.geologist} onChange={e => updateForm('geologist', e.target.value)} required /></div>
            <div className="form-group"><label>Confidence %</label><input type="number" min="0" max="100" value={form.confidence} onChange={e => updateForm('confidence', e.target.value)} /></div>
            <div className="form-group full-width"><label>Notes</label><textarea value={form.notes} onChange={e => updateForm('notes', e.target.value)} /></div>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default GeologyMaps;
