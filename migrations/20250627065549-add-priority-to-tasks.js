'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Tasks', 'priority', {
      type: Sequelize.STRING,
      allowNull: true, // or false if you want to enforce it
    });
  },

  async down(queryInterface, Sequelize) {

    await queryInterface.removeColumn('Tasks', 'priority');
  }
};
