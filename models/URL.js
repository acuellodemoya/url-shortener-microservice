const mongoose = require('mongoose');

const URLSchema = new mongoose.Schema({
  original_url: { type: String, required: true },
  short_url: Number,
});

module.exports = mongoose.model('URL', URLSchema);
