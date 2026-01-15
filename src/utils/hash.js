const crypto = require('crypto');

exports.sha256 = (data) =>
  crypto.createHash('sha256').update(data).digest('hex');
