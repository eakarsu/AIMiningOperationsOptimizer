const https = require('https');
const http = require('http');
require('dotenv').config({ path: require('path').resolve(__dirname, '../../../.env') });

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'anthropic/claude-haiku-4.5';

async function callOpenRouter(prompt, systemPrompt = '') {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      model: OPENROUTER_MODEL,
      messages: [
        ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
        { role: 'user', content: prompt }
      ],
      max_tokens: 2000,
      temperature: 0.7
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

Provide a detailed analysis including:
1. Grade quality assessment (High/Medium/Low)
2. Predicted optimal extraction depth
3. Estimated recovery rate percentage
4. Economic viability score (1-10)
5. Recommendations for extraction method
6. Risk factors
7. Confidence level of prediction`;

  const systemPrompt = 'You are an expert mining geologist AI assistant specializing in ore grade prediction and mineral resource assessment.';
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

Provide optimization recommendations:
1. Optimal spacing and burden ratio
2. Recommended hole depth adjustment
3. Explosive charge optimization
4. Fragmentation prediction
5. Vibration risk assessment
6. Cost efficiency improvement percentage
7. Safety recommendations
8. Environmental impact minimization`;

  const systemPrompt = 'You are an expert mining blast engineer AI specializing in drill pattern optimization and blast design.';
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

Provide detailed analysis:
1. Root cause analysis
2. Risk level assessment (Critical/High/Medium/Low)
3. Similar incident pattern recognition
4. Preventive measures recommended
5. Required safety protocol updates
6. Training recommendations
7. Equipment inspection requirements
8. Estimated resolution timeline`;

  const systemPrompt = 'You are an expert mining safety engineer AI specializing in incident analysis, risk assessment, and safety compliance.';
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

Provide comprehensive analysis:
1. Equipment health score (1-100)
2. Predicted remaining useful life
3. Maintenance priority level
4. Fuel efficiency optimization suggestions
5. Utilization improvement recommendations
6. Replacement vs repair cost analysis
7. Optimal operating schedule
8. Downtime reduction strategies`;

  const systemPrompt = 'You are an expert mining equipment engineer AI specializing in fleet management, predictive maintenance, and equipment utilization optimization.';
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

Provide comprehensive assessment:
1. Compliance risk score (1-10)
2. Trend analysis and projection
3. Regulatory violation probability
4. Recommended corrective actions
5. Environmental impact assessment
6. Monitoring frequency recommendation
7. Mitigation strategies
8. Reporting requirements`;

  const systemPrompt = 'You are an expert environmental compliance AI specializing in mining environmental monitoring, regulatory compliance, and environmental impact assessment.';
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

Provide production analysis:
1. Production efficiency score (1-100)
2. Throughput optimization recommendations
3. Recovery rate improvement strategies
4. Downtime root cause analysis
5. Staffing optimization suggestions
6. Cost per ton analysis
7. Shift performance comparison insights
8. Bottleneck identification`;

  const systemPrompt = 'You are an expert mining production engineer AI specializing in production optimization, throughput analysis, and operational efficiency.';
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

Provide comprehensive workforce analysis:
1. Worker performance assessment
2. Fatigue risk level based on hours worked
3. Certification renewal urgency
4. Training recommendations
5. Career development suggestions
6. Safety improvement areas
7. Optimal shift assignment recommendation
8. Overtime risk assessment`;

  const systemPrompt = 'You are an expert mining workforce management AI specializing in human resources, safety compliance, fatigue management, and workforce optimization in mining operations.';
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

Provide comprehensive cost analysis:
1. Budget adherence score (1-10)
2. Cost reduction opportunities
3. Variance root cause analysis
4. Benchmarking against industry standards
5. Cost optimization recommendations
6. ROI improvement strategies
7. Forecasting for next period
8. Risk of budget overrun assessment`;

  const systemPrompt = 'You are an expert mining financial analyst AI specializing in cost optimization, budget management, and financial forecasting for mining operations.';
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

Provide geological interpretation:
1. Mineralization potential assessment
2. Structural stability analysis
3. Recommended exploration targets
4. Mining method suitability
5. Ground support requirements
6. Water ingress risk
7. Geotechnical hazard assessment
8. Resource estimation confidence level`;

  const systemPrompt = 'You are an expert mining geologist AI specializing in geological interpretation, structural analysis, resource estimation, and mine planning.';
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

Provide hauling optimization analysis:
1. Route efficiency score (1-100)
2. Fuel efficiency assessment (L/ton-km)
3. Optimal load weight recommendation
4. Route optimization suggestions
5. Cycle time reduction strategies
6. Fleet dispatch recommendations
7. Driver performance assessment
8. Cost per ton-km analysis`;

  const systemPrompt = 'You are an expert mining logistics AI specializing in hauling optimization, fleet dispatch, route planning, and transportation efficiency in mining operations.';
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
  optimizeHauling
};
