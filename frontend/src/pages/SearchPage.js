import React, { useState, useRef } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';

const resourceOptions = [
  { value: '', label: 'All Resources' },
  { value: 'equipment', label: 'Equipment' },
  { value: 'ore-grades', label: 'Ore Grades' },
  { value: 'safety-incidents', label: 'Safety Incidents' },
  { value: 'drill-patterns', label: 'Drill Patterns' },
  { value: 'environmental', label: 'Environmental' },
  { value: 'production-logs', label: 'Production Logs' },
  { value: 'workforce', label: 'Workforce' },
  { value: 'cost-analysis', label: 'Cost Analysis' },
  { value: 'geology-maps', label: 'Geology Maps' },
  { value: 'hauling', label: 'Hauling' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'inventory', label: 'Inventory' }
];

function SearchPage() {
  const [query, setQuery] = useState('');
  const [resource, setResource] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef(null);

  const performSearch = async (searchTerm, searchResource) => {
    if (!searchTerm.trim()) { setResults(null); return; }
    setLoading(true);
    try {
      const params = { q: searchTerm };
      if (searchResource) params.resource = searchResource;
      const res = await api.get('/search', { params });
      setResults(res.data);
    } catch (e) { toast.error('Search failed'); setResults(null); } finally { setLoading(false); }
  };

  const handleQueryChange = (value) => {
    setQuery(value);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => { performSearch(value, resource); }, 400);
  };

  const handleResourceChange = (value) => {
    setResource(value);
    if (query.trim()) performSearch(query, value);
  };

  const getResultKeys = (item) => {
    const keys = Object.keys(item).filter(k => k !== 'id' && k !== '_id' && k !== '__v' && k !== 'aiRecommendation');
    return keys.slice(0, 5);
  };

  const groupedResults = () => {
    if (!results) return {};
    if (Array.isArray(results)) {
      return { results };
    }
    return results;
  };

  const grouped = groupedResults();
  const totalCount = Object.values(grouped).reduce((sum, arr) => sum + (Array.isArray(arr) ? arr.length : 0), 0);

  return (
    <div className="feature-page">
      <div className="page-header">
        <h1>Global Search</h1>
        <p>Search across all mining operations data</p>
      </div>
      <div className="form-grid" style={{ marginBottom: '2rem' }}>
        <div className="form-group full-width">
          <input
            type="text"
            value={query}
            onChange={e => handleQueryChange(e.target.value)}
            placeholder="Search across all mining data..."
            style={{ fontSize: '1.1rem', padding: '0.9rem 1.2rem' }}
          />
        </div>
        <div className="form-group">
          <select value={resource} onChange={e => handleResourceChange(e.target.value)} className="btn btn-secondary" style={{ width: '100%', padding: '0.7rem' }}>
            {resourceOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
        </div>
      </div>

      {loading && (
        <div className="empty-state"><h3>Searching...</h3></div>
      )}

      {!loading && results && totalCount === 0 && (
        <div className="empty-state"><div className="empty-icon">{'\u{1F50D}'}</div><h3>No results found</h3><p>Try a different search term or resource filter</p></div>
      )}

      {!loading && results && totalCount > 0 && (
        <div>
          <p style={{ color: '#94a3b8', marginBottom: '1rem' }}>{totalCount} result{totalCount !== 1 ? 's' : ''} found</p>
          {Object.entries(grouped).map(([resourceName, resourceItems]) => {
            if (!Array.isArray(resourceItems) || resourceItems.length === 0) return null;
            return (
              <div key={resourceName} style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                  <h3 style={{ margin: 0, textTransform: 'capitalize', color: '#e2e8f0' }}>{resourceName.replace(/-/g, ' ')}</h3>
                  <span className="badge badge-info">{resourceItems.length}</span>
                </div>
                <div style={{ display: 'grid', gap: '0.75rem' }}>
                  {resourceItems.map((item, idx) => (
                    <div key={item.id || idx} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '1rem 1.25rem' }}>
                      <div className="detail-grid">
                        {getResultKeys(item).map(key => (
                          <div className="detail-item" key={key}>
                            <span className="detail-label">{key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}</span>
                            <span className="detail-value">{typeof item[key] === 'object' ? JSON.stringify(item[key]) : String(item[key] ?? 'N/A')}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!loading && !results && (
        <div className="empty-state"><div className="empty-icon">{'\u{1F50D}'}</div><h3>Start typing to search</h3><p>Search equipment, incidents, production data, and more</p></div>
      )}
    </div>
  );
}

export default SearchPage;
