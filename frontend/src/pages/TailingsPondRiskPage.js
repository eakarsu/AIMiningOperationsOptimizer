import React, { useState } from 'react';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export default function TailingsPondRiskPage() {
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const forecast = async () => {
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${API}/tailings-pond-risk/forecast`, {
        pond: { freeboardMeters: 1.2, seepageLitersHour: 260 },
        inspections: [{ daysAgo: 34 }],
        rainfallMm: 125,
        productionTons: 850000,
      }, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  return (
    <div className="page">
      <h1>Tailings Pond Risk</h1>
      <p>Forecast pond risk from freeboard, seepage, rainfall, production load, and inspection age.</p>
      <button onClick={forecast}>Run forecast</button>
      {error && <div className="error">{error}</div>}
      {result && <pre className="ai-result">{JSON.stringify(result, null, 2)}</pre>}
    </div>
  );
}
