const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const GeologyMap = sequelize.define('GeologyMap', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  surveyId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  surveyType: {
    type: DataTypes.STRING,
    allowNull: false
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false
  },
  zone: {
    type: DataTypes.STRING,
    allowNull: false
  },
  rockFormation: {
    type: DataTypes.STRING,
    allowNull: false
  },
  dominantMineral: {
    type: DataTypes.STRING,
    allowNull: false
  },
  structuralFeature: {
    type: DataTypes.STRING,
    allowNull: false
  },
  strikeAngle: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  dipAngle: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  depthRange: {
    type: DataTypes.STRING,
    allowNull: false
  },
  surveyDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  geologist: {
    type: DataTypes.STRING,
    allowNull: false
  },
  confidence: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  notes: {
    type: DataTypes.TEXT,
    defaultValue: null
  },
  aiInterpretation: {
    type: DataTypes.JSONB,
    defaultValue: null
  }
}, {
  tableName: 'geology_maps',
  timestamps: true
});

module.exports = GeologyMap;
