const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Equipment = sequelize.define('Equipment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  equipmentId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false
  },
  manufacturer: {
    type: DataTypes.STRING,
    allowNull: false
  },
  model: {
    type: DataTypes.STRING,
    allowNull: false
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'operational'
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false
  },
  hoursOperated: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  fuelConsumption: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  maintenanceDue: {
    type: DataTypes.DATE,
    allowNull: true
  },
  lastMaintenance: {
    type: DataTypes.DATE,
    allowNull: true
  },
  utilizationRate: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  aiRecommendation: {
    type: DataTypes.JSONB,
    defaultValue: null
  }
}, {
  tableName: 'equipment',
  timestamps: true
});

module.exports = Equipment;
