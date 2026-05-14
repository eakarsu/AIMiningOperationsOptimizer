const https = require('https');
const http = require('http');
require('dotenv').config({ path: require('path').resolve(__dirname, '../../../.env') });

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'anthropic/claude-3-5-sonnet-20241022';

// Parse structured JSON from AI response
function parseAIJson(content) {
  try {
    return JSON.parse(content);
  } catch {
    const match = content.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch {}
    }
    // Return as-is wrapped in a content field if JSON parsing fails
    return { content, _parse_error: true };
  }
}

async function callOpenRouter(prompt, systemPrompt = '') {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      model: OPENROUTER_MODEL,
      messages: [
        ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
        { role: 'user', content: prompt }
      ],
      max_tokens: 2000,
      temperature: 0.3
    });

    const options = {
      hostname: 'openrouter.ai',
      path: '/api/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'AI Mining Operations Optimizer'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.error) {
            reject(new Error(parsed.error.message || 'OpenRouter API error'));
            return;
          }
          const content = parsed.choices?.[0]?.message?.content || 'No response generated';
          resolve({
            content,
            parsed: parseAIJson(content),
            model: parsed.model,
            usage: parsed.usage,
            id: parsed.id
          });
        } catch (e) {
          reject(new Error('Failed to parse OpenRouter response'));
        }
      });
    });

    req.on('error', (e) => reject(e));
    req.write(payload);
    req.end();
  });
}

// Ore Grade Prediction
async function predictOreGrade(sample) {
  const prompt = `Analyze this mining ore sample and predict the ore grade quality:
- Sample ID: ${sample.sampleId}
- Location: ${sample.location}
- Zone: ${sample.zone}
- Depth: ${sample.depth}m
- Mineral Type: ${sample.mineralType}
- Current Grade: ${sample.gradePercentage}%
- Tonnage: ${sample.tonnage} tons

Return JSON: { quality_assessment: "High|Medium|Low", grade_percentage: number, processing_recommendation: "string", economic_value_estimate: "string", risk_factors: ["string"], confidence_level: number, extraction_depth: "string", recovery_rate_percent: number }
Only respond with valid JSON, no additional text.`;

  const systemPrompt = 'You are an expert mining geologist AI assistant specializing in ore grade prediction and mineral resource assessment. Always return valid JSON.';
  return callOpenRouter(prompt, systemPrompt);
}

// Drill Pattern Optimization
async function optimizeDrillPattern(pattern) {
  const prompt = `Optimize this blast drill pattern for maximum efficiency and safety:
- Pattern ID: ${pattern.patternId}
- Blast Zone: ${pattern.blastZone}
- Hole Count: ${pattern.holeCount}
- Hole Depth: ${pattern.holeDepth}m
- Hole Diameter: ${pattern.holeDiameter}mm
- Spacing: ${pattern.spacing}m
- Burden: ${pattern.burden}m
- Rock Type: ${pattern.rockType}
- Explosive Type: ${pattern.explosiveType}
- Explosive Amount: ${pattern.explosiveAmount}kg

Return JSON: { efficiency_score: number, optimal_spacing: number, optimal_burden: number, recommended_hole_depth: number, fragmentation_prediction: "string", vibration_risk: "low|medium|high", cost_efficiency_improvement_pct: number, safety_recommendations: ["string"], environmental_notes: "string" }
Only respond with valid JSON, no additional text.`;

  const systemPrompt = 'You are an expert mining blast engineer AI specializing in drill pattern optimization and blast design. Always return valid JSON.';
  return callOpenRouter(prompt, systemPrompt);
}

// Safety Analysis
async function analyzeSafetyIncident(incident) {
  const prompt = `Analyze this mining safety incident and provide comprehensive assessment:
- Incident ID: ${incident.incidentId}
- Type: ${incident.type}
- Severity: ${incident.severity}
- Location: ${incident.location}
- Zone: ${incident.zone}
- Description: ${incident.description}
- Injuries: ${incident.injuriesCount}
- Date: ${incident.date}

Return JSON: { risk_level: "low|medium|high|critical", incident_type_classification: "string", immediate_actions: ["string"], preventive_measures: ["string"], regulatory_compliance_notes: "string", root_cause: "string", training_recommendations: ["string"], resolution_timeline: "string" }
Only respond with valid JSON, no additional text.`;

  const systemPrompt = 'You are an expert mining safety engineer AI specializing in incident analysis, risk assessment, and safety compliance. Always return valid JSON.';
  return callOpenRouter(prompt, systemPrompt);
}

// Equipment Utilization Analysis
async function analyzeEquipment(equipment) {
  const prompt = `Analyze this mining equipment utilization and provide optimization recommendations:
- Equipment ID: ${equipment.equipmentId}
- Name: ${equipment.name}
- Type: ${equipment.type}
- Manufacturer: ${equipment.manufacturer}
- Model: ${equipment.model}
- Status: ${equipment.status}
- Hours Operated: ${equipment.hoursOperated}
- Fuel Consumption: ${equipment.fuelConsumption} L/hr
- Utilization Rate: ${equipment.utilizationRate}%
- Last Maintenance: ${equipment.lastMaintenance}
- Maintenance Due: ${equipment.maintenanceDue}

Return JSON: { health_score: number, failure_risk: "low|medium|high", maintenance_priority: "string", recommended_actions: ["string"], estimated_downtime_days: number, remaining_useful_life: "string", fuel_efficiency_rating: "string", utilization_improvement: "string" }
Only respond with valid JSON, no additional text.`;

  const systemPrompt = 'You are an expert mining equipment engineer AI specializing in fleet management, predictive maintenance, and equipment utilization optimization. Always return valid JSON.';
  return callOpenRouter(prompt, systemPrompt);
}

// Environmental Compliance Analysis
async function assessEnvironmentalCompliance(report) {
  const prompt = `Assess this environmental compliance monitoring data:
- Report ID: ${report.reportId}
- Category: ${report.category}
- Parameter: ${report.parameter}
- Measured Value: ${report.measuredValue} ${report.unit}
- Regulatory Limit: ${report.regulatoryLimit} ${report.unit}
- Location: ${report.location}
- Monitoring Date: ${report.monitoringDate}
- Current Status: ${report.complianceStatus}

Return JSON: { compliance_risk_score: number, violation_probability: "low|medium|high", corrective_actions: ["string"], environmental_impact: "string", monitoring_frequency: "string", mitigation_strategies: ["string"], reporting_requirements: "string", trend_projection: "string" }
Only respond with valid JSON, no additional text.`;

  const systemPrompt = 'You are an expert environmental compliance AI specializing in mining environmental monitoring, regulatory compliance, and environmental impact assessment. Always return valid JSON.';
  return callOpenRouter(prompt, systemPrompt);
}

// Production Analysis
async function analyzeProduction(log) {
  const prompt = `Analyze this mining production log and provide optimization insights:
- Log ID: ${log.logId}
- Shift: ${log.shift}
- Date: ${log.date}
- Zone: ${log.zone}
- Material Type: ${log.materialType}
- Tonnage Mined: ${log.tonnageMined} tons
- Tonnage Processed: ${log.tonnageProcessed} tons
- Recovery Rate: ${log.recoveryRate}%
- Downtime: ${log.downtime} hours
- Operator Count: ${log.operatorCount}
- Supervisor: ${log.supervisor}

Return JSON: { efficiency_score: number, throughput_recommendations: ["string"], recovery_improvement: "string", downtime_cause: "string", staffing_optimization: "string", cost_per_ton_assessment: "string", bottlenecks: ["string"], shift_performance_rating: "Excellent|Good|Average|Poor" }
Only respond with valid JSON, no additional text.`;

  const systemPrompt = 'You are an expert mining production engineer AI specializing in production optimization, throughput analysis, and operational efficiency. Always return valid JSON.';
  return callOpenRouter(prompt, systemPrompt);
}

// Workforce Analysis
async function analyzeWorkforce(worker) {
  const prompt = `Analyze this mining workforce member and provide management recommendations:
- Worker ID: ${worker.workerId}
- Name: ${worker.name}
- Role: ${worker.role}
- Department: ${worker.department}
- Shift: ${worker.shift}
- Certification: ${worker.certification}
- Certification Expiry: ${worker.certExpiry}
- Years Experience: ${worker.yearsExperience}
- Safety Score: ${worker.safetyScore}/100
- Hours This Month: ${worker.hoursThisMonth}
- Status: ${worker.status}

Return JSON: { performance_rating: "Excellent|Good|Average|Poor", fatigue_risk: "low|medium|high", fatigue_score: number, certification_urgency: "none|upcoming|urgent|expired", training_recommendations: ["string"], shift_recommendation: "string", overtime_risk: "low|medium|high", safety_improvement_areas: ["string"] }
Only respond with valid JSON, no additional text.`;

  const systemPrompt = 'You are an expert mining workforce management AI specializing in human resources, safety compliance, fatigue management, and workforce optimization in mining operations. Always return valid JSON.';
  return callOpenRouter(prompt, systemPrompt);
}

// Cost Analysis
async function analyzeCost(cost) {
  const prompt = `Analyze this mining operation cost data and provide financial optimization insights:
- Cost ID: ${cost.costId}
- Category: ${cost.category}
- Subcategory: ${cost.subcategory}
- Description: ${cost.description}
- Actual Amount: $${cost.amount?.toLocaleString()}
- Budgeted Amount: $${cost.budgeted?.toLocaleString()}
- Variance: $${cost.variance?.toLocaleString()}
- Period: ${cost.period}
- Zone: ${cost.zone}
- Cost Per Ton: $${cost.costPerTon}

Return JSON: { budget_adherence_score: number, overrun_risk: "low|medium|high", variance_cause: "string", cost_reduction_opportunities: ["string"], optimization_recommendations: ["string"], next_period_forecast: "string", roi_improvement: "string", industry_benchmark_comparison: "string" }
Only respond with valid JSON, no additional text.`;

  const systemPrompt = 'You are an expert mining financial analyst AI specializing in cost optimization, budget management, and financial forecasting for mining operations. Always return valid JSON.';
  return callOpenRouter(prompt, systemPrompt);
}

// Geology Interpretation
async function interpretGeology(survey) {
  const prompt = `Interpret this geological survey data for mining planning:
- Survey ID: ${survey.surveyId}
- Survey Type: ${survey.surveyType}
- Location: ${survey.location}
- Zone: ${survey.zone}
- Rock Formation: ${survey.rockFormation}
- Dominant Mineral: ${survey.dominantMineral}
- Structural Feature: ${survey.structuralFeature}
- Strike Angle: ${survey.strikeAngle}°
- Dip Angle: ${survey.dipAngle}°
- Depth Range: ${survey.depthRange}
- Geologist: ${survey.geologist}
- Confidence: ${survey.confidence}%
- Notes: ${survey.notes || 'None'}

Return JSON: { mineralization_potential: "low|medium|high|very_high", structural_stability: "stable|moderate|unstable", exploration_targets: ["string"], mining_method: "string", ground_support_requirements: "string", water_ingress_risk: "low|medium|high", geotechnical_hazards: ["string"], resource_confidence: number }
Only respond with valid JSON, no additional text.`;

  const systemPrompt = 'You are an expert mining geologist AI specializing in geological interpretation, structural analysis, resource estimation, and mine planning. Always return valid JSON.';
  return callOpenRouter(prompt, systemPrompt);
}

// Hauling Optimization
async function optimizeHauling(trip) {
  const prompt = `Optimize this mining hauling operation and provide logistics recommendations:
- Trip ID: ${trip.tripId}
- Truck ID: ${trip.truckId}
- Driver: ${trip.driver}
- Origin: ${trip.origin}
- Destination: ${trip.destination}
- Material Type: ${trip.materialType}
- Load Weight: ${trip.loadWeight} tons
- Distance: ${trip.distance} km
- Trip Duration: ${trip.tripDuration} minutes
- Fuel Used: ${trip.fuelUsed} liters
- Date: ${trip.date}
- Shift: ${trip.shift}

Return JSON: { route_efficiency_score: number, fuel_efficiency_l_per_ton_km: number, optimal_load_weight: number, route_suggestions: ["string"], cycle_time_reduction: "string", fleet_dispatch_recommendation: "string", driver_performance: "Excellent|Good|Average|Poor", cost_per_ton_km: number }
Only respond with valid JSON, no additional text.`;

  const systemPrompt = 'You are an expert mining logistics AI specializing in hauling optimization, fleet dispatch, route planning, and transportation efficiency in mining operations. Always return valid JSON.';
  return callOpenRouter(prompt, systemPrompt);
}

// Cross-domain correlation analysis
async function analyzeCorrelations(data) {
  const prompt = `Find correlations in this mining operations data and provide actionable insights.

Data:
- Average Ore Grade: ${data.avgOreGrade}%
- Equipment Downtime Count: ${data.equipmentDowntime} records
- Safety Incidents (recent): ${data.safetyIncidents}
- Average Workforce Fatigue Hours: ${data.avgFatigueHours}h this month

Return JSON: {
  "correlations": [
    { "metric_a": "string", "metric_b": "string", "correlation": "positive|negative|none", "strength": "strong|moderate|weak", "insight": "string" }
  ],
  "top_production_risk": "string",
  "recommendations": ["string"]
}
Only respond with valid JSON, no additional text.`;

  const systemPrompt = 'You are an expert mining operations analyst AI. Identify data correlations and operational risks. Always return valid JSON.';
  return callOpenRouter(prompt, systemPrompt);
}

module.exports = {
  predictOreGrade,
  optimizeDrillPattern,
  analyzeSafetyIncident,
  analyzeEquipment,
  assessEnvironmentalCompliance,
  analyzeProduction,
  analyzeWorkforce,
  analyzeCost,
  interpretGeology,
  optimizeHauling,
  analyzeCorrelations,
  parseAIJson
};
