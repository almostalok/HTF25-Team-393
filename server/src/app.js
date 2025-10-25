
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const { connectDB, closeDB } = require('./config/db');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Basic health
app.get('/api/health', (req, res) => {
  res.json({ ok: true, uptime: process.uptime() });
});

// Routes
const reportRouter = require('./routes/report');
app.use('/api/report', reportRouter);
const authRouter = require('./routes/auth');
app.use('/api/auth', authRouter);

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await connectDB(process.env.MONGO_URI);
  } catch (err) {
    console.warn('Continuing without DB connection (start).');
  }

  const server = app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });

  // Graceful shutdown
  const shutdown = async (signal) => {
    console.log(`Received ${signal}. Shutting down...`);
    server.close(() => {
      console.log('HTTP server closed');
    });
    try {
      await closeDB();
    } catch (err) {
      console.error('Error during DB close', err.message);
    }
    process.exit(0);
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

start();

module.exports = app;
