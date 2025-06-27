'use strict';
const { faker } = require('@faker-js/faker');
const bcrypt = require('bcrypt');


/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const users = [];

    for (let i = 0; i < 10; i++) {
      const rawPassword = faker.internet.password();
      const hashedPassword = await bcrypt.hash(rawPassword, 10);

      users.push({
        name: faker.person.fullName(),
        email: faker.internet.email(),
        password: hashedPassword,
        age: faker.number.int({ min: 18, max: 60 }),
        createdAt: new Date(),
        updatedAt: new Date(),

      });
    }

    await queryInterface.bulkInsert('Users', users, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Users', null, {});
  }
};
