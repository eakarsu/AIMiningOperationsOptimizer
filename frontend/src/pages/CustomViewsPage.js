import React from 'react';
import OreGradeTrendChart from '../components/OreGradeTrendChart';
import EquipmentUtilizationHeatmap from '../components/EquipmentUtilizationHeatmap';
import ShiftProductionPdf from '../components/ShiftProductionPdf';
import ExtractionRulesEditor from '../components/ExtractionRulesEditor';

function CustomViewsPage() {
  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ color: '#fff', marginTop: 0 }}>Mining Views</h1>
      <p style={{ color: '#aaa', marginBottom: 24 }}>
        Synthesized custom views for ore grade trends, equipment utilization, shift reports, and extraction rule management.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 20 }}>
        <OreGradeTrendChart />
        <EquipmentUtilizationHeatmap />
        <ShiftProductionPdf />
        <ExtractionRulesEditor />
      </div>
    </div>
  );
}

export default CustomViewsPage;
