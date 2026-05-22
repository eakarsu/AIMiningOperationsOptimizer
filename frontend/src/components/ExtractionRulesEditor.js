import React, { useEffect, useState } from 'react';
import axios from 'axios';

const empty = { name: '', metric: 'grade_pct', operator: '>=', value: 0, action: 'notify', enabled: true };

function ExtractionRulesEditor() {
  const [rules, setRules] = useState([]);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [err, setErr] = useState(null);

  const token = localStorage.getItem('token');
  const auth = { headers: { Authorization: `Bearer ${token}` } };

  const load = () => {
    axios.get('/api/custom-views/extraction-rules', auth)
      .then((r) => setRules(r.data.rules || []))
      .catch((e) => setErr(e.message));
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  const submit = async () => {
    try {
      if (editingId) {
        await axios.put(`/api/custom-views/extraction-rules/${editingId}`, form, auth);
      } else {
        await axios.post('/api/custom-views/extraction-rules', form, auth);
      }
      setForm(empty);
      setEditingId(null);
      load();
    } catch (e) {
      setErr(e.message);
    }
  };

  const edit = (r) => {
    setForm({ name: r.name, metric: r.metric, operator: r.operator, value: r.value, action: r.action, enabled: r.enabled });
    setEditingId(r.id);
  };

  const remove = async (id) => {
    try {
      await axios.delete(`/api/custom-views/extraction-rules/${id}`, auth);
      load();
    } catch (e) {
      setErr(e.message);
    }
  };

  const input = { background: '#13131f', color: '#fff', border: '1px solid #444', padding: 6, borderRadius: 4 };

  return (
    <div className="card" style={{ background: '#1e1e2f', padding: 16, borderRadius: 8 }}>
      <h3 style={{ marginTop: 0, color: '#fff' }}>Extraction Rules Editor</h3>
      {err && <div style={{ color: '#ef5350', marginBottom: 8 }}>Error: {err}</div>}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
        <input style={input} placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <select style={input} value={form.metric} onChange={(e) => setForm({ ...form, metric: e.target.value })}>
          <option value="grade_pct">grade_pct</option>
          <option value="yield_tonnes">yield_tonnes</option>
          <option value="downtime_hrs">downtime_hrs</option>
          <option value="spacing_m">spacing_m</option>
        </select>
        <select style={input} value={form.operator} onChange={(e) => setForm({ ...form, operator: e.target.value })}>
          <option value=">=">≥</option>
          <option value=">">&gt;</option>
          <option value="<=">≤</option>
          <option value="<">&lt;</option>
          <option value="==">=</option>
        </select>
        <input style={{ ...input, width: 100 }} type="number" value={form.value} onChange={(e) => setForm({ ...form, value: parseFloat(e.target.value) || 0 })} />
        <select style={input} value={form.action} onChange={(e) => setForm({ ...form, action: e.target.value })}>
          <option value="notify">notify</option>
          <option value="priority_haul">priority_haul</option>
          <option value="notify_supervisor">notify_supervisor</option>
          <option value="schedule_maintenance">schedule_maintenance</option>
          <option value="reject_plan">reject_plan</option>
        </select>
        <label style={{ color: '#ddd', fontSize: 13, display: 'flex', alignItems: 'center', gap: 4 }}>
          <input type="checkbox" checked={form.enabled} onChange={(e) => setForm({ ...form, enabled: e.target.checked })} />
          enabled
        </label>
        <button onClick={submit} style={{ background: '#4FC3F7', color: '#111', border: 'none', padding: '6px 14px', borderRadius: 4, cursor: 'pointer', fontWeight: 600 }}>
          {editingId ? 'Update' : 'Add'}
        </button>
        {editingId && (
          <button onClick={() => { setForm(empty); setEditingId(null); }} style={{ background: '#555', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: 4, cursor: 'pointer' }}>
            Cancel
          </button>
        )}
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', color: '#ddd', fontSize: 13 }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #333', color: '#888', textAlign: 'left' }}>
            <th style={{ padding: 6 }}>Name</th>
            <th>Metric</th>
            <th>Op</th>
            <th>Value</th>
            <th>Action</th>
            <th>Enabled</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {rules.map((r) => (
            <tr key={r.id} style={{ borderBottom: '1px solid #2a2a3a' }}>
              <td style={{ padding: 6 }}>{r.name}</td>
              <td>{r.metric}</td>
              <td>{r.operator}</td>
              <td>{r.value}</td>
              <td>{r.action}</td>
              <td>{r.enabled ? 'yes' : 'no'}</td>
              <td>
                <button onClick={() => edit(r)} style={{ marginRight: 6, background: '#FFB74D', color: '#111', border: 'none', padding: '4px 10px', borderRadius: 4, cursor: 'pointer' }}>Edit</button>
                <button onClick={() => remove(r.id)} style={{ background: '#ef5350', color: '#fff', border: 'none', padding: '4px 10px', borderRadius: 4, cursor: 'pointer' }}>Delete</button>
              </td>
            </tr>
          ))}
          {rules.length === 0 && (
            <tr><td colSpan={7} style={{ padding: 12, color: '#888', textAlign: 'center' }}>No rules</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default ExtractionRulesEditor;
