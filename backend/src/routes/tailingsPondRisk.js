const express = require('express');
const router = express.Router();

router.post('/forecast', (req, res) => {
  const { pond = {}, inspections = [], rainfallMm = 0, productionTons = 0 } = req.body || {};
  const freeboard = Number(pond.freeboardMeters || 0);
  const seepage = Number(pond.seepageLitersHour || 0);
  const oldestInspectionDays = Math.max(...(Array.isArray(inspections) && inspections.length ? inspections.map((i) => Number(i.daysAgo || 0)) : [90]));
  const score = Math.min(100,
    (freeboard < 1.5 ? 30 : freeboard < 2.5 ? 15 : 0) +
    Math.min(25, seepage / 20) +
    Math.min(20, Number(rainfallMm) / 5) +
    Math.min(15, Number(productionTons) / 100000) +
    Math.min(10, oldestInspectionDays / 10)
  );
  res.json({
    feature: 'Tailings Pond Risk',
    score: Math.round(score),
    band: score >= 70 ? 'critical' : score >= 45 ? 'elevated' : 'controlled',
    controls: [
      freeboard < 2.5 ? 'Increase freeboard monitoring frequency.' : 'Maintain current freeboard checks.',
      seepage > 200 ? 'Dispatch geotechnical inspection for seepage trend.' : 'Keep seepage on routine watch.',
      Number(rainfallMm) > 100 ? 'Prepare stormwater diversion and emergency pumping plan.' : 'No rainfall escalation required.',
    ],
  });
});

module.exports = router;
