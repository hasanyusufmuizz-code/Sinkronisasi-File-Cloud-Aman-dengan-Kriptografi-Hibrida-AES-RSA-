const express = require('express');
const router = express.Router();
const { generateKeys, encryptHybrid, decryptHybrid } = require('../controllers/crypto.controller');

router.post('/keys/generate', generateKeys);
router.post('/encrypt-hybrid', encryptHybrid);
router.post('/decrypt-hybrid', decryptHybrid);

module.exports = router;
