const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ShiftSchedule = sequelize.define('ShiftSchedule', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  scheduleId: { type: DataTypes.STRING, unique: true, allowNull: false },
  workerName: { type: DataTypes.STRING, allowNull: false },
  workerId: { type: DataTypes.STRING, allowNull: false },
  shift: { type: DataTypes.STRING, allowNull: false },
  date: { type: DataTypes.DATEONLY, allowNull: false },
  startTime: { type: DataTypes.STRING, allowNull: false },
  endTime: { type: DataTypes.STRING, allowNull: false },
  location: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.STRING, allowNull: false },
  status: { type: DataTypes.STRING, defaultValue: 'scheduled' },
  notes: { type: DataTypes.TEXT, allowNull: true }
}, { tableName: 'shift_schedules', timestamps: true });

module.exports = ShiftSchedule;
