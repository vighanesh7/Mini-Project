const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Author = sequelize.define(
  'Author',
  {
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      set(value) {
        this.setDataValue('name', typeof value === 'string' ? value.trim() : value);
      },
      validate: { notEmpty: { msg: 'Author name is required' } },
    },
    email: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: true,
      set(value) {
        this.setDataValue('email', typeof value === 'string' ? value.trim().toLowerCase() : value);
      },
      validate: {
        notEmpty: { msg: 'Email is required' },
        isEmail: { msg: 'Email must be a valid email address' },
      },
    },
    // Foreign key -> Publishers.id (the association is declared in models/index.js)
    publisherId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { isInt: { msg: 'publisherId must be an integer' } },
    },
  },
  { tableName: 'Authors' }
);

module.exports = Author;
