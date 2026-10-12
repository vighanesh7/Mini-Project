'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Books', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      title: { type: Sequelize.STRING(200), allowNull: false },
      isbn: { type: Sequelize.STRING(20), allowNull: false, unique: true },
      genre: { type: Sequelize.STRING(60), allowNull: false },
      // DECIMAL (fixed precision) instead of FLOAT so money is stored exactly.
      price: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      stock: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE },
    });

    await queryInterface.addIndex('Books', ['title'], { name: 'idx_books_title' });
    await queryInterface.addIndex('Books', ['genre'], { name: 'idx_books_genre' });

    // Database-level CHECK constraints (enforced by MySQL 8.0.16+).
    await queryInterface.sequelize.query(
      'ALTER TABLE Books ADD CONSTRAINT chk_books_stock_non_negative CHECK (stock >= 0)'
    );
    await queryInterface.sequelize.query(
      'ALTER TABLE Books ADD CONSTRAINT chk_books_price_non_negative CHECK (price >= 0)'
    );
  },

  async down(queryInterface) {
    await queryInterface.dropTable('Books');
  },
};
