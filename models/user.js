const EventEmitter = require('events');
class UserEmitter extends EventEmitter { }
const userEmitter = new UserEmitter();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {emailQueue} = require('../jobs/emailQueue');


const nodemailer = require('nodemailer');

const refreshTokens = [];

module.exports = (sequelize, DataTypes) => {
   
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
        },
        age:{
            type:DataTypes.INTEGER,
            allowNull:true,

        },
        verified: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }

    }, {
        paranoid: true, // <-- this enables soft delete
        deletedAt: 'deletedAt' // (optional) custom column name
    });

    // create a new user
    User.registerUser = async (data) => {

       
            const { name, email, password, age } = data;
            
            const existing = await User.findOne({ where: { email } });
            
            if (existing) throw { status: 400, message: 'Email already exists' };



            const hashedPassword = await bcrypt.hash(password, 10);
            const user = await User.create({ name, email, password: hashedPassword, age, verified: false });

            const token = jwt.sign({ id: user.id }, process.env.SECRET_KEY, { expiresIn: '15m' });

            // Send email using Bull
            
            await emailQueue.add('verifyEmail', { email, name, token }, {
                attempts: 5,
                backoff: { type: 'exponential', delay: 1000 }
            });
            
            return user;

            
        

    };

    // display all users
    User.getAllUsers = async function () {
        return await this.findAll();
    };

    User.verifyUserByToken = async function (token) {
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        const user = await this.findByPk(decoded.id);
        if (!user) throw new Error('User not found');
        user.verified = true;
        await user.save();
        return user;
    };




    //validate user based on credentials for login
    User.loginUser = async function (email, password) {
        const user = await this.findOne({ where: { email } });

        if (!user) {
            throw { status: 404, message: 'User not found' };
        }

        if (!user.verified) {
            throw { status: 403, message: 'Please verify your email first' };
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw { status: 401, message: 'Incorrect password' };
        }

        const payload = { id: user.id, email: user.email };

        const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, 
           { expiresIn: '15m' },
        );

        const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });

        return {
            accessToken,
            refreshToken,
            message: 'Login successful'
        };
    };







    // display user by id which is the primary key
    User.getUserById = async function (id) {
        const user = await this.findByPk(id);
        if (!user) throw new Error("user does not exist");
        return user;
    };

    User.updateUser = async function (id, data) {
    // If password is being updated, hash it first
    if (data.password) {
        data.password = await bcrypt.hash(data.password, 10);
    }
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
        if (!user) throw new Error('User not found');
        const task = user.getTasks();
      
        return task;
    };



    //generating access token via refresh token
    User.refreshAccessToken = async function (refreshToken) {
        
        try {
            console.log("inside refresh token");

            if (!refreshToken) {
                throw { status: 401, message: 'Refresh token required' };
            }

            // Verify the refresh token
            const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

            // Optional: check if user still exists
            const user = await this.findByPk(decoded.id);
            if (!user) {
                throw { status: 404, message: 'User not found' };
            }

            // Optional: check if user is verified
            if (!user.verified) {
                throw { status: 403, message: 'Email not verified' };
            }

            // Generate new access token
            const payload = { id: user.id, email: user.email };

            const newAccessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn: process.env.ACCESS_TOKEN_EXPIRE || '15m',
            });

            return { accessToken: newAccessToken };
        } catch (err) {
            if (err.name === 'TokenExpiredError') {
                throw { status: 403, message: 'Refresh token expired' };
            }
            if (err.name === 'JsonWebTokenError') {
                throw { status: 403, message: 'Invalid refresh token' };
            }
            throw err.status ? err : { status: 500, message: 'Internal server error' };
        }
    };


    return User;
};




