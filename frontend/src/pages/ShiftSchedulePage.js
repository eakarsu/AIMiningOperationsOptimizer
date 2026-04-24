import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';
import { toast } from 'react-toastify';

const emptyForm = {
  scheduleId: '', workerName: '', workerId: '', shift: 'day', date: '', startTime: '', endTime: '',
  location: '', role: '', status: 'scheduled', notes: ''
};

function ShiftSchedulePage() {
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [filterShift, setFilterShift] = useState('');
  const [filterDate, setFilterDate] = useState('');

  const fetchItems = async () => {
    try { const res = await api.get('/shift-schedules'); setItems(res.data); } catch (e) { toast.error('Failed to load schedules'); }
  };
  useEffect(() => { fetchItems(); }, []);

  const handleRowClick = (item) => { setSelected(item); setShowDetail(true); };
  const handleNew = () => { setForm(emptyForm); setEditMode(false); setShowForm(true); };

  const handleEdit = () => {
    setForm({
      scheduleId: selected.scheduleId, workerName: selected.workerName, workerId: selected.workerId,
      shift: selected.shift, date: selected.date?.split('T')[0] || '', startTime: selected.startTime || '',
      endTime: selected.endTime || '', location: selected.location || '', role: selected.role || '',
      status: selected.status, notes: selected.notes || ''
    });
    setEditMode(true); setShowDetail(false); setShowForm(true);
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this schedule?')) return;
    try { await api.delete(`/shift-schedules/${selected.id}`); toast.success('Deleted'); setShowDetail(false); fetchItems(); }
    catch (e) { toast.error('Failed'); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode) { await api.put(`/shift-schedules/${selected.id}`, form); toast.success('Updated'); }
      else { await api.post('/shift-schedules', form); toast.success('Created'); }
      setShowForm(false); fetchItems();
    } catch (e) { toast.error(e.response?.data?.error || 'Failed'); }
  };

  const updateForm = (f, v) => setForm(prev => ({ ...prev, [f]: v }));

  const getShiftBadge = (s) => ({ day: 'badge-success', night: 'badge-info', swing: 'badge-warning' }[s] || 'badge-secondary');
  const getStatusBadge = (s) => ({ scheduled: 'badge-info', 'in-progress': 'badge-warning', completed: 'badge-success', cancelled: 'badge-danger', 'no-show': 'badge-danger' }[s] || 'badge-secondary');

  const filtered = items.filter(item =>
    (!filterShift || item.shift === filterShift) &&
    (!filterDate || (item.date && item.date.startsWith(filterDate)))
  );

  return (
    <div className="feature-page">
      <div className="page-header">
        <h1>Shift Scheduling</h1>
        <p>Manage worker shift assignments and schedules</p>
      </div>
      <div className="page-actions">
        <select className="btn btn-secondary" value={filterShift} onChange={e => setFilterShift(e.target.value)}>
          <option value="">All Shifts</option>
          <option value="day">Day</option><option value="night">Night</option><option value="swing">Swing</option>
        </select>
        <input type="date" className="btn btn-secondary" value={filterDate} onChange={e => setFilterDate(e.target.value)} style={{ marginLeft: '8px' }} />
        <button className="btn btn-primary" onClick={handleNew} style={{ marginLeft: '8px' }}>+ Add Schedule</button>
      </div>
      <div className="data-table-container">
        <table className="data-table">
          <thead><tr><th>Schedule ID</th><th>Worker</th><th>Worker ID</th><th>Shift</th><th>Date</th><th>Start</th><th>End</th><th>Location</th><th>Role</th><th>Status</th></tr></thead>
          <tbody>
            {filtered.map(item => (
              <tr key={item.id} onClick={() => handleRowClick(item)}>
                <td><strong>{item.scheduleId}</strong></td><td>{item.workerName}</td><td>{item.workerId}</td>
                <td><span className={`badge ${getShiftBadge(item.shift)}`}>{item.shift}</span></td>
                <td>{item.date?.split('T')[0]}</td><td>{item.startTime}</td><td>{item.endTime}</td>
                <td>{item.location}</td><td>{item.role}</td>
                <td><span className={`badge ${getStatusBadge(item.status)}`}>{item.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="empty-state"><div className="empty-icon">{'\u{1F4C5}'}</div><h3>No schedules found</h3></div>}
      </div>

      <Modal isOpen={showDetail} onClose={() => setShowDetail(false)} title="Schedule Details">
        {selected && (
          <>
            <div className="detail-section">
              <h3>Schedule Information</h3>
              <div className="detail-grid">
                <div className="detail-item"><span className="detail-label">Schedule ID</span><span className="detail-value">{selected.scheduleId}</span></div>
                <div className="detail-item"><span className="detail-label">Worker Name</span><span className="detail-value">{selected.workerName}</span></div>
                <div className="detail-item"><span className="detail-label">Worker ID</span><span className="detail-value">{selected.workerId}</span></div>
                <div className="detail-item"><span className="detail-label">Shift</span><span className={`badge ${getShiftBadge(selected.shift)}`}>{selected.shift}</span></div>
                <div className="detail-item"><span className="detail-label">Date</span><span className="detail-value">{selected.date?.split('T')[0]}</span></div>
                <div className="detail-item"><span className="detail-label">Start Time</span><span className="detail-value">{selected.startTime}</span></div>
                <div className="detail-item"><span className="detail-label">End Time</span><span className="detail-value">{selected.endTime}</span></div>
                <div className="detail-item"><span className="detail-label">Location</span><span className="detail-value">{selected.location}</span></div>
                <div className="detail-item"><span className="detail-label">Role</span><span className="detail-value">{selected.role}</span></div>
                <div className="detail-item"><span className="detail-label">Status</span><span className={`badge ${getStatusBadge(selected.status)}`}>{selected.status}</span></div>
              </div>
            </div>
            {selected.notes && (
              <div className="detail-section">
                <h3>Notes</h3>
                <p style={{ fontSize: '14px', lineHeight: 1.6, color: '#94a3b8' }}>{selected.notes}</p>
              </div>
            )}
            <div className="detail-actions">
              <button className="btn btn-warning" onClick={handleEdit}>Edit</button>
              <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
            </div>
          </>
        )}
      </Modal>

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editMode ? 'Edit Schedule' : 'Add New Schedule'}
        footer={<><button className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button><button className="btn btn-primary" onClick={handleSubmit}>{editMode ? 'Update' : 'Add'}</button></>}>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group"><label>Schedule ID</label><input value={form.scheduleId} onChange={e => updateForm('scheduleId', e.target.value)} required placeholder="e.g. SH-001" /></div>
            <div className="form-group"><label>Worker Name</label><input value={form.workerName} onChange={e => updateForm('workerName', e.target.value)} required /></div>
            <div className="form-group"><label>Worker ID</label><input value={form.workerId} onChange={e => updateForm('workerId', e.target.value)} required placeholder="e.g. W-101" /></div>
            <div className="form-group"><label>Shift</label><select value={form.shift} onChange={e => updateForm('shift', e.target.value)} required>
              <option value="day">Day</option><option value="night">Night</option><option value="swing">Swing</option>
            </select></div>
            <div className="form-group"><label>Date</label><input type="date" value={form.date} onChange={e => updateForm('date', e.target.value)} required /></div>
            <div className="form-group"><label>Start Time</label><input type="time" value={form.startTime} onChange={e => updateForm('startTime', e.target.value)} required /></div>
            <div className="form-group"><label>End Time</label><input type="time" value={form.endTime} onChange={e => updateForm('endTime', e.target.value)} required /></div>
            <div className="form-group"><label>Location</label><input value={form.location} onChange={e => updateForm('location', e.target.value)} required /></div>
            <div className="form-group"><label>Role</label><input value={form.role} onChange={e => updateForm('role', e.target.value)} required placeholder="e.g. Operator" /></div>
            <div className="form-group"><label>Status</label><select value={form.status} onChange={e => updateForm('status', e.target.value)}>
              <option value="scheduled">Scheduled</option><option value="in-progress">In Progress</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option><option value="no-show">No Show</option>
            </select></div>
            <div className="form-group full-width"><label>Notes</label><textarea value={form.notes} onChange={e => updateForm('notes', e.target.value)} /></div>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default ShiftSchedulePage;
