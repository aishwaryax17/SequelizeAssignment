const { User,Task } = require('../models');
//create-user
exports.createUser = async (req, res) => {
    try {
        const user = await User.createUser(req.body);
        res.status(201).json({ success: true, data: user });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
}
//display all user
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.getAllUsers();
        res.status(201).json({ success: true, data: users });
    }
    catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};
//display user by id

exports.getUserById = async (req, res) => {
    try {
        const user = await User.getUserById(req.params.id);
        res.status(200).json({ success: true, data: user });
    } catch (err) {
        res.status(404).json({ success: false, error: err.message });
    }
};


//update user details by id
exports.updateUser = async (req, res) => {
    try {
        const user = await User.updateUser(req.params.id, req.body);
        res.status(200).json({ success: true, data: user });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

//delete user by id

exports.deleteUser = async (req, res) => {
    try {
        await User.deleteUser(req.params.id);
        res.status(200).json({ success: true, message: 'User deleted' });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

//get all tasks associated to particular user
exports.getUserTasks = async (req, res) => {
    try {
        const tasks = await User.getUserTasks(req.params.id);
        res.status(200).json({ success: true, data: tasks });
    } catch (err) {
        res.status(404).json({ success: false, error: err.message });
    }
};