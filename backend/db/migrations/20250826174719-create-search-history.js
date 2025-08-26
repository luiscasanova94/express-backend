'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('SearchHistories', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      date: {
        type: Sequelize.DATE
      },
      keyword: {
        type: Sequelize.STRING
      },
      type: {
        type: Sequelize.ENUM('phone', 'email', 'name', 'address')
      },
      resultType: {
        type: Sequelize.ENUM('set', 'single', 'empty')
      },
      state: {
        type: Sequelize.ENUM('active', 'archived'),
        defaultValue: 'active'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('SearchHistories');
  }
};