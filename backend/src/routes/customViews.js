// Custom Views routes — synthesized endpoints for Mining Views
const express = require('express');
const router = express.Router();

// In-memory rules store for extraction rules CRUD (NON-VIZ)
let extractionRules = [
  { id: 1, name: 'High Grade Ore Threshold', metric: 'grade_pct', operator: '>=', value: 4.5, action: 'priority_haul', enabled: true, createdAt: new Date().toISOString() },
  { id: 2, name: 'Low Yield Alert', metric: 'yield_tonnes', operator: '<', value: 1200, action: 'notify_supervisor', enabled: true, createdAt: new Date().toISOString() },
  { id: 3, name: 'Equipment Downtime Limit', metric: 'downtime_hrs', operator: '>', value: 6, action: 'schedule_maintenance', enabled: true, createdAt: new Date().toISOString() },
  { id: 4, name: 'Blast Spacing Compliance', metric: 'spacing_m', operator: '<', value: 3.0, action: 'reject_plan', enabled: false, createdAt: new Date().toISOString() },
];
let nextRuleId = 5;

function seedRand(seed) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

// VIZ 1: Ore grade trend chart (time-series by ore type)
router.get('/ore-grade-trend', (req, res) => {
  const days = Math.min(60, parseInt(req.query.days) || 30);
  const rnd = seedRand(42);
  const oreTypes = ['Copper', 'Iron', 'Gold', 'Zinc'];
  const today = new Date();
  const series = oreTypes.map((type, i) => {
    const base = [2.4, 58, 3.1, 5.2][i];
    const points = [];
    for (let d = days - 1; d >= 0; d--) {
      const date = new Date(today);
      date.setDate(date.getDate() - d);
      const noise = (rnd() - 0.5) * base * 0.18;
      const trend = Math.sin((days - d) / 6) * base * 0.08;
      points.push({
        date: date.toISOString().slice(0, 10),
        grade: +(base + noise + trend).toFixed(3),
      });
    }
    return { oreType: type, unit: i === 1 ? '% Fe' : i === 2 ? 'g/t' : '% Cu/Zn', points };
  });
  res.json({
    title: 'Ore Grade Trend (Last ' + days + ' Days)',
    generatedAt: new Date().toISOString(),
    series,
  });
});

// VIZ 2: Equipment utilization heatmap (equipment x hour-of-day)
router.get('/equipment-utilization-heatmap', (req, res) => {
  const rnd = seedRand(117);
  const equipment = [
    'Excavator EX-101', 'Excavator EX-102', 'Haul Truck HT-201', 'Haul Truck HT-202',
    'Loader LD-301', 'Drill DR-401', 'Crusher CR-501', 'Conveyor CV-601',
  ];
  const hours = Array.from({ length: 24 }, (_, h) => h);
  const matrix = equipment.map((name) => {
    const row = hours.map((h) => {
      const shiftBoost = (h >= 6 && h <= 18) ? 0.25 : -0.10;
      const util = Math.max(0, Math.min(1, 0.55 + shiftBoost + (rnd() - 0.5) * 0.30));
      return { hour: h, utilization: +util.toFixed(2) };
    });
    return { equipment: name, hourly: row };
  });
  res.json({
    title: 'Equipment Utilization Heatmap (24-Hour)',
    generatedAt: new Date().toISOString(),
    xAxis: hours,
    matrix,
  });
});

// NON-VIZ 1: Shift production PDF (returns a PDF-like text/plain doc)
router.get('/shift-production-pdf', (req, res) => {
  const shift = (req.query.shift || 'day').toLowerCase();
  const date = req.query.date || new Date().toISOString().slice(0, 10);
  const rnd = seedRand(date.split('-').join('') | 0 + (shift === 'day' ? 1 : 2));
  const sites = ['Pit A', 'Pit B', 'Pit C', 'Underground Section 4'];
  const lines = [];
  lines.push('%PDF-1.4 (synthesized text report)');
  lines.push('================================================');
  lines.push('  SHIFT PRODUCTION REPORT');
  lines.push('  Date:  ' + date);
  lines.push('  Shift: ' + shift.toUpperCase());
  lines.push('================================================');
  lines.push('');
  lines.push('  Site                | Tonnes  | Grade%  | Trucks');
  lines.push('  --------------------+---------+---------+-------');
  let totalT = 0, totalTr = 0;
  sites.forEach((s) => {
    const t = Math.round(900 + rnd() * 1800);
    const g = +(1.8 + rnd() * 3.5).toFixed(2);
    const tr = Math.round(8 + rnd() * 22);
    totalT += t; totalTr += tr;
    lines.push('  ' + s.padEnd(19) + ' | ' + String(t).padEnd(7) + ' | ' + String(g).padEnd(7) + ' | ' + tr);
  });
  lines.push('  --------------------+---------+---------+-------');
  lines.push('  TOTAL               | ' + String(totalT).padEnd(7) + ' |   --    | ' + totalTr);
  lines.push('');
  lines.push('  Crew on duty: ' + Math.round(18 + rnd() * 12));
  lines.push('  Safety incidents: ' + Math.round(rnd() * 2));
  lines.push('  Equipment uptime: ' + (88 + Math.round(rnd() * 11)) + '%');
  lines.push('');
  lines.push('  Signed: Shift Supervisor');
  lines.push('%%EOF');
  const body = lines.join('\n');
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'inline; filename="shift-' + date + '-' + shift + '.pdf"');
  res.send(body);
});

// NON-VIZ 2: Extraction rules editor (CRUD)
router.get('/extraction-rules', (req, res) => {
  res.json({ rules: extractionRules, total: extractionRules.length });
});

router.post('/extraction-rules', (req, res) => {
  const { name, metric, operator, value, action, enabled } = req.body || {};
  if (!name || !metric || !operator) {
    return res.status(400).json({ error: 'name, metric, operator are required' });
  }
  const rule = {
    id: nextRuleId++,
    name, metric, operator,
    value: value ?? 0,
    action: action || 'notify',
    enabled: enabled !== false,
    createdAt: new Date().toISOString(),
  };
  extractionRules.push(rule);
  res.status(201).json(rule);
});

router.put('/extraction-rules/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const idx = extractionRules.findIndex((r) => r.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  extractionRules[idx] = { ...extractionRules[idx], ...req.body, id };
  res.json(extractionRules[idx]);
});

router.delete('/extraction-rules/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const before = extractionRules.length;
  extractionRules = extractionRules.filter((r) => r.id !== id);
  if (extractionRules.length === before) return res.status(404).json({ error: 'Not found' });
  res.json({ ok: true, id });
});

module.exports = router;
