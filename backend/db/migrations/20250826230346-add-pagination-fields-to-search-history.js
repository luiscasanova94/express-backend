'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('SearchHistories', 'sort', {
      type: Sequelize.JSON,
      allowNull: true,
    });
    await queryInterface.addColumn('SearchHistories', 'offset', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
    await queryInterface.addColumn('SearchHistories', 'page', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
    await queryInterface.addColumn('SearchHistories', 'count', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('SearchHistories', 'sort');
    await queryInterface.removeColumn('SearchHistories', 'offset');
    await queryInterface.removeColumn('SearchHistories', 'page');
    await queryInterface.removeColumn('SearchHistories', 'count');
  }
};