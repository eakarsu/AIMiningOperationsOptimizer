import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';
import { toast } from 'react-toastify';

const emptyForm = {
  scheduleId: '', equipmentId: '', equipmentName: '', type: 'preventive', priority: 'medium',
  scheduledDate: '', assignedTo: '', description: '', estimatedDuration: '', cost: '', notes: ''
};

function MaintenanceScheduler() {
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');

  const fetchItems = async () => {
    try { const res = await api.get('/maintenance'); setItems(res.data); } catch (e) { toast.error('Failed to load maintenance schedules'); }
  };
  useEffect(() => { fetchItems(); }, []);

  const handleRowClick = (item) => { setSelected(item); setShowDetail(true); };
  const handleNew = () => { setForm(emptyForm); setEditMode(false); setShowForm(true); };

  const handleEdit = () => {
    setForm({
      scheduleId: selected.scheduleId, equipmentId: selected.equipmentId, equipmentName: selected.equipmentName,
      type: selected.type, priority: selected.priority, scheduledDate: selected.scheduledDate?.split('T')[0] || '',
      assignedTo: selected.assignedTo, description: selected.description || '', estimatedDuration: selected.estimatedDuration || '',
      cost: selected.cost || '', notes: selected.notes || ''
    });
    setEditMode(true); setShowDetail(false); setShowForm(true);
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this maintenance schedule?')) return;
    try { await api.delete(`/maintenance/${selected.id}`); toast.success('Deleted'); setShowDetail(false); fetchItems(); }
    catch (e) { toast.error('Failed to delete'); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode) { await api.put(`/maintenance/${selected.id}`, form); toast.success('Updated'); }
      else { await api.post('/maintenance', form); toast.success('Created'); }
      setShowForm(false); fetchItems();
    } catch (e) { toast.error(e.response?.data?.error || 'Failed'); }
  };

  const updateForm = (f, v) => setForm(prev => ({ ...prev, [f]: v }));

  const getPriorityBadge = (p) => ({ urgent: 'badge-danger', high: 'badge-warning', medium: 'badge-info', low: 'badge-secondary' }[p] || 'badge-secondary');
  const getStatusBadge = (s) => ({ scheduled: 'badge-info', 'in-progress': 'badge-warning', completed: 'badge-success', overdue: 'badge-danger', cancelled: 'badge-secondary' }[s] || 'badge-secondary');

  const filtered = items.filter(item => {
    if (filterStatus && item.status !== filterStatus) return false;
    if (filterPriority && item.priority !== filterPriority) return false;
    return true;
  });

  return (
    <div className="feature-page">
      <div className="page-header">
        <h1>Maintenance Scheduler</h1>
        <p>Equipment maintenance calendar and tracking</p>
      </div>
      <div className="page-actions">
        <button className="btn btn-primary" onClick={handleNew}>+ Add Schedule</button>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="btn btn-secondary">
          <option value="">All Statuses</option>
          <option value="scheduled">Scheduled</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="overdue">Overdue</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)} className="btn btn-secondary">
          <option value="">All Priorities</option>
          <option value="urgent">Urgent</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>
      <div className="data-table-container">
        <table className="data-table">
          <thead><tr><th>Schedule ID</th><th>Equipment</th><th>Type</th><th>Priority</th><th>Status</th><th>Scheduled Date</th><th>Assigned To</th><th>Est. Duration</th></tr></thead>
          <tbody>
            {filtered.map(item => (
              <tr key={item.id} onClick={() => handleRowClick(item)}>
                <td><strong>{item.scheduleId}</strong></td>
                <td>{item.equipmentName}</td>
                <td>{item.type}</td>
                <td><span className={`badge ${getPriorityBadge(item.priority)}`}>{item.priority}</span></td>
                <td><span className={`badge ${getStatusBadge(item.status)}`}>{item.status}</span></td>
                <td>{item.scheduledDate?.split('T')[0] || 'N/A'}</td>
                <td>{item.assignedTo}</td>
                <td>{item.estimatedDuration ? `${item.estimatedDuration} hrs` : 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="empty-state"><div className="empty-icon">{'\u{1F527}'}</div><h3>No maintenance schedules found</h3></div>}
      </div>

      <Modal isOpen={showDetail} onClose={() => setShowDetail(false)} title="Maintenance Schedule Details">
        {selected && (
          <>
            <div className="detail-section">
              <h3>Schedule Information</h3>
              <div className="detail-grid">
                <div className="detail-item"><span className="detail-label">Schedule ID</span><span className="detail-value">{selected.scheduleId}</span></div>
                <div className="detail-item"><span className="detail-label">Equipment ID</span><span className="detail-value">{selected.equipmentId}</span></div>
                <div className="detail-item"><span className="detail-label">Equipment Name</span><span className="detail-value">{selected.equipmentName}</span></div>
                <div className="detail-item"><span className="detail-label">Type</span><span className="detail-value">{selected.type}</span></div>
                <div className="detail-item"><span className="detail-label">Priority</span><span className={`badge ${getPriorityBadge(selected.priority)}`}>{selected.priority}</span></div>
                <div className="detail-item"><span className="detail-label">Status</span><span className={`badge ${getStatusBadge(selected.status)}`}>{selected.status}</span></div>
                <div className="detail-item"><span className="detail-label">Scheduled Date</span><span className="detail-value">{selected.scheduledDate?.split('T')[0] || 'N/A'}</span></div>
                <div className="detail-item"><span className="detail-label">Assigned To</span><span className="detail-value">{selected.assignedTo}</span></div>
                <div className="detail-item"><span className="detail-label">Estimated Duration</span><span className="detail-value">{selected.estimatedDuration ? `${selected.estimatedDuration} hrs` : 'N/A'}</span></div>
                <div className="detail-item"><span className="detail-label">Actual Duration</span><span className="detail-value">{selected.actualDuration ? `${selected.actualDuration} hrs` : 'N/A'}</span></div>
                <div className="detail-item"><span className="detail-label">Cost</span><span className="detail-value">{selected.cost ? `$${Number(selected.cost).toLocaleString()}` : 'N/A'}</span></div>
                <div className="detail-item"><span className="detail-label">Completion Date</span><span className="detail-value">{selected.completionDate?.split('T')[0] || 'N/A'}</span></div>
              </div>
            </div>
            <div className="detail-section">
              <h3>Description</h3>
              <div className="detail-grid">
                <div className="detail-item full-width"><span className="detail-label">Description</span><span className="detail-value">{selected.description || 'N/A'}</span></div>
                <div className="detail-item full-width"><span className="detail-label">Notes</span><span className="detail-value">{selected.notes || 'N/A'}</span></div>
              </div>
            </div>
            {selected.parts && selected.parts.length > 0 && (
              <div className="detail-section">
                <h3>Parts List</h3>
                <div className="data-table-container">
                  <table className="data-table">
                    <thead><tr><th>Part Name</th><th>Quantity</th><th>Cost</th></tr></thead>
                    <tbody>
                      {selected.parts.map((part, i) => (
                        <tr key={i}><td>{part.name}</td><td>{part.quantity}</td><td>${Number(part.cost || 0).toLocaleString()}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            <div className="detail-actions">
              <button className="btn btn-warning" onClick={handleEdit}>Edit</button>
              <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
            </div>
          </>
        )}
      </Modal>

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editMode ? 'Edit Maintenance Schedule' : 'Add Maintenance Schedule'}
        footer={<><button className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button><button className="btn btn-primary" onClick={handleSubmit}>{editMode ? 'Update' : 'Add'}</button></>}>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group"><label>Schedule ID</label><input value={form.scheduleId} onChange={e => updateForm('scheduleId', e.target.value)} required placeholder="e.g. MS-001" /></div>
            <div className="form-group"><label>Equipment ID</label><input value={form.equipmentId} onChange={e => updateForm('equipmentId', e.target.value)} required placeholder="e.g. EQ-001" /></div>
            <div className="form-group"><label>Equipment Name</label><input value={form.equipmentName} onChange={e => updateForm('equipmentName', e.target.value)} required /></div>
            <div className="form-group"><label>Type</label><select value={form.type} onChange={e => updateForm('type', e.target.value)} required>
              <option value="preventive">Preventive</option><option value="corrective">Corrective</option><option value="predictive">Predictive</option><option value="inspection">Inspection</option>
            </select></div>
            <div className="form-group"><label>Priority</label><select value={form.priority} onChange={e => updateForm('priority', e.target.value)} required>
              <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="urgent">Urgent</option>
            </select></div>
            <div className="form-group"><label>Scheduled Date</label><input type="date" value={form.scheduledDate} onChange={e => updateForm('scheduledDate', e.target.value)} required /></div>
            <div className="form-group"><label>Assigned To</label><input value={form.assignedTo} onChange={e => updateForm('assignedTo', e.target.value)} required /></div>
            <div className="form-group"><label>Estimated Duration (hrs)</label><input type="number" value={form.estimatedDuration} onChange={e => updateForm('estimatedDuration', e.target.value)} /></div>
            <div className="form-group"><label>Cost ($)</label><input type="number" value={form.cost} onChange={e => updateForm('cost', e.target.value)} /></div>
            <div className="form-group full-width"><label>Description</label><textarea value={form.description} onChange={e => updateForm('description', e.target.value)} rows="3" /></div>
            <div className="form-group full-width"><label>Notes</label><textarea value={form.notes} onChange={e => updateForm('notes', e.target.value)} rows="2" /></div>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default MaintenanceScheduler;
