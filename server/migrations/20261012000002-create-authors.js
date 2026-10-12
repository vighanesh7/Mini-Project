'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Authors', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      name: { type: Sequelize.STRING(100), allowNull: false },
      email: { type: Sequelize.STRING(150), allowNull: false, unique: true },
      // One publisher -> many authors. RESTRICT = a publisher that still has
      // authors cannot be deleted.
      publisherId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Publishers', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE },
    });
    await queryInterface.addIndex('Authors', ['name'], { name: 'idx_authors_name' });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('Authors');
  },
};
