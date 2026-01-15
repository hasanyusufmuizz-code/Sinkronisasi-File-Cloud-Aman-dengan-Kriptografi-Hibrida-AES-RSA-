const express = require('express');
const router = express.Router();

const multer = require('multer');
const upload = multer();

const {
  uploadFile,
  downloadFile,
  updateFile,
  getVersions
} = require('../controllers/file.controller');

router.post('/upload', upload.single('file'), uploadFile);
router.get('/download/:fileId', downloadFile);
router.post('/update/:fileId', upload.single('file'), updateFile);
router.get('/versions/:fileId', getVersions);

module.exports = router;
