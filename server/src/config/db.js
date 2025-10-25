const mongoose = require('mongoose');
const debug = require('debug')('saarthi:db');

async function connectDB(uri) {
  if (!uri) {
    console.warn('MONGO_URI not provided. Skipping DB connection (running in fallback mode).');
    return null;
  }

  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    debug('Connected to MongoDB');
    console.log('Connected to MongoDB');
    return mongoose.connection;
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    throw err;
  }
}

async function closeDB() {
  if (mongoose.connection && mongoose.connection.readyState === 1) {
    await mongoose.disconnect();
    debug('Disconnected from MongoDB');
    console.log('Disconnected from MongoDB');
  }
}

module.exports = { connectDB, closeDB };
