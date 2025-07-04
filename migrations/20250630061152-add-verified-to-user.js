'use strict';

const { defaultValueSchemable } = require('sequelize/lib/utils');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn("Users","verfied",{
      type:Sequelize.BOOLEAN,
      defaultValue:false,
    })
        
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn("Users","verified")
    
  }
};
