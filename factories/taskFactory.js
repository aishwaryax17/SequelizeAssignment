// factories/taskFactory.js
const { Task } = require('../models');

const taskFactory = {
  async createOne(data = {}) {
    const defaultData = {
      id:data.id,
      title: 'Default Task',
      description: 'Default description',
      completed: false,
    };
    return await Task.createTask({ ...defaultData, ...data });
  },

  async createMany(count = 3, dataOverrides = {}) {
    const tasks = [];
    for (let i = 0; i < count; i++) {
      tasks.push(
        await taskFactory.createOne({
          title: `Task ${i + 1}`,
          ...dataOverrides,
        })
      );
    }
    return tasks;
  }
};

module.exports = taskFactory;
