const mongoose = require('mongoose');
const { Schema } = mongoose;

const TimelineEntry = new Schema({
  status: { type: String, required: true },
  note: { type: String },
  timestamp: { type: Date, default: Date.now }
}, { _id: false });

const GeoSchema = new Schema({
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true }
}, { _id: false });

const IssueSchema = new Schema({
  issueId: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  reporter: { type: Schema.Types.ObjectId, ref: 'User' },
  phone: { type: String },
  imageUrl: { type: String },
  status: { type: String, default: 'Pending' },
  upvotes: { type: Number, default: 0 },
  karmaChange: { type: Number, default: 0 },
  blockchainHash: { type: String },
  timeline: { type: [TimelineEntry], default: [] },
  location: { type: GeoSchema, required: true },
  department: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Issue', IssueSchema);
