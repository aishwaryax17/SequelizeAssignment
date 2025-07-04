const { User, Task } = require('../models');
//create-user
exports.registerUser = async (req, res) => {
  try {
    const user = await User.registerUser(req.body);
    return res.status(201).json({ success: true, data: user });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, error: err.message || 'Something went wrong' });
  }
};

//email verification
exports.verifyEmail = async (req, res) => {
  try {
    await User.verifyUserByToken(req.params.token);
    res.json({ message: 'Email verified successfully' });
  } catch (err) {
    res.status(400).json({ message: err.message || 'Invalid or expired token' });
  }
};




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
//generate access token using refresh token
exports.refreshToken = async (req, res) => {
  try {
    const { token } = req.body;

    const result = await User.refreshAccessToken(token);

    return res.status(200).json({
      message: 'Access token refreshed successfully',
      accessToken: result.accessToken,
    });
  } catch (err) {
    return res.status(err.status || 500).json({
      message: err.message || 'Something went wrong',
    });
  }
};



//validate user based on credentials for  login

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await User.loginUser(email, password);

    return res.status(200).json(result);
  } catch (err) {
    return res.status(err.status || 500).json({
      message: err.message || 'Login failed'
    });
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

