const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const InventoryItem = sequelize.define('InventoryItem', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  itemId: { type: DataTypes.STRING, unique: true, allowNull: false },
  name: { type: DataTypes.STRING, allowNull: false },
  category: { type: DataTypes.STRING, allowNull: false },
  quantity: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
  unit: { type: DataTypes.STRING, allowNull: false },
  minStock: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
  maxStock: { type: DataTypes.FLOAT, allowNull: true },
  location: { type: DataTypes.STRING, allowNull: false },
  supplier: { type: DataTypes.STRING, allowNull: true },
  unitCost: { type: DataTypes.FLOAT, allowNull: true },
  lastRestocked: { type: DataTypes.DATE, allowNull: true },
  expiryDate: { type: DataTypes.DATE, allowNull: true },
  status: { type: DataTypes.STRING, defaultValue: 'in-stock' },
  notes: { type: DataTypes.TEXT, allowNull: true }
}, { tableName: 'inventory_items', timestamps: true });

module.exports = InventoryItem;
