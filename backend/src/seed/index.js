const sequelize = require('../config/database');
const { User, OreGrade, DrillPattern, SafetyIncident, Equipment, EnvironmentalCompliance, ProductionLog, WorkforceRecord, CostAnalysis, GeologyMap, HaulingLogistic, AuditLog, Alert, ShiftSchedule, MaintenanceSchedule, InventoryItem } = require('../models');
const bcrypt = require('bcryptjs');

async function seed() {
  try {
    await sequelize.sync({ force: true });
    console.log('Database synced successfully');

    // Seed Users
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await User.bulkCreate([
      { email: 'admin@miningops.com', password: hashedPassword, name: 'Admin User', role: 'admin' },
      { email: 'operator@miningops.com', password: hashedPassword, name: 'John Operator', role: 'operator' },
      { email: 'engineer@miningops.com', password: hashedPassword, name: 'Sarah Engineer', role: 'engineer' }
    ], { individualHooks: false });
    console.log('Users seeded');

    // Seed Ore Grades (15 items)
    await OreGrade.bulkCreate([
      { sampleId: 'ORE-001', location: 'North Pit', zone: 'Zone A', depth: 45.5, mineralType: 'Gold', gradePercentage: 3.2, tonnage: 1500, confidence: 85, status: 'pending' },
      { sampleId: 'ORE-002', location: 'South Pit', zone: 'Zone B', depth: 78.3, mineralType: 'Copper', gradePercentage: 1.8, tonnage: 3200, confidence: 72, status: 'pending' },
      { sampleId: 'ORE-003', location: 'East Ridge', zone: 'Zone C', depth: 32.1, mineralType: 'Iron', gradePercentage: 45.6, tonnage: 8500, confidence: 91, status: 'analyzed' },
      { sampleId: 'ORE-004', location: 'West Valley', zone: 'Zone D', depth: 120.7, mineralType: 'Silver', gradePercentage: 0.5, tonnage: 950, confidence: 68, status: 'pending' },
      { sampleId: 'ORE-005', location: 'North Pit', zone: 'Zone A', depth: 55.0, mineralType: 'Gold', gradePercentage: 5.1, tonnage: 2100, confidence: 88, status: 'pending' },
      { sampleId: 'ORE-006', location: 'Central Mine', zone: 'Zone E', depth: 92.4, mineralType: 'Zinc', gradePercentage: 8.3, tonnage: 4200, confidence: 79, status: 'pending' },
      { sampleId: 'ORE-007', location: 'South Pit', zone: 'Zone B', depth: 67.8, mineralType: 'Copper', gradePercentage: 2.4, tonnage: 2800, confidence: 83, status: 'analyzed' },
      { sampleId: 'ORE-008', location: 'Deep Shaft', zone: 'Zone F', depth: 250.0, mineralType: 'Gold', gradePercentage: 8.7, tonnage: 680, confidence: 62, status: 'pending' },
      { sampleId: 'ORE-009', location: 'East Ridge', zone: 'Zone C', depth: 28.5, mineralType: 'Iron', gradePercentage: 52.1, tonnage: 12000, confidence: 94, status: 'pending' },
      { sampleId: 'ORE-010', location: 'North Extension', zone: 'Zone G', depth: 85.2, mineralType: 'Nickel', gradePercentage: 1.2, tonnage: 3600, confidence: 76, status: 'pending' },
      { sampleId: 'ORE-011', location: 'West Valley', zone: 'Zone D', depth: 110.3, mineralType: 'Silver', gradePercentage: 0.8, tonnage: 1100, confidence: 71, status: 'pending' },
      { sampleId: 'ORE-012', location: 'Central Mine', zone: 'Zone E', depth: 45.0, mineralType: 'Lead', gradePercentage: 3.9, tonnage: 2500, confidence: 81, status: 'pending' },
      { sampleId: 'ORE-013', location: 'South Extension', zone: 'Zone H', depth: 73.6, mineralType: 'Copper', gradePercentage: 3.1, tonnage: 4100, confidence: 86, status: 'pending' },
      { sampleId: 'ORE-014', location: 'Deep Shaft', zone: 'Zone F', depth: 310.5, mineralType: 'Platinum', gradePercentage: 0.3, tonnage: 420, confidence: 58, status: 'pending' },
      { sampleId: 'ORE-015', location: 'North Pit', zone: 'Zone A', depth: 38.9, mineralType: 'Gold', gradePercentage: 4.5, tonnage: 1850, confidence: 90, status: 'pending' }
    ]);
    console.log('Ore Grades seeded (15 items)');

    // Seed Drill Patterns (15 items)
    await DrillPattern.bulkCreate([
      { patternId: 'DRL-001', blastZone: 'North Pit Bench 1', holeCount: 48, holeDepth: 12.5, holeDiameter: 165, spacing: 4.5, burden: 3.8, rockType: 'Granite', explosiveType: 'ANFO', explosiveAmount: 2400, status: 'planned' },
      { patternId: 'DRL-002', blastZone: 'South Pit Bench 3', holeCount: 36, holeDepth: 10.0, holeDiameter: 127, spacing: 3.5, burden: 3.0, rockType: 'Limestone', explosiveType: 'Emulsion', explosiveAmount: 1800, status: 'completed' },
      { patternId: 'DRL-003', blastZone: 'East Ridge Cut 2', holeCount: 64, holeDepth: 15.0, holeDiameter: 200, spacing: 5.0, burden: 4.2, rockType: 'Basalt', explosiveType: 'ANFO', explosiveAmount: 4200, status: 'planned' },
      { patternId: 'DRL-004', blastZone: 'West Valley Floor', holeCount: 28, holeDepth: 8.5, holeDiameter: 102, spacing: 3.0, burden: 2.5, rockType: 'Sandstone', explosiveType: 'Watergel', explosiveAmount: 1200, status: 'planned' },
      { patternId: 'DRL-005', blastZone: 'Central Bench 5', holeCount: 52, holeDepth: 14.0, holeDiameter: 178, spacing: 4.8, burden: 4.0, rockType: 'Gneiss', explosiveType: 'Emulsion', explosiveAmount: 3600, status: 'optimized' },
      { patternId: 'DRL-006', blastZone: 'North Extension A', holeCount: 40, holeDepth: 11.0, holeDiameter: 152, spacing: 4.0, burden: 3.5, rockType: 'Quartzite', explosiveType: 'ANFO', explosiveAmount: 2000, status: 'planned' },
      { patternId: 'DRL-007', blastZone: 'Deep Shaft Level 3', holeCount: 20, holeDepth: 6.0, holeDiameter: 89, spacing: 2.5, burden: 2.0, rockType: 'Schist', explosiveType: 'Emulsion', explosiveAmount: 800, status: 'planned' },
      { patternId: 'DRL-008', blastZone: 'South Pit Bench 1', holeCount: 56, holeDepth: 13.5, holeDiameter: 165, spacing: 4.5, burden: 3.8, rockType: 'Dolomite', explosiveType: 'ANFO', explosiveAmount: 3200, status: 'planned' },
      { patternId: 'DRL-009', blastZone: 'East Ridge Cut 4', holeCount: 72, holeDepth: 16.0, holeDiameter: 200, spacing: 5.2, burden: 4.5, rockType: 'Granite', explosiveType: 'Heavy ANFO', explosiveAmount: 5100, status: 'planned' },
      { patternId: 'DRL-010', blastZone: 'West Valley Upper', holeCount: 32, holeDepth: 9.5, holeDiameter: 127, spacing: 3.5, burden: 2.8, rockType: 'Limestone', explosiveType: 'Watergel', explosiveAmount: 1500, status: 'planned' },
      { patternId: 'DRL-011', blastZone: 'Central Bench 2', holeCount: 44, holeDepth: 12.0, holeDiameter: 152, spacing: 4.2, burden: 3.5, rockType: 'Basalt', explosiveType: 'Emulsion', explosiveAmount: 2800, status: 'planned' },
      { patternId: 'DRL-012', blastZone: 'North Pit Bench 4', holeCount: 60, holeDepth: 14.5, holeDiameter: 178, spacing: 4.8, burden: 4.0, rockType: 'Granite', explosiveType: 'ANFO', explosiveAmount: 3800, status: 'planned' },
      { patternId: 'DRL-013', blastZone: 'South Extension B', holeCount: 38, holeDepth: 10.5, holeDiameter: 140, spacing: 3.8, burden: 3.2, rockType: 'Shale', explosiveType: 'Emulsion', explosiveAmount: 1900, status: 'planned' },
      { patternId: 'DRL-014', blastZone: 'Deep Shaft Level 5', holeCount: 16, holeDepth: 5.0, holeDiameter: 76, spacing: 2.0, burden: 1.8, rockType: 'Quartzite', explosiveType: 'Watergel', explosiveAmount: 600, status: 'planned' },
      { patternId: 'DRL-015', blastZone: 'East Ridge Cut 1', holeCount: 68, holeDepth: 15.5, holeDiameter: 200, spacing: 5.0, burden: 4.3, rockType: 'Gabbro', explosiveType: 'Heavy ANFO', explosiveAmount: 4800, status: 'planned' }
    ]);
    console.log('Drill Patterns seeded (15 items)');

    // Seed Safety Incidents (15 items)
    await SafetyIncident.bulkCreate([
      { incidentId: 'SAF-001', type: 'Equipment Malfunction', severity: 'High', location: 'North Pit', zone: 'Zone A', description: 'Hydraulic line failure on excavator EX-204 during operation', reportedBy: 'Mike Johnson', date: '2024-01-15', status: 'resolved', injuriesCount: 0, rootCause: 'Worn hydraulic fitting' },
      { incidentId: 'SAF-002', type: 'Ground Instability', severity: 'Critical', location: 'South Pit', zone: 'Zone B', description: 'Bench slope failure detected near active mining area', reportedBy: 'Sarah Chen', date: '2024-01-20', status: 'open', injuriesCount: 0, rootCause: null },
      { incidentId: 'SAF-003', type: 'Vehicle Collision', severity: 'Medium', location: 'Haul Road 3', zone: 'Zone C', description: 'Minor collision between haul truck and light vehicle at intersection', reportedBy: 'Tom Williams', date: '2024-02-03', status: 'investigating', injuriesCount: 1, rootCause: null },
      { incidentId: 'SAF-004', type: 'Rock Fall', severity: 'High', location: 'East Ridge', zone: 'Zone C', description: 'Unexpected rock fall from upper bench during drilling operations', reportedBy: 'David Brown', date: '2024-02-10', status: 'open', injuriesCount: 0, rootCause: null },
      { incidentId: 'SAF-005', type: 'Electrical Hazard', severity: 'High', location: 'Processing Plant', zone: 'Zone E', description: 'Exposed wiring found near conveyor belt motor', reportedBy: 'Lisa Martinez', date: '2024-02-15', status: 'resolved', injuriesCount: 0, rootCause: 'Insulation wear' },
      { incidentId: 'SAF-006', type: 'Dust Exposure', severity: 'Medium', location: 'Crusher Area', zone: 'Zone E', description: 'Elevated silica dust levels detected during crushing operations', reportedBy: 'James Wilson', date: '2024-02-22', status: 'open', injuriesCount: 0, rootCause: null },
      { incidentId: 'SAF-007', type: 'Blast Misfire', severity: 'Critical', location: 'Central Bench', zone: 'Zone E', description: 'Two holes failed to detonate during scheduled blast', reportedBy: 'Robert Taylor', date: '2024-03-01', status: 'resolved', injuriesCount: 0, rootCause: 'Detonator connection failure' },
      { incidentId: 'SAF-008', type: 'Slip/Trip/Fall', severity: 'Low', location: 'Maintenance Shop', zone: 'Zone A', description: 'Worker slipped on oil spill in maintenance bay', reportedBy: 'Amy Davis', date: '2024-03-05', status: 'resolved', injuriesCount: 1, rootCause: 'Inadequate housekeeping' },
      { incidentId: 'SAF-009', type: 'Equipment Malfunction', severity: 'Medium', location: 'West Valley', zone: 'Zone D', description: 'Brake failure warning on haul truck HT-108', reportedBy: 'Chris Anderson', date: '2024-03-10', status: 'investigating', injuriesCount: 0, rootCause: null },
      { incidentId: 'SAF-010', type: 'Chemical Spill', severity: 'High', location: 'Reagent Storage', zone: 'Zone E', description: 'Minor cyanide solution leak from storage tank valve', reportedBy: 'Karen Thomas', date: '2024-03-14', status: 'resolved', injuriesCount: 0, rootCause: 'Corroded valve seal' },
      { incidentId: 'SAF-011', type: 'Near Miss', severity: 'Medium', location: 'North Pit', zone: 'Zone A', description: 'Loader bucket narrowly missed worker on foot near stockpile', reportedBy: 'Steve Garcia', date: '2024-03-18', status: 'open', injuriesCount: 0, rootCause: null },
      { incidentId: 'SAF-012', type: 'Noise Exposure', severity: 'Low', location: 'Drill Site 7', zone: 'Zone G', description: 'Workers reporting hearing protection inadequacy during drilling', reportedBy: 'Nancy Lee', date: '2024-03-22', status: 'open', injuriesCount: 0, rootCause: null },
      { incidentId: 'SAF-013', type: 'Ground Instability', severity: 'High', location: 'Deep Shaft', zone: 'Zone F', description: 'Tension cracks observed on shaft wall at 200m level', reportedBy: 'Paul Robinson', date: '2024-03-25', status: 'investigating', injuriesCount: 0, rootCause: null },
      { incidentId: 'SAF-014', type: 'Vehicle Collision', severity: 'Low', location: 'Parking Area', zone: 'Zone A', description: 'Low-speed contact between two service vehicles', reportedBy: 'Jennifer Clark', date: '2024-03-28', status: 'resolved', injuriesCount: 0, rootCause: 'Poor visibility' },
      { incidentId: 'SAF-015', type: 'Fire', severity: 'Critical', location: 'Fuel Storage', zone: 'Zone A', description: 'Small fire detected near diesel fuel storage facility', reportedBy: 'Mark Wright', date: '2024-04-01', status: 'resolved', injuriesCount: 0, rootCause: 'Electrical short circuit' }
    ]);
    console.log('Safety Incidents seeded (15 items)');

    // Seed Equipment (15 items)
    await Equipment.bulkCreate([
      { equipmentId: 'EQ-001', name: 'CAT 797F Haul Truck', type: 'Haul Truck', manufacturer: 'Caterpillar', model: '797F', status: 'operational', location: 'North Pit', hoursOperated: 12450, fuelConsumption: 320, maintenanceDue: '2024-04-15', lastMaintenance: '2024-01-15', utilizationRate: 82 },
      { equipmentId: 'EQ-002', name: 'Komatsu PC8000 Excavator', type: 'Excavator', manufacturer: 'Komatsu', model: 'PC8000-11', status: 'operational', location: 'South Pit', hoursOperated: 8900, fuelConsumption: 450, maintenanceDue: '2024-05-01', lastMaintenance: '2024-02-01', utilizationRate: 78 },
      { equipmentId: 'EQ-003', name: 'Atlas Copco D65 Drill', type: 'Drill Rig', manufacturer: 'Atlas Copco', model: 'D65', status: 'maintenance', location: 'Maintenance Shop', hoursOperated: 15200, fuelConsumption: 180, maintenanceDue: '2024-03-20', lastMaintenance: '2024-03-15', utilizationRate: 45 },
      { equipmentId: 'EQ-004', name: 'Liebherr T 284 Truck', type: 'Haul Truck', manufacturer: 'Liebherr', model: 'T 284', status: 'operational', location: 'East Ridge', hoursOperated: 6500, fuelConsumption: 340, maintenanceDue: '2024-06-01', lastMaintenance: '2024-03-01', utilizationRate: 88 },
      { equipmentId: 'EQ-005', name: 'CAT D11T Dozer', type: 'Dozer', manufacturer: 'Caterpillar', model: 'D11T', status: 'operational', location: 'West Valley', hoursOperated: 11200, fuelConsumption: 210, maintenanceDue: '2024-04-20', lastMaintenance: '2024-01-20', utilizationRate: 75 },
      { equipmentId: 'EQ-006', name: 'Sandvik DR461i Drill', type: 'Drill Rig', manufacturer: 'Sandvik', model: 'DR461i', status: 'operational', location: 'Central Mine', hoursOperated: 4300, fuelConsumption: 160, maintenanceDue: '2024-07-01', lastMaintenance: '2024-04-01', utilizationRate: 91 },
      { equipmentId: 'EQ-007', name: 'Komatsu 930E Truck', type: 'Haul Truck', manufacturer: 'Komatsu', model: '930E-5', status: 'breakdown', location: 'Maintenance Shop', hoursOperated: 18700, fuelConsumption: 310, maintenanceDue: '2024-03-10', lastMaintenance: '2024-03-05', utilizationRate: 25 },
      { equipmentId: 'EQ-008', name: 'CAT 994K Loader', type: 'Wheel Loader', manufacturer: 'Caterpillar', model: '994K', status: 'operational', location: 'North Pit', hoursOperated: 9800, fuelConsumption: 280, maintenanceDue: '2024-05-15', lastMaintenance: '2024-02-15', utilizationRate: 84 },
      { equipmentId: 'EQ-009', name: 'Hitachi EX8000 Excavator', type: 'Excavator', manufacturer: 'Hitachi', model: 'EX8000-7', status: 'operational', location: 'South Pit', hoursOperated: 7200, fuelConsumption: 420, maintenanceDue: '2024-06-15', lastMaintenance: '2024-03-15', utilizationRate: 80 },
      { equipmentId: 'EQ-010', name: 'Epiroc PV271 Drill', type: 'Drill Rig', manufacturer: 'Epiroc', model: 'PV-271', status: 'operational', location: 'East Ridge', hoursOperated: 5600, fuelConsumption: 150, maintenanceDue: '2024-05-20', lastMaintenance: '2024-02-20', utilizationRate: 86 },
      { equipmentId: 'EQ-011', name: 'Volvo A60H Truck', type: 'Articulated Truck', manufacturer: 'Volvo', model: 'A60H', status: 'operational', location: 'West Valley', hoursOperated: 3800, fuelConsumption: 95, maintenanceDue: '2024-08-01', lastMaintenance: '2024-05-01', utilizationRate: 92 },
      { equipmentId: 'EQ-012', name: 'CAT 16M3 Grader', type: 'Motor Grader', manufacturer: 'Caterpillar', model: '16M3', status: 'operational', location: 'Haul Roads', hoursOperated: 10500, fuelConsumption: 65, maintenanceDue: '2024-04-25', lastMaintenance: '2024-01-25', utilizationRate: 70 },
      { equipmentId: 'EQ-013', name: 'Metso HP500 Crusher', type: 'Crusher', manufacturer: 'Metso', model: 'HP500', status: 'operational', location: 'Processing Plant', hoursOperated: 22000, fuelConsumption: 0, maintenanceDue: '2024-04-10', lastMaintenance: '2024-01-10', utilizationRate: 95 },
      { equipmentId: 'EQ-014', name: 'Terex MT6300 Truck', type: 'Haul Truck', manufacturer: 'Terex', model: 'MT6300AC', status: 'idle', location: 'Staging Area', hoursOperated: 14200, fuelConsumption: 350, maintenanceDue: '2024-05-10', lastMaintenance: '2024-02-10', utilizationRate: 35 },
      { equipmentId: 'EQ-015', name: 'Wirtgen 220SM Miner', type: 'Surface Miner', manufacturer: 'Wirtgen', model: '220SM', status: 'operational', location: 'Central Mine', hoursOperated: 2100, fuelConsumption: 190, maintenanceDue: '2024-09-01', lastMaintenance: '2024-06-01', utilizationRate: 88 }
    ]);
    console.log('Equipment seeded (15 items)');

    // Seed Environmental Compliance (15 items)
    await EnvironmentalCompliance.bulkCreate([
      { reportId: 'ENV-001', category: 'Air Quality', parameter: 'PM10 Particulate Matter', measuredValue: 145, unit: 'µg/m³', regulatoryLimit: 150, location: 'North Pit Boundary', monitoringDate: '2024-03-01', complianceStatus: 'compliant', inspector: 'Dr. Emily Foster' },
      { reportId: 'ENV-002', category: 'Water Quality', parameter: 'pH Level', measuredValue: 6.8, unit: 'pH', regulatoryLimit: 9.0, location: 'Tailing Dam Outflow', monitoringDate: '2024-03-01', complianceStatus: 'compliant', inspector: 'Mark Stevens' },
      { reportId: 'ENV-003', category: 'Noise', parameter: 'Ambient Noise Level', measuredValue: 72, unit: 'dB(A)', regulatoryLimit: 70, location: 'Community Boundary East', monitoringDate: '2024-03-02', complianceStatus: 'non-compliant', inspector: 'Dr. Emily Foster', notes: 'Exceeded limit during night shift blasting' },
      { reportId: 'ENV-004', category: 'Water Quality', parameter: 'Total Suspended Solids', measuredValue: 48, unit: 'mg/L', regulatoryLimit: 50, location: 'Creek Discharge Point', monitoringDate: '2024-03-03', complianceStatus: 'compliant', inspector: 'Mark Stevens' },
      { reportId: 'ENV-005', category: 'Air Quality', parameter: 'SO2 Emissions', measuredValue: 0.12, unit: 'ppm', regulatoryLimit: 0.5, location: 'Processing Plant Stack', monitoringDate: '2024-03-05', complianceStatus: 'compliant', inspector: 'Dr. Emily Foster' },
      { reportId: 'ENV-006', category: 'Vibration', parameter: 'Peak Particle Velocity', measuredValue: 12.5, unit: 'mm/s', regulatoryLimit: 15.0, location: 'Nearest Residence', monitoringDate: '2024-03-06', complianceStatus: 'compliant', inspector: 'Tom Richards' },
      { reportId: 'ENV-007', category: 'Water Quality', parameter: 'Cyanide Concentration', measuredValue: 0.18, unit: 'mg/L', regulatoryLimit: 0.2, location: 'Tailing Dam Seepage', monitoringDate: '2024-03-07', complianceStatus: 'warning', inspector: 'Mark Stevens', notes: 'Near regulatory limit - increased monitoring required' },
      { reportId: 'ENV-008', category: 'Air Quality', parameter: 'PM2.5 Fine Particles', measuredValue: 32, unit: 'µg/m³', regulatoryLimit: 35, location: 'South Pit Boundary', monitoringDate: '2024-03-08', complianceStatus: 'warning', inspector: 'Dr. Emily Foster' },
      { reportId: 'ENV-009', category: 'Soil Quality', parameter: 'Heavy Metal Content (Pb)', measuredValue: 280, unit: 'mg/kg', regulatoryLimit: 300, location: 'Waste Dump Perimeter', monitoringDate: '2024-03-10', complianceStatus: 'compliant', inspector: 'Susan Park' },
      { reportId: 'ENV-010', category: 'Water Quality', parameter: 'Arsenic Level', measuredValue: 0.012, unit: 'mg/L', regulatoryLimit: 0.01, location: 'Groundwater Well GW-3', monitoringDate: '2024-03-11', complianceStatus: 'non-compliant', inspector: 'Mark Stevens', notes: 'Exceeds drinking water standard - immediate action required' },
      { reportId: 'ENV-011', category: 'Air Quality', parameter: 'NOx Emissions', measuredValue: 0.08, unit: 'ppm', regulatoryLimit: 0.25, location: 'Vehicle Staging Area', monitoringDate: '2024-03-12', complianceStatus: 'compliant', inspector: 'Dr. Emily Foster' },
      { reportId: 'ENV-012', category: 'Biodiversity', parameter: 'Vegetation Cover Index', measuredValue: 0.35, unit: 'index', regulatoryLimit: 0.3, location: 'Rehabilitation Area A', monitoringDate: '2024-03-13', complianceStatus: 'compliant', inspector: 'Susan Park' },
      { reportId: 'ENV-013', category: 'Noise', parameter: 'Blast Overpressure', measuredValue: 118, unit: 'dB(L)', regulatoryLimit: 120, location: 'Community Boundary West', monitoringDate: '2024-03-14', complianceStatus: 'compliant', inspector: 'Tom Richards' },
      { reportId: 'ENV-014', category: 'Water Quality', parameter: 'Turbidity', measuredValue: 55, unit: 'NTU', regulatoryLimit: 50, location: 'Settling Pond Overflow', monitoringDate: '2024-03-15', complianceStatus: 'non-compliant', inspector: 'Mark Stevens', notes: 'Heavy rainfall caused overflow - corrective action initiated' },
      { reportId: 'ENV-015', category: 'Soil Quality', parameter: 'Hydrocarbon Content', measuredValue: 85, unit: 'mg/kg', regulatoryLimit: 100, location: 'Fuel Storage Perimeter', monitoringDate: '2024-03-16', complianceStatus: 'compliant', inspector: 'Susan Park' }
    ]);
    console.log('Environmental Compliance seeded (15 items)');

    // Seed Production Logs (15 items)
    await ProductionLog.bulkCreate([
      { logId: 'PRD-001', shift: 'Day', date: '2024-03-01', zone: 'Zone A', materialType: 'Gold Ore', tonnageMined: 4500, tonnageProcessed: 4200, recoveryRate: 93.3, downtime: 1.5, operatorCount: 12, supervisor: 'Mike Henderson' },
      { logId: 'PRD-002', shift: 'Night', date: '2024-03-01', zone: 'Zone B', materialType: 'Copper Ore', tonnageMined: 6200, tonnageProcessed: 5800, recoveryRate: 87.5, downtime: 2.0, operatorCount: 10, supervisor: 'Sarah Palmer' },
      { logId: 'PRD-003', shift: 'Day', date: '2024-03-02', zone: 'Zone C', materialType: 'Iron Ore', tonnageMined: 12500, tonnageProcessed: 12000, recoveryRate: 96.0, downtime: 0.5, operatorCount: 15, supervisor: 'Mike Henderson' },
      { logId: 'PRD-004', shift: 'Night', date: '2024-03-02', zone: 'Zone A', materialType: 'Gold Ore', tonnageMined: 3800, tonnageProcessed: 3500, recoveryRate: 92.1, downtime: 3.0, operatorCount: 11, supervisor: 'Sarah Palmer' },
      { logId: 'PRD-005', shift: 'Day', date: '2024-03-03', zone: 'Zone D', materialType: 'Silver Ore', tonnageMined: 2100, tonnageProcessed: 1950, recoveryRate: 88.5, downtime: 1.0, operatorCount: 8, supervisor: 'Tom Nguyen' },
      { logId: 'PRD-006', shift: 'Night', date: '2024-03-03', zone: 'Zone E', materialType: 'Zinc Ore', tonnageMined: 5400, tonnageProcessed: 5100, recoveryRate: 90.2, downtime: 1.5, operatorCount: 12, supervisor: 'Sarah Palmer' },
      { logId: 'PRD-007', shift: 'Day', date: '2024-03-04', zone: 'Zone B', materialType: 'Copper Ore', tonnageMined: 7100, tonnageProcessed: 6800, recoveryRate: 89.0, downtime: 0.0, operatorCount: 14, supervisor: 'Mike Henderson' },
      { logId: 'PRD-008', shift: 'Night', date: '2024-03-04', zone: 'Zone C', materialType: 'Iron Ore', tonnageMined: 11800, tonnageProcessed: 11200, recoveryRate: 94.9, downtime: 2.5, operatorCount: 13, supervisor: 'Tom Nguyen' },
      { logId: 'PRD-009', shift: 'Day', date: '2024-03-05', zone: 'Zone F', materialType: 'Gold Ore', tonnageMined: 1200, tonnageProcessed: 1100, recoveryRate: 91.7, downtime: 4.0, operatorCount: 6, supervisor: 'Mike Henderson', notes: 'Deep shaft extraction - limited capacity' },
      { logId: 'PRD-010', shift: 'Night', date: '2024-03-05', zone: 'Zone A', materialType: 'Gold Ore', tonnageMined: 4800, tonnageProcessed: 4500, recoveryRate: 93.8, downtime: 1.0, operatorCount: 12, supervisor: 'Sarah Palmer' },
      { logId: 'PRD-011', shift: 'Day', date: '2024-03-06', zone: 'Zone G', materialType: 'Nickel Ore', tonnageMined: 3600, tonnageProcessed: 3300, recoveryRate: 85.5, downtime: 2.0, operatorCount: 10, supervisor: 'Tom Nguyen' },
      { logId: 'PRD-012', shift: 'Night', date: '2024-03-06', zone: 'Zone E', materialType: 'Lead Ore', tonnageMined: 4100, tonnageProcessed: 3800, recoveryRate: 86.8, downtime: 1.5, operatorCount: 11, supervisor: 'Sarah Palmer' },
      { logId: 'PRD-013', shift: 'Day', date: '2024-03-07', zone: 'Zone H', materialType: 'Copper Ore', tonnageMined: 5500, tonnageProcessed: 5200, recoveryRate: 91.0, downtime: 0.5, operatorCount: 13, supervisor: 'Mike Henderson' },
      { logId: 'PRD-014', shift: 'Night', date: '2024-03-07', zone: 'Zone B', materialType: 'Copper Ore', tonnageMined: 6800, tonnageProcessed: 6400, recoveryRate: 88.2, downtime: 3.5, operatorCount: 10, supervisor: 'Tom Nguyen', notes: 'Crusher downtime - bearing replacement' },
      { logId: 'PRD-015', shift: 'Day', date: '2024-03-08', zone: 'Zone C', materialType: 'Iron Ore', tonnageMined: 13200, tonnageProcessed: 12800, recoveryRate: 97.0, downtime: 0.0, operatorCount: 16, supervisor: 'Mike Henderson' }
    ]);
    console.log('Production Logs seeded (15 items)');

    // Seed Workforce Records (15 items)
    await WorkforceRecord.bulkCreate([
      { workerId: 'WRK-001', name: 'James McCarthy', role: 'Heavy Equipment Operator', department: 'Mining', shift: 'Day', certification: 'Class A HEO', certExpiry: '2025-06-15', yearsExperience: 12, safetyScore: 95, hoursThisMonth: 168, status: 'active' },
      { workerId: 'WRK-002', name: 'Maria Santos', role: 'Blast Engineer', department: 'Drilling & Blasting', shift: 'Day', certification: 'Shotfirer Level 3', certExpiry: '2024-12-01', yearsExperience: 8, safetyScore: 98, hoursThisMonth: 152, status: 'active' },
      { workerId: 'WRK-003', name: 'Ahmed Hassan', role: 'Haul Truck Driver', department: 'Mining', shift: 'Night', certification: 'Class B HEO', certExpiry: '2025-03-20', yearsExperience: 5, safetyScore: 88, hoursThisMonth: 192, status: 'active' },
      { workerId: 'WRK-004', name: 'Linda Chen', role: 'Geologist', department: 'Geology', shift: 'Day', certification: 'Professional Geologist', certExpiry: '2026-01-15', yearsExperience: 15, safetyScore: 100, hoursThisMonth: 140, status: 'active' },
      { workerId: 'WRK-005', name: 'Robert Ndlovu', role: 'Mine Supervisor', department: 'Operations', shift: 'Day', certification: 'Mine Manager Certificate', certExpiry: '2025-09-30', yearsExperience: 20, safetyScore: 97, hoursThisMonth: 176, status: 'active' },
      { workerId: 'WRK-006', name: 'Sarah O\'Brien', role: 'Environmental Officer', department: 'Environment', shift: 'Day', certification: 'Environmental Management', certExpiry: '2025-04-10', yearsExperience: 7, safetyScore: 100, hoursThisMonth: 160, status: 'active' },
      { workerId: 'WRK-007', name: 'Pavel Kozlov', role: 'Drill Operator', department: 'Drilling & Blasting', shift: 'Night', certification: 'Drill Operator Level 2', certExpiry: '2024-08-15', yearsExperience: 4, safetyScore: 82, hoursThisMonth: 200, status: 'active' },
      { workerId: 'WRK-008', name: 'Grace Muthoni', role: 'Safety Inspector', department: 'Safety', shift: 'Day', certification: 'OHS Inspector', certExpiry: '2025-11-20', yearsExperience: 10, safetyScore: 100, hoursThisMonth: 155, status: 'active' },
      { workerId: 'WRK-009', name: 'Tom Williams', role: 'Maintenance Mechanic', department: 'Maintenance', shift: 'Day', certification: 'Heavy Diesel Mechanic', certExpiry: '2025-07-01', yearsExperience: 14, safetyScore: 91, hoursThisMonth: 180, status: 'active' },
      { workerId: 'WRK-010', name: 'Yuki Tanaka', role: 'Process Engineer', department: 'Processing', shift: 'Day', certification: 'Chemical Engineering', certExpiry: '2026-02-28', yearsExperience: 6, safetyScore: 96, hoursThisMonth: 145, status: 'active' },
      { workerId: 'WRK-011', name: 'Carlos Mendez', role: 'Excavator Operator', department: 'Mining', shift: 'Night', certification: 'Class A HEO', certExpiry: '2024-10-05', yearsExperience: 9, safetyScore: 85, hoursThisMonth: 188, status: 'active' },
      { workerId: 'WRK-012', name: 'Emma Wilson', role: 'Survey Technician', department: 'Survey', shift: 'Day', certification: 'Mine Surveyor', certExpiry: '2025-05-15', yearsExperience: 3, safetyScore: 100, hoursThisMonth: 135, status: 'active' },
      { workerId: 'WRK-013', name: 'David Okafor', role: 'Electrician', department: 'Maintenance', shift: 'Night', certification: 'Mine Electrician', certExpiry: '2025-01-20', yearsExperience: 11, safetyScore: 93, hoursThisMonth: 172, status: 'active' },
      { workerId: 'WRK-014', name: 'Sophie Dubois', role: 'Loader Operator', department: 'Mining', shift: 'Day', certification: 'Class B HEO', certExpiry: '2024-11-30', yearsExperience: 2, safetyScore: 78, hoursThisMonth: 160, status: 'training' },
      { workerId: 'WRK-015', name: 'Mike Johnson', role: 'Crusher Operator', department: 'Processing', shift: 'Night', certification: 'Plant Operator Level 2', certExpiry: '2025-08-10', yearsExperience: 7, safetyScore: 90, hoursThisMonth: 176, status: 'active' }
    ]);
    console.log('Workforce Records seeded (15 items)');

    // Seed Cost Analysis (15 items)
    await CostAnalysis.bulkCreate([
      { costId: 'CST-001', category: 'Labor', subcategory: 'Overtime', description: 'Night shift overtime for Q1 production push', amount: 285000, budgeted: 250000, variance: -35000, period: '2024-Q1', zone: 'All Zones', costPerTon: 2.85, status: 'recorded' },
      { costId: 'CST-002', category: 'Fuel', subcategory: 'Diesel', description: 'Haul truck diesel consumption', amount: 1240000, budgeted: 1100000, variance: -140000, period: '2024-Q1', zone: 'All Zones', costPerTon: 12.40, status: 'recorded' },
      { costId: 'CST-003', category: 'Maintenance', subcategory: 'Scheduled', description: 'Planned equipment maintenance program', amount: 680000, budgeted: 700000, variance: 20000, period: '2024-Q1', zone: 'All Zones', costPerTon: 6.80, status: 'recorded' },
      { costId: 'CST-004', category: 'Explosives', subcategory: 'ANFO', description: 'Bulk ANFO for North Pit blasting', amount: 420000, budgeted: 400000, variance: -20000, period: '2024-Q1', zone: 'Zone A', costPerTon: 4.20, status: 'recorded' },
      { costId: 'CST-005', category: 'Maintenance', subcategory: 'Unplanned', description: 'Emergency repairs on Komatsu 930E', amount: 185000, budgeted: 50000, variance: -135000, period: '2024-Q1', zone: 'Zone B', costPerTon: 1.85, status: 'over-budget' },
      { costId: 'CST-006', category: 'Processing', subcategory: 'Reagents', description: 'Chemical reagents for gold extraction', amount: 350000, budgeted: 380000, variance: 30000, period: '2024-Q1', zone: 'Zone E', costPerTon: 3.50, status: 'recorded' },
      { costId: 'CST-007', category: 'Labor', subcategory: 'Contract', description: 'Contractor drilling services', amount: 520000, budgeted: 500000, variance: -20000, period: '2024-Q1', zone: 'Zone C', costPerTon: 5.20, status: 'recorded' },
      { costId: 'CST-008', category: 'Environmental', subcategory: 'Compliance', description: 'Environmental monitoring and remediation', amount: 95000, budgeted: 120000, variance: 25000, period: '2024-Q1', zone: 'All Zones', costPerTon: 0.95, status: 'recorded' },
      { costId: 'CST-009', category: 'Fuel', subcategory: 'Electricity', description: 'Processing plant electricity costs', amount: 310000, budgeted: 290000, variance: -20000, period: '2024-Q1', zone: 'Zone E', costPerTon: 3.10, status: 'recorded' },
      { costId: 'CST-010', category: 'Equipment', subcategory: 'Tires', description: 'Haul truck tire replacement program', amount: 890000, budgeted: 800000, variance: -90000, period: '2024-Q1', zone: 'All Zones', costPerTon: 8.90, status: 'over-budget' },
      { costId: 'CST-011', category: 'Safety', subcategory: 'PPE', description: 'Personal protective equipment procurement', amount: 45000, budgeted: 50000, variance: 5000, period: '2024-Q1', zone: 'All Zones', costPerTon: 0.45, status: 'recorded' },
      { costId: 'CST-012', category: 'Drilling', subcategory: 'Consumables', description: 'Drill bits and rods replacement', amount: 275000, budgeted: 260000, variance: -15000, period: '2024-Q1', zone: 'Zone A', costPerTon: 2.75, status: 'recorded' },
      { costId: 'CST-013', category: 'Transport', subcategory: 'Road Maintenance', description: 'Haul road grading and watering', amount: 165000, budgeted: 150000, variance: -15000, period: '2024-Q1', zone: 'All Zones', costPerTon: 1.65, status: 'recorded' },
      { costId: 'CST-014', category: 'Processing', subcategory: 'Water Treatment', description: 'Process water treatment and recycling', amount: 130000, budgeted: 140000, variance: 10000, period: '2024-Q1', zone: 'Zone E', costPerTon: 1.30, status: 'recorded' },
      { costId: 'CST-015', category: 'Administration', subcategory: 'Insurance', description: 'Mining operations insurance premium', amount: 480000, budgeted: 480000, variance: 0, period: '2024-Q1', zone: 'All Zones', costPerTon: 4.80, status: 'recorded' }
    ]);
    console.log('Cost Analysis seeded (15 items)');

    // Seed Geology Maps (15 items)
    await GeologyMap.bulkCreate([
      { surveyId: 'GEO-001', surveyType: 'Diamond Drilling', location: 'North Pit', zone: 'Zone A', rockFormation: 'Archaean Greenstone', dominantMineral: 'Gold-bearing Quartz', structuralFeature: 'Shear Zone', strikeAngle: 045, dipAngle: 65, depthRange: '20-80m', surveyDate: '2024-01-15', geologist: 'Dr. Linda Chen', confidence: 88 },
      { surveyId: 'GEO-002', surveyType: 'RC Drilling', location: 'South Pit', zone: 'Zone B', rockFormation: 'Porphyry Intrusion', dominantMineral: 'Chalcopyrite', structuralFeature: 'Stockwork Veining', strikeAngle: 120, dipAngle: 45, depthRange: '30-120m', surveyDate: '2024-01-20', geologist: 'Dr. Linda Chen', confidence: 82 },
      { surveyId: 'GEO-003', surveyType: 'Geological Mapping', location: 'East Ridge', zone: 'Zone C', rockFormation: 'Banded Iron Formation', dominantMineral: 'Hematite-Magnetite', structuralFeature: 'Syncline Fold', strikeAngle: 270, dipAngle: 30, depthRange: '0-50m', surveyDate: '2024-02-01', geologist: 'Dr. Peter Hoffman', confidence: 94 },
      { surveyId: 'GEO-004', surveyType: 'Geophysical Survey', location: 'West Valley', zone: 'Zone D', rockFormation: 'Epithermal Vein System', dominantMineral: 'Native Silver', structuralFeature: 'Normal Fault', strikeAngle: 180, dipAngle: 72, depthRange: '50-200m', surveyDate: '2024-02-10', geologist: 'Dr. Linda Chen', confidence: 71 },
      { surveyId: 'GEO-005', surveyType: 'Diamond Drilling', location: 'Central Mine', zone: 'Zone E', rockFormation: 'Sedimentary Zinc-Lead', dominantMineral: 'Sphalerite-Galena', structuralFeature: 'Reef Structure', strikeAngle: 090, dipAngle: 15, depthRange: '40-100m', surveyDate: '2024-02-15', geologist: 'Dr. Peter Hoffman', confidence: 86 },
      { surveyId: 'GEO-006', surveyType: 'Geochemical Sampling', location: 'North Extension', zone: 'Zone G', rockFormation: 'Ultramafic Komatiite', dominantMineral: 'Pentlandite', structuralFeature: 'Basal Contact', strikeAngle: 315, dipAngle: 25, depthRange: '10-60m', surveyDate: '2024-02-20', geologist: 'Dr. Linda Chen', confidence: 79 },
      { surveyId: 'GEO-007', surveyType: 'RC Drilling', location: 'Deep Shaft', zone: 'Zone F', rockFormation: 'Archaean Greenstone', dominantMineral: 'Gold-Sulfide', structuralFeature: 'Plunging Anticline', strikeAngle: 060, dipAngle: 80, depthRange: '200-350m', surveyDate: '2024-02-25', geologist: 'Dr. Peter Hoffman', confidence: 65 },
      { surveyId: 'GEO-008', surveyType: 'Geological Mapping', location: 'South Extension', zone: 'Zone H', rockFormation: 'Porphyry Intrusion', dominantMineral: 'Chalcopyrite-Bornite', structuralFeature: 'Thrust Fault', strikeAngle: 150, dipAngle: 35, depthRange: '20-90m', surveyDate: '2024-03-01', geologist: 'Dr. Linda Chen', confidence: 84 },
      { surveyId: 'GEO-009', surveyType: 'Geophysical Survey', location: 'North Pit', zone: 'Zone A', rockFormation: 'Archaean Greenstone', dominantMineral: 'Gold-bearing Quartz', structuralFeature: 'Cross-cutting Dyke', strikeAngle: 000, dipAngle: 88, depthRange: '30-120m', surveyDate: '2024-03-05', geologist: 'Dr. Peter Hoffman', confidence: 76 },
      { surveyId: 'GEO-010', surveyType: 'Diamond Drilling', location: 'East Ridge', zone: 'Zone C', rockFormation: 'Banded Iron Formation', dominantMineral: 'Goethite', structuralFeature: 'Unconformity', strikeAngle: 250, dipAngle: 10, depthRange: '0-30m', surveyDate: '2024-03-08', geologist: 'Dr. Linda Chen', confidence: 91 },
      { surveyId: 'GEO-011', surveyType: 'Geochemical Sampling', location: 'West Valley', zone: 'Zone D', rockFormation: 'Epithermal Vein System', dominantMineral: 'Electrum', structuralFeature: 'Breccia Pipe', strikeAngle: 200, dipAngle: 85, depthRange: '80-250m', surveyDate: '2024-03-10', geologist: 'Dr. Peter Hoffman', confidence: 68 },
      { surveyId: 'GEO-012', surveyType: 'RC Drilling', location: 'Central Mine', zone: 'Zone E', rockFormation: 'Sedimentary Zinc-Lead', dominantMineral: 'Sphalerite', structuralFeature: 'Graben Structure', strikeAngle: 110, dipAngle: 55, depthRange: '30-80m', surveyDate: '2024-03-12', geologist: 'Dr. Linda Chen', confidence: 83 },
      { surveyId: 'GEO-013', surveyType: 'Geological Mapping', location: 'South Pit', zone: 'Zone B', rockFormation: 'Porphyry Intrusion', dominantMineral: 'Molybdenite', structuralFeature: 'Alteration Halo', strikeAngle: 340, dipAngle: 40, depthRange: '50-150m', surveyDate: '2024-03-14', geologist: 'Dr. Peter Hoffman', confidence: 77 },
      { surveyId: 'GEO-014', surveyType: 'Geophysical Survey', location: 'North Extension', zone: 'Zone G', rockFormation: 'Ultramafic Komatiite', dominantMineral: 'Chromite', structuralFeature: 'Podiform Deposit', strikeAngle: 075, dipAngle: 50, depthRange: '15-45m', surveyDate: '2024-03-16', geologist: 'Dr. Linda Chen', confidence: 85 },
      { surveyId: 'GEO-015', surveyType: 'Diamond Drilling', location: 'Deep Shaft', zone: 'Zone F', rockFormation: 'Bushveld Complex', dominantMineral: 'Platinum Group Elements', structuralFeature: 'Merensky Reef', strikeAngle: 030, dipAngle: 12, depthRange: '280-340m', surveyDate: '2024-03-18', geologist: 'Dr. Peter Hoffman', confidence: 62 }
    ]);
    console.log('Geology Maps seeded (15 items)');

    // Seed Hauling Logistics (15 items)
    await HaulingLogistic.bulkCreate([
      { tripId: 'HUL-001', truckId: 'EQ-001', driver: 'Ahmed Hassan', origin: 'North Pit Face A', destination: 'Primary Crusher', materialType: 'Gold Ore', loadWeight: 363, distance: 4.2, tripDuration: 28, fuelUsed: 45, date: '2024-03-01', shift: 'Day', status: 'completed' },
      { tripId: 'HUL-002', truckId: 'EQ-004', driver: 'Carlos Mendez', origin: 'East Ridge Bench 3', destination: 'ROM Pad', materialType: 'Iron Ore', loadWeight: 400, distance: 6.8, tripDuration: 42, fuelUsed: 68, date: '2024-03-01', shift: 'Day', status: 'completed' },
      { tripId: 'HUL-003', truckId: 'EQ-001', driver: 'Ahmed Hassan', origin: 'North Pit Face B', destination: 'Waste Dump East', materialType: 'Waste Rock', loadWeight: 363, distance: 3.1, tripDuration: 22, fuelUsed: 35, date: '2024-03-01', shift: 'Day', status: 'completed' },
      { tripId: 'HUL-004', truckId: 'EQ-014', driver: 'Sophie Dubois', origin: 'South Pit Bench 1', destination: 'Primary Crusher', materialType: 'Copper Ore', loadWeight: 360, distance: 5.5, tripDuration: 35, fuelUsed: 58, date: '2024-03-01', shift: 'Night', status: 'completed' },
      { tripId: 'HUL-005', truckId: 'EQ-004', driver: 'Carlos Mendez', origin: 'East Ridge Bench 5', destination: 'Stockpile A', materialType: 'Iron Ore', loadWeight: 400, distance: 7.2, tripDuration: 48, fuelUsed: 72, date: '2024-03-02', shift: 'Day', status: 'completed' },
      { tripId: 'HUL-006', truckId: 'EQ-001', driver: 'Mike Johnson', origin: 'North Pit Face A', destination: 'Primary Crusher', materialType: 'Gold Ore', loadWeight: 350, distance: 4.2, tripDuration: 26, fuelUsed: 42, date: '2024-03-02', shift: 'Night', status: 'completed' },
      { tripId: 'HUL-007', truckId: 'EQ-014', driver: 'Ahmed Hassan', origin: 'Central Bench 2', destination: 'Secondary Crusher', materialType: 'Zinc Ore', loadWeight: 355, distance: 3.8, tripDuration: 24, fuelUsed: 38, date: '2024-03-02', shift: 'Night', status: 'completed' },
      { tripId: 'HUL-008', truckId: 'EQ-004', driver: 'Sophie Dubois', origin: 'West Valley Floor', destination: 'Waste Dump West', materialType: 'Waste Rock', loadWeight: 400, distance: 2.5, tripDuration: 18, fuelUsed: 30, date: '2024-03-03', shift: 'Day', status: 'completed' },
      { tripId: 'HUL-009', truckId: 'EQ-001', driver: 'Carlos Mendez', origin: 'North Pit Face C', destination: 'ROM Pad', materialType: 'Gold Ore', loadWeight: 340, distance: 4.8, tripDuration: 32, fuelUsed: 50, date: '2024-03-03', shift: 'Day', status: 'completed' },
      { tripId: 'HUL-010', truckId: 'EQ-014', driver: 'Mike Johnson', origin: 'South Pit Bench 3', destination: 'Primary Crusher', materialType: 'Copper Ore', loadWeight: 358, distance: 6.1, tripDuration: 38, fuelUsed: 62, date: '2024-03-03', shift: 'Night', status: 'completed' },
      { tripId: 'HUL-011', truckId: 'EQ-001', driver: 'Ahmed Hassan', origin: 'North Extension A', destination: 'Stockpile B', materialType: 'Nickel Ore', loadWeight: 345, distance: 5.0, tripDuration: 30, fuelUsed: 48, date: '2024-03-04', shift: 'Day', status: 'completed' },
      { tripId: 'HUL-012', truckId: 'EQ-004', driver: 'Sophie Dubois', origin: 'East Ridge Bench 1', destination: 'Primary Crusher', materialType: 'Iron Ore', loadWeight: 395, distance: 6.5, tripDuration: 40, fuelUsed: 65, date: '2024-03-04', shift: 'Day', status: 'completed' },
      { tripId: 'HUL-013', truckId: 'EQ-014', driver: 'Carlos Mendez', origin: 'South Extension B', destination: 'Secondary Crusher', materialType: 'Copper Ore', loadWeight: 362, distance: 7.8, tripDuration: 52, fuelUsed: 78, date: '2024-03-04', shift: 'Night', status: 'delayed' },
      { tripId: 'HUL-014', truckId: 'EQ-001', driver: 'Mike Johnson', origin: 'North Pit Face A', destination: 'Waste Dump East', materialType: 'Waste Rock', loadWeight: 363, distance: 3.1, tripDuration: 20, fuelUsed: 33, date: '2024-03-05', shift: 'Day', status: 'completed' },
      { tripId: 'HUL-015', truckId: 'EQ-004', driver: 'Ahmed Hassan', origin: 'Central Bench 5', destination: 'ROM Pad', materialType: 'Lead Ore', loadWeight: 380, distance: 4.5, tripDuration: 29, fuelUsed: 46, date: '2024-03-05', shift: 'Night', status: 'completed' }
    ]);
    console.log('Hauling Logistics seeded (15 items)');

    // Seed Alerts (10 items)
    await Alert.bulkCreate([
      { alertId: 'ALT-001', title: 'Equipment Overheating', type: 'equipment', severity: 'high', status: 'active', message: 'Excavator EX-001 engine temperature exceeding safe limits at 105°C', source: 'Equipment Monitoring', threshold: 95, currentValue: 105 },
      { alertId: 'ALT-002', title: 'Air Quality Violation', type: 'environmental', severity: 'critical', status: 'active', message: 'PM2.5 levels at North Pit exceed regulatory limits (150 µg/m³ vs limit 100 µg/m³)', source: 'Environmental Monitoring', threshold: 100, currentValue: 150 },
      { alertId: 'ALT-003', title: 'Low Explosive Inventory', type: 'safety', severity: 'medium', status: 'acknowledged', message: 'ANFO stock below minimum threshold. Current: 2.5 tons, Minimum: 5 tons', source: 'Inventory System', threshold: 5, currentValue: 2.5, acknowledgedBy: 'Admin User', acknowledgedAt: new Date() },
      { alertId: 'ALT-004', title: 'Production Below Target', type: 'production', severity: 'medium', status: 'active', message: 'Day shift production at 78% of daily target (7,800 tons vs 10,000 ton target)', source: 'Production Monitoring', threshold: 90, currentValue: 78 },
      { alertId: 'ALT-005', title: 'Budget Overrun Warning', type: 'cost', severity: 'high', status: 'active', message: 'March fuel costs 22% over budget ($145,000 vs $118,000 budget)', source: 'Cost Analysis', threshold: 118000, currentValue: 145000 },
      { alertId: 'ALT-006', title: 'Haul Truck Brake Wear', type: 'equipment', severity: 'high', status: 'resolved', message: 'Haul truck HT-003 brake pad wear at 92%. Replacement required within 50 hours', source: 'Equipment Monitoring', threshold: 80, currentValue: 92, resolvedAt: new Date() },
      { alertId: 'ALT-007', title: 'Worker Fatigue Risk', type: 'safety', severity: 'medium', status: 'active', message: '3 workers on night shift approaching 12-hour continuous operation limit', source: 'Workforce Management', threshold: 12, currentValue: 11.5 },
      { alertId: 'ALT-008', title: 'Slope Stability Warning', type: 'safety', severity: 'critical', status: 'active', message: 'Ground movement sensors detecting 15mm displacement at South Pit wall (limit: 10mm)', source: 'Geology Monitoring', threshold: 10, currentValue: 15 },
      { alertId: 'ALT-009', title: 'Water Discharge pH Level', type: 'environmental', severity: 'low', status: 'resolved', message: 'Settling pond discharge pH at 6.8 (approaching lower limit of 6.5)', source: 'Environmental Monitoring', threshold: 6.5, currentValue: 6.8, resolvedAt: new Date() },
      { alertId: 'ALT-010', title: 'Drill Bit Replacement Due', type: 'equipment', severity: 'low', status: 'active', message: 'Drill rig DR-002 bit has 85% wear. Schedule replacement within next shift', source: 'Equipment Monitoring', threshold: 80, currentValue: 85 }
    ]);
    console.log('Alerts seeded (10 items)');

    // Seed Shift Schedules (15 items)
    const today = new Date();
    const dateStr = (offset) => {
      const d = new Date(today);
      d.setDate(d.getDate() + offset);
      return d.toISOString().split('T')[0];
    };
    await ShiftSchedule.bulkCreate([
      { scheduleId: 'SHF-001', workerName: 'John Smith', workerId: 'WRK-001', shift: 'day', date: dateStr(0), startTime: '06:00', endTime: '18:00', location: 'North Pit', role: 'Excavator Operator', status: 'in-progress' },
      { scheduleId: 'SHF-002', workerName: 'Maria Garcia', workerId: 'WRK-002', shift: 'day', date: dateStr(0), startTime: '06:00', endTime: '18:00', location: 'South Pit', role: 'Haul Truck Driver', status: 'in-progress' },
      { scheduleId: 'SHF-003', workerName: 'Ahmed Hassan', workerId: 'WRK-003', shift: 'night', date: dateStr(0), startTime: '18:00', endTime: '06:00', location: 'Central Mine', role: 'Drill Operator', status: 'scheduled' },
      { scheduleId: 'SHF-004', workerName: 'Li Wei', workerId: 'WRK-004', shift: 'night', date: dateStr(0), startTime: '18:00', endTime: '06:00', location: 'East Ridge', role: 'Blaster', status: 'scheduled' },
      { scheduleId: 'SHF-005', workerName: 'James Wilson', workerId: 'WRK-005', shift: 'day', date: dateStr(1), startTime: '06:00', endTime: '18:00', location: 'North Pit', role: 'Supervisor', status: 'scheduled' },
      { scheduleId: 'SHF-006', workerName: 'Sarah Johnson', workerId: 'WRK-006', shift: 'swing', date: dateStr(1), startTime: '14:00', endTime: '22:00', location: 'Processing Plant', role: 'Plant Operator', status: 'scheduled' },
      { scheduleId: 'SHF-007', workerName: 'Tom Brown', workerId: 'WRK-007', shift: 'day', date: dateStr(1), startTime: '06:00', endTime: '18:00', location: 'West Valley', role: 'Mechanic', status: 'scheduled' },
      { scheduleId: 'SHF-008', workerName: 'Elena Petrov', workerId: 'WRK-008', shift: 'night', date: dateStr(1), startTime: '18:00', endTime: '06:00', location: 'South Pit', role: 'Safety Officer', status: 'scheduled' },
      { scheduleId: 'SHF-009', workerName: 'Carlos Rivera', workerId: 'WRK-009', shift: 'day', date: dateStr(2), startTime: '06:00', endTime: '18:00', location: 'North Pit', role: 'Haul Truck Driver', status: 'scheduled' },
      { scheduleId: 'SHF-010', workerName: 'John Smith', workerId: 'WRK-001', shift: 'night', date: dateStr(2), startTime: '18:00', endTime: '06:00', location: 'Central Mine', role: 'Excavator Operator', status: 'scheduled' },
      { scheduleId: 'SHF-011', workerName: 'Maria Garcia', workerId: 'WRK-002', shift: 'day', date: dateStr(-1), startTime: '06:00', endTime: '18:00', location: 'South Pit', role: 'Haul Truck Driver', status: 'completed' },
      { scheduleId: 'SHF-012', workerName: 'Ahmed Hassan', workerId: 'WRK-003', shift: 'day', date: dateStr(-1), startTime: '06:00', endTime: '18:00', location: 'East Ridge', role: 'Drill Operator', status: 'completed' },
      { scheduleId: 'SHF-013', workerName: 'Li Wei', workerId: 'WRK-004', shift: 'swing', date: dateStr(2), startTime: '14:00', endTime: '22:00', location: 'Processing Plant', role: 'Blaster', status: 'scheduled' },
      { scheduleId: 'SHF-014', workerName: 'James Wilson', workerId: 'WRK-005', shift: 'day', date: dateStr(-1), startTime: '06:00', endTime: '18:00', location: 'North Pit', role: 'Supervisor', status: 'completed' },
      { scheduleId: 'SHF-015', workerName: 'Tom Brown', workerId: 'WRK-007', shift: 'night', date: dateStr(3), startTime: '18:00', endTime: '06:00', location: 'West Valley', role: 'Mechanic', status: 'scheduled' }
    ]);
    console.log('Shift Schedules seeded (15 items)');

    // Seed Maintenance Schedules (10 items)
    await MaintenanceSchedule.bulkCreate([
      { scheduleId: 'MNT-001', equipmentId: 'EQ-001', equipmentName: 'CAT 390F Excavator', type: 'preventive', priority: 'high', status: 'scheduled', scheduledDate: dateStr(2), assignedTo: 'Tom Brown', description: '5000-hour service: engine oil, filters, hydraulic fluid replacement', estimatedDuration: 8, cost: 4500, parts: JSON.stringify(['Oil filter', 'Hydraulic filter', 'Engine oil 40L', 'Hydraulic fluid 20L']) },
      { scheduleId: 'MNT-002', equipmentId: 'EQ-003', equipmentName: 'Komatsu HD785 Haul Truck', type: 'corrective', priority: 'urgent', status: 'in-progress', scheduledDate: dateStr(0), assignedTo: 'Carlos Rivera', description: 'Brake system repair - front axle brake pads and rotors replacement', estimatedDuration: 6, cost: 12000, parts: JSON.stringify(['Brake pads (4)', 'Brake rotors (2)', 'Brake fluid 10L']) },
      { scheduleId: 'MNT-003', equipmentId: 'EQ-005', equipmentName: 'Atlas Copco D65 Drill Rig', type: 'inspection', priority: 'medium', status: 'scheduled', scheduledDate: dateStr(5), assignedTo: 'James Wilson', description: 'Quarterly safety inspection and drill string condition assessment', estimatedDuration: 4, cost: 800 },
      { scheduleId: 'MNT-004', equipmentId: 'EQ-002', equipmentName: 'Liebherr T 264 Haul Truck', type: 'preventive', priority: 'medium', status: 'completed', scheduledDate: dateStr(-3), completedDate: dateStr(-2), assignedTo: 'Tom Brown', description: 'Tire rotation and pressure check, suspension inspection', estimatedDuration: 5, actualDuration: 4.5, cost: 3200 },
      { scheduleId: 'MNT-005', equipmentId: 'EQ-007', equipmentName: 'CAT D11 Dozer', type: 'predictive', priority: 'high', status: 'scheduled', scheduledDate: dateStr(7), assignedTo: 'Elena Petrov', description: 'Undercarriage wear analysis and track tension adjustment based on sensor data', estimatedDuration: 6, cost: 8500, parts: JSON.stringify(['Track pads (12)', 'Idler wheel', 'Track adjuster seal kit']) },
      { scheduleId: 'MNT-006', equipmentId: 'EQ-004', equipmentName: 'Volvo A60H Articulated Truck', type: 'preventive', priority: 'low', status: 'scheduled', scheduledDate: dateStr(10), assignedTo: 'Carlos Rivera', description: 'Cabin air filter replacement and HVAC system check', estimatedDuration: 2, cost: 350 },
      { scheduleId: 'MNT-007', equipmentId: 'EQ-006', equipmentName: 'Sandvik TH663i Truck', type: 'corrective', priority: 'high', status: 'overdue', scheduledDate: dateStr(-5), assignedTo: 'Tom Brown', description: 'Transmission fault code P0715 - speed sensor replacement', estimatedDuration: 4, cost: 2800, parts: JSON.stringify(['Speed sensor', 'Transmission gasket', 'ATF fluid 15L']) },
      { scheduleId: 'MNT-008', equipmentId: 'EQ-001', equipmentName: 'CAT 390F Excavator', type: 'inspection', priority: 'medium', status: 'completed', scheduledDate: dateStr(-10), completedDate: dateStr(-9), assignedTo: 'James Wilson', description: 'Annual structural integrity inspection - boom and arm', estimatedDuration: 3, actualDuration: 3.5, cost: 1200 },
      { scheduleId: 'MNT-009', equipmentId: 'EQ-008', equipmentName: 'Wirtgen 220SM Surface Miner', type: 'preventive', priority: 'medium', status: 'scheduled', scheduledDate: dateStr(14), assignedTo: 'Elena Petrov', description: 'Cutting drum teeth replacement and conveyor belt inspection', estimatedDuration: 10, cost: 15000, parts: JSON.stringify(['Cutting teeth set (48)', 'Conveyor belt section 5m']) },
      { scheduleId: 'MNT-010', equipmentId: 'EQ-010', equipmentName: 'CAT 994K Wheel Loader', type: 'predictive', priority: 'low', status: 'scheduled', scheduledDate: dateStr(21), assignedTo: 'Tom Brown', description: 'Oil analysis follow-up - monitor iron particle count in hydraulic system', estimatedDuration: 2, cost: 500 }
    ]);
    console.log('Maintenance Schedules seeded (10 items)');

    // Seed Inventory Items (15 items)
    await InventoryItem.bulkCreate([
      { itemId: 'INV-001', name: 'ANFO Explosive', category: 'explosives', quantity: 2500, unit: 'kg', minStock: 5000, maxStock: 20000, location: 'Magazine A', supplier: 'Orica Mining Services', unitCost: 0.85, status: 'low-stock' },
      { itemId: 'INV-002', name: 'Diesel Fuel', category: 'fuel', quantity: 45000, unit: 'liters', minStock: 20000, maxStock: 100000, location: 'Fuel Depot', supplier: 'Shell Mining', unitCost: 1.45, lastRestocked: dateStr(-2), status: 'in-stock' },
      { itemId: 'INV-003', name: 'Hydraulic Oil ISO 46', category: 'consumables', quantity: 800, unit: 'liters', minStock: 500, maxStock: 5000, location: 'Maintenance Workshop', supplier: 'Mobil Industrial', unitCost: 4.20, status: 'in-stock' },
      { itemId: 'INV-004', name: 'Excavator Teeth', category: 'spare-parts', quantity: 24, unit: 'units', minStock: 10, maxStock: 100, location: 'Parts Warehouse', supplier: 'CAT Parts Direct', unitCost: 285, status: 'in-stock' },
      { itemId: 'INV-005', name: 'Hard Hats (Class E)', category: 'safety-equipment', quantity: 150, unit: 'units', minStock: 50, maxStock: 300, location: 'Safety Store', supplier: 'MSA Safety', unitCost: 32, status: 'in-stock' },
      { itemId: 'INV-006', name: 'Detonators (Electronic)', category: 'explosives', quantity: 500, unit: 'units', minStock: 200, maxStock: 2000, location: 'Magazine B', supplier: 'Dyno Nobel', unitCost: 12.50, expiryDate: dateStr(180), status: 'in-stock' },
      { itemId: 'INV-007', name: 'Drill Bits 165mm', category: 'tools', quantity: 3, unit: 'units', minStock: 5, maxStock: 20, location: 'Drill Shop', supplier: 'Sandvik Mining', unitCost: 4500, status: 'low-stock' },
      { itemId: 'INV-008', name: 'Conveyor Belt Rubber', category: 'spare-parts', quantity: 50, unit: 'meters', minStock: 30, maxStock: 200, location: 'Parts Warehouse', supplier: 'Continental Mining', unitCost: 180, status: 'in-stock' },
      { itemId: 'INV-009', name: 'Sodium Cyanide', category: 'chemicals', quantity: 0, unit: 'kg', minStock: 1000, maxStock: 10000, location: 'Chemical Store', supplier: 'Cyanco', unitCost: 2.80, status: 'out-of-stock' },
      { itemId: 'INV-010', name: 'Safety Goggles', category: 'safety-equipment', quantity: 200, unit: 'units', minStock: 75, maxStock: 500, location: 'Safety Store', supplier: 'MSA Safety', unitCost: 18, status: 'in-stock' },
      { itemId: 'INV-011', name: 'Engine Oil 15W-40', category: 'consumables', quantity: 1200, unit: 'liters', minStock: 800, maxStock: 5000, location: 'Maintenance Workshop', supplier: 'Shell Mining', unitCost: 3.60, status: 'in-stock' },
      { itemId: 'INV-012', name: 'Welding Rods 3.2mm', category: 'tools', quantity: 500, unit: 'units', minStock: 200, maxStock: 2000, location: 'Maintenance Workshop', supplier: 'Lincoln Electric', unitCost: 0.45, status: 'in-stock' },
      { itemId: 'INV-013', name: 'Haul Truck Tires 40.00R57', category: 'spare-parts', quantity: 2, unit: 'units', minStock: 4, maxStock: 12, location: 'Tire Bay', supplier: 'Bridgestone Mining', unitCost: 42000, status: 'low-stock' },
      { itemId: 'INV-014', name: 'Flocculant Polymer', category: 'chemicals', quantity: 3000, unit: 'kg', minStock: 1000, maxStock: 8000, location: 'Water Treatment', supplier: 'BASF Mining', unitCost: 5.20, status: 'in-stock' },
      { itemId: 'INV-015', name: 'Breathing Apparatus', category: 'safety-equipment', quantity: 15, unit: 'units', minStock: 10, maxStock: 30, location: 'Emergency Store', supplier: 'Drager Safety', unitCost: 1200, lastRestocked: dateStr(-15), status: 'in-stock' }
    ]);
    console.log('Inventory Items seeded (15 items)');

    // Seed Audit Logs (10 sample entries)
    await AuditLog.bulkCreate([
      { userId: 1, userName: 'Admin User', action: 'login', resource: 'auth', details: { ip: '192.168.1.100' } },
      { userId: 1, userName: 'Admin User', action: 'create', resource: 'equipment', resourceId: 1, details: { name: 'CAT 390F Excavator' } },
      { userId: 2, userName: 'John Operator', action: 'login', resource: 'auth', details: { ip: '192.168.1.105' } },
      { userId: 2, userName: 'John Operator', action: 'update', resource: 'production-logs', resourceId: 3, details: { field: 'tonnage', from: 8500, to: 9200 } },
      { userId: 3, userName: 'Sarah Engineer', action: 'view', resource: 'safety-incidents', resourceId: 5 },
      { userId: 1, userName: 'Admin User', action: 'export', resource: 'equipment', details: { format: 'csv', records: 15 } },
      { userId: 3, userName: 'Sarah Engineer', action: 'create', resource: 'drill-patterns', resourceId: 8, details: { blastZone: 'South Pit Bench 1' } },
      { userId: 2, userName: 'John Operator', action: 'update', resource: 'hauling', resourceId: 12, details: { field: 'status', from: 'in-transit', to: 'completed' } },
      { userId: 1, userName: 'Admin User', action: 'delete', resource: 'alerts', resourceId: 3, details: { alertId: 'ALT-OLD-001' } },
      { userId: 3, userName: 'Sarah Engineer', action: 'login', resource: 'auth', details: { ip: '192.168.1.110' } }
    ]);
    console.log('Audit Logs seeded (10 items)');

    console.log('\n✅ All seed data inserted successfully!');
    console.log('Default login: admin@miningops.com / admin123');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}

seed();
