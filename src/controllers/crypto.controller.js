const fs = require('fs');
const crypto = require('crypto');
const { generateRSAKeys } = require('../utils/rsa');
const { encryptAES, decryptAES } = require('../utils/aes');

exports.generateKeys = (req, res) => {
    try {
        generateRSAKeys();
        res.json({ message: "RSA key pair generated successfully (public.pem, private.pem)" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.encryptHybrid = (req, res) => {
    try {
        const { data } = req.body;
        if (!data) return res.status(400).json({ error: "Data is required" });

        const startTime = process.hrtime();

        // 1. Generate AES Key
        const aesKey = crypto.randomBytes(32);

        // 2. Encrypt Data with AES
        const { encrypted, iv } = encryptAES(Buffer.from(data), aesKey);

        // 3. Encrypt AES Key with RSA Public Key
        if (!fs.existsSync('public.pem')) {
            return res.status(400).json({ error: "Public key not found. Generate keys first." });
        }
        const publicKey = fs.readFileSync('public.pem');
        const encryptedKey = crypto.publicEncrypt(publicKey, aesKey);

        const endTime = process.hrtime(startTime);
        const timeTaken = (endTime[0] * 1000 + endTime[1] / 1e6).toFixed(3);

        res.json({
            message: "Hybrid Encryption Successful",
            encryptedData: encrypted.toString('base64'),
            encryptedKey: encryptedKey.toString('base64'),
            iv: iv.toString('base64'),
            performance: {
                timeMs: timeTaken,
                ciphertextSizeBytes: encrypted.length
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.decryptHybrid = (req, res) => {
    try {
        const { encryptedData, encryptedKey, iv } = req.body;
        if (!encryptedData || !encryptedKey || !iv) {
            return res.status(400).json({ error: "encryptedData, encryptedKey, and iv are required" });
        }

        const startTime = process.hrtime();

        // 1. Decrypt AES Key with RSA Private Key
        if (!fs.existsSync('private.pem')) {
            return res.status(400).json({ error: "Private key not found. Generate keys first." });
        }
        const privateKey = fs.readFileSync('private.pem');
        const aesKey = crypto.privateDecrypt(
            privateKey,
            Buffer.from(encryptedKey, 'base64')
        );

        // 2. Decrypt Data with AES
        const decrypted = decryptAES(
            Buffer.from(encryptedData, 'base64'),
            aesKey,
            Buffer.from(iv, 'base64')
        );

        const endTime = process.hrtime(startTime);
        const timeTaken = (endTime[0] * 1000 + endTime[1] / 1e6).toFixed(3);

        res.json({
            message: "Hybrid Decryption Successful",
            decryptedData: decrypted.toString(),
            performance: {
                timeMs: timeTaken
            }
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
