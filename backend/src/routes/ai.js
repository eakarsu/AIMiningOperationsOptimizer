const express = require('express');
const router = express.Router();
// Apply pass 5: fix prior broken import — auth middleware module exports
// {authenticateToken, generateToken}, so we must destructure to use it as a
// function in router.post(...). Existing ai.js file used `auth = require(...)`
// which made `auth` an object and caused Express "callback function" errors.
const { authenticateToken: auth } = require('../middleware/auth');
const aiService = require('../services/aiService');
const { ProductionLog, Equipment, SafetyIncident, EnvironmentalCompliance, CostAnalysis } = require('../models');

// POST /api/ai/production-forecast — reuse drill-pattern analyzer + log context
router.post('/production-forecast', auth, async (req, res) => {
  try {
    const { drillPattern } = req.body;
    let recentLogs = [];
    try { recentLogs = await ProductionLog.findAll({ limit: 30, order: [['createdAt', 'DESC']] }); } catch (e) {}

    const ctx = {
      ...(drillPattern || {}),
      recentLogsSample: recentLogs.slice(0, 10).map(l => l.toJSON ? l.toJSON() : l),
    };
    const raw = await aiService.optimizeDrillPattern(ctx);
    const structured = aiService.parseAIJson(raw) || null;
    res.json({ raw, structured });
  } catch (error) {
    console.error('Production forecast error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/ai/equipment-failure-predict — predictive maintenance
router.post('/equipment-failure-predict', auth, async (req, res) => {
  try {
    const { equipmentId } = req.body;
    let equipment = null;
    if (equipmentId) {
      equipment = await Equipment.findByPk(equipmentId);
      if (!equipment) return res.status(404).json({ error: 'Equipment not found' });
    } else {
      const all = await Equipment.findAll({ limit: 10 });
      equipment = all[0];
    }
    const raw = await aiService.analyzeEquipment(equipment ? (equipment.toJSON ? equipment.toJSON() : equipment) : {});
    const structured = aiService.parseAIJson(raw);
    res.json({ raw, structured, equipment });
  } catch (error) {
    console.error('Equipment failure predict error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/ai/safety-risk-assess — identify hazard patterns across recent incidents
router.post('/safety-risk-assess', auth, async (req, res) => {
  try {
    let incidents = [];
    try { incidents = await SafetyIncident.findAll({ limit: 30, order: [['createdAt', 'DESC']] }); } catch (e) {}
    const sample = incidents[0] || { description: 'no recent incidents', severity: 'unknown' };
    // Reuse analyzeSafetyIncident on the most recent incident; embed cluster context.
    sample.recentClusterCount = incidents.length;
    sample.clusterContext = incidents.slice(0, 10).map(i => i.toJSON ? i.toJSON() : i);
    const raw = await aiService.analyzeSafetyIncident(sample);
    const structured = aiService.parseAIJson(raw);
    res.json({ raw, structured, recent_incident_count: incidents.length });
  } catch (error) {
    console.error('Safety risk assess error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/ai/cost-optimize — wrap analyzeCost with portfolio context
router.post('/cost-optimize', auth, async (req, res) => {
  try {
    if (!process.env.OPENROUTER_API_KEY) {
      return res.status(503).json({ error: 'AI service unavailable: OPENROUTER_API_KEY not configured' });
    }
    const { cost } = req.body;
    let portfolio = [];
    try { portfolio = await CostAnalysis.findAll({ limit: 30, order: [['createdAt', 'DESC']] }); } catch (e) {}
    const sample = cost || (portfolio[0] ? (portfolio[0].toJSON ? portfolio[0].toJSON() : portfolio[0]) : { category: 'overall', amount: 0 });
    sample.portfolioSample = portfolio.slice(0, 10).map(p => p.toJSON ? p.toJSON() : p);
    sample.portfolioCount = portfolio.length;
    const raw = await aiService.analyzeCost(sample);
    const structured = aiService.parseAIJson(raw);
    res.json({ raw, structured, portfolio_count: portfolio.length });
  } catch (error) {
    console.error('Cost optimize error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/ai/environmental-risk — wrap assessEnvironmentalCompliance with cluster
router.post('/environmental-risk', auth, async (req, res) => {
  try {
    if (!process.env.OPENROUTER_API_KEY) {
      return res.status(503).json({ error: 'AI service unavailable: OPENROUTER_API_KEY not configured' });
    }
    const { report } = req.body;
    let recent = [];
    try { recent = await EnvironmentalCompliance.findAll({ limit: 20, order: [['createdAt', 'DESC']] }); } catch (e) {}
    const sample = report || (recent[0] ? (recent[0].toJSON ? recent[0].toJSON() : recent[0]) : { area: 'overall', findings: 'no recent reports' });
    sample.recentClusterCount = recent.length;
    sample.clusterContext = recent.slice(0, 10).map(r => r.toJSON ? r.toJSON() : r);
    const raw = await aiService.assessEnvironmentalCompliance(sample);
    const structured = aiService.parseAIJson(raw);
    res.json({ raw, structured, recent_report_count: recent.length });
  } catch (error) {
    console.error('Environmental risk error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/ai/geology-interpret — wrap interpretGeology
router.post('/geology-interpret', auth, async (req, res) => {
  try {
    if (!process.env.OPENROUTER_API_KEY) {
      return res.status(503).json({ error: 'AI service unavailable: OPENROUTER_API_KEY not configured' });
    }
    const { survey } = req.body;
    if (!survey) return res.status(400).json({ error: 'survey is required (e.g., assay/borehole/lithology summary)' });
    const raw = await aiService.interpretGeology(survey);
    const structured = aiService.parseAIJson(raw);
    res.json({ raw, structured });
  } catch (error) {
    console.error('Geology interpret error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Apply pass 5 — remaining backlog (additive endpoints)
// Documented env vars:
//   OPENROUTER_API_KEY    — AI generation
//   GPS_TELEMATICS_API_KEY, GPS_TELEMATICS_BASE_URL — GPS / fleet tracking
//   DRONE_SURVEY_API_KEY, DRONE_SURVEY_BASE_URL    — drone imagery / lab assay
//   MQTT_BROKER_URL                                — environmental sensor stream
// ─────────────────────────────────────────────────────────────────────────────

// PRODUCT-DECISION: Mine-to-mill coordination. We model the downstream
// processor as a JSON description rather than tying to a specific external
// system; the LLM proposes coordination actions.
router.post('/mine-to-mill', auth, async (req, res) => {
  try {
    if (!process.env.OPENROUTER_API_KEY) {
      return res.status(503).json({ error: 'AI service unavailable: OPENROUTER_API_KEY not configured' });
    }
    const { upstream, downstream, constraints } = req.body || {};
    if (!upstream && !downstream) {
      return res.status(400).json({ error: 'upstream or downstream context is required' });
    }
    let recentLogs = [];
    try { recentLogs = await ProductionLog.findAll({ limit: 20, order: [['createdAt', 'DESC']] }); } catch (e) {}
    const ctx = {
      upstream: upstream || { recentProductionSample: recentLogs.slice(0, 10).map(l => l.toJSON ? l.toJSON() : l) },
      downstream: downstream || { processor: 'unspecified mineral processor', target_throughput_tph: null },
      constraints: constraints || {},
    };
    // Reuse the cost analyzer prompt path — it returns coordination-style JSON well.
    const raw = await aiService.analyzeCost({
      category: 'mine_to_mill_coordination',
      payload: ctx,
      prompt_hint: 'Optimize material flow from mine to mill: scheduling, blending, throughput, downtime.',
    });
    const structured = aiService.parseAIJson(raw);
    res.json({ raw, structured });
  } catch (error) {
    console.error('Mine-to-mill error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// PRODUCT-DECISION: Streaming safety anomaly detection (synchronous fallback).
// Default: scan the last 30 incidents for anomaly patterns rather than using a
// real streaming queue (which would require infra outside the scope of this pass).
router.post('/safety-anomaly-detect', auth, async (req, res) => {
  try {
    if (!process.env.OPENROUTER_API_KEY) {
      return res.status(503).json({ error: 'AI service unavailable: OPENROUTER_API_KEY not configured' });
    }
    const { window_size } = req.body || {};
    const limit = Math.max(5, Math.min(parseInt(window_size, 10) || 30, 100));
    let incidents = [];
    try { incidents = await SafetyIncident.findAll({ limit, order: [['createdAt', 'DESC']] }); } catch (e) {}
    const sample = incidents[0] || { description: 'no recent incidents', severity: 'unknown' };
    sample.windowSize = limit;
    sample.incidentSeries = incidents.map(i => i.toJSON ? i.toJSON() : i);
    sample.detectMode = 'anomaly_cluster';
    const raw = await aiService.analyzeSafetyIncident(sample);
    const structured = aiService.parseAIJson(raw);
    res.json({ raw, structured, window_size: limit, incident_count: incidents.length });
  } catch (error) {
    console.error('Safety anomaly detect error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// PRODUCT-DECISION: Regulatory incident auto-report. Default jurisdiction is
// "MSHA" (US Mine Safety and Health Admin) when not specified. Output is a
// drafted notice — actual filing requires manual submission.
router.post('/regulatory-incident-report', auth, async (req, res) => {
  try {
    if (!process.env.OPENROUTER_API_KEY) {
      return res.status(503).json({ error: 'AI service unavailable: OPENROUTER_API_KEY not configured' });
    }
    const { incident_id, jurisdiction } = req.body || {};
    let incident = null;
    if (incident_id) {
      try { incident = await SafetyIncident.findByPk(incident_id); } catch (e) {}
    }
    if (!incident) {
      try {
        const all = await SafetyIncident.findAll({ limit: 1, order: [['createdAt', 'DESC']] });
        incident = all[0] || null;
      } catch (e) {}
    }
    if (!incident) return res.status(404).json({ error: 'No incident found to report' });
    const payload = incident.toJSON ? incident.toJSON() : incident;
    payload.targetJurisdiction = jurisdiction || 'MSHA';
    payload.outputFormat = 'regulatory_notice_draft';
    const raw = await aiService.analyzeSafetyIncident(payload);
    const structured = aiService.parseAIJson(raw);
    res.json({ raw, structured, jurisdiction: payload.targetJurisdiction, incident_id: payload.id });
  } catch (error) {
    console.error('Regulatory incident report error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// NEEDS-CREDS: GPS / fleet telematics integration stub.
router.post('/gps-telematics', auth, async (req, res) => {
  const apiKey = process.env.GPS_TELEMATICS_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: 'GPS telematics unavailable', missing: 'GPS_TELEMATICS_API_KEY' });
  }
  const { equipment_id, mode } = req.body || {};
  return res.json({
    status: 'configured',
    base_url: process.env.GPS_TELEMATICS_BASE_URL || 'https://api.example-telematics.com',
    equipment_id: equipment_id || null,
    mode: mode || 'snapshot',
    note: 'Telematics credentials accepted; live polling wiring deferred.',
  });
});

// NEEDS-CREDS: Drone survey / lab assay ingest stub.
router.post('/drone-survey-ingest', auth, async (req, res) => {
  const apiKey = process.env.DRONE_SURVEY_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: 'Drone survey ingest unavailable', missing: 'DRONE_SURVEY_API_KEY' });
  }
  const { survey_id, mode } = req.body || {};
  return res.json({
    status: 'configured',
    base_url: process.env.DRONE_SURVEY_BASE_URL || 'https://api.example-drone-survey.com',
    survey_id: survey_id || null,
    mode: mode || 'imagery',
    note: 'Drone-survey credentials accepted; live ingest deferred.',
  });
});

module.exports = router;
