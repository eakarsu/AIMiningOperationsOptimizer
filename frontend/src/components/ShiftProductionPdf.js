import React, { useState } from 'react';

function ShiftProductionPdf() {
  const [shift, setShift] = useState('day');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  const download = async () => {
    setBusy(true);
    setMsg('');
    try {
      const token = localStorage.getItem('token');
      const resp = await fetch(`/api/custom-views/shift-production-pdf?shift=${shift}&date=${date}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!resp.ok) throw new Error('HTTP ' + resp.status);
      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `shift-${date}-${shift}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setMsg('Downloaded shift-' + date + '-' + shift + '.pdf');
    } catch (e) {
      setMsg('Error: ' + e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="card" style={{ background: '#1e1e2f', padding: 16, borderRadius: 8 }}>
      <h3 style={{ marginTop: 0, color: '#fff' }}>Shift Production Report (PDF)</h3>
      <p style={{ color: '#aaa', fontSize: 13 }}>
        Generate a printable production summary for any shift on any date.
      </p>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <label style={{ color: '#ddd', fontSize: 13 }}>
          Date:&nbsp;
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={{ background: '#13131f', color: '#fff', border: '1px solid #444', padding: 6, borderRadius: 4 }}
          />
        </label>
        <label style={{ color: '#ddd', fontSize: 13 }}>
          Shift:&nbsp;
          <select
            value={shift}
            onChange={(e) => setShift(e.target.value)}
            style={{ background: '#13131f', color: '#fff', border: '1px solid #444', padding: 6, borderRadius: 4 }}
          >
            <option value="day">Day</option>
            <option value="night">Night</option>
          </select>
        </label>
        <button
          onClick={download}
          disabled={busy}
          style={{ background: '#4FC3F7', color: '#111', border: 'none', padding: '8px 14px', borderRadius: 4, cursor: 'pointer', fontWeight: 600 }}
        >
          {busy ? 'Generating...' : 'Download PDF'}
        </button>
      </div>
      {msg && <div style={{ marginTop: 10, color: msg.startsWith('Error') ? '#ef5350' : '#81C784', fontSize: 13 }}>{msg}</div>}
    </div>
  );
}

export default ShiftProductionPdf;
