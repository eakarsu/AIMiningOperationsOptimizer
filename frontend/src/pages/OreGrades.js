import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';
import AIResultDisplay from '../components/AIResultDisplay';
import { toast } from 'react-toastify';

const emptyForm = {
  sampleId: '', location: '', zone: '', depth: '', mineralType: '',
  gradePercentage: '', tonnage: '', confidence: '', status: 'pending'
};

function OreGrades() {
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
      const res = await api.get('/ore-grades', { params: { page, pageSize: pagination.pageSize } });
      const d = res.data;
      if (d.data) { setItems(d.data); setPagination(d.pagination); }
      else setItems(d);
    } catch (e) {
      toast.error('Failed to load data');
    }
  };

  const exportCSV = async () => {
    try {
      const res = await api.get('/export/ore-grades', { responseType: 'blob' });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a'); a.href = url; a.download = 'ore-grades.csv'; a.click();
    } catch (e) { toast.error('Export failed'); }
  };

  useEffect(() => { fetchItems(); }, []);

  const handleRowClick = (item) => {
    setSelected(item);
    setAiResult(item.aiPrediction);
    setShowDetail(true);
  };

  const handleNew = () => {
    setForm(emptyForm);
    setEditMode(false);
    setShowForm(true);
  };

  const handleEdit = () => {
    setForm({
      sampleId: selected.sampleId,
      location: selected.location,
      zone: selected.zone,
      depth: selected.depth,
      mineralType: selected.mineralType,
      gradePercentage: selected.gradePercentage,
      tonnage: selected.tonnage,
      confidence: selected.confidence,
      status: selected.status
    });
    setEditMode(true);
    setShowDetail(false);
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      await api.delete(`/ore-grades/${selected.id}`);
      toast.success('Deleted successfully');
      setShowDetail(false);
      fetchItems();
    } catch (e) {
      toast.error('Failed to delete');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode) {
        await api.put(`/ore-grades/${selected.id}`, form);
        toast.success('Updated successfully');
      } else {
        await api.post('/ore-grades', form);
        toast.success('Created successfully');
      }
      setShowForm(false);
      fetchItems();
    } catch (e) {
      toast.error(e.response?.data?.error || 'Operation failed');
    }
  };

  const handleAIPredict = async () => {
    setAiLoading(true);
    setAiResult(null);
    try {
      const res = await api.post(`/ore-grades/${selected.id}/predict`);
      setAiResult(res.data.aiResult);
      setSelected(res.data.item);
      toast.success('AI prediction complete');
      fetchItems();
    } catch (e) {
      toast.error('AI prediction failed');
    } finally {
      setAiLoading(false);
    }
  };

  const updateForm = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const getBadgeClass = (status) => {
    switch (status) {
      case 'analyzed': return 'badge-success';
      case 'pending': return 'badge-warning';
      default: return 'badge-secondary';
    }
  };

  return (
    <div className="feature-page">
      <div className="page-header">
        <h1>Ore Grade Prediction</h1>
        <p>AI-powered ore sample analysis and grade prediction</p>
      </div>
      <div className="page-actions">
        <button className="btn btn-primary" onClick={handleNew}>+ New Sample</button>
        <button className="btn btn-secondary" onClick={exportCSV} style={{ marginLeft: '8px' }}>Export CSV</button>
      </div>

      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Sample ID</th>
              <th>Location</th>
              <th>Zone</th>
              <th>Depth (m)</th>
              <th>Mineral</th>
              <th>Grade %</th>
              <th>Tonnage</th>
              <th>Confidence</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id} onClick={() => handleRowClick(item)}>
                <td><strong>{item.sampleId}</strong></td>
                <td>{item.location}</td>
                <td>{item.zone}</td>
                <td>{item.depth}</td>
                <td>{item.mineralType}</td>
                <td>{item.gradePercentage}%</td>
                <td>{item.tonnage?.toLocaleString()}</td>
                <td>{item.confidence}%</td>
                <td><span className={`badge ${getBadgeClass(item.status)}`}>{item.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
        {items.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">{'\u25C7'}</div>
            <h3>No ore samples yet</h3>
            <p>Add your first ore sample to get started</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '16px', alignItems: 'center' }}>
          <button className="btn btn-secondary" disabled={pagination.page <= 1} onClick={() => fetchItems(pagination.page - 1)}>Prev</button>
          <span style={{ color: '#94a3b8', fontSize: '14px' }}>Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)</span>
          <button className="btn btn-secondary" disabled={pagination.page >= pagination.totalPages} onClick={() => fetchItems(pagination.page + 1)}>Next</button>
        </div>
      )}

      {/* Detail Modal */}
      <Modal isOpen={showDetail} onClose={() => setShowDetail(false)} title="Ore Sample Details">
        {selected && (
          <>
            <div className="detail-section">
              <h3>Sample Information</h3>
              <div className="detail-grid">
                <div className="detail-item"><span className="detail-label">Sample ID</span><span className="detail-value">{selected.sampleId}</span></div>
                <div className="detail-item"><span className="detail-label">Location</span><span className="detail-value">{selected.location}</span></div>
                <div className="detail-item"><span className="detail-label">Zone</span><span className="detail-value">{selected.zone}</span></div>
                <div className="detail-item"><span className="detail-label">Depth</span><span className="detail-value">{selected.depth}m</span></div>
                <div className="detail-item"><span className="detail-label">Mineral Type</span><span className="detail-value">{selected.mineralType}</span></div>
                <div className="detail-item"><span className="detail-label">Grade</span><span className="detail-value">{selected.gradePercentage}%</span></div>
                <div className="detail-item"><span className="detail-label">Tonnage</span><span className="detail-value">{selected.tonnage?.toLocaleString()} tons</span></div>
                <div className="detail-item"><span className="detail-label">Confidence</span><span className="detail-value">{selected.confidence}%</span></div>
                <div className="detail-item"><span className="detail-label">Status</span><span className={`badge ${getBadgeClass(selected.status)}`}>{selected.status}</span></div>
              </div>
            </div>
            <div className="detail-actions">
              <button className="btn btn-warning" onClick={handleEdit}>Edit</button>
              <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
              <button className="btn btn-success" onClick={handleAIPredict} disabled={aiLoading}>
                {aiLoading ? 'Analyzing...' : 'AI Predict Grade'}
              </button>
            </div>
            <AIResultDisplay result={aiResult} loading={aiLoading} entityType="ore_grade" />
          </>
        )}
      </Modal>

      {/* Form Modal */}
      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editMode ? 'Edit Ore Sample' : 'New Ore Sample'}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSubmit}>{editMode ? 'Update' : 'Create'}</button>
          </>
        }
      >
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label>Sample ID</label>
              <input value={form.sampleId} onChange={e => updateForm('sampleId', e.target.value)} required placeholder="e.g. ORE-016" />
            </div>
            <div className="form-group">
              <label>Location</label>
              <input value={form.location} onChange={e => updateForm('location', e.target.value)} required placeholder="e.g. North Pit" />
            </div>
            <div className="form-group">
              <label>Zone</label>
              <input value={form.zone} onChange={e => updateForm('zone', e.target.value)} required placeholder="e.g. Zone A" />
            </div>
            <div className="form-group">
              <label>Depth (m)</label>
              <input type="number" step="0.1" value={form.depth} onChange={e => updateForm('depth', e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Mineral Type</label>
              <select value={form.mineralType} onChange={e => updateForm('mineralType', e.target.value)} required>
                <option value="">Select...</option>
                <option>Gold</option><option>Copper</option><option>Iron</option><option>Silver</option>
                <option>Zinc</option><option>Nickel</option><option>Lead</option><option>Platinum</option>
              </select>
            </div>
            <div className="form-group">
              <label>Grade %</label>
              <input type="number" step="0.01" value={form.gradePercentage} onChange={e => updateForm('gradePercentage', e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Tonnage</label>
              <input type="number" value={form.tonnage} onChange={e => updateForm('tonnage', e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Confidence %</label>
              <input type="number" value={form.confidence} onChange={e => updateForm('confidence', e.target.value)} />
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default OreGrades;
