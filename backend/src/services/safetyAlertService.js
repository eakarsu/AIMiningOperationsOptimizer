/**
 * Safety Alert Persistence and Escalation Service
 *
 * When the AI analyzes a safety incident and detects a high-risk or critical
 * condition this service:
 *  1. Creates/upserts an Alert record in the database.
 *  2. Fires a notification — email via nodemailer if SMTP_HOST is configured,
 *     otherwise a webhook POST to SAFETY_WEBHOOK_URL.
 *
 * Environment variables:
 *   SAFETY_HIGH_RISK_KEYWORDS  — comma-separated risk keywords (default: 'Critical,High')
 *   SAFETY_WEBHOOK_URL         — webhook endpoint to POST alert data
 *   SAFETY_EMAIL_TO            — comma-separated escalation email recipients
 *   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS — nodemailer credentials
 */

const crypto = require('crypto');
require('dotenv').config({ path: require('path').resolve(__dirname, '../../../.env') });

// Lazily load models to avoid circular dependencies
function getAlert() {
  const { Alert } = require('../models');
  return Alert;
}

// ---- Risk detection ----

const HIGH_RISK_KEYWORDS = (process.env.SAFETY_HIGH_RISK_KEYWORDS || 'Critical,High,critical,high,CRITICAL,HIGH')
  .split(',').map(k => k.trim()).filter(Boolean);

function extractRiskLevel(aiResult) {
  // aiResult is { content: string, model, usage, id }
  const text = typeof aiResult === 'object' && aiResult.content ? aiResult.content : String(aiResult);
  // Look for explicit risk level mentions
  if (/\bCritical\b/i.test(text)) return 'critical';
  if (/\bHigh\b/i.test(text)) return 'high';
  if (/\bMedium\b/i.test(text)) return 'medium';
  return 'low';
}

function isHighRisk(riskLevel) {
  return ['critical', 'high'].includes(riskLevel);
}

// ---- Alert persistence ----

async function createOrUpdateAlert(incident, riskLevel, aiResult) {
  const Alert = getAlert();
  const alertId = `safety-${incident.id}-${crypto.randomBytes(4).toString('hex')}`;
  const text = typeof aiResult === 'object' && aiResult.content ? aiResult.content : String(aiResult);

  const alert = await Alert.create({
    alertId,
    title: `Safety Alert: ${incident.type || 'Incident'} in ${incident.zone || 'Unknown Zone'}`,
    type: 'safety',
    severity: riskLevel,
    status: 'active',
    message: text.substring(0, 1000), // truncate for storage
    source: `safety_incident_${incident.id}`,
    threshold: null,
    currentValue: incident.injuriesCount ?? null,
  });

  return alert;
}

// ---- Notification dispatch ----

async function sendEmailNotification(alert, incident) {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SAFETY_EMAIL_TO } = process.env;
  if (!SMTP_HOST || !SAFETY_EMAIL_TO) return;

  // Dynamically require nodemailer — it may not be installed
  let nodemailer;
  try { nodemailer = require('nodemailer'); } catch {
    console.warn('[safety alert] nodemailer not installed — skipping email notification');
    return;
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: parseInt(SMTP_PORT || '587'),
    secure: SMTP_PORT === '465',
    auth: SMTP_USER ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
  });

  const recipients = SAFETY_EMAIL_TO.split(',').map(e => e.trim()).join(', ');
  await transporter.sendMail({
    from: `"Mining Safety System" <${SMTP_USER || 'noreply@mining.local'}>`,
    to: recipients,
    subject: `[${alert.severity.toUpperCase()}] Safety Alert: ${alert.title}`,
    text: [
      `SAFETY ALERT TRIGGERED`,
      ``,
      `Alert ID:  ${alert.alertId}`,
      `Severity:  ${alert.severity.toUpperCase()}`,
      `Title:     ${alert.title}`,
      `Incident:  ${incident.incidentId} — ${incident.type}`,
      `Zone:      ${incident.zone}`,
      `Location:  ${incident.location}`,
      `Injuries:  ${incident.injuriesCount}`,
      ``,
      `AI Assessment:`,
      alert.message,
      ``,
      `Please review and take immediate action.`,
    ].join('\n'),
  });

  console.log(`[safety alert] Email sent to ${recipients} for alert ${alert.alertId}`);
}

async function sendWebhookNotification(alert, incident) {
  const { SAFETY_WEBHOOK_URL } = process.env;
  if (!SAFETY_WEBHOOK_URL) return;

  const payload = {
    event: 'safety.alert.created',
    timestamp: new Date().toISOString(),
    alert: {
      id: alert.alertId,
      severity: alert.severity,
      title: alert.title,
      message: alert.message,
      status: alert.status,
    },
    incident: {
      id: incident.id,
      incidentId: incident.incidentId,
      type: incident.type,
      zone: incident.zone,
      location: incident.location,
      injuriesCount: incident.injuriesCount,
      date: incident.date,
    },
  };

  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 10_000);
    const res = await fetch(SAFETY_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: ctrl.signal,
    });
    clearTimeout(timer);
    if (!res.ok) console.warn(`[safety alert] Webhook responded ${res.status}`);
    else console.log(`[safety alert] Webhook delivered to ${SAFETY_WEBHOOK_URL}`);
  } catch (err) {
    console.error(`[safety alert] Webhook delivery failed: ${err.message}`);
  }
}

// ---- Main entry point ----

/**
 * Called after AI analyzes a safety incident.
 * Creates an alert record if risk is high/critical and dispatches notifications.
 * Returns the alert record or null if risk is below threshold.
 */
async function persistSafetyAlert(incident, aiResult) {
  const riskLevel = extractRiskLevel(aiResult);

  if (!isHighRisk(riskLevel)) {
    console.log(`[safety alert] Incident ${incident.id} risk=${riskLevel} — below threshold, no alert created`);
    return null;
  }

  console.log(`[safety alert] High-risk incident ${incident.id} (${riskLevel}) — creating alert`);

  const alert = await createOrUpdateAlert(incident, riskLevel, aiResult);

  // Fire notifications in background — don't block the HTTP response
  Promise.allSettled([
    sendEmailNotification(alert, incident),
    sendWebhookNotification(alert, incident),
  ]).then(results => {
    results.forEach((r, i) => {
      if (r.status === 'rejected') {
        console.error(`[safety alert] Notification ${i} failed:`, r.reason?.message);
      }
    });
  });

  return alert;
}

module.exports = { persistSafetyAlert, extractRiskLevel, isHighRisk };
