import React, { useEffect, useState } from 'react';
import axios from 'axios';

function color(v) {
  // 0..1 → dark blue → orange
  const r = Math.round(40 + v * 215);
  const g = Math.round(60 + v * 100);
  const b = Math.round(200 - v * 180);
  return `rgb(${r},${g},${b})`;
}

function EquipmentUtilizationHeatmap() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    axios.get('/api/custom-views/equipment-utilization-heatmap', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => setData(r.data))
      .catch((e) => setErr(e.message));
  }, []);

  if (err) return <div style={{ color: '#ef5350', padding: 12 }}>Error: {err}</div>;
  if (!data) return <div style={{ padding: 12 }}>Loading utilization heatmap...</div>;

  const cell = 24;

  return (
    <div className="card" style={{ background: '#1e1e2f', padding: 16, borderRadius: 8 }}>
      <h3 style={{ marginTop: 0, color: '#fff' }}>{data.title}</h3>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'collapse', color: '#ddd', fontSize: 11 }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: 4, color: '#aaa' }}>Equipment</th>
              {data.xAxis.map((h) => (
                <th key={h} style={{ width: cell, padding: 0, color: '#888', fontWeight: 400 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.matrix.map((row) => (
              <tr key={row.equipment}>
                <td style={{ padding: '4px 8px', whiteSpace: 'nowrap' }}>{row.equipment}</td>
                {row.hourly.map((c) => (
                  <td
                    key={c.hour}
                    title={`Hour ${c.hour}: ${(c.utilization * 100).toFixed(0)}%`}
                    style={{ width: cell, height: cell, background: color(c.utilization), border: '1px solid #13131f' }}
                  />
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, fontSize: 12, color: '#aaa' }}>
        <span>Low</span>
        {[0, 0.25, 0.5, 0.75, 1].map((v) => (
          <span key={v} style={{ width: 28, height: 14, background: color(v), display: 'inline-block' }} />
        ))}
        <span>High</span>
      </div>
    </div>
  );
}

export default EquipmentUtilizationHeatmap;
