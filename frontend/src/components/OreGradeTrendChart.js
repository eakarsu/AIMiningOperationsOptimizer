import React, { useEffect, useState } from 'react';
import axios from 'axios';

const COLORS = ['#4FC3F7', '#FFB74D', '#FFD54F', '#81C784'];

function OreGradeTrendChart() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    axios.get('/api/custom-views/ore-grade-trend?days=30', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => setData(r.data))
      .catch((e) => setErr(e.message));
  }, []);

  if (err) return <div style={{ color: '#ef5350', padding: 12 }}>Error: {err}</div>;
  if (!data) return <div style={{ padding: 12 }}>Loading ore grade trend...</div>;

  const W = 720, H = 260, PAD = 36;
  const allPoints = data.series.flatMap((s) => s.points.map((p) => p.grade));
  const ymax = Math.max(...allPoints) * 1.05;
  const ymin = Math.min(...allPoints) * 0.95;
  const n = data.series[0].points.length;

  const x = (i) => PAD + (i * (W - PAD * 2)) / Math.max(1, n - 1);
  const y = (v) => H - PAD - ((v - ymin) / (ymax - ymin)) * (H - PAD * 2);

  return (
    <div className="card" style={{ background: '#1e1e2f', padding: 16, borderRadius: 8 }}>
      <h3 style={{ marginTop: 0, color: '#fff' }}>{data.title}</h3>
      <svg width={W} height={H} style={{ background: '#13131f', borderRadius: 6 }}>
        <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke="#555" />
        <line x1={PAD} y1={PAD} x2={PAD} y2={H - PAD} stroke="#555" />
        {data.series.map((s, si) => {
          const path = s.points.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(i)},${y(p.grade)}`).join(' ');
          return <path key={s.oreType} d={path} fill="none" stroke={COLORS[si % COLORS.length]} strokeWidth={2} />;
        })}
        <text x={PAD} y={20} fill="#aaa" fontSize="11">grade</text>
        <text x={W - PAD - 20} y={H - 8} fill="#aaa" fontSize="11">days</text>
      </svg>
      <div style={{ display: 'flex', gap: 16, marginTop: 12, flexWrap: 'wrap' }}>
        {data.series.map((s, si) => (
          <div key={s.oreType} style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#ddd', fontSize: 13 }}>
            <span style={{ width: 12, height: 12, background: COLORS[si % COLORS.length], display: 'inline-block', borderRadius: 2 }} />
            {s.oreType} ({s.unit})
          </div>
        ))}
      </div>
    </div>
  );
}

export default OreGradeTrendChart;
