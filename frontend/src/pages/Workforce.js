import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';
import AIResultDisplay from '../components/AIResultDisplay';
import { toast } from 'react-toastify';

const emptyForm = {
  workerId: '', name: '', role: '', department: '', shift: '', certification: '',
  certExpiry: '', yearsExperience: '', safetyScore: 100, hoursThisMonth: 0, status: 'active'
};

function Workforce() {
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
      const res = await api.get('/workforce', { params: { page, pageSize: pagination.pageSize } });
      const d = res.data;
      if (d.data) { setItems(d.data); setPagination(d.pagination); } else setItems(d);
    } catch (e) { toast.error('Failed to load'); }
  };
  const exportCSV = async () => {
    try {
      const res = await api.get('/export/workforce', { responseType: 'blob' });
      const url = URL.createObjectURL(res.data); const a = document.createElement('a'); a.href = url; a.download = 'workforce.csv'; a.click();
    } catch (e) { toast.error('Export failed'); }
  };
  useEffect(() => { fetchItems(); }, []);

  const handleRowClick = (item) => { setSelected(item); setAiResult(item.aiAssessment); setShowDetail(true); };
  const handleNew = () => { setForm(emptyForm); setEditMode(false); setShowForm(true); };

  const handleEdit = () => {
    setForm({
      workerId: selected.workerId, name: selected.name, role: selected.role,
      department: selected.department, shift: selected.shift, certification: selected.certification,
      certExpiry: selected.certExpiry || '', yearsExperience: selected.yearsExperience,
      safetyScore: selected.safetyScore, hoursThisMonth: selected.hoursThisMonth, status: selected.status
    });
    setEditMode(true); setShowDetail(false); setShowForm(true);
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this worker record?')) return;
    try { await api.delete(`/workforce/${selected.id}`); toast.success('Deleted'); setShowDetail(false); fetchItems(); }
    catch (e) { toast.error('Failed'); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode) { await api.put(`/workforce/${selected.id}`, form); toast.success('Updated'); }
      else { await api.post('/workforce', form); toast.success('Created'); }
      setShowForm(false); fetchItems();
    } catch (e) { toast.error(e.response?.data?.error || 'Failed'); }
  };

  const handleAIAnalyze = async () => {
    setAiLoading(true); setAiResult(null);
    try {
      const res = await api.post(`/workforce/${selected.id}/analyze`);
      setAiResult(res.data.aiResult); setSelected(res.data.item); toast.success('AI analysis complete'); fetchItems();
    } catch (e) { toast.error('AI analysis failed'); } finally { setAiLoading(false); }
  };

  const updateForm = (f, v) => setForm(prev => ({ ...prev, [f]: v }));
  const getStatusBadge = (s) => ({ active: 'badge-success', training: 'badge-warning', leave: 'badge-info', inactive: 'badge-danger' }[s] || 'badge-secondary');
  const getSafetyColor = (score) => score >= 90 ? 'badge-success' : score >= 75 ? 'badge-warning' : 'badge-danger';

  return (
    <div className="feature-page">
      <div className="page-header">
        <h1>Workforce Management</h1>
        <p>AI-powered workforce optimization, safety scoring, and fatigue management</p>
      </div>
      <div className="page-actions">
        <button className="btn btn-primary" onClick={handleNew}>+ Add Worker</button>
        <button className="btn btn-secondary" onClick={exportCSV} style={{ marginLeft: '8px' }}>Export CSV</button>
      </div>
      <div className="data-table-container">
        <table className="data-table">
          <thead><tr><th>ID</th><th>Name</th><th>Role</th><th>Department</th><th>Shift</th><th>Experience</th><th>Safety</th><th>Hours/Mo</th><th>Status</th></tr></thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id} onClick={() => handleRowClick(item)}>
                <td><strong>{item.workerId}</strong></td><td>{item.name}</td><td>{item.role}</td>
                <td>{item.department}</td><td>{item.shift}</td><td>{item.yearsExperience}yr</td>
                <td><span className={`badge ${getSafetyColor(item.safetyScore)}`}>{item.safetyScore}</span></td>
                <td>{item.hoursThisMonth}</td>
                <td><span className={`badge ${getStatusBadge(item.status)}`}>{item.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
        {items.length === 0 && <div className="empty-state"><h3>No workforce records</h3></div>}
      </div>

      {pagination.totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '16px', alignItems: 'center' }}>
          <button className="btn btn-secondary" disabled={pagination.page <= 1} onClick={() => fetchItems(pagination.page - 1)}>Prev</button>
          <span style={{ color: '#94a3b8', fontSize: '14px' }}>Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)</span>
          <button className="btn btn-secondary" disabled={pagination.page >= pagination.totalPages} onClick={() => fetchItems(pagination.page + 1)}>Next</button>
        </div>
      )}

      <Modal isOpen={showDetail} onClose={() => setShowDetail(false)} title="Worker Details">
        {selected && (
          <>
            <div className="detail-section">
              <h3>Worker Information</h3>
              <div className="detail-grid">
                <div className="detail-item"><span className="detail-label">Worker ID</span><span className="detail-value">{selected.workerId}</span></div>
                <div className="detail-item"><span className="detail-label">Name</span><span className="detail-value">{selected.name}</span></div>
                <div className="detail-item"><span className="detail-label">Role</span><span className="detail-value">{selected.role}</span></div>
                <div className="detail-item"><span className="detail-label">Department</span><span className="detail-value">{selected.department}</span></div>
                <div className="detail-item"><span className="detail-label">Shift</span><span className="detail-value">{selected.shift}</span></div>
                <div className="detail-item"><span className="detail-label">Certification</span><span className="detail-value">{selected.certification}</span></div>
                <div className="detail-item"><span className="detail-label">Cert Expiry</span><span className="detail-value">{selected.certExpiry}</span></div>
                <div className="detail-item"><span className="detail-label">Experience</span><span className="detail-value">{selected.yearsExperience} years</span></div>
                <div className="detail-item"><span className="detail-label">Safety Score</span><span className={`badge ${getSafetyColor(selected.safetyScore)}`}>{selected.safetyScore}/100</span></div>
                <div className="detail-item"><span className="detail-label">Hours This Month</span><span className="detail-value">{selected.hoursThisMonth}</span></div>
                <div className="detail-item"><span className="detail-label">Status</span><span className={`badge ${getStatusBadge(selected.status)}`}>{selected.status}</span></div>
              </div>
            </div>
            <div className="detail-actions">
              <button className="btn btn-warning" onClick={handleEdit}>Edit</button>
              <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
              <button className="btn btn-success" onClick={handleAIAnalyze} disabled={aiLoading}>{aiLoading ? 'Analyzing...' : 'AI Workforce Analysis'}</button>
            </div>
            <AIResultDisplay result={aiResult} loading={aiLoading} entityType="workforce" />
          </>
        )}
      </Modal>

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editMode ? 'Edit Worker' : 'Add New Worker'}
        footer={<><button className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button><button className="btn btn-primary" onClick={handleSubmit}>{editMode ? 'Update' : 'Add'}</button></>}>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group"><label>Worker ID</label><input value={form.workerId} onChange={e => updateForm('workerId', e.target.value)} required placeholder="e.g. WRK-016" /></div>
            <div className="form-group"><label>Name</label><input value={form.name} onChange={e => updateForm('name', e.target.value)} required /></div>
            <div className="form-group"><label>Role</label><select value={form.role} onChange={e => updateForm('role', e.target.value)} required>
              <option value="">Select...</option><option>Heavy Equipment Operator</option><option>Blast Engineer</option><option>Haul Truck Driver</option><option>Geologist</option><option>Mine Supervisor</option><option>Environmental Officer</option><option>Drill Operator</option><option>Safety Inspector</option><option>Maintenance Mechanic</option><option>Process Engineer</option><option>Excavator Operator</option><option>Survey Technician</option><option>Electrician</option><option>Loader Operator</option><option>Crusher Operator</option>
            </select></div>
            <div className="form-group"><label>Department</label><select value={form.department} onChange={e => updateForm('department', e.target.value)} required>
              <option value="">Select...</option><option>Mining</option><option>Drilling & Blasting</option><option>Geology</option><option>Operations</option><option>Environment</option><option>Safety</option><option>Maintenance</option><option>Processing</option><option>Survey</option>
            </select></div>
            <div className="form-group"><label>Shift</label><select value={form.shift} onChange={e => updateForm('shift', e.target.value)} required>
              <option value="">Select...</option><option>Day</option><option>Night</option>
            </select></div>
            <div className="form-group"><label>Certification</label><input value={form.certification} onChange={e => updateForm('certification', e.target.value)} required /></div>
            <div className="form-group"><label>Cert Expiry</label><input type="date" value={form.certExpiry} onChange={e => updateForm('certExpiry', e.target.value)} required /></div>
            <div className="form-group"><label>Years Experience</label><input type="number" step="0.5" value={form.yearsExperience} onChange={e => updateForm('yearsExperience', e.target.value)} required /></div>
            <div className="form-group"><label>Safety Score</label><input type="number" min="0" max="100" value={form.safetyScore} onChange={e => updateForm('safetyScore', e.target.value)} /></div>
            <div className="form-group"><label>Hours This Month</label><input type="number" value={form.hoursThisMonth} onChange={e => updateForm('hoursThisMonth', e.target.value)} /></div>
            <div className="form-group"><label>Status</label><select value={form.status} onChange={e => updateForm('status', e.target.value)}>
              <option>active</option><option>training</option><option>leave</option><option>inactive</option>
            </select></div>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default Workforce;
