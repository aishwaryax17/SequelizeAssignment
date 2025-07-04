const { User } = require('../models');
const bcrypt = require('bcrypt');

module.exports.createOne = async (data = {}) => {
    const password = data.password || 'defaultpass';
    const hashed = await bcrypt.hash(password, 10);    
    const user = await User.create({
      id: data.id,
      name: data.name || 'Test User',
      email: data.email || `user_${Date.now()}@example.com`,
      password: hashed,
      verified: data.verified ?? true,
      age: data.age || 25
    });
    return user; // <-- return the created user instance
};

