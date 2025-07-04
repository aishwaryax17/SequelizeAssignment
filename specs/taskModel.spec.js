const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised.default);

const { expect } = chai;
const { Task, User, sequelize } = require('../models');
const taskFactory = require('../factories/taskFactory');
const userFactory = require('../factories/userFactory');

describe('Task Model Suite', () => {
  let tasks;
  let user;

  beforeEach(async () => {
  await sequelize.sync({ force: true }); // Reset DB before each test
  user = await userFactory.createOne({
    id:123,
  });
  tasks = await Promise.all([
    taskFactory.createOne({ title: 'Task 1', userId: 123 }),
    taskFactory.createOne({ title: 'Task 2', userId: user.id }),
  ]);
});

  afterEach(async () => {
    await Task.destroy({ where: {}, truncate: true, cascade: true });
    await User.destroy({ where: {}, truncate: true, cascade: true });
  });

  it('should create tasks using factory method', async () => {
    expect(tasks[0]).to.exist;
    expect(tasks[0].title).to.equal('Task 1');
    expect(tasks[1].title).to.equal('Task 2');
  });

  it('should get all tasks', async () => {
    const allTasks = await Task.getAllTasks();
    expect(allTasks).to.have.lengthOf(2);
    expect(allTasks.map(t => t.title)).to.include('Task 1');
    expect(allTasks.map(t => t.title)).to.include('Task 2');
  });

  it('should update a task by id', async () => {
    const updated = await Task.updateTask(tasks[0].id, { title: 'Updated Title' });
    expect(updated.title).to.equal('Updated Title');
  });

  it('should delete a task by id', async () => {
    const result = await Task.deleteTask(tasks[0].id);
    expect(result).to.equal(1);
    const check = await Task.findByPk(tasks[0].id);
    expect(check).to.be.null;
  });

 

  it('should get task by id', async () => {
    const found = await Task.getTaskById(tasks[0].id);
    expect(found).to.exist;
    expect(found.title).to.equal('Task 1');
  });

  it('should throw error if task not found', async () => {
    const invalidId = 9999;
    await expect(Task.getTaskById(invalidId)).to.be.rejectedWith("task does not exist");
  });
  it('should throw error if updating a non-existent task', async () => {
  const invalidId = 9999;
  await expect(Task.updateTask(invalidId, { title: 'Does not matter' }))
    .to.be.rejectedWith("task does not exist");
});

it('should throw error if deleting a non-existent task', async () => {
  const invalidId = 9999;
  await expect(Task.deleteTask(invalidId))
    .to.be.rejectedWith("task does not exist");
});

it('should throw error if getting user for a non-existent task', async () => {
  const invalidId = 9999;
  await expect(Task.getUser(invalidId))
    .to.be.rejectedWith("Task not found");
});
});

describe('Task.getUser Sequelize Method', () => {
  let user, task;

  beforeEach(async () => {
    await sequelize.sync({ force: true });
    user = await userFactory.createOne();
    task = await taskFactory.createOne({ userId: user.id });
  });

  afterEach(async () => {
    await Task.destroy({ where: {}, truncate: true, cascade: true });
    await User.destroy({ where: {}, truncate: true, cascade: true });
  });

  it('should return the associated user for a valid task', async () => {
    const associatedUser = await Task.getUser(task.id);
    expect(associatedUser).to.exist;
    expect(associatedUser.id).to.equal(user.id);
    expect(associatedUser.email).to.equal(user.email);
  });

  it('should throw error if task does not exist', async () => {
    const invalidId = 9999;
    await expect(Task.getUser(invalidId)).to.be.rejectedWith('Task not found');
  });
});