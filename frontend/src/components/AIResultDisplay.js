import React from 'react';

function formatAIContent(text) {
  if (!text) return '';

  let html = text
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^\d+\.\s+(.+)$/gm, '<li>$1</li>')
    .replace(/^[-•]\s+(.+)$/gm, '<li>$1</li>')
    .replace(/((?:<li>.*<\/li>\n?)+)/g, '<ul>$1</ul>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br/>');

  return `<p>${html}</p>`;
}

// Render structured JSON fields as cards based on entity type
function StructuredDisplay({ parsed, entityType }) {
  if (!parsed || parsed._parse_error) return null;

  // Equipment health score gauge
  if (entityType === 'equipment' && parsed.health_score !== undefined) {
    const score = parsed.health_score;
    const color = score >= 70 ? '#10b981' : score >= 40 ? '#f59e0b' : '#ef4444';
    return (
      <div style={{ padding: '16px' }}>
        {/* Health Score Gauge */}
        <div style={{ marginBottom: '16px', textAlign: 'center' }}>
          <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Health Score</div>
          <div style={{ fontSize: '48px', fontWeight: '700', color }}>{score}/100</div>
          <div style={{ height: '8px', backgroundColor: '#1e293b', borderRadius: '4px', margin: '8px auto', maxWidth: '200px', overflow: 'hidden' }}>
            <div style={{ width: `${score}%`, height: '100%', backgroundColor: color, borderRadius: '4px', transition: 'width 0.5s ease' }} />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          {parsed.failure_risk && (
            <Card label="Failure Risk" value={parsed.failure_risk}
              color={parsed.failure_risk === 'high' ? '#ef4444' : parsed.failure_risk === 'medium' ? '#f59e0b' : '#10b981'} />
          )}
          {parsed.maintenance_priority && <Card label="Maintenance Priority" value={parsed.maintenance_priority} />}
          {parsed.estimated_downtime_days !== undefined && <Card label="Est. Downtime" value={`${parsed.estimated_downtime_days} days`} />}
          {parsed.remaining_useful_life && <Card label="Remaining Life" value={parsed.remaining_useful_life} />}
        </div>
        {parsed.recommended_actions && parsed.recommended_actions.length > 0 && (
          <ListCard label="Recommended Actions" items={parsed.recommended_actions} />
        )}
      </div>
    );
  }

  // Safety incident risk level badge
  if (entityType === 'safety' || parsed.risk_level) {
    const riskColor = { critical: '#ef4444', high: '#f59e0b', medium: '#3b82f6', low: '#10b981' }[parsed.risk_level] || '#94a3b8';
    return (
      <div style={{ padding: '16px' }}>
        {parsed.risk_level && (
          <div style={{ marginBottom: '16px', textAlign: 'center' }}>
            <span style={{ padding: '8px 20px', borderRadius: '9999px', backgroundColor: riskColor + '33', color: riskColor, fontSize: '18px', fontWeight: '700', textTransform: 'uppercase', border: `2px solid ${riskColor}` }}>
              {parsed.risk_level} Risk
            </span>
          </div>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
          {parsed.incident_type_classification && <Card label="Classification" value={parsed.incident_type_classification} />}
          {parsed.root_cause && <Card label="Root Cause" value={parsed.root_cause} />}
        </div>
        {parsed.immediate_actions && parsed.immediate_actions.length > 0 && (
          <ListCard label="Immediate Actions" items={parsed.immediate_actions} accent="#ef4444" />
        )}
        {parsed.preventive_measures && parsed.preventive_measures.length > 0 && (
          <ListCard label="Preventive Measures" items={parsed.preventive_measures} accent="#10b981" />
        )}
        {parsed.regulatory_compliance_notes && (
          <InfoCard label="Regulatory Notes" value={parsed.regulatory_compliance_notes} />
        )}
      </div>
    );
  }

  // Ore grade quality badge
  if (parsed.quality_assessment || parsed.grade_percentage !== undefined) {
    const qualityColor = { High: '#10b981', Medium: '#f59e0b', Low: '#ef4444' }[parsed.quality_assessment] || '#94a3b8';
    return (
      <div style={{ padding: '16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
          {parsed.quality_assessment && <Card label="Quality" value={parsed.quality_assessment} color={qualityColor} />}
          {parsed.grade_percentage !== undefined && <Card label="Grade %" value={`${parsed.grade_percentage}%`} />}
          {parsed.recovery_rate_percent !== undefined && <Card label="Recovery Rate" value={`${parsed.recovery_rate_percent}%`} />}
          {parsed.confidence_level !== undefined && <Card label="Confidence" value={`${parsed.confidence_level}%`} />}
        </div>
        {parsed.processing_recommendation && <InfoCard label="Processing Recommendation" value={parsed.processing_recommendation} />}
        {parsed.economic_value_estimate && <InfoCard label="Economic Value" value={parsed.economic_value_estimate} />}
        {parsed.risk_factors && parsed.risk_factors.length > 0 && (
          <ListCard label="Risk Factors" items={parsed.risk_factors} accent="#f59e0b" />
        )}
      </div>
    );
  }

  // Generic structured display for other types
  return (
    <div style={{ padding: '16px' }}>
      {Object.entries(parsed).map(([key, val]) => {
        if (key === '_parse_error') return null;
        if (Array.isArray(val)) {
          return <ListCard key={key} label={formatKey(key)} items={val.map(String)} />;
        }
        if (typeof val === 'object' && val !== null) {
          return <InfoCard key={key} label={formatKey(key)} value={JSON.stringify(val)} />;
        }
        return <Card key={key} label={formatKey(key)} value={String(val)} />;
      })}
    </div>
  );
}

function formatKey(key) {
  return key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

function Card({ label, value, color }) {
  return (
    <div style={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '12px' }}>
      <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>{label}</div>
      <div style={{ fontSize: '15px', fontWeight: '600', color: color || '#e2e8f0' }}>{value}</div>
    </div>
  );
}

function InfoCard({ label, value }) {
  return (
    <div style={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '12px', marginBottom: '8px' }}>
      <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>{label}</div>
      <div style={{ fontSize: '14px', color: '#cbd5e1', lineHeight: '1.5' }}>{value}</div>
    </div>
  );
}

function ListCard({ label, items, accent }) {
  return (
    <div style={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '12px', marginBottom: '8px' }}>
      <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>{label}</div>
      <ul style={{ margin: 0, paddingLeft: '0', listStyle: 'none' }}>
        {items.map((item, i) => (
          <li key={i} style={{ fontSize: '13px', color: '#cbd5e1', padding: '4px 0', borderBottom: i < items.length - 1 ? '1px solid #1e293b' : 'none', paddingLeft: '12px', position: 'relative' }}>
            <span style={{ position: 'absolute', left: 0, color: accent || '#3b82f6' }}>•</span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function AIResultDisplay({ result, loading, entityType }) {
  if (loading) {
    return (
      <div className="ai-loading">
        <div className="spinner"></div>
        <span>AI is analyzing your data...</span>
      </div>
    );
  }

  if (!result) return null;

  const content = result.content || result;
  const model = result.model || '';
  const usage = result.usage;

  // Try to get parsed structured JSON
  const parsed = result.parsed || (typeof content === 'object' ? content : null);
  const hasStructured = parsed && !parsed._parse_error && typeof parsed === 'object';

  return (
    <div className="ai-result">
      <div className="ai-result-header">
        <span className="ai-badge">AI Analysis</span>
        {model && <span className="ai-model">Model: {model}</span>}
        {usage && (
          <span className="ai-model">
            Tokens: {(usage.prompt_tokens || 0) + (usage.completion_tokens || 0)}
          </span>
        )}
      </div>

      {hasStructured ? (
        <StructuredDisplay parsed={parsed} entityType={entityType} />
      ) : (
        <div
          className="ai-result-content"
          dangerouslySetInnerHTML={{ __html: formatAIContent(typeof content === 'string' ? content : JSON.stringify(content, null, 2)) }}
        />
      )}
    </div>
  );
}

export default AIResultDisplay;
