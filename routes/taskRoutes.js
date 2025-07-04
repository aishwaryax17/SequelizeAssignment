const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const {
    createTaskValidation,
    headerIdValidation, 
    updateTaskValidation,

} = require('../Validation');

router.post('/', createTaskValidation,taskController.createTask);
router.get('/', taskController.getAllTasks);
router.get('/:id',headerIdValidation, taskController.getTaskById);
router.put('/:id',updateTaskValidation, taskController.updateTask);
router.delete('/:id', headerIdValidation,taskController.deleteTask);
router.get('/:id/user', headerIdValidation,taskController.getUser);


module.exports = router;
