const EventEmitter = require('events');
class UserEmitter extends EventEmitter {}
const userEmitter = new UserEmitter();



module.exports = (sequelize, DataTypes) => {
    console.log("inside user model");
    const User = sequelize.define('User', {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        email: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        }
    });

    // create a new user
    User.createUser = async function (data) {
        if (!data.email.includes('@')) throw new Error("invalid email");
        const newUser= await this.create(data);
        userEmitter.emit('userCreated', newUser);
        return newUser;
    };

    // display all users
    User.getAllUsers = async function () {
        return await this.findAll();
    };

    // display user by id which is the primary key
    User.getUserById = async function (id) {
        const user = await this.findByPk(id);
        if (!user) throw new Error("user does not exist");
        return user;
    };

    // update user by id 
    User.updateUser = async function (id, data) {
        const [count] = await this.update(data, { where: { id } });
        if (count === 0) throw new Error('Update failed');
        return await this.findByPk(id);
    };




    // delete user by id
    User.deleteUser = async function (id) {
        const user = await this.findByPk(id);
        if (!user) throw new Error("user does not exist");
        return await this.destroy({ where: { id } });
    };

    //task associated to user-id
    User.getUserTasks = async function (userId) {
        
        const user = await this.findByPk(userId);
        const task = user.getTasks();
        if (!user) throw new Error('User not found');
        return task;
    };



    return User;
};

userEmitter.on('userCreated', (user) => {
  console.log(`New user created: ${user.name}`);
  // You could do other business logic here, like sending an email
  // For example: sendWelcomeEmail(user)
});

