import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';
import AIResultDisplay from '../components/AIResultDisplay';
import { toast } from 'react-toastify';

const emptyForm = {
  tripId: '', truckId: '', driver: '', origin: '', destination: '', materialType: '',
  loadWeight: '', distance: '', tripDuration: '', fuelUsed: '', date: '', shift: '', status: 'completed'
};

function HaulingLogistics() {
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
      const res = await api.get('/hauling', { params: { page, pageSize: pagination.pageSize } });
      const d = res.data;
      if (d.data) { setItems(d.data); setPagination(d.pagination); } else setItems(d);
    } catch (e) { toast.error('Failed to load'); }
  };
  const exportCSV = async () => {
    try {
      const res = await api.get('/export/hauling', { responseType: 'blob' });
      const url = URL.createObjectURL(res.data); const a = document.createElement('a'); a.href = url; a.download = 'hauling-logistics.csv'; a.click();
    } catch (e) { toast.error('Export failed'); }
  };
  useEffect(() => { fetchItems(); }, []);

  const handleRowClick = (item) => { setSelected(item); setAiResult(item.aiOptimization); setShowDetail(true); };
  const handleNew = () => { setForm(emptyForm); setEditMode(false); setShowForm(true); };

  const handleEdit = () => {
    setForm({
      tripId: selected.tripId, truckId: selected.truckId, driver: selected.driver,
      origin: selected.origin, destination: selected.destination, materialType: selected.materialType,
      loadWeight: selected.loadWeight, distance: selected.distance, tripDuration: selected.tripDuration,
      fuelUsed: selected.fuelUsed, date: selected.date || '', shift: selected.shift, status: selected.status
    });
    setEditMode(true); setShowDetail(false); setShowForm(true);
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this trip record?')) return;
    try { await api.delete(`/hauling/${selected.id}`); toast.success('Deleted'); setShowDetail(false); fetchItems(); }
    catch (e) { toast.error('Failed'); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode) { await api.put(`/hauling/${selected.id}`, form); toast.success('Updated'); }
      else { await api.post('/hauling', form); toast.success('Created'); }
      setShowForm(false); fetchItems();
    } catch (e) { toast.error(e.response?.data?.error || 'Failed'); }
  };

  const handleAIOptimize = async () => {
    setAiLoading(true); setAiResult(null);
    try {
      const res = await api.post(`/hauling/${selected.id}/optimize`);
      setAiResult(res.data.aiResult); setSelected(res.data.item); toast.success('AI optimization complete'); fetchItems();
    } catch (e) { toast.error('AI optimization failed'); } finally { setAiLoading(false); }
  };

  const updateForm = (f, v) => setForm(prev => ({ ...prev, [f]: v }));
  const getStatusBadge = (s) => ({ completed: 'badge-success', 'in-transit': 'badge-warning', delayed: 'badge-danger', optimized: 'badge-info' }[s] || 'badge-secondary');

  return (
    <div className="feature-page">
      <div className="page-header">
        <h1>Hauling & Logistics</h1>
        <p>AI-powered route optimization and fleet dispatch management</p>
      </div>
      <div className="page-actions">
        <button className="btn btn-primary" onClick={handleNew}>+ New Trip</button>
        <button className="btn btn-secondary" onClick={exportCSV} style={{ marginLeft: '8px' }}>Export CSV</button>
      </div>
      <div className="data-table-container">
        <table className="data-table">
          <thead><tr><th>Trip ID</th><th>Truck</th><th>Driver</th><th>Origin</th><th>Destination</th><th>Load (t)</th><th>Distance</th><th>Duration</th><th>Fuel (L)</th><th>Status</th></tr></thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id} onClick={() => handleRowClick(item)}>
                <td><strong>{item.tripId}</strong></td><td>{item.truckId}</td><td>{item.driver}</td>
                <td>{item.origin}</td><td>{item.destination}</td><td>{item.loadWeight}</td>
                <td>{item.distance}km</td><td>{item.tripDuration}min</td><td>{item.fuelUsed}</td>
                <td><span className={`badge ${getStatusBadge(item.status)}`}>{item.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
        {items.length === 0 && <div className="empty-state"><h3>No hauling records</h3></div>}
      </div>

      {pagination.totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '16px', alignItems: 'center' }}>
          <button className="btn btn-secondary" disabled={pagination.page <= 1} onClick={() => fetchItems(pagination.page - 1)}>Prev</button>
          <span style={{ color: '#94a3b8', fontSize: '14px' }}>Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)</span>
          <button className="btn btn-secondary" disabled={pagination.page >= pagination.totalPages} onClick={() => fetchItems(pagination.page + 1)}>Next</button>
        </div>
      )}

      <Modal isOpen={showDetail} onClose={() => setShowDetail(false)} title="Hauling Trip Details">
        {selected && (
          <>
            <div className="detail-section">
              <h3>Trip Information</h3>
              <div className="detail-grid">
                <div className="detail-item"><span className="detail-label">Trip ID</span><span className="detail-value">{selected.tripId}</span></div>
                <div className="detail-item"><span className="detail-label">Truck ID</span><span className="detail-value">{selected.truckId}</span></div>
                <div className="detail-item"><span className="detail-label">Driver</span><span className="detail-value">{selected.driver}</span></div>
                <div className="detail-item"><span className="detail-label">Origin</span><span className="detail-value">{selected.origin}</span></div>
                <div className="detail-item"><span className="detail-label">Destination</span><span className="detail-value">{selected.destination}</span></div>
                <div className="detail-item"><span className="detail-label">Material</span><span className="detail-value">{selected.materialType}</span></div>
                <div className="detail-item"><span className="detail-label">Load Weight</span><span className="detail-value">{selected.loadWeight} tons</span></div>
                <div className="detail-item"><span className="detail-label">Distance</span><span className="detail-value">{selected.distance} km</span></div>
                <div className="detail-item"><span className="detail-label">Trip Duration</span><span className="detail-value">{selected.tripDuration} minutes</span></div>
                <div className="detail-item"><span className="detail-label">Fuel Used</span><span className="detail-value">{selected.fuelUsed} L</span></div>
                <div className="detail-item"><span className="detail-label">Date</span><span className="detail-value">{selected.date}</span></div>
                <div className="detail-item"><span className="detail-label">Shift</span><span className="detail-value">{selected.shift}</span></div>
                <div className="detail-item"><span className="detail-label">Status</span><span className={`badge ${getStatusBadge(selected.status)}`}>{selected.status}</span></div>
              </div>
            </div>
            <div className="detail-actions">
              <button className="btn btn-warning" onClick={handleEdit}>Edit</button>
              <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
              <button className="btn btn-success" onClick={handleAIOptimize} disabled={aiLoading}>{aiLoading ? 'Optimizing...' : 'AI Route Optimization'}</button>
            </div>
            <AIResultDisplay result={aiResult} loading={aiLoading} entityType="hauling" />
          </>
        )}
      </Modal>

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editMode ? 'Edit Trip' : 'New Hauling Trip'}
        footer={<><button className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button><button className="btn btn-primary" onClick={handleSubmit}>{editMode ? 'Update' : 'Create'}</button></>}>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group"><label>Trip ID</label><input value={form.tripId} onChange={e => updateForm('tripId', e.target.value)} required placeholder="e.g. HUL-016" /></div>
            <div className="form-group"><label>Truck ID</label><input value={form.truckId} onChange={e => updateForm('truckId', e.target.value)} required placeholder="e.g. EQ-001" /></div>
            <div className="form-group"><label>Driver</label><input value={form.driver} onChange={e => updateForm('driver', e.target.value)} required /></div>
            <div className="form-group"><label>Origin</label><input value={form.origin} onChange={e => updateForm('origin', e.target.value)} required /></div>
            <div className="form-group"><label>Destination</label><input value={form.destination} onChange={e => updateForm('destination', e.target.value)} required /></div>
            <div className="form-group"><label>Material Type</label><select value={form.materialType} onChange={e => updateForm('materialType', e.target.value)} required>
              <option value="">Select...</option><option>Gold Ore</option><option>Copper Ore</option><option>Iron Ore</option><option>Zinc Ore</option><option>Nickel Ore</option><option>Lead Ore</option><option>Waste Rock</option>
            </select></div>
            <div className="form-group"><label>Load Weight (tons)</label><input type="number" value={form.loadWeight} onChange={e => updateForm('loadWeight', e.target.value)} required /></div>
            <div className="form-group"><label>Distance (km)</label><input type="number" step="0.1" value={form.distance} onChange={e => updateForm('distance', e.target.value)} required /></div>
            <div className="form-group"><label>Trip Duration (min)</label><input type="number" value={form.tripDuration} onChange={e => updateForm('tripDuration', e.target.value)} required /></div>
            <div className="form-group"><label>Fuel Used (L)</label><input type="number" value={form.fuelUsed} onChange={e => updateForm('fuelUsed', e.target.value)} required /></div>
            <div className="form-group"><label>Date</label><input type="date" value={form.date} onChange={e => updateForm('date', e.target.value)} required /></div>
            <div className="form-group"><label>Shift</label><select value={form.shift} onChange={e => updateForm('shift', e.target.value)} required>
              <option value="">Select...</option><option>Day</option><option>Night</option>
            </select></div>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default HaulingLogistics;
