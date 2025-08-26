'use strict';
const bcrypt = require('bcryptjs');

module.exports = {
  async up (queryInterface, Sequelize) {
    const hashedPassword = await bcrypt.hash('540Mega$__', 10);
    
    await queryInterface.bulkInsert('Users', [{
      email: 'luis.casanova@cheaterbuster.net',
      username: 'luis',
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date()
    }], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Users', { email: 'luis.casanova@cheaterbuster.net' }, {});
  }
};