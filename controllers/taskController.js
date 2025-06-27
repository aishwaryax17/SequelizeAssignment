const { User,Task } = require('../models');
//create task

exports.createTask = async (req, res) => {
    try {
        const task = await Task.createTask(req.body);
        res.status(201).json({ success: true, data: task });
    }
    catch (err) {
        res.status(400).json({ success: false, error: err.message });

    }
};
//display all task

exports.getAllTasks = async (req, res) => {
    try {
        const tasks = await Task.getAllTasks();
        res.status(200).json({ success: true, data: tasks });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

//display by Task-id

exports.getTaskById = async (req, res) => {
    try {
        const task = await Task.getTaskById(req.params.id);
        res.status(200).json({ success: true, data: task });
    } catch (err) {
        res.status(404).json({ success: false, error: err.message });
    }
};

//update task details by id

exports.updateTask = async (req, res) => {
    try {
        const task = await Task.updateTask(req.params.id, req.body);
        res.status(200).json({ success: true, data: task });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

//delete task by id

exports.deleteTask = async (req, res) => {
    try {
        await Task.deleteTask(req.params.id);
        res.status(200).json({ success: true, message: 'Task deleted' });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

exports.getUser = async (req, res) => {
    try {
        const user = await Task.getUser(req.params.id);
        res.status(200).json({ success: true, data: user });
    } catch (err) {
        res.status(404).json({ success: false, error: err.message });
    }
};