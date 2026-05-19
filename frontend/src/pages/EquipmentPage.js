import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';
import AIResultDisplay from '../components/AIResultDisplay';
import { toast } from 'react-toastify';

const emptyForm = {
  equipmentId: '', name: '', type: '', manufacturer: '', model: '', status: 'operational',
  location: '', hoursOperated: '', fuelConsumption: '', maintenanceDue: '', lastMaintenance: '', utilizationRate: ''
};

function EquipmentPage() {
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 20, total: 0, totalPages: 1 });
  const [selected, setSelected] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [autoCheckLoading, setAutoCheckLoading] = useState(false);

  const fetchItems = async (page = 1) => {
    try {
      const res = await api.get('/equipment', { params: { page, pageSize: pagination.pageSize } });
      const d = res.data;
      if (d.data) { setItems(d.data); setPagination(d.pagination); }
      else setItems(d);
    } catch (e) { toast.error('Failed to load'); }
  };
  useEffect(() => { fetchItems(); }, []);

  const handleRowClick = (item) => { setSelected(item); setAiResult(item.aiRecommendation); setShowDetail(true); };
  const handleNew = () => { setForm(emptyForm); setEditMode(false); setShowForm(true); };

  const handleEdit = () => {
    setForm({
      equipmentId: selected.equipmentId, name: selected.name, type: selected.type,
      manufacturer: selected.manufacturer, model: selected.model, status: selected.status,
      location: selected.location, hoursOperated: selected.hoursOperated, fuelConsumption: selected.fuelConsumption,
      maintenanceDue: selected.maintenanceDue?.split('T')[0] || '', lastMaintenance: selected.lastMaintenance?.split('T')[0] || '',
      utilizationRate: selected.utilizationRate
    });
    setEditMode(true); setShowDetail(false); setShowForm(true);
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this equipment?')) return;
    try { await api.delete(`/equipment/${selected.id}`); toast.success('Deleted'); setShowDetail(false); fetchItems(); }
    catch (e) { toast.error('Failed'); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode) { await api.put(`/equipment/${selected.id}`, form); toast.success('Updated'); }
      else { await api.post('/equipment', form); toast.success('Created'); }
      setShowForm(false); fetchItems();
    } catch (e) { toast.error(e.response?.data?.error || 'Failed'); }
  };

  const handleAIAnalyze = async () => {
    setAiLoading(true); setAiResult(null);
    try {
      const res = await api.post(`/equipment/${selected.id}/analyze`);
      setAiResult(res.data.aiResult); setSelected(res.data.item); toast.success('AI analysis complete'); fetchItems();
    } catch (e) { toast.error('AI analysis failed'); } finally { setAiLoading(false); }
  };

  const handleAutoCheck = async () => {
    setAutoCheckLoading(true);
    try {
      const res = await api.post('/equipment/auto-alerts');
      toast.success(`Auto-check complete: ${res.data.checked} checked, ${res.data.alerts_created} alerts created`);
      fetchItems();
    } catch (e) { toast.error('Auto-check failed'); } finally { setAutoCheckLoading(false); }
  };

  const updateForm = (f, v) => setForm(prev => ({ ...prev, [f]: v }));
  const getStatusBadge = (s) => ({ operational: 'badge-success', maintenance: 'badge-warning', breakdown: 'badge-danger', idle: 'badge-secondary', analyzed: 'badge-info' }[s] || 'badge-secondary');

  return (
    <div className="feature-page">
      <div className="page-header">
        <h1>Equipment Utilization</h1>
        <p>AI-powered fleet management and predictive maintenance</p>
      </div>
      <div className="page-actions">
        <button className="btn btn-primary" onClick={handleNew}>+ Add Equipment</button>
        <button className="btn btn-warning" onClick={handleAutoCheck} disabled={autoCheckLoading} style={{ marginLeft: '8px' }}>
          {autoCheckLoading ? 'Running...' : 'Run Auto-Check'}
        </button>
      </div>
      <div className="data-table-container">
        <table className="data-table">
          <thead><tr><th>ID</th><th>Name</th><th>Type</th><th>Location</th><th>Hours</th><th>Fuel (L/hr)</th><th>Utilization</th><th>Status</th></tr></thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id} onClick={() => handleRowClick(item)}>
                <td><strong>{item.equipmentId}</strong></td><td>{item.name}</td><td>{item.type}</td>
                <td>{item.location}</td><td>{item.hoursOperated?.toLocaleString()}</td><td>{item.fuelConsumption}</td>
                <td>{item.utilizationRate}%</td><td><span className={`badge ${getStatusBadge(item.status)}`}>{item.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
        {items.length === 0 && <div className="empty-state"><div className="empty-icon">{'\u2699'}</div><h3>No equipment registered</h3></div>}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '16px', alignItems: 'center' }}>
          <button className="btn btn-secondary" disabled={pagination.page <= 1} onClick={() => fetchItems(pagination.page - 1)}>Prev</button>
          <span style={{ color: '#94a3b8', fontSize: '14px' }}>Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)</span>
          <button className="btn btn-secondary" disabled={pagination.page >= pagination.totalPages} onClick={() => fetchItems(pagination.page + 1)}>Next</button>
        </div>
      )}

      <Modal isOpen={showDetail} onClose={() => setShowDetail(false)} title="Equipment Details">
        {selected && (
          <>
            <div className="detail-section">
              <h3>Equipment Information</h3>
              <div className="detail-grid">
                <div className="detail-item"><span className="detail-label">Equipment ID</span><span className="detail-value">{selected.equipmentId}</span></div>
                <div className="detail-item"><span className="detail-label">Name</span><span className="detail-value">{selected.name}</span></div>
                <div className="detail-item"><span className="detail-label">Type</span><span className="detail-value">{selected.type}</span></div>
                <div className="detail-item"><span className="detail-label">Manufacturer</span><span className="detail-value">{selected.manufacturer}</span></div>
                <div className="detail-item"><span className="detail-label">Model</span><span className="detail-value">{selected.model}</span></div>
                <div className="detail-item"><span className="detail-label">Location</span><span className="detail-value">{selected.location}</span></div>
                <div className="detail-item"><span className="detail-label">Hours Operated</span><span className="detail-value">{selected.hoursOperated?.toLocaleString()}</span></div>
                <div className="detail-item"><span className="detail-label">Fuel Consumption</span><span className="detail-value">{selected.fuelConsumption} L/hr</span></div>
                <div className="detail-item"><span className="detail-label">Utilization Rate</span><span className="detail-value">{selected.utilizationRate}%</span></div>
                <div className="detail-item"><span className="detail-label">Last Maintenance</span><span className="detail-value">{selected.lastMaintenance?.split('T')[0] || 'N/A'}</span></div>
                <div className="detail-item"><span className="detail-label">Maintenance Due</span><span className="detail-value">{selected.maintenanceDue?.split('T')[0] || 'N/A'}</span></div>
                <div className="detail-item"><span className="detail-label">Status</span><span className={`badge ${getStatusBadge(selected.status)}`}>{selected.status}</span></div>
              </div>
            </div>
            <div className="detail-actions">
              <button className="btn btn-warning" onClick={handleEdit}>Edit</button>
              <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
              <button className="btn btn-success" onClick={handleAIAnalyze} disabled={aiLoading}>{aiLoading ? 'Analyzing...' : 'AI Equipment Analysis'}</button>
            </div>
            <AIResultDisplay result={aiResult} loading={aiLoading} entityType="equipment" />
          </>
        )}
      </Modal>

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editMode ? 'Edit Equipment' : 'Add New Equipment'}
        footer={<><button className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button><button className="btn btn-primary" onClick={handleSubmit}>{editMode ? 'Update' : 'Add'}</button></>}>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group"><label>Equipment ID</label><input value={form.equipmentId} onChange={e => updateForm('equipmentId', e.target.value)} required placeholder="e.g. EQ-016" /></div>
            <div className="form-group"><label>Name</label><input value={form.name} onChange={e => updateForm('name', e.target.value)} required /></div>
            <div className="form-group"><label>Type</label><select value={form.type} onChange={e => updateForm('type', e.target.value)} required>
              <option value="">Select...</option><option>Haul Truck</option><option>Excavator</option><option>Drill Rig</option><option>Dozer</option><option>Wheel Loader</option><option>Motor Grader</option><option>Crusher</option><option>Articulated Truck</option><option>Surface Miner</option>
            </select></div>
            <div className="form-group"><label>Manufacturer</label><input value={form.manufacturer} onChange={e => updateForm('manufacturer', e.target.value)} required /></div>
            <div className="form-group"><label>Model</label><input value={form.model} onChange={e => updateForm('model', e.target.value)} required /></div>
            <div className="form-group"><label>Location</label><input value={form.location} onChange={e => updateForm('location', e.target.value)} required /></div>
            <div className="form-group"><label>Hours Operated</label><input type="number" value={form.hoursOperated} onChange={e => updateForm('hoursOperated', e.target.value)} /></div>
            <div className="form-group"><label>Fuel Consumption (L/hr)</label><input type="number" value={form.fuelConsumption} onChange={e => updateForm('fuelConsumption', e.target.value)} /></div>
            <div className="form-group"><label>Utilization Rate %</label><input type="number" value={form.utilizationRate} onChange={e => updateForm('utilizationRate', e.target.value)} /></div>
            <div className="form-group"><label>Status</label><select value={form.status} onChange={e => updateForm('status', e.target.value)}>
              <option>operational</option><option>maintenance</option><option>breakdown</option><option>idle</option>
            </select></div>
            <div className="form-group"><label>Last Maintenance</label><input type="date" value={form.lastMaintenance} onChange={e => updateForm('lastMaintenance', e.target.value)} /></div>
            <div className="form-group"><label>Maintenance Due</label><input type="date" value={form.maintenanceDue} onChange={e => updateForm('maintenanceDue', e.target.value)} /></div>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default EquipmentPage;
