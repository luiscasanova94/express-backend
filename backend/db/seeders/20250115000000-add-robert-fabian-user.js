'use strict';
const bcrypt = require('bcryptjs');

module.exports = {
  async up (queryInterface, Sequelize) {
    const hashedPassword = await bcrypt.hash('DataAxleMVPTest$1', 10);
    
    await queryInterface.bulkInsert('Users', [{
      email: 'robert.fabian@data-axle.com',
      username: 'robert.fabian@data-axle.com',
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date()
    }], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Users', { email: 'robert.fabian@data-axle.com' }, {});
  }
};
