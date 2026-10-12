const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Trim text before it is validated/saved so "   " becomes "" and fails notEmpty.
const trimmed = (field) => ({
  set(value) {
    this.setDataValue(field, typeof value === 'string' ? value.trim() : value);
  },
});

const Publisher = sequelize.define(
  'Publisher',
  {
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      ...trimmed('name'),
      validate: {
        notEmpty: { msg: 'Publisher name is required' },
        len: { args: [1, 100], msg: 'Publisher name must be at most 100 characters' },
      },
    },
    country: {
      type: DataTypes.STRING(60),
      allowNull: false,
      ...trimmed('country'),
      validate: {
        notEmpty: { msg: 'Country is required' },
        len: { args: [1, 60], msg: 'Country must be at most 60 characters' },
      },
    },
  },
  { tableName: 'Publishers' }
);

module.exports = Publisher;
