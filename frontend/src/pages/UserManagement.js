import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';
import { toast } from 'react-toastify';

const emptyForm = { name: '', email: '', password: '', role: 'operator' };

function UserManagement() {
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const fetchItems = async () => {
    try { const res = await api.get('/users'); setItems(res.data); } catch (e) { toast.error('Failed to load users'); }
  };
  useEffect(() => { fetchItems(); }, []);

  const handleRowClick = (item) => { setSelected(item); setShowDetail(true); };
  const handleNew = () => { setForm(emptyForm); setEditMode(false); setShowForm(true); };

  const handleEdit = () => {
    setForm({
      name: selected.name, email: selected.email, password: '', role: selected.role
    });
    setEditMode(true); setShowDetail(false); setShowForm(true);
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this user? This action cannot be undone.')) return;
    try { await api.delete(`/users/${selected.id}`); toast.success('User deleted'); setShowDetail(false); fetchItems(); }
    catch (e) { toast.error('Failed to delete user'); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form };
      if (editMode && !payload.password) delete payload.password;
      if (editMode) { await api.put(`/users/${selected.id}`, payload); toast.success('User updated'); }
      else { await api.post('/users', payload); toast.success('User created'); }
      setShowForm(false); fetchItems();
    } catch (e) { toast.error(e.response?.data?.error || 'Failed'); }
  };

  const updateForm = (f, v) => setForm(prev => ({ ...prev, [f]: v }));
  const getRoleBadge = (r) => ({ admin: 'badge-danger', engineer: 'badge-info', operator: 'badge-success' }[r] || 'badge-secondary');

  return (
    <div className="feature-page">
      <div className="page-header">
        <h1>User Management</h1>
        <p>Manage system users and access permissions</p>
      </div>
      <div className="page-actions"><button className="btn btn-primary" onClick={handleNew}>+ Add User</button></div>
      <div className="data-table-container">
        <table className="data-table">
          <thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Role</th><th>Created</th></tr></thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id} onClick={() => handleRowClick(item)}>
                <td><strong>{item.id}</strong></td><td>{item.name}</td><td>{item.email}</td>
                <td><span className={`badge ${getRoleBadge(item.role)}`}>{item.role}</span></td>
                <td>{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {items.length === 0 && <div className="empty-state"><div className="empty-icon">{'\u{1F465}'}</div><h3>No users found</h3></div>}
      </div>

      <Modal isOpen={showDetail} onClose={() => setShowDetail(false)} title="User Details">
        {selected && (
          <>
            <div className="detail-section">
              <h3>User Information</h3>
              <div className="detail-grid">
                <div className="detail-item"><span className="detail-label">ID</span><span className="detail-value">{selected.id}</span></div>
                <div className="detail-item"><span className="detail-label">Name</span><span className="detail-value">{selected.name}</span></div>
                <div className="detail-item"><span className="detail-label">Email</span><span className="detail-value">{selected.email}</span></div>
                <div className="detail-item"><span className="detail-label">Role</span><span className={`badge ${getRoleBadge(selected.role)}`}>{selected.role}</span></div>
                <div className="detail-item"><span className="detail-label">Created</span><span className="detail-value">{selected.createdAt ? new Date(selected.createdAt).toLocaleString() : 'N/A'}</span></div>
                {selected.updatedAt && <div className="detail-item"><span className="detail-label">Last Updated</span><span className="detail-value">{new Date(selected.updatedAt).toLocaleString()}</span></div>}
              </div>
            </div>
            <div className="detail-actions">
              <button className="btn btn-warning" onClick={handleEdit}>Edit</button>
              <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
            </div>
          </>
        )}
      </Modal>

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editMode ? 'Edit User' : 'Add New User'}
        footer={<><button className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button><button className="btn btn-primary" onClick={handleSubmit}>{editMode ? 'Update' : 'Create'}</button></>}>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group"><label>Name</label><input value={form.name} onChange={e => updateForm('name', e.target.value)} required /></div>
            <div className="form-group"><label>Email</label><input type="email" value={form.email} onChange={e => updateForm('email', e.target.value)} required /></div>
            <div className="form-group"><label>{editMode ? 'Password' : 'Password'}</label><input type="password" value={form.password} onChange={e => updateForm('password', e.target.value)} required={!editMode} placeholder={editMode ? 'Leave blank to keep current' : 'Enter password'} /></div>
            <div className="form-group"><label>Role</label><select value={form.role} onChange={e => updateForm('role', e.target.value)} required>
              <option value="admin">Admin</option><option value="engineer">Engineer</option><option value="operator">Operator</option>
            </select></div>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default UserManagement;
