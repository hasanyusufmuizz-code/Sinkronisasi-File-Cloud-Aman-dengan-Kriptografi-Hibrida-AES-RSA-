const crypto = require('crypto');
const fs = require('fs');

exports.generateRSAKeys = () => {
  const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
  });

  fs.writeFileSync('public.pem', publicKey.export({ type: 'pkcs1', format: 'pem' }));
  fs.writeFileSync('private.pem', privateKey.export({ type: 'pkcs1', format: 'pem' }));

  return { publicKey, privateKey };
};
