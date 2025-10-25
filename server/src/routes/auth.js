const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();

const User = require('../models/User');
const mongoose = require('mongoose');

// In-memory fallback store when DB isn't connected
const inMemoryUsers = new Map();

function userExistsByPhone(phone) {
  if (mongoose.connection && mongoose.connection.readyState === 1) {
    return User.findOne({ phone }).then(u => !!u);
  }
  return Promise.resolve(inMemoryUsers.has(phone));
}

function createUser({ userId, name, phone, password }) {
  const passwordHash = bcrypt.hashSync(password, 10);
  if (mongoose.connection && mongoose.connection.readyState === 1) {
    const u = new User({ userId, name, phone, passwordHash });
    return u.save();
  }
  const user = { userId, name, phone, passwordHash, role: 'user', karmaPoints: 0 };
  inMemoryUsers.set(phone, user);
  return Promise.resolve(user);
}

function findUserByPhone(phone) {
  if (mongoose.connection && mongoose.connection.readyState === 1) {
    return User.findOne({ phone });
  }
  return Promise.resolve(inMemoryUsers.get(phone));
}

router.post('/register', async (req, res) => {
  const { name, phone, password } = req.body;
  if (!name || !phone || !password) {
    return res.status(400).json({ error: 'name, phone, and password are required' });
  }
  try {
    const exists = await userExistsByPhone(phone);
    if (exists) return res.status(400).json({ error: 'User with this phone already exists' });
    const userId = `USER-${Date.now()}`;
    const user = await createUser({ userId, name, phone, password });
    const token = jwt.sign({ userId: user.userId || userId, phone }, process.env.JWT_SECRET || 'dev_secret', { expiresIn: '7d' });
    return res.status(201).json({ ok: true, user: { userId: user.userId || userId, name, phone }, token });
  } catch (err) {
    console.error('Register error', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/login', async (req, res) => {
  const { phone, password } = req.body;
  if (!phone || !password) return res.status(400).json({ error: 'phone and password required' });
  try {
    const user = await findUserByPhone(phone);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const ok = bcrypt.compareSync(password, user.passwordHash || user.passwordHash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ userId: user.userId, phone }, process.env.JWT_SECRET || 'dev_secret', { expiresIn: '7d' });
    return res.json({ ok: true, token, user: { userId: user.userId, phone, name: user.name } });
  } catch (err) {
    console.error('Login error', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
