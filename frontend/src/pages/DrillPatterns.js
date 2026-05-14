import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';
import AIResultDisplay from '../components/AIResultDisplay';
import { toast } from 'react-toastify';

const emptyForm = {
  patternId: '', blastZone: '', holeCount: '', holeDepth: '', holeDiameter: '',
  spacing: '', burden: '', rockType: '', explosiveType: '', explosiveAmount: '', status: 'planned'
};

function DrillPatterns() {
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
      const res = await api.get('/drill-patterns', { params: { page, pageSize: pagination.pageSize } });
      const d = res.data;
      if (d.data) { setItems(d.data); setPagination(d.pagination); } else setItems(d);
    } catch (e) { toast.error('Failed to load data'); }
  };
  const exportCSV = async () => {
    try {
      const res = await api.get('/export/drill-patterns', { responseType: 'blob' });
      const url = URL.createObjectURL(res.data); const a = document.createElement('a'); a.href = url; a.download = 'drill-patterns.csv'; a.click();
    } catch (e) { toast.error('Export failed'); }
  };
  useEffect(() => { fetchItems(); }, []);

  const handleRowClick = (item) => { setSelected(item); setAiResult(item.aiOptimization); setShowDetail(true); };
  const handleNew = () => { setForm(emptyForm); setEditMode(false); setShowForm(true); };

  const handleEdit = () => {
    setForm({
      patternId: selected.patternId, blastZone: selected.blastZone, holeCount: selected.holeCount,
      holeDepth: selected.holeDepth, holeDiameter: selected.holeDiameter, spacing: selected.spacing,
      burden: selected.burden, rockType: selected.rockType, explosiveType: selected.explosiveType,
      explosiveAmount: selected.explosiveAmount, status: selected.status
    });
    setEditMode(true); setShowDetail(false); setShowForm(true);
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this drill pattern?')) return;
    try { await api.delete(`/drill-patterns/${selected.id}`); toast.success('Deleted'); setShowDetail(false); fetchItems(); }
    catch (e) { toast.error('Failed to delete'); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode) { await api.put(`/drill-patterns/${selected.id}`, form); toast.success('Updated'); }
      else { await api.post('/drill-patterns', form); toast.success('Created'); }
      setShowForm(false); fetchItems();
    } catch (e) { toast.error(e.response?.data?.error || 'Operation failed'); }
  };

  const handleAIOptimize = async () => {
    setAiLoading(true); setAiResult(null);
    try {
      const res = await api.post(`/drill-patterns/${selected.id}/optimize`);
      setAiResult(res.data.aiResult); setSelected(res.data.item); toast.success('AI optimization complete'); fetchItems();
    } catch (e) { toast.error('AI optimization failed'); } finally { setAiLoading(false); }
  };

  const updateForm = (f, v) => setForm(prev => ({ ...prev, [f]: v }));
  const getBadge = (s) => ({ completed: 'badge-success', optimized: 'badge-info', planned: 'badge-warning' }[s] || 'badge-secondary');

  return (
    <div className="feature-page">
      <div className="page-header">
        <h1>Drill Pattern Optimization</h1>
        <p>AI-powered blast design and fragmentation optimization</p>
      </div>
      <div className="page-actions">
        <button className="btn btn-primary" onClick={handleNew}>+ New Pattern</button>
        <button className="btn btn-secondary" onClick={exportCSV} style={{ marginLeft: '8px' }}>Export CSV</button>
      </div>
      <div className="data-table-container">
        <table className="data-table">
          <thead><tr><th>Pattern ID</th><th>Blast Zone</th><th>Holes</th><th>Depth (m)</th><th>Spacing (m)</th><th>Burden (m)</th><th>Rock Type</th><th>Explosive</th><th>Status</th></tr></thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id} onClick={() => handleRowClick(item)}>
                <td><strong>{item.patternId}</strong></td><td>{item.blastZone}</td><td>{item.holeCount}</td>
                <td>{item.holeDepth}</td><td>{item.spacing}</td><td>{item.burden}</td>
                <td>{item.rockType}</td><td>{item.explosiveType}</td>
                <td><span className={`badge ${getBadge(item.status)}`}>{item.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
        {items.length === 0 && <div className="empty-state"><div className="empty-icon">{'\u2316'}</div><h3>No drill patterns yet</h3></div>}
      </div>

      {pagination.totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '16px', alignItems: 'center' }}>
          <button className="btn btn-secondary" disabled={pagination.page <= 1} onClick={() => fetchItems(pagination.page - 1)}>Prev</button>
          <span style={{ color: '#94a3b8', fontSize: '14px' }}>Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)</span>
          <button className="btn btn-secondary" disabled={pagination.page >= pagination.totalPages} onClick={() => fetchItems(pagination.page + 1)}>Next</button>
        </div>
      )}

      <Modal isOpen={showDetail} onClose={() => setShowDetail(false)} title="Drill Pattern Details">
        {selected && (
          <>
            <div className="detail-section">
              <h3>Pattern Information</h3>
              <div className="detail-grid">
                <div className="detail-item"><span className="detail-label">Pattern ID</span><span className="detail-value">{selected.patternId}</span></div>
                <div className="detail-item"><span className="detail-label">Blast Zone</span><span className="detail-value">{selected.blastZone}</span></div>
                <div className="detail-item"><span className="detail-label">Hole Count</span><span className="detail-value">{selected.holeCount}</span></div>
                <div className="detail-item"><span className="detail-label">Hole Depth</span><span className="detail-value">{selected.holeDepth}m</span></div>
                <div className="detail-item"><span className="detail-label">Hole Diameter</span><span className="detail-value">{selected.holeDiameter}mm</span></div>
                <div className="detail-item"><span className="detail-label">Spacing</span><span className="detail-value">{selected.spacing}m</span></div>
                <div className="detail-item"><span className="detail-label">Burden</span><span className="detail-value">{selected.burden}m</span></div>
                <div className="detail-item"><span className="detail-label">Rock Type</span><span className="detail-value">{selected.rockType}</span></div>
                <div className="detail-item"><span className="detail-label">Explosive</span><span className="detail-value">{selected.explosiveType}</span></div>
                <div className="detail-item"><span className="detail-label">Amount</span><span className="detail-value">{selected.explosiveAmount}kg</span></div>
                <div className="detail-item"><span className="detail-label">Status</span><span className={`badge ${getBadge(selected.status)}`}>{selected.status}</span></div>
              </div>
            </div>
            <div className="detail-actions">
              <button className="btn btn-warning" onClick={handleEdit}>Edit</button>
              <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
              <button className="btn btn-success" onClick={handleAIOptimize} disabled={aiLoading}>{aiLoading ? 'Optimizing...' : 'AI Optimize Pattern'}</button>
            </div>
            <AIResultDisplay result={aiResult} loading={aiLoading} entityType="drill_pattern" />
          </>
        )}
      </Modal>

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editMode ? 'Edit Pattern' : 'New Drill Pattern'}
        footer={<><button className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button><button className="btn btn-primary" onClick={handleSubmit}>{editMode ? 'Update' : 'Create'}</button></>}>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group"><label>Pattern ID</label><input value={form.patternId} onChange={e => updateForm('patternId', e.target.value)} required placeholder="e.g. DRL-016" /></div>
            <div className="form-group"><label>Blast Zone</label><input value={form.blastZone} onChange={e => updateForm('blastZone', e.target.value)} required /></div>
            <div className="form-group"><label>Hole Count</label><input type="number" value={form.holeCount} onChange={e => updateForm('holeCount', e.target.value)} required /></div>
            <div className="form-group"><label>Hole Depth (m)</label><input type="number" step="0.1" value={form.holeDepth} onChange={e => updateForm('holeDepth', e.target.value)} required /></div>
            <div className="form-group"><label>Hole Diameter (mm)</label><input type="number" value={form.holeDiameter} onChange={e => updateForm('holeDiameter', e.target.value)} required /></div>
            <div className="form-group"><label>Spacing (m)</label><input type="number" step="0.1" value={form.spacing} onChange={e => updateForm('spacing', e.target.value)} required /></div>
            <div className="form-group"><label>Burden (m)</label><input type="number" step="0.1" value={form.burden} onChange={e => updateForm('burden', e.target.value)} required /></div>
            <div className="form-group"><label>Rock Type</label><select value={form.rockType} onChange={e => updateForm('rockType', e.target.value)} required>
              <option value="">Select...</option><option>Granite</option><option>Limestone</option><option>Basalt</option><option>Sandstone</option><option>Gneiss</option><option>Quartzite</option><option>Schist</option><option>Dolomite</option><option>Shale</option><option>Gabbro</option>
            </select></div>
            <div className="form-group"><label>Explosive Type</label><select value={form.explosiveType} onChange={e => updateForm('explosiveType', e.target.value)} required>
              <option value="">Select...</option><option>ANFO</option><option>Emulsion</option><option>Watergel</option><option>Heavy ANFO</option>
            </select></div>
            <div className="form-group"><label>Explosive Amount (kg)</label><input type="number" value={form.explosiveAmount} onChange={e => updateForm('explosiveAmount', e.target.value)} required /></div>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default DrillPatterns;
