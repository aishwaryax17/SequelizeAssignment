const express = require('express');
const app = express();
const db = require('./models/index');

const cors = require('cors');
require('dotenv').config();
app.use(express.json());
app.use(cors());


// Routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));
app.get('/', (req, res, next) => res.send({"success":true}))

app.use((err, req, res, next) => {
  console.error("🚨 Unhandled Error:", err); // Log the error for debugging
  const statusCode = err.statusCode || 500;
  const message = err.message || "An unexpected error occurred.";
  res.status(statusCode).json({
    success: false,
    message: message,
    // In development, you might send the stack trace
    // stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
})

//app.use(errors());

const port = process.env.PORT || 5000;

async function startServer() {
  try {
    await db.sequelize.authenticate();
    console.log("🟢 DB connected");

    await db.sequelize.sync({ alter: true });
    console.log("✅ DB synced");

    app.listen(port, () => {
      console.log(`🚀 Server running at http://localhost:${port}`);
    });
  } catch (err) {
    console.error("❌ Startup error:", err);
  }
}

startServer();
