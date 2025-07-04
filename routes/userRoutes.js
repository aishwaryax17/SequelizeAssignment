const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const verifyToken = require('../middleware/index.js');
const {
    signupValidation,
    loginValidation,
    tokenValidation,
    userUpdateValidation,
    userDeleteValidation,
    userDisplayValidation,
    getUserTasksValidation
} = require('../Validation');

// Public routes
router.post('/refresh-token', userController.refreshToken);
router.post('/signup', signupValidation, userController.registerUser);
router.get('/', userController.getAllUsers);
router.get('/verify/:token', userController.verifyEmail);
router.post('/login', loginValidation, userController.loginUser);




// Protected routes (require valid JWT in Authorization header)
router.get('/:id', verifyToken, userDisplayValidation, userController.getUserById);

router.put('/:id', verifyToken, userUpdateValidation, userController.updateUser);
router.delete('/:id', verifyToken, userDeleteValidation, userController.deleteUser);
router.get('/:id/tasks', verifyToken, getUserTasksValidation, userController.getUserTasks);

module.exports = router;