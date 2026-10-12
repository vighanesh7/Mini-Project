const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Book = sequelize.define(
  'Book',
  {
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
      set(value) {
        this.setDataValue('title', typeof value === 'string' ? value.trim() : value);
      },
      validate: { notEmpty: { msg: 'Title is required' } },
    },
    isbn: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
      set(value) {
        this.setDataValue('isbn', typeof value === 'string' ? value.trim() : value);
      },
      validate: { notEmpty: { msg: 'ISBN is required' } },
    },
    genre: {
      type: DataTypes.STRING(60),
      allowNull: false,
      set(value) {
        this.setDataValue('genre', typeof value === 'string' ? value.trim() : value);
      },
      validate: { notEmpty: { msg: 'Genre is required' } },
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: { min: { args: [0], msg: 'Price cannot be negative' } },
      // MySQL returns DECIMAL as a string ("12.50"); give the API a real number.
      get() {
        const value = this.getDataValue('price');
        return value === null || value === undefined ? value : Number(value);
      },
    },
    stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        isInt: { msg: 'Stock must be a whole number' },
        min: { args: [0], msg: 'Stock cannot be negative' },
      },
    },
  },
  { tableName: 'Books' }
);

module.exports = Book;
