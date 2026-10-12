// Loads every model and declares ALL associations in one place.
const sequelize = require('../config/database');
const Publisher = require('./Publisher');
const Author = require('./Author');
const Book = require('./Book');
const AuthorBook = require('./AuthorBook');

// ---- One-to-many: Publisher 1 --- M Author ----
Publisher.hasMany(Author, { foreignKey: 'publisherId', as: 'authors', onDelete: 'RESTRICT' });
Author.belongsTo(Publisher, { foreignKey: 'publisherId', as: 'publisher' });

// ---- Many-to-many: Author M --- N Book (through AuthorBooks) ----
Author.belongsToMany(Book, {
  through: AuthorBook,
  as: 'books',
  foreignKey: 'AuthorId',
  otherKey: 'BookId',
});
Book.belongsToMany(Author, {
  through: AuthorBook,
  as: 'authors',
  foreignKey: 'BookId',
  otherKey: 'AuthorId',
});

module.exports = { sequelize, Publisher, Author, Book, AuthorBook };
