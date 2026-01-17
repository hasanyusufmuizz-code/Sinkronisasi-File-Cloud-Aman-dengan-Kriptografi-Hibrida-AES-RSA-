const fs = require('fs');
const crypto = require('crypto');
const File = require('../models/File');
const { encryptAES, decryptAES } = require('../utils/aes');
const { sha256 } = require('../utils/hash');


exports.uploadFile = async (req, res) => {
  const tStart = process.hrtime();
  try {
    if (!req.file) {
      return res.status(400).json({
        error: "File tidak ditemukan. Pastikan key = 'file' dan type = File di Postman."
      });
    }

    const buffer = req.file.buffer;
    const fileSize = buffer.length;

    // Generate AES key
    const aesKey = crypto.randomBytes(32);

    // Encrypt file (AES)
    const tEncryptStart = process.hrtime();
    const { encrypted, iv } = encryptAES(buffer, aesKey);
    const tEncryptEnd = process.hrtime(tEncryptStart);
    const aesTimeMs = (tEncryptEnd[0] * 1000 + tEncryptEnd[1] / 1e6).toFixed(3);

    // Encrypt AES key (RSA public key)
    const tRsaStart = process.hrtime();
    if (!fs.existsSync('public.pem')) {
      return res.status(400).json({ error: "Public key not found. Please call /api/keys/generate first." });
    }
    const publicKey = fs.readFileSync('public.pem');
    const encryptedKey = crypto.publicEncrypt(publicKey, aesKey);
    const tRsaEnd = process.hrtime(tRsaStart);
    const rsaTimeMs = (tRsaEnd[0] * 1000 + tRsaEnd[1] / 1e6).toFixed(3);

    // Hash original file
    const hash = sha256(buffer);

    // Save encrypted file
    if (!fs.existsSync('storage/encrypted')) {
      fs.mkdirSync('storage/encrypted', { recursive: true });
    }
    const filePath = `storage/encrypted/${Date.now()}_${req.file.originalname}`;
    fs.writeFileSync(filePath, encrypted);

    // Save metadata to MongoDB
    const file = await File.create({
      filename: req.file.originalname,
      versions: [{
        version: 1,
        hash,
        encryptedKey: encryptedKey.toString('base64'),
        iv: iv.toString('base64'),
        path: filePath,
        createdAt: new Date()
      }]
    });

    const tTotalEnd = process.hrtime(tStart);
    const totalTimeMs = (tTotalEnd[0] * 1000 + tTotalEnd[1] / 1e6).toFixed(3);

    res.status(201).json({
      message: "File uploaded securely",
      fileId: file._id,
      version: 1,
      performance: {
        originalSize: fileSize,
        ciphertextSize: encrypted.length,
        aesEncryptionTimeMs: aesTimeMs,
        rsaKeyEncryptionTimeMs: rsaTimeMs,
        totalTimeMs: totalTimeMs
      }
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.downloadFile = async (req, res) => {
  const tStart = process.hrtime();
  try {
    const file = await File.findById(req.params.fileId);
    if (!file) {
      return res.status(404).json({ error: "File not found" });
    }

    // Latest version
    const latest = file.versions[file.versions.length - 1];

    // Read encrypted file
    if (!fs.existsSync(latest.path)) {
      return res.status(404).json({ error: "Physical file Not Found" });
    }
    const encryptedData = fs.readFileSync(latest.path);

    // Decrypt AES key (RSA private key)
    const tRsaStart = process.hrtime();
    if (!fs.existsSync('private.pem')) {
      return res.status(500).json({ error: "Private key not found on server" });
    }
    const privateKey = fs.readFileSync('private.pem');
    const aesKey = crypto.privateDecrypt(
      privateKey,
      Buffer.from(latest.encryptedKey, 'base64')
    );
    const tRsaEnd = process.hrtime(tRsaStart);
    const rsaTimeMs = (tRsaEnd[0] * 1000 + tRsaEnd[1] / 1e6).toFixed(3);

    // Decrypt file (AES)
    const tDecryptStart = process.hrtime();
    const decrypted = decryptAES(
      encryptedData,
      aesKey,
      Buffer.from(latest.iv, 'base64')
    );
    const tDecryptEnd = process.hrtime(tDecryptStart);
    const aesTimeMs = (tDecryptEnd[0] * 1000 + tDecryptEnd[1] / 1e6).toFixed(3);

    const tTotalEnd = process.hrtime(tStart);
    const totalTimeMs = (tTotalEnd[0] * 1000 + tTotalEnd[1] / 1e6).toFixed(3);

    // Send performance stats in Headers (since body is file content)
    res.setHeader('X-Performance-AES-Decrypt-Time-Ms', aesTimeMs);
    res.setHeader('X-Performance-RSA-Decrypt-Time-Ms', rsaTimeMs);
    res.setHeader('X-Performance-Total-Time-Ms', totalTimeMs);
    res.setHeader('X-Original-Size', decrypted.length);

    // Send file
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${file.filename}"`
    );
    res.setHeader('Content-Type', 'application/octet-stream');
    res.send(decrypted);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateFile = async (req, res) => {
  const tStart = process.hrtime();
  try {
    if (!req.file) {
      return res.status(400).json({ error: "File tidak ditemukan" });
    }

    const file = await File.findById(req.params.fileId);
    if (!file) {
      return res.status(404).json({ error: "File not found" });
    }

    const buffer = req.file.buffer;
    const fileSize = buffer.length;

    // Generate new AES key
    const aesKey = crypto.randomBytes(32);

    // Encrypt new file
    const tEncryptStart = process.hrtime();
    const { encrypted, iv } = encryptAES(buffer, aesKey);
    const tEncryptEnd = process.hrtime(tEncryptStart);
    const aesTimeMs = (tEncryptEnd[0] * 1000 + tEncryptEnd[1] / 1e6).toFixed(3);

    // Encrypt AES key (RSA)
    const tRsaStart = process.hrtime();
    const publicKey = fs.readFileSync('public.pem');
    const encryptedKey = crypto.publicEncrypt(publicKey, aesKey);
    const tRsaEnd = process.hrtime(tRsaStart);
    const rsaTimeMs = (tRsaEnd[0] * 1000 + tRsaEnd[1] / 1e6).toFixed(3);

    // Hash new file
    const hash = sha256(buffer);

    // [TUGAS BESAR GUARDRAIL]
    // Cek apakah file yang diupload IDENTIK dengan versi terakhir
    const latestVersion = file.versions[file.versions.length - 1];
    if (latestVersion && latestVersion.hash === hash) {
      return res.status(400).json({
        error: "File content is IDENTICAL to the latest version. Please modify the file content to create a new version (SHA-256 matches)."
      });
    }

    // Save encrypted file
    if (!fs.existsSync('storage/encrypted')) {
      fs.mkdirSync('storage/encrypted', { recursive: true });
    }
    const filePath = `storage/encrypted/${Date.now()}_${req.file.originalname}`;
    fs.writeFileSync(filePath, encrypted);

    // Create new version
    const newVersion = {
      version: file.versions.length + 1,
      hash,
      encryptedKey: encryptedKey.toString('base64'),
      iv: iv.toString('base64'),
      path: filePath,
      createdAt: new Date()
    };

    file.versions.push(newVersion);
    await file.save();

    const tTotalEnd = process.hrtime(tStart);
    const totalTimeMs = (tTotalEnd[0] * 1000 + tTotalEnd[1] / 1e6).toFixed(3);

    res.json({
      message: "File updated successfully",
      version: newVersion.version,
      performance: {
        originalSize: fileSize,
        ciphertextSize: encrypted.length,
        aesEncryptionTimeMs: aesTimeMs,
        rsaKeyEncryptionTimeMs: rsaTimeMs,
        totalTimeMs: totalTimeMs
      }
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getVersions = async (req, res) => {
  try {
    const file = await File.findById(req.params.fileId);
    if (!file) {
      return res.status(404).json({ error: "File not found" });
    }

    res.json({
      filename: file.filename,
      totalVersions: file.versions.length,
      versions: file.versions.map(v => ({
        version: v.version,
        hash: v.hash,
        createdAt: v.createdAt,
        encryptedKeySize: v.encryptedKey.length,
        ciphertextSize: fs.existsSync(v.path) ? fs.statSync(v.path).size : 0
      }))
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

