const mongoose = require('mongoose');

const FileSchema = new mongoose.Schema({
  filename: String,
  versions: [
    {
      version: Number,
      hash: String,
      encryptedKey: String,
      iv: String,
      path: String,
      createdAt: { type: Date, default: Date.now }
    }
  ]
});

module.exports = mongoose.model('File', FileSchema);
