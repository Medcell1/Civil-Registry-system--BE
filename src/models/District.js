const mongoose = require('mongoose');

const districtSchema = new mongoose.Schema({
  name: { type: String, required: true },
  supervisors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  records: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Record' }],
});

module.exports = mongoose.model('District', districtSchema);
