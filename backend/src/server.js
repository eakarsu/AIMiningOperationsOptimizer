const express = require('express');
const cors = require('cors');
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const sequelize = require('./config/database');

const authRoutes = require('./routes/auth');
const oreGradeRoutes = require('./routes/oreGrades');
const drillPatternRoutes = require('./routes/drillPatterns');
const safetyIncidentRoutes = require('./routes/safetyIncidents');
const equipmentRoutes = require('./routes/equipment');
const environmentalRoutes = require('./routes/environmentalCompliance');
const productionLogRoutes = require('./routes/productionLogs');
const workforceRoutes = require('./routes/workforce');
const costAnalysisRoutes = require('./routes/costAnalysis');
const geologyMapRoutes = require('./routes/geologyMaps');
const haulingRoutes = require('./routes/haulingLogistics');
const auditLogRoutes = require('./routes/auditLog');
const alertRoutes = require('./routes/alerts');
const shiftScheduleRoutes = require('./routes/shiftSchedule');
const maintenanceRoutes = require('./routes/maintenanceSchedule');
const inventoryRoutes = require('./routes/inventory');
const userManagementRoutes = require('./routes/userManagement');
const analyticsRoutes = require('./routes/analytics');
const exportRoutes = require('./routes/exportData');
const searchRoutes = require('./routes/search');
const reportsRoutes = require('./routes/reports');

const app = express();
const PORT = process.env.BACKEND_PORT || 3001;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/ore-grades', oreGradeRoutes);
app.use('/api/drill-patterns', drillPatternRoutes);
app.use('/api/safety-incidents', safetyIncidentRoutes);
app.use('/api/equipment', equipmentRoutes);
app.use('/api/environmental', environmentalRoutes);
app.use('/api/production-logs', productionLogRoutes);
app.use('/api/workforce', workforceRoutes);
app.use('/api/cost-analysis', costAnalysisRoutes);
app.use('/api/geology-maps', geologyMapRoutes);
app.use('/api/hauling', haulingRoutes);
app.use('/api/audit-logs', auditLogRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/shift-schedules', shiftScheduleRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/users', userManagementRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/reports', reportsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
async function start() {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully');
    await sequelize.sync();
    app.listen(PORT, () => {
      console.log(`Backend server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();
