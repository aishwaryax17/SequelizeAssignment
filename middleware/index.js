const jwt = require('jsonwebtoken');
const { User } = require('../models'); // Sequelize User model

const verifyToken = async (req, res, next) => {

  
  const authHeader = req.headers.authorization;

  // 1. Check if token is provided
  if (!authHeader) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    // 2. Verify token
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    

    // 3. Find user using Sequelize
    const user = await User.findByPk(decoded.id); 

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }


    // 4. Attach user to request object
    req.user = user;
    if(req.params.id && parseInt(req.params.id)!== user.id){
      return res.status(403).json({message:"Forbidden:You can access only your data"});
    }



    next(); // Call next middleware or route handler
  } catch (err) {
  console.error("JWT verification error:", err);
  return res.status(403).json({ message: "Invalid token" });
}
};

module.exports = verifyToken;
