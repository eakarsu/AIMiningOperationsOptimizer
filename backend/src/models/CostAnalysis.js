const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CostAnalysis = sequelize.define('CostAnalysis', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  costId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false
  },
  subcategory: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  amount: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  budgeted: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  variance: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  period: {
    type: DataTypes.STRING,
    allowNull: false
  },
  zone: {
    type: DataTypes.STRING,
    allowNull: false
  },
  costPerTon: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'recorded'
  },
  aiAnalysis: {
    type: DataTypes.JSONB,
    defaultValue: null
  }
}, {
  tableName: 'cost_analyses',
  timestamps: true
});

module.exports = CostAnalysis;
