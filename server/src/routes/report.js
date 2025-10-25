const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const Issue = require('../models/Issue');
const { mockStoreOnChain } = require('../services/blockchain');

// Ensure uploads dir exists
const uploadsDir = path.join(process.cwd(), 'server', 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2,8)}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) return cb(new Error('Only images allowed'));
    cb(null, true);
  }
});

// In-memory fallback store for issues when DB not connected
const inMemoryIssues = [];

function generateIssueId() {
  const t = new Date();
  return `ISSUE-${t.getFullYear()}-${String(Date.now()).slice(-6)}`;
}

router.get('/', (req, res) => {
  res.json({ ok: true, message: 'report endpoint ready' });
});

router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { title, description, latitude, longitude, userId, phone } = req.body;
    // Validate
    const missing = [];
    if (!req.file) missing.push('image');
    if (!title) missing.push('title');
    if (!description) missing.push('description');
    if (!latitude) missing.push('latitude');
    if (!longitude) missing.push('longitude');
    if (missing.length) return res.status(400).json({ error: `Missing fields: ${missing.join(', ')}` });

    const issueId = generateIssueId();
    const imageUrl = `/uploads/${req.file.filename}`;
    const timeline = [{ status: 'Reported', timestamp: new Date() }];

    // store on chain (mock)
    const blockchainHash = await mockStoreOnChain({ issueId, title, description });

    const issueData = {
      issueId,
      title,
      description,
      phone,
      imageUrl,
      status: 'Pending',
      upvotes: 0,
      blockchainHash,
      timeline,
      location: { latitude: Number(latitude), longitude: Number(longitude) }
    };

    if (mongoose.connection && mongoose.connection.readyState === 1) {
      const issue = new Issue(issueData);
      await issue.save();
      return res.status(201).json({ success: true, issue: { issueId: issue.issueId, title: issue.title, status: issue.status, upvotes: issue.upvotes, blockchainHash: issue.blockchainHash, link: `${req.protocol}://${req.get('host')}/issues/${issue.issueId}` } });
    }

    // fallback: push to memory
    inMemoryIssues.push(issueData);
    return res.status(201).json({ success: true, issue: { issueId, title, status: 'Pending', upvotes: 0, blockchainHash, link: `${req.protocol}://${req.get('host')}/issues/${issueId}` } });

  } catch (err) {
    console.error('Report POST error', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

module.exports = router;
// cleaned duplicate content - file contains only the proper router implementation above
