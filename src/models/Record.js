const mongoose = require('mongoose');

const recordSchema = new mongoose.Schema({
  type: { type: String, enum: ['BIRTH', 'MARRIAGE', 'DEATH'], required: true },
  details: { type: Object, required: true },
  createdAt: { type: Date, default: Date.now },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  district: { type: mongoose.Schema.Types.ObjectId, ref: 'District' },
});

module.exports = mongoose.model('Record', recordSchema);
