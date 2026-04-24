import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';
import AIResultDisplay from '../components/AIResultDisplay';
import { toast } from 'react-toastify';

const emptyForm = {
  costId: '', category: '', subcategory: '', description: '', amount: '',
  budgeted: '', variance: '', period: '', zone: '', costPerTon: '', status: 'recorded'
};

function CostAnalysisPage() {
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);

  const fetchItems = async () => {
    try { const res = await api.get('/cost-analysis'); setItems(res.data); } catch (e) { toast.error('Failed to load'); }
  };
  useEffect(() => { fetchItems(); }, []);

  const handleRowClick = (item) => { setSelected(item); setAiResult(item.aiAnalysis); setShowDetail(true); };
  const handleNew = () => { setForm(emptyForm); setEditMode(false); setShowForm(true); };

  const handleEdit = () => {
    setForm({
      costId: selected.costId, category: selected.category, subcategory: selected.subcategory,
      description: selected.description, amount: selected.amount, budgeted: selected.budgeted,
      variance: selected.variance, period: selected.period, zone: selected.zone,
      costPerTon: selected.costPerTon, status: selected.status
    });
    setEditMode(true); setShowDetail(false); setShowForm(true);
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this cost record?')) return;
    try { await api.delete(`/cost-analysis/${selected.id}`); toast.success('Deleted'); setShowDetail(false); fetchItems(); }
    catch (e) { toast.error('Failed'); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = { ...form, variance: (form.budgeted - form.amount) };
    try {
      if (editMode) { await api.put(`/cost-analysis/${selected.id}`, data); toast.success('Updated'); }
      else { await api.post('/cost-analysis', data); toast.success('Created'); }
      setShowForm(false); fetchItems();
    } catch (e) { toast.error(e.response?.data?.error || 'Failed'); }
  };

  const handleAIAnalyze = async () => {
    setAiLoading(true); setAiResult(null);
    try {
      const res = await api.post(`/cost-analysis/${selected.id}/analyze`);
      setAiResult(res.data.aiResult); setSelected(res.data.item); toast.success('AI analysis complete'); fetchItems();
    } catch (e) { toast.error('AI analysis failed'); } finally { setAiLoading(false); }
  };

  const updateForm = (f, v) => setForm(prev => ({ ...prev, [f]: v }));
  const getVarianceBadge = (v) => v > 0 ? 'badge-success' : v < -50000 ? 'badge-danger' : 'badge-warning';
  const getStatusBadge = (s) => ({ recorded: 'badge-info', analyzed: 'badge-success', 'over-budget': 'badge-danger' }[s] || 'badge-secondary');

  return (
    <div className="feature-page">
      <div className="page-header">
        <h1>Cost Analysis</h1>
        <p>AI-powered financial optimization and budget management</p>
      </div>
      <div className="page-actions"><button className="btn btn-primary" onClick={handleNew}>+ New Cost Entry</button></div>
      <div className="data-table-container">
        <table className="data-table">
          <thead><tr><th>Cost ID</th><th>Category</th><th>Subcategory</th><th>Actual</th><th>Budgeted</th><th>Variance</th><th>$/Ton</th><th>Period</th><th>Status</th></tr></thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id} onClick={() => handleRowClick(item)}>
                <td><strong>{item.costId}</strong></td><td>{item.category}</td><td>{item.subcategory}</td>
                <td>${item.amount?.toLocaleString()}</td><td>${item.budgeted?.toLocaleString()}</td>
                <td><span className={`badge ${getVarianceBadge(item.variance)}`}>${item.variance?.toLocaleString()}</span></td>
                <td>${item.costPerTon}</td><td>{item.period}</td>
                <td><span className={`badge ${getStatusBadge(item.status)}`}>{item.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
        {items.length === 0 && <div className="empty-state"><h3>No cost records</h3></div>}
      </div>

      <Modal isOpen={showDetail} onClose={() => setShowDetail(false)} title="Cost Analysis Details">
        {selected && (
          <>
            <div className="detail-section">
              <h3>Cost Information</h3>
              <div className="detail-grid">
                <div className="detail-item"><span className="detail-label">Cost ID</span><span className="detail-value">{selected.costId}</span></div>
                <div className="detail-item"><span className="detail-label">Category</span><span className="detail-value">{selected.category}</span></div>
                <div className="detail-item"><span className="detail-label">Subcategory</span><span className="detail-value">{selected.subcategory}</span></div>
                <div className="detail-item"><span className="detail-label">Actual Amount</span><span className="detail-value">${selected.amount?.toLocaleString()}</span></div>
                <div className="detail-item"><span className="detail-label">Budgeted</span><span className="detail-value">${selected.budgeted?.toLocaleString()}</span></div>
                <div className="detail-item"><span className="detail-label">Variance</span><span className={`badge ${getVarianceBadge(selected.variance)}`}>${selected.variance?.toLocaleString()}</span></div>
                <div className="detail-item"><span className="detail-label">Period</span><span className="detail-value">{selected.period}</span></div>
                <div className="detail-item"><span className="detail-label">Zone</span><span className="detail-value">{selected.zone}</span></div>
                <div className="detail-item"><span className="detail-label">Cost Per Ton</span><span className="detail-value">${selected.costPerTon}</span></div>
                <div className="detail-item"><span className="detail-label">Status</span><span className={`badge ${getStatusBadge(selected.status)}`}>{selected.status}</span></div>
              </div>
            </div>
            <div className="detail-section"><h3>Description</h3><p style={{ fontSize: '14px', color: '#94a3b8' }}>{selected.description}</p></div>
            <div className="detail-actions">
              <button className="btn btn-warning" onClick={handleEdit}>Edit</button>
              <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
              <button className="btn btn-success" onClick={handleAIAnalyze} disabled={aiLoading}>{aiLoading ? 'Analyzing...' : 'AI Cost Analysis'}</button>
            </div>
            <AIResultDisplay result={aiResult} loading={aiLoading} />
          </>
        )}
      </Modal>

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editMode ? 'Edit Cost' : 'New Cost Entry'}
        footer={<><button className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button><button className="btn btn-primary" onClick={handleSubmit}>{editMode ? 'Update' : 'Create'}</button></>}>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group"><label>Cost ID</label><input value={form.costId} onChange={e => updateForm('costId', e.target.value)} required placeholder="e.g. CST-016" /></div>
            <div className="form-group"><label>Category</label><select value={form.category} onChange={e => updateForm('category', e.target.value)} required>
              <option value="">Select...</option><option>Labor</option><option>Fuel</option><option>Maintenance</option><option>Explosives</option><option>Processing</option><option>Environmental</option><option>Equipment</option><option>Safety</option><option>Drilling</option><option>Transport</option><option>Administration</option>
            </select></div>
            <div className="form-group"><label>Subcategory</label><input value={form.subcategory} onChange={e => updateForm('subcategory', e.target.value)} required /></div>
            <div className="form-group"><label>Actual Amount ($)</label><input type="number" value={form.amount} onChange={e => updateForm('amount', e.target.value)} required /></div>
            <div className="form-group"><label>Budgeted Amount ($)</label><input type="number" value={form.budgeted} onChange={e => updateForm('budgeted', e.target.value)} required /></div>
            <div className="form-group"><label>Period</label><input value={form.period} onChange={e => updateForm('period', e.target.value)} required placeholder="e.g. 2024-Q1" /></div>
            <div className="form-group"><label>Zone</label><input value={form.zone} onChange={e => updateForm('zone', e.target.value)} required /></div>
            <div className="form-group"><label>Cost Per Ton ($)</label><input type="number" step="0.01" value={form.costPerTon} onChange={e => updateForm('costPerTon', e.target.value)} /></div>
            <div className="form-group full-width"><label>Description</label><textarea value={form.description} onChange={e => updateForm('description', e.target.value)} required /></div>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default CostAnalysisPage;
