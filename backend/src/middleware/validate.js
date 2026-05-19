/**
 * Lightweight input validation middleware.
 *
 * Usage:
 *   const { validate, rules } = require('../middleware/validate');
 *   router.post('/', validate(rules.oreGrade), async (req, res) => { ... });
 *
 * `validate(schema)` returns an Express middleware that checks req.body against
 * the schema object, collects errors, and responds 400 if any are found.
 * Each schema value is a validator function: (value, field) => errorString | null
 */

// ---- Primitive validators ----

function required(label) {
  return (val, field) => (val === undefined || val === null || val === '') ? `${label || field} is required` : null;
}

function isString(label) {
  return (val, field) => (val !== undefined && typeof val !== 'string') ? `${label || field} must be a string` : null;
}

function isNumber(label) {
  return (val, field) => (val !== undefined && (typeof val !== 'number' || isNaN(val))) ? `${label || field} must be a number` : null;
}

function minLength(n, label) {
  return (val, field) => (val !== undefined && typeof val === 'string' && val.trim().length < n) ? `${label || field} must be at least ${n} characters` : null;
}

function maxLength(n, label) {
  return (val, field) => (val !== undefined && typeof val === 'string' && val.length > n) ? `${label || field} must be at most ${n} characters` : null;
}

function isIn(values, label) {
  return (val, field) => (val !== undefined && !values.includes(val)) ? `${label || field} must be one of: ${values.join(', ')}` : null;
}

function isPositive(label) {
  return (val, field) => (val !== undefined && (typeof val !== 'number' || val <= 0)) ? `${label || field} must be a positive number` : null;
}

// Compose multiple validators for one field
function chain(...validators) {
  return (val, field) => {
    for (const v of validators) {
      const err = v(val, field);
      if (err) return err;
    }
    return null;
  };
}

// ---- Main middleware factory ----

/**
 * @param {Object} schema - { fieldName: validatorFn | validatorFn[] }
 */
function validate(schema) {
  return (req, res, next) => {
    const errors = [];
    for (const [field, validators] of Object.entries(schema)) {
      const fns = Array.isArray(validators) ? validators : [validators];
      for (const fn of fns) {
        const err = fn(req.body[field], field);
        if (err) { errors.push({ field, message: err }); break; }
      }
    }
    if (errors.length > 0) {
      return res.status(400).json({ error: 'Validation failed', details: errors });
    }
    next();
  };
}

// ---- Domain schemas ----

const rules = {
  oreGrade: {
    sampleId:       chain(required('sampleId'), isString()),
    location:       chain(required('location'), isString(), maxLength(255)),
    zone:           chain(required('zone'), isString(), maxLength(100)),
    depth:          chain(required('depth'), isNumber()),
    mineralType:    chain(required('mineralType'), isString(), maxLength(100)),
    gradePercentage: chain(required('gradePercentage'), isNumber()),
    tonnage:        chain(required('tonnage'), isNumber()),
  },

  drillPattern: {
    patternId:      chain(required('patternId'), isString()),
    blastZone:      chain(required('blastZone'), isString()),
    holeCount:      chain(required('holeCount'), isNumber()),
    holeDepth:      chain(required('holeDepth'), isPositive()),
    holeDiameter:   chain(required('holeDiameter'), isPositive()),
    spacing:        chain(required('spacing'), isPositive()),
    burden:         chain(required('burden'), isPositive()),
    rockType:       chain(required('rockType'), isString()),
    explosiveType:  chain(required('explosiveType'), isString()),
    explosiveAmount: chain(required('explosiveAmount'), isPositive()),
  },

  safetyIncident: {
    incidentId:    chain(required('incidentId'), isString()),
    type:          chain(required('type'), isString()),
    severity:      chain(required('severity'), isIn(['low', 'medium', 'high', 'critical'])),
    location:      chain(required('location'), isString()),
    zone:          chain(required('zone'), isString()),
    description:   chain(required('description'), isString(), minLength(10), maxLength(2000)),
    injuriesCount: chain(required('injuriesCount'), isNumber()),
    date:          chain(required('date'), isString()),
  },

  equipment: {
    equipmentId:     chain(required('equipmentId'), isString()),
    name:            chain(required('name'), isString()),
    type:            chain(required('type'), isString()),
    manufacturer:    isString(),
    model:           isString(),
    status:          chain(required('status'), isIn(['operational', 'maintenance', 'idle', 'offline'])),
    hoursOperated:   isNumber(),
    fuelConsumption: isNumber(),
    utilizationRate: isNumber(),
  },

  environmentalCompliance: {
    reportId:        chain(required('reportId'), isString()),
    category:        chain(required('category'), isString()),
    parameter:       chain(required('parameter'), isString()),
    measuredValue:   chain(required('measuredValue'), isNumber()),
    regulatoryLimit: chain(required('regulatoryLimit'), isNumber()),
    location:        chain(required('location'), isString()),
    monitoringDate:  chain(required('monitoringDate'), isString()),
    complianceStatus: chain(required('complianceStatus'), isIn(['compliant', 'non_compliant', 'warning'])),
    unit:            chain(required('unit'), isString()),
  },

  productionLog: {
    logId:             chain(required('logId'), isString()),
    shift:             chain(required('shift'), isIn(['day', 'night', 'afternoon'])),
    date:              chain(required('date'), isString()),
    zone:              chain(required('zone'), isString()),
    materialType:      chain(required('materialType'), isString()),
    tonnageMined:      chain(required('tonnageMined'), isNumber()),
    tonnageProcessed:  chain(required('tonnageProcessed'), isNumber()),
    recoveryRate:      isNumber(),
    downtime:          isNumber(),
    operatorCount:     isNumber(),
  },

  workforce: {
    workerId:        chain(required('workerId'), isString()),
    name:            chain(required('name'), isString()),
    role:            chain(required('role'), isString()),
    department:      chain(required('department'), isString()),
    shift:           chain(required('shift'), isIn(['day', 'night', 'afternoon'])),
    status:          isIn(['active', 'on_leave', 'inactive']),
  },

  costAnalysis: {
    costId:    chain(required('costId'), isString()),
    category:  chain(required('category'), isString()),
    amount:    chain(required('amount'), isNumber()),
    period:    chain(required('period'), isString()),
    zone:      chain(required('zone'), isString()),
  },

  geologyMap: {
    surveyId:    chain(required('surveyId'), isString()),
    surveyType:  chain(required('surveyType'), isString()),
    location:    chain(required('location'), isString()),
    zone:        chain(required('zone'), isString()),
    rockFormation: chain(required('rockFormation'), isString()),
    dominantMineral: chain(required('dominantMineral'), isString()),
  },

  haulingLogistic: {
    tripId:      chain(required('tripId'), isString()),
    truckId:     chain(required('truckId'), isString()),
    driver:      chain(required('driver'), isString()),
    origin:      chain(required('origin'), isString()),
    destination: chain(required('destination'), isString()),
    materialType: chain(required('materialType'), isString()),
    loadWeight:  chain(required('loadWeight'), isPositive()),
    distance:    chain(required('distance'), isPositive()),
  },

  auth: {
    email:    chain(required('email'), isString(), minLength(3), maxLength(254)),
    password: chain(required('password'), isString(), minLength(6), maxLength(128)),
  },
};

module.exports = { validate, rules, required, isString, isNumber, isIn, isPositive, minLength, maxLength, chain };
