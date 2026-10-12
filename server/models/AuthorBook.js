const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Junction ("through") model for Author <-> Book (many-to-many).
// AuthorId + BookId together form the primary key, so a pair can exist only once.
const AuthorBook = sequelize.define(
  'AuthorBook',
  {
    AuthorId: { type: DataTypes.INTEGER, primaryKey: true, allowNull: false },
    BookId: { type: DataTypes.INTEGER, primaryKey: true, allowNull: false },
  },
  { tableName: 'AuthorBooks' }
);

module.exports = AuthorBook;
