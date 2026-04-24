import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';
import { toast } from 'react-toastify';

const emptyForm = {
  itemId: '', name: '', category: 'spare-parts', quantity: '', unit: 'units', minStock: '', maxStock: '',
  location: '', supplier: '', unitCost: '', expiryDate: '', notes: ''
};

function InventoryPage() {
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [restockQty, setRestockQty] = useState('');
  const [restocking, setRestocking] = useState(false);

  const fetchItems = async () => {
    try { const res = await api.get('/inventory'); setItems(res.data); } catch (e) { toast.error('Failed to load inventory'); }
  };
  useEffect(() => { fetchItems(); }, []);

  const handleRowClick = (item) => { setSelected(item); setRestockQty(''); setShowDetail(true); };
  const handleNew = () => { setForm(emptyForm); setEditMode(false); setShowForm(true); };

  const handleEdit = () => {
    setForm({
      itemId: selected.itemId, name: selected.name, category: selected.category,
      quantity: selected.quantity, unit: selected.unit, minStock: selected.minStock || '',
      maxStock: selected.maxStock || '', location: selected.location || '', supplier: selected.supplier || '',
      unitCost: selected.unitCost || '', expiryDate: selected.expiryDate?.split('T')[0] || '', notes: selected.notes || ''
    });
    setEditMode(true); setShowDetail(false); setShowForm(true);
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this inventory item?')) return;
    try { await api.delete(`/inventory/${selected.id}`); toast.success('Deleted'); setShowDetail(false); fetchItems(); }
    catch (e) { toast.error('Failed to delete'); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode) { await api.put(`/inventory/${selected.id}`, form); toast.success('Updated'); }
      else { await api.post('/inventory', form); toast.success('Created'); }
      setShowForm(false); fetchItems();
    } catch (e) { toast.error(e.response?.data?.error || 'Failed'); }
  };

  const handleRestock = async () => {
    if (!restockQty || Number(restockQty) <= 0) { toast.error('Enter a valid quantity'); return; }
    setRestocking(true);
    try {
      const res = await api.put(`/inventory/${selected.id}/restock`, { quantity: Number(restockQty) });
      toast.success('Restocked successfully');
      setSelected(res.data); setRestockQty(''); fetchItems();
    } catch (e) { toast.error('Restock failed'); } finally { setRestocking(false); }
  };

  const updateForm = (f, v) => setForm(prev => ({ ...prev, [f]: v }));

  const getStatusBadge = (s) => ({ 'in-stock': 'badge-success', 'low-stock': 'badge-warning', 'out-of-stock': 'badge-danger', 'on-order': 'badge-info', expired: 'badge-danger' }[s] || 'badge-secondary');
  const getCategoryBadge = (c) => ({ explosives: 'badge-danger', fuel: 'badge-warning', 'spare-parts': 'badge-info', 'safety-equipment': 'badge-success', tools: 'badge-secondary', chemicals: 'badge-info', consumables: 'badge-secondary' }[c] || 'badge-secondary');

  const filtered = items.filter(item => {
    if (filterCategory && item.category !== filterCategory) return false;
    if (filterStatus && item.status !== filterStatus) return false;
    return true;
  });

  const isLowStock = (item) => item.quantity != null && item.minStock != null && item.quantity <= item.minStock;

  return (
    <div className="feature-page">
      <div className="page-header">
        <h1>Inventory Management</h1>
        <p>Track and manage mining supplies and materials</p>
      </div>
      <div className="page-actions">
        <button className="btn btn-primary" onClick={handleNew}>+ Add Item</button>
        <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="btn btn-secondary">
          <option value="">All Categories</option>
          <option value="explosives">Explosives</option>
          <option value="fuel">Fuel</option>
          <option value="spare-parts">Spare Parts</option>
          <option value="safety-equipment">Safety Equipment</option>
          <option value="tools">Tools</option>
          <option value="chemicals">Chemicals</option>
          <option value="consumables">Consumables</option>
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="btn btn-secondary">
          <option value="">All Statuses</option>
          <option value="in-stock">In Stock</option>
          <option value="low-stock">Low Stock</option>
          <option value="out-of-stock">Out of Stock</option>
          <option value="on-order">On Order</option>
          <option value="expired">Expired</option>
        </select>
      </div>
      <div className="data-table-container">
        <table className="data-table">
          <thead><tr><th>Item ID</th><th>Name</th><th>Category</th><th>Quantity</th><th>Unit</th><th>Min Stock</th><th>Location</th><th>Status</th><th>Unit Cost</th></tr></thead>
          <tbody>
            {filtered.map(item => (
              <tr key={item.id} onClick={() => handleRowClick(item)} style={isLowStock(item) ? { background: 'rgba(239, 68, 68, 0.1)' } : {}}>
                <td><strong>{item.itemId}</strong></td>
                <td>{item.name}</td>
                <td><span className={`badge ${getCategoryBadge(item.category)}`}>{item.category}</span></td>
                <td>{item.quantity?.toLocaleString()}</td>
                <td>{item.unit}</td>
                <td>{item.minStock}</td>
                <td>{item.location}</td>
                <td><span className={`badge ${getStatusBadge(item.status)}`}>{item.status}</span></td>
                <td>{item.unitCost ? `$${Number(item.unitCost).toLocaleString()}` : 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="empty-state"><div className="empty-icon">{'\u{1F4E6}'}</div><h3>No inventory items found</h3></div>}
      </div>

      <Modal isOpen={showDetail} onClose={() => setShowDetail(false)} title="Inventory Item Details">
        {selected && (
          <>
            <div className="detail-section">
              <h3>Item Information</h3>
              <div className="detail-grid">
                <div className="detail-item"><span className="detail-label">Item ID</span><span className="detail-value">{selected.itemId}</span></div>
                <div className="detail-item"><span className="detail-label">Name</span><span className="detail-value">{selected.name}</span></div>
                <div className="detail-item"><span className="detail-label">Category</span><span className={`badge ${getCategoryBadge(selected.category)}`}>{selected.category}</span></div>
                <div className="detail-item"><span className="detail-label">Quantity</span><span className="detail-value">{selected.quantity?.toLocaleString()} {selected.unit}</span></div>
                <div className="detail-item"><span className="detail-label">Min Stock</span><span className="detail-value">{selected.minStock}</span></div>
                <div className="detail-item"><span className="detail-label">Max Stock</span><span className="detail-value">{selected.maxStock || 'N/A'}</span></div>
                <div className="detail-item"><span className="detail-label">Location</span><span className="detail-value">{selected.location || 'N/A'}</span></div>
                <div className="detail-item"><span className="detail-label">Supplier</span><span className="detail-value">{selected.supplier || 'N/A'}</span></div>
                <div className="detail-item"><span className="detail-label">Unit Cost</span><span className="detail-value">{selected.unitCost ? `$${Number(selected.unitCost).toLocaleString()}` : 'N/A'}</span></div>
                <div className="detail-item"><span className="detail-label">Total Value</span><span className="detail-value">{selected.unitCost && selected.quantity ? `$${(selected.quantity * selected.unitCost).toLocaleString()}` : 'N/A'}</span></div>
                <div className="detail-item"><span className="detail-label">Expiry Date</span><span className="detail-value">{selected.expiryDate?.split('T')[0] || 'N/A'}</span></div>
                <div className="detail-item"><span className="detail-label">Status</span><span className={`badge ${getStatusBadge(selected.status)}`}>{selected.status}</span></div>
              </div>
            </div>
            {selected.notes && (
              <div className="detail-section">
                <h3>Notes</h3>
                <div className="detail-grid">
                  <div className="detail-item full-width"><span className="detail-value">{selected.notes}</span></div>
                </div>
              </div>
            )}
            <div className="detail-section">
              <h3>Restock</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Restock Quantity</label>
                  <input type="number" value={restockQty} onChange={e => setRestockQty(e.target.value)} placeholder="Enter quantity" min="1" />
                </div>
                <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end' }}>
                  <button className="btn btn-success" onClick={handleRestock} disabled={restocking}>{restocking ? 'Restocking...' : 'Restock'}</button>
                </div>
              </div>
            </div>
            <div className="detail-actions">
              <button className="btn btn-warning" onClick={handleEdit}>Edit</button>
              <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
            </div>
          </>
        )}
      </Modal>

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editMode ? 'Edit Inventory Item' : 'Add Inventory Item'}
        footer={<><button className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button><button className="btn btn-primary" onClick={handleSubmit}>{editMode ? 'Update' : 'Add'}</button></>}>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group"><label>Item ID</label><input value={form.itemId} onChange={e => updateForm('itemId', e.target.value)} required placeholder="e.g. INV-001" /></div>
            <div className="form-group"><label>Name</label><input value={form.name} onChange={e => updateForm('name', e.target.value)} required /></div>
            <div className="form-group"><label>Category</label><select value={form.category} onChange={e => updateForm('category', e.target.value)} required>
              <option value="explosives">Explosives</option><option value="fuel">Fuel</option><option value="spare-parts">Spare Parts</option>
              <option value="safety-equipment">Safety Equipment</option><option value="tools">Tools</option><option value="chemicals">Chemicals</option><option value="consumables">Consumables</option>
            </select></div>
            <div className="form-group"><label>Quantity</label><input type="number" value={form.quantity} onChange={e => updateForm('quantity', e.target.value)} required min="0" /></div>
            <div className="form-group"><label>Unit</label><select value={form.unit} onChange={e => updateForm('unit', e.target.value)} required>
              <option value="kg">kg</option><option value="liters">liters</option><option value="units">units</option><option value="meters">meters</option><option value="tons">tons</option>
            </select></div>
            <div className="form-group"><label>Min Stock</label><input type="number" value={form.minStock} onChange={e => updateForm('minStock', e.target.value)} min="0" /></div>
            <div className="form-group"><label>Max Stock</label><input type="number" value={form.maxStock} onChange={e => updateForm('maxStock', e.target.value)} min="0" /></div>
            <div className="form-group"><label>Location</label><input value={form.location} onChange={e => updateForm('location', e.target.value)} /></div>
            <div className="form-group"><label>Supplier</label><input value={form.supplier} onChange={e => updateForm('supplier', e.target.value)} /></div>
            <div className="form-group"><label>Unit Cost ($)</label><input type="number" value={form.unitCost} onChange={e => updateForm('unitCost', e.target.value)} min="0" step="0.01" /></div>
            <div className="form-group"><label>Expiry Date</label><input type="date" value={form.expiryDate} onChange={e => updateForm('expiryDate', e.target.value)} /></div>
            <div className="form-group full-width"><label>Notes</label><textarea value={form.notes} onChange={e => updateForm('notes', e.target.value)} rows="3" /></div>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default InventoryPage;
