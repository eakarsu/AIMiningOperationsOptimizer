/**
 * Ore Yield Prediction / Forecast Service
 *
 * Uses recent ore grade samples and drill pattern data to ask the AI for a
 * 30-day ore yield forecast per zone. Falls back to a statistical estimate
 * (weighted moving average) if no AI key is configured.
 */

const https = require('https');
require('dotenv').config({ path: require('path').resolve(__dirname, '../../../.env') });

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'anthropic/claude-haiku-4.5';

// Re-exported so analytics.js can import it for the live AI call
async function callOpenRouter(prompt, systemPrompt = '') {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      model: OPENROUTER_MODEL,
      messages: [
        ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
        { role: 'user', content: prompt },
      ],
      max_tokens: 3000,
      temperature: 0.3,
    });

    const options = {
      hostname: 'openrouter.ai',
      path: '/api/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'AI Mining Operations Optimizer',
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.error) { reject(new Error(parsed.error.message || 'OpenRouter error')); return; }
          resolve(parsed.choices?.[0]?.message?.content || '');
        } catch (e) { reject(new Error('Failed to parse OpenRouter response')); }
      });
    });
    req.on('error', e => reject(e));
    req.write(payload);
    req.end();
  });
}

function isAIAvailable() {
  return !!OPENROUTER_API_KEY && !OPENROUTER_API_KEY.includes('your-');
}

// ---- Statistical fallback ----

function statisticalForecast(oreGrades, drillPatterns) {
  // Group samples by zone and compute a simple weighted moving average
  const zoneMap = {};
  for (const s of oreGrades) {
    if (!zoneMap[s.zone]) zoneMap[s.zone] = [];
    zoneMap[s.zone].push({
      grade: s.gradePercentage,
      tonnage: s.tonnage,
      date: new Date(s.createdAt || Date.now()),
    });
  }

  const zoneForecasts = Object.entries(zoneMap).map(([zone, samples]) => {
    // Weight recent samples more (exponential decay, λ=0.1/day)
    const now = Date.now();
    let weightedGrade = 0, totalWeight = 0, totalTonnage = 0;
    for (const s of samples) {
      const ageDays = (now - s.date.getTime()) / 86400000;
      const w = Math.exp(-0.1 * ageDays);
      weightedGrade += s.grade * w;
      totalWeight += w;
      totalTonnage += s.tonnage;
    }
    const avgGrade = totalWeight > 0 ? weightedGrade / totalWeight : 0;
    const avgTonnage = samples.length > 0 ? totalTonnage / samples.length : 0;

    // Estimated monthly yield (grade% × average daily tonnage × 30)
    const dailyTonnage = avgTonnage;
    const monthlyYield = avgGrade / 100 * dailyTonnage * 30;

    return {
      zone,
      predictedGradePercentage: parseFloat(avgGrade.toFixed(3)),
      predictedMonthlyTonnage: parseFloat((dailyTonnage * 30).toFixed(1)),
      predictedMonthlyYieldTons: parseFloat(monthlyYield.toFixed(1)),
      confidence: Math.min(90, 50 + samples.length * 5),
      sampleCount: samples.length,
      method: 'statistical_wma',
    };
  });

  return zoneForecasts;
}

// ---- AI forecast ----

async function aiForecast(oreGrades, drillPatterns) {
  const systemPrompt = `You are an expert mining geologist and data analyst AI specializing in ore yield prediction and resource estimation. You analyze drill patterns and ore grade samples to forecast future production.`;

  // Summarize data for the prompt
  const zoneStats = {};
  for (const s of oreGrades) {
    if (!zoneStats[s.zone]) zoneStats[s.zone] = { grades: [], tonnages: [], mineralTypes: new Set() };
    zoneStats[s.zone].grades.push(s.gradePercentage);
    zoneStats[s.zone].tonnages.push(s.tonnage);
    zoneStats[s.zone].mineralTypes.add(s.mineralType);
  }

  const zoneSummary = Object.entries(zoneStats).map(([zone, d]) => {
    const avgGrade = d.grades.reduce((a, b) => a + b, 0) / d.grades.length;
    const avgTonnage = d.tonnages.reduce((a, b) => a + b, 0) / d.tonnages.length;
    return `Zone ${zone}: avg grade ${avgGrade.toFixed(2)}%, avg sample tonnage ${avgTonnage.toFixed(0)}t, minerals: ${[...d.mineralTypes].join('/')}`;
  }).join('\n');

  const patternSummary = drillPatterns.slice(0, 10).map(p =>
    `Zone ${p.blastZone}: ${p.holeCount} holes at ${p.holeDepth}m depth, ${p.rockType} rock`
  ).join('\n');

  const prompt = `Based on the following recent ore grade data and drill patterns, forecast ore yield for the next 30 days per zone.

ORE GRADE DATA (last 30 days):
${zoneSummary || 'No data available'}

DRILL PATTERNS (active):
${patternSummary || 'No drill patterns available'}

Return ONLY valid JSON in this exact format (no markdown, no explanation):
{
  "forecasts": [
    {
      "zone": "zone_name",
      "predictedGradePercentage": 2.35,
      "predictedMonthlyTonnage": 15000,
      "predictedMonthlyYieldTons": 352.5,
      "confidence": 78,
      "riskFactors": ["factor 1", "factor 2"],
      "recommendations": ["action 1", "action 2"],
      "trend": "stable|increasing|decreasing"
    }
  ],
  "overallOutlook": "brief one-sentence outlook",
  "keyRisks": ["risk 1", "risk 2"],
  "generatedAt": "${new Date().toISOString()}"
}`;

  const raw = await callOpenRouter(prompt, systemPrompt);

  // Strip markdown fences if present
  let cleaned = raw.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');
  }
  return JSON.parse(cleaned);
}

// ---- Main export ----

async function generateYieldForecast(oreGrades, drillPatterns) {
  if (!isAIAvailable()) {
    const stats = statisticalForecast(oreGrades, drillPatterns);
    return {
      forecasts: stats,
      overallOutlook: 'Statistical forecast based on weighted moving average of recent ore grade samples.',
      keyRisks: ['No AI key configured — forecast is purely statistical'],
      generatedAt: new Date().toISOString(),
      method: 'statistical',
    };
  }

  try {
    const result = await aiForecast(oreGrades, drillPatterns);
    result.method = 'ai';
    return result;
  } catch (err) {
    console.error('[yield forecast] AI call failed, falling back to statistical:', err.message);
    const stats = statisticalForecast(oreGrades, drillPatterns);
    return {
      forecasts: stats,
      overallOutlook: 'AI unavailable — statistical forecast based on weighted moving average.',
      keyRisks: ['AI forecast failed — using statistical fallback'],
      generatedAt: new Date().toISOString(),
      method: 'statistical_fallback',
    };
  }
}

module.exports = { generateYieldForecast, callOpenRouter };
