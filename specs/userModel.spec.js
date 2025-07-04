const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised.default);
const { expect } = chai;
const { User, sequelize, Task } = require('../models');
const userFactory = require('../factories/userFactory');
const taskFactory = require('../factories/taskFactory');
const jwt = require('jsonwebtoken');
const sinon = require('sinon');
const bcrypt = require('bcrypt');
const { emailQueue } = require('../jobs/emailQueue');
const { afterEach } = require('mocha');
describe('User Model Suite', () => {
  before(async () => {
    await sequelize.sync({ force: true });
     // Prevents real email sending // Recreate test DB schema
  });

  beforeEach(async () => {
    await userFactory.createOne({
      id: 123,
      email:"bob@example.com",
    })
    await userFactory.createOne({
      id: 124,
      email:"asi@gmail.com",
    })
    sinon.stub(emailQueue, 'add').resolves();
  });
  afterEach(async() => {
    await Task.destroy({ where: {}, truncate: true, cascade: true });
    await User.destroy({ where: {}, truncate: true, cascade: true });
    sinon.restore(); // Restore all stubs after all tests
  });

  it('should register a new user', async () => {
    const userData = {
      name: 'Alice',
      email: 'alice@example.com',
      password: 'securepass123',
      age: 22,
    };

    const user = await User.registerUser(userData);
    expect(user).to.exist;
    expect(user.email).to.equal('alice@example.com');
    expect(user.verified).to.be.false;
  });

  it('should not allow duplicate email registration', async () => {
    const userData = {
      name: 'Bob',
      email: 'bob@example.com',
      password: 'securepass',
      age: 30
    };
    await expect(User.registerUser(userData)).to.be.rejectedWith('Email already exists');
  });

  it('should verify user using token', async () => {
     
    const token = jwt.sign({ id: 123 }, process.env.SECRET_KEY, { expiresIn: '15m' });
    const verifiedUser = await User.verifyUserByToken(token);
    expect(verifiedUser.verified).to.be.true;
  });
  it('should verify user using token -user not found', async () => {
    const token = jwt.sign({ id: 123 }, process.env.SECRET_KEY, { expiresIn: '15m' });
    await User.destroy({where:{id:123}});
    await expect(User.verifyUserByToken(token)).to.be.rejectedWith("User not found");
  });


  it('should login user after verification', async () => {
    const user = await User.registerUser({
      name: 'Dan',
      email: 'dan@example.com',
      password: 'testpass',
      age: 35
    });

    await User.verifyUserByToken(jwt.sign({ id: user.id }, process.env.SECRET_KEY));

    const loginResult = await User.loginUser(user.email, 'testpass');
    expect(loginResult.accessToken).to.exist;
    expect(loginResult.refreshToken).to.exist;
  });

  it('should not login unverified user', async () => {
    const user = await User.registerUser({
      name: 'Eve',
      email: 'eve@example.com',
      password: 'pass123',
      age: 27
    });

    await expect(User.loginUser(user.email, 'pass123')).to.be.rejectedWith('Please verify your email first');
  });

  it('should throw on invalid credentials', async () => {
    await expect(User.loginUser('not@found.com', 'wrong')).to.be.rejectedWith('User not found');
  });

  it('should update user details', async () => {
   
    const updated = await User.updateUser(123, { name: 'John Updated' });
    expect(updated.name).to.equal('John Updated');
  });

  it('should delete user by ID', async () => {
   
    const result = await User.deleteUser(123);
    expect(result).to.equal(1);
    const deleted = await User.findByPk(123);
    expect(deleted).to.be.null;
  });

  it('should get user tasks using getUserTasks', async () => {
    
    await Task.create({ title: 'task 1', userId: 123 });
    const tasks = await User.getUserTasks(123);
    expect(tasks.length).to.equal(1);
    expect(tasks[0].title).to.equal('task 1');
  });

  it('should generate new access token from refresh token', async () => {
    
    const refreshToken = jwt.sign({ id:123, email: "bob@example.com" }, process.env.REFRESH_TOKEN_SECRET);
    const result = await User.refreshAccessToken(refreshToken);
    expect(result.accessToken).to.exist;
  });
  it('should return all users in the database', async () => {
    

    const users = await User.getAllUsers();

    expect(users).to.be.an('array');
    expect(users.length).to.equal(2);
    const emails = users.map(u => u.email);
    expect(emails).to.include('asi@gmail.com');
    expect(emails).to.include('bob@example.com');
  });

 
});
describe('User Model Suite - Empty DB', () => {
  beforeEach(async () => {
    await Task.destroy({ where: {}, truncate: true, cascade: true });
    await User.destroy({ where: {}, truncate: true, cascade: true });
  });

  it('should return an empty array if no users exist', async () => {
    const users = await User.getAllUsers();
    expect(users).to.be.an('array').that.is.empty;
  });
});


describe('User.refreshAccessToken() with stubbed JWT', () => {
  let user;
  let verifyStub, signStub;

  beforeEach(async () => {
    await sequelize.sync({ force: true });
    user = await User.create({
      id: 123,
      name: 'Test User',
      email: 'test@example.com',
      password: 'secret',
      verified: true,
    });
  });

  afterEach(async () => {
    sinon.restore(); // restore stubs after each test

    await Task.destroy({ where: {}, truncate: true, cascade: true });
    await User.destroy({ where: {}, truncate: true, cascade: true });
  });

  it('should throw 401 if no token is provided', async () => {
    try {
      await User.refreshAccessToken();
    } catch (err) {
      expect(err.status).to.equal(401);
      expect(err.message).to.equal('Refresh token required');
    }
  });

  it('should throw 403 on invalid token', async () => {
    verifyStub = sinon.stub(jwt, 'verify').throws({ name: 'JsonWebTokenError' });

    try {
      await User.refreshAccessToken('fake.token.invalid');
    } catch (err) {
      expect(err.status).to.equal(403);
      expect(err.message).to.equal('Invalid refresh token');
    }
  });

  it('should throw 403 on expired token', async () => {
    verifyStub = sinon.stub(jwt, 'verify').throws({ name: 'TokenExpiredError' });

    try {
      await User.refreshAccessToken('expired.token');
    } catch (err) {
      expect(err.status).to.equal(403);
      expect(err.message).to.equal('Refresh token expired');
    }
  });

  it('should throw 404 if user is not found', async () => {
    verifyStub = sinon.stub(jwt, 'verify').returns({ id: 9999 }); // non-existent user

    try {
      await User.refreshAccessToken('valid.token');
    } catch (err) {
      expect(err.status).to.equal(404);
      expect(err.message).to.equal('User not found');
    }
  });

  it('should throw 403 if user is not verified', async () => {
    const unverified = await User.create({

      name: 'Unverified',
      email: 'nope@example.com',
      password: 'abc',
      verified: false,
    });

    verifyStub = sinon.stub(jwt, 'verify').returns({ id: unverified.id });

    try {
      await User.refreshAccessToken('valid.token');
    } catch (err) {
      expect(err.status).to.equal(403);
      expect(err.message).to.equal('Email not verified');
    }
  });

  it('should return a new access token when everything is valid', async () => {
    verifyStub = sinon.stub(jwt, 'verify').returns({ id: 123, email: user.email });
    signStub = sinon.stub(jwt, 'sign').returns('new.access.token');

    const result = await User.refreshAccessToken('valid.token');
    expect(result).to.deep.equal({ accessToken: 'new.access.token' });
  });
});

describe('User.getUserById()', () => {

  let testUser;

  before(async () => {
    await sequelize.sync({ force: true });
  });

  beforeEach(async () => {
    // You can also use `await userFactory.createOne()` if you have a factory
    testUser = await User.create({
      name: 'Alice',
      email: 'alice@example.com',
      password: 'password123',
      verified: true
    });
  });

  afterEach(async () => {
    await User.destroy({ where: {}, truncate: true, cascade: true });
  });

  it('should return the user when ID is valid', async () => {
    const user = await User.getUserById(testUser.id);
    expect(user).to.exist;
    expect(user.email).to.equal('alice@example.com');
    expect(user.name).to.equal('Alice');
  });

  it('should throw an error if user is not found', async () => {
    try {
      await User.getUserById(9999); // Non-existent ID
      throw new Error('Expected error was not thrown');
    } catch (err) {
      expect(err).to.be.an('Error');
      expect(err.message).to.equal('user does not exist');
    }
  });

});
describe('User Model Error Handling', () => {
  before(async () => {
    await sequelize.sync({ force: true });
  });

  it('deleteUser() should throw if user not found', async () => {
    try {
      await User.deleteUser(12345);
      throw new Error('Expected error was not thrown');
    } catch (err) {
      expect(err.message).to.equal('user does not exist');
    }
  });

  it('getUserTasks() should throw if user not found', async () => {
    try {
      await User.getUserTasks(54321);
      throw new Error('Expected error was not thrown');
    } catch (err) {
      expect(err.message).to.equal('User not found');
    }
  });
});

describe('User Model - Error Handling Cases', () => {
  before(async () => {
    await sequelize.sync({ force: true });
  });

  describe('User.updateUser()', () => {
    it('should throw "Update failed" if user does not exist', async () => {
      try {
        await User.updateUser(9999, { name: 'Ghost' });
        throw new Error('Expected error was not thrown');
      } catch (err) {
        expect(err).to.be.an('Error');
        expect(err.message).to.equal('Update failed');
      }
    });
  });

  describe('User.loginUser()', () => {
    let user;

    before(async () => {
      // Create a verified user with a known password
      const hashedPassword = await bcrypt.hash('correctpass', 10);
      user = await User.create({
        name: 'Aishu',
        email: 'aishu@example.com',
        password: hashedPassword,
        verified: true
      });
    });

    it('should throw 401 error for incorrect password', async () => {
      try {
        await User.loginUser(user.email, 'wrongpass');
        throw new Error('Expected error was not thrown');
      } catch (err) {
        expect(err).to.have.property('status', 401);
        expect(err.message).to.equal('Incorrect password');
      }
    });
  });
});