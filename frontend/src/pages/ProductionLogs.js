import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';
import AIResultDisplay from '../components/AIResultDisplay';
import { toast } from 'react-toastify';

const emptyForm = {
  logId: '', shift: '', date: '', zone: '', materialType: '', tonnageMined: '',
  tonnageProcessed: '', recoveryRate: '', downtime: '', operatorCount: '', supervisor: '', notes: ''
};

function ProductionLogs() {
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);

  const fetchItems = async () => {
    try { const res = await api.get('/production-logs'); setItems(res.data); } catch (e) { toast.error('Failed to load'); }
  };
  useEffect(() => { fetchItems(); }, []);

  const handleRowClick = (item) => { setSelected(item); setAiResult(item.aiAnalysis); setShowDetail(true); };
  const handleNew = () => { setForm(emptyForm); setEditMode(false); setShowForm(true); };

  const handleEdit = () => {
    setForm({
      logId: selected.logId, shift: selected.shift, date: selected.date || '',
      zone: selected.zone, materialType: selected.materialType, tonnageMined: selected.tonnageMined,
      tonnageProcessed: selected.tonnageProcessed, recoveryRate: selected.recoveryRate,
      downtime: selected.downtime, operatorCount: selected.operatorCount,
      supervisor: selected.supervisor, notes: selected.notes || ''
    });
    setEditMode(true); setShowDetail(false); setShowForm(true);
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this log?')) return;
    try { await api.delete(`/production-logs/${selected.id}`); toast.success('Deleted'); setShowDetail(false); fetchItems(); }
    catch (e) { toast.error('Failed'); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode) { await api.put(`/production-logs/${selected.id}`, form); toast.success('Updated'); }
      else { await api.post('/production-logs', form); toast.success('Created'); }
      setShowForm(false); fetchItems();
    } catch (e) { toast.error(e.response?.data?.error || 'Failed'); }
  };

  const handleAIAnalyze = async () => {
    setAiLoading(true); setAiResult(null);
    try {
      const res = await api.post(`/production-logs/${selected.id}/analyze`);
      setAiResult(res.data.aiResult); setSelected(res.data.item); toast.success('AI analysis complete'); fetchItems();
    } catch (e) { toast.error('AI analysis failed'); } finally { setAiLoading(false); }
  };

  const updateForm = (f, v) => setForm(prev => ({ ...prev, [f]: v }));

  return (
    <div className="feature-page">
      <div className="page-header">
        <h1>Production Analytics</h1>
        <p>AI-powered production optimization and throughput analysis</p>
      </div>
      <div className="page-actions"><button className="btn btn-primary" onClick={handleNew}>+ New Log Entry</button></div>
      <div className="data-table-container">
        <table className="data-table">
          <thead><tr><th>Log ID</th><th>Date</th><th>Shift</th><th>Zone</th><th>Material</th><th>Mined (t)</th><th>Processed (t)</th><th>Recovery</th><th>Downtime</th></tr></thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id} onClick={() => handleRowClick(item)}>
                <td><strong>{item.logId}</strong></td><td>{item.date}</td>
                <td><span className={`badge ${item.shift === 'Day' ? 'badge-warning' : 'badge-info'}`}>{item.shift}</span></td>
                <td>{item.zone}</td><td>{item.materialType}</td>
                <td>{item.tonnageMined?.toLocaleString()}</td><td>{item.tonnageProcessed?.toLocaleString()}</td>
                <td>{item.recoveryRate}%</td><td>{item.downtime}h</td>
              </tr>
            ))}
          </tbody>
        </table>
        {items.length === 0 && <div className="empty-state"><div className="empty-icon">{'\u2263'}</div><h3>No production logs yet</h3></div>}
      </div>

      <Modal isOpen={showDetail} onClose={() => setShowDetail(false)} title="Production Log Details">
        {selected && (
          <>
            <div className="detail-section">
              <h3>Production Information</h3>
              <div className="detail-grid">
                <div className="detail-item"><span className="detail-label">Log ID</span><span className="detail-value">{selected.logId}</span></div>
                <div className="detail-item"><span className="detail-label">Date</span><span className="detail-value">{selected.date}</span></div>
                <div className="detail-item"><span className="detail-label">Shift</span><span className="detail-value">{selected.shift}</span></div>
                <div className="detail-item"><span className="detail-label">Zone</span><span className="detail-value">{selected.zone}</span></div>
                <div className="detail-item"><span className="detail-label">Material Type</span><span className="detail-value">{selected.materialType}</span></div>
                <div className="detail-item"><span className="detail-label">Tonnage Mined</span><span className="detail-value">{selected.tonnageMined?.toLocaleString()} tons</span></div>
                <div className="detail-item"><span className="detail-label">Tonnage Processed</span><span className="detail-value">{selected.tonnageProcessed?.toLocaleString()} tons</span></div>
                <div className="detail-item"><span className="detail-label">Recovery Rate</span><span className="detail-value">{selected.recoveryRate}%</span></div>
                <div className="detail-item"><span className="detail-label">Downtime</span><span className="detail-value">{selected.downtime} hours</span></div>
                <div className="detail-item"><span className="detail-label">Operators</span><span className="detail-value">{selected.operatorCount}</span></div>
                <div className="detail-item"><span className="detail-label">Supervisor</span><span className="detail-value">{selected.supervisor}</span></div>
              </div>
            </div>
            {selected.notes && <div className="detail-section"><h3>Notes</h3><p style={{ fontSize: '14px', color: '#94a3b8' }}>{selected.notes}</p></div>}
            <div className="detail-actions">
              <button className="btn btn-warning" onClick={handleEdit}>Edit</button>
              <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
              <button className="btn btn-success" onClick={handleAIAnalyze} disabled={aiLoading}>{aiLoading ? 'Analyzing...' : 'AI Production Analysis'}</button>
            </div>
            <AIResultDisplay result={aiResult} loading={aiLoading} />
          </>
        )}
      </Modal>

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editMode ? 'Edit Log' : 'New Production Log'}
        footer={<><button className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button><button className="btn btn-primary" onClick={handleSubmit}>{editMode ? 'Update' : 'Create'}</button></>}>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group"><label>Log ID</label><input value={form.logId} onChange={e => updateForm('logId', e.target.value)} required placeholder="e.g. PRD-016" /></div>
            <div className="form-group"><label>Date</label><input type="date" value={form.date} onChange={e => updateForm('date', e.target.value)} required /></div>
            <div className="form-group"><label>Shift</label><select value={form.shift} onChange={e => updateForm('shift', e.target.value)} required>
              <option value="">Select...</option><option>Day</option><option>Night</option>
            </select></div>
            <div className="form-group"><label>Zone</label><input value={form.zone} onChange={e => updateForm('zone', e.target.value)} required /></div>
            <div className="form-group"><label>Material Type</label><select value={form.materialType} onChange={e => updateForm('materialType', e.target.value)} required>
              <option value="">Select...</option><option>Gold Ore</option><option>Copper Ore</option><option>Iron Ore</option><option>Silver Ore</option><option>Zinc Ore</option><option>Nickel Ore</option><option>Lead Ore</option>
            </select></div>
            <div className="form-group"><label>Tonnage Mined</label><input type="number" value={form.tonnageMined} onChange={e => updateForm('tonnageMined', e.target.value)} required /></div>
            <div className="form-group"><label>Tonnage Processed</label><input type="number" value={form.tonnageProcessed} onChange={e => updateForm('tonnageProcessed', e.target.value)} required /></div>
            <div className="form-group"><label>Recovery Rate %</label><input type="number" step="0.1" value={form.recoveryRate} onChange={e => updateForm('recoveryRate', e.target.value)} required /></div>
            <div className="form-group"><label>Downtime (hours)</label><input type="number" step="0.5" value={form.downtime} onChange={e => updateForm('downtime', e.target.value)} /></div>
            <div className="form-group"><label>Operator Count</label><input type="number" value={form.operatorCount} onChange={e => updateForm('operatorCount', e.target.value)} required /></div>
            <div className="form-group"><label>Supervisor</label><input value={form.supervisor} onChange={e => updateForm('supervisor', e.target.value)} required /></div>
            <div className="form-group full-width"><label>Notes</label><textarea value={form.notes} onChange={e => updateForm('notes', e.target.value)} /></div>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default ProductionLogs;
