const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const HaulingLogistic = sequelize.define('HaulingLogistic', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  tripId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  truckId: {
    type: DataTypes.STRING,
    allowNull: false
  },
  driver: {
    type: DataTypes.STRING,
    allowNull: false
  },
  origin: {
    type: DataTypes.STRING,
    allowNull: false
  },
  destination: {
    type: DataTypes.STRING,
    allowNull: false
  },
  materialType: {
    type: DataTypes.STRING,
    allowNull: false
  },
  loadWeight: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  distance: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  tripDuration: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  fuelUsed: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  shift: {
    type: DataTypes.STRING,
    allowNull: false
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'completed'
  },
  aiOptimization: {
    type: DataTypes.JSONB,
    defaultValue: null
  }
}, {
  tableName: 'hauling_logistics',
  timestamps: true
});

module.exports = HaulingLogistic;
