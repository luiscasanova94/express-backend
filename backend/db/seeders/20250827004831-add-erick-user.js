'use strict';
const bcrypt = require('bcryptjs');

module.exports = {
  async up (queryInterface, Sequelize) {
    const hashedPassword = await bcrypt.hash('540Mega$__', 10);
    
    await queryInterface.bulkInsert('Users', [{
      email: 'erick@clipping.io',
      username: 'erick',
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date()
    }], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Users', { email: 'erick@clipping.io' }, {});
  }
};