const crypto = require('crypto');

exports.encryptAES = (buffer, key) => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
  return { encrypted, iv };
};

exports.decryptAES = (encrypted, key, iv) => {
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]);
};
