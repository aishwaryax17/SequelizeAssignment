

module.exports = (sequelize, DataTypes) => {

    const Task = sequelize.define('Task', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true,
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false
        },
        description: DataTypes.TEXT,
        priority: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        completed: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    }, {
        paranoid: true, // <-- this enables soft delete
        deletedAt: 'deletedAt' // (optional) custom column name
    });

    //create a new task
    Task.createTask = async function (data) {
        const task = await this.create(data);
        return task;
    };


    //display task
    Task.getAllTasks = async function () {
        return await this.findAll();
    }

    //display task by id
    Task.getTaskById = async function (id) {
        const task = await this.findByPk(id);
        if (!task) throw new Error("task does not exist");
        return task;
    }

    //update task by id
    Task.updateTask = async function (id, data) {
        const task = await this.findByPk(id);
        if (!task) throw new Error("task does not exist");
        const updatedTask = await task.update(data, { where: { id } });
        return updatedTask;
    }
    //delete task by id
    Task.deleteTask = async function (id) {
        const task = await this.findByPk(id);
        if (!task) throw new Error("task does not exist");
        return await this.destroy({ where: { id } });

    }
    //get user  related to each task
    Task.getUser = async function (taskId) {
        const task = await this.findByPk(taskId);
        if (!task) throw new Error('Task not found');
        const user = await task.getUser(); // <-- await here!
        return user;
    };

    return Task;
};
