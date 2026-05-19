const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
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
const aiRoutes = require('./routes/ai');

const app = express();
const PORT = process.env.BACKEND_PORT || 3001;

// Security middleware
app.use(helmet());

// CORS — restrict to allowed origins
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : ['http://localhost:3000', 'http://localhost:5173'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // server-to-server / curl
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
}));

// Global rate limiter
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later' },
});

// Strict rate limiter for AI endpoints (expensive OpenRouter calls)
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'AI rate limit exceeded: max 10 requests per 15 minutes' },
});

app.use('/api/', globalLimiter);

// Apply AI rate limiter to all analyze/predict endpoints
app.use('/api/ore-grades/:id/predict', aiLimiter);
app.use('/api/drill-patterns/:id/analyze', aiLimiter);
app.use('/api/safety-incidents/:id/analyze', aiLimiter);
app.use('/api/equipment/:id/analyze', aiLimiter);
app.use('/api/environmental/:id/analyze', aiLimiter);
app.use('/api/production-logs/:id/analyze', aiLimiter);
app.use('/api/workforce/:id/analyze', aiLimiter);
app.use('/api/cost-analysis/:id/analyze', aiLimiter);
app.use('/api/geology-maps/:id/analyze', aiLimiter);
app.use('/api/hauling/:id/analyze', aiLimiter);
app.use('/api/analytics/yield-forecast', aiLimiter);
app.use('/api/ai', aiLimiter);

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
app.use('/api/ai', aiRoutes);

// Custom Views (Mining Views) — mounted before any 404 handler
app.use('/api/custom-views', require('./routes/customViews'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
async function start() {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully');

    // Create ai_analyses table if it doesn't exist (safe idempotent migration)
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS ai_analyses (
        id SERIAL PRIMARY KEY,
        entity_type VARCHAR(50),
        entity_id INTEGER,
        user_id INTEGER,
        result JSONB,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('ai_analyses table ensured');

    const isProd = process.env.NODE_ENV === 'production';
    if (isProd) {
      // In production never auto-alter the schema — run migrations instead.
      // We only verify connectivity (authenticate above) and start listening.
      console.log('Production mode: skipping sequelize.sync() — use migrations.');
    } else {
      // Development/staging: sync schema (alter=false to avoid data loss)
      await sequelize.sync({ alter: false });
      console.log('Database synced (development mode)');
    }

    app.listen(PORT, () => {
      console.log(`Backend server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();

// === BATCH 05 AUTO-MOUNT (custom feature suggestions) ===
app.use('/api/mining-planner-agent', require('./routes/mining-planner-agent'));
app.use('/api/safety-anomaly-stream', require('./routes/safety-anomaly-stream'));
app.use('/api/equipment-maintenance-autonomous', require('./routes/equipment-maintenance-autonomous'));
app.use('/api/env-compliance-multimodal', require('./routes/env-compliance-multimodal'));
app.use('/api/mine-to-mill-agent', require('./routes/mine-to-mill-agent'));

// === Batch 05 Gaps & Frontend Mounts ===
try { const _gap_ai_blast_pattern_optimizer = require('./routes/gap-ai-blast-pattern-optimizer'); app.use('/api/gap-ai-blast-pattern-optimizer', _gap_ai_blast_pattern_optimizer); } catch(e) { console.error('gap mount fail ai-blast-pattern-optimizer:', e.message); }
try { const _gap_ai_water_balance_forecaster = require('./routes/gap-ai-water-balance-forecaster'); app.use('/api/gap-ai-water-balance-forecaster', _gap_ai_water_balance_forecaster); } catch(e) { console.error('gap mount fail ai-water-balance-forecaster:', e.message); }
try { const _gap_ai_labor_fatigue_predictor = require('./routes/gap-ai-labor-fatigue-predictor'); app.use('/api/gap-ai-labor-fatigue-predictor', _gap_ai_labor_fatigue_predictor); } catch(e) { console.error('gap mount fail ai-labor-fatigue-predictor:', e.message); }
try { const _gap_ai_commodity_price_impact = require('./routes/gap-ai-commodity-price-impact'); app.use('/api/gap-ai-commodity-price-impact', _gap_ai_commodity_price_impact); } catch(e) { console.error('gap mount fail ai-commodity-price-impact:', e.message); }
try { const _gap_real_time = require('./routes/gap-real-time'); app.use('/api/gap-real-time', _gap_real_time); } catch(e) { console.error('gap mount fail real-time:', e.message); }
try { const _gap_lab = require('./routes/gap-lab'); app.use('/api/gap-lab', _gap_lab); } catch(e) { console.error('gap mount fail lab:', e.message); }
try { const _gap_webhooks = require('./routes/gap-webhooks'); app.use('/api/gap-webhooks', _gap_webhooks); } catch(e) { console.error('gap mount fail webhooks:', e.message); }
try { const _gap_native = require('./routes/gap-native'); app.use('/api/gap-native', _gap_native); } catch(e) { console.error('gap mount fail native:', e.message); }
try { const _gap_mobile = require('./routes/gap-mobile'); app.use('/api/gap-mobile', _gap_mobile); } catch(e) { console.error('gap mount fail mobile:', e.message); }
try { const _gap_operator = require('./routes/gap-operator'); app.use('/api/gap-operator', _gap_operator); } catch(e) { console.error('gap mount fail operator:', e.message); }
// === End Batch 05 Mounts ===
