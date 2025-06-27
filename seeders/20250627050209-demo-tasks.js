'use strict';
const { faker } = require('@faker-js/faker');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const users = await queryInterface.sequelize.query(
      `SELECT id FROM "Users";`
    );

    const userIds = users[0].map(user => user.id);
    const tasks = [];

    for (let i = 0; i < 20; i++) {
      tasks.push({
        title: faker.hacker.verb() + ' ' + faker.hacker.noun(),
        description: faker.lorem.sentence(),
        completed: faker.datatype.boolean(),
        priority: faker.helpers.arrayElement(['low', 'medium', 'high']),
        userId: faker.helpers.arrayElement(userIds),
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    await queryInterface.bulkInsert('Tasks', tasks, {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Tasks', null, {});
  }
};
