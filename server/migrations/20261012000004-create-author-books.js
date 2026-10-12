'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Junction table for the many-to-many Author <-> Book relationship.
    // The composite primary key (AuthorId, BookId) stops the same author being
    // linked to the same book twice.
    await queryInterface.createTable('AuthorBooks', {
      AuthorId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: { model: 'Authors', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      BookId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: { model: 'Books', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE },
    });
    await queryInterface.addIndex('AuthorBooks', ['BookId'], { name: 'idx_authorbooks_book' });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('AuthorBooks');
  },
};
