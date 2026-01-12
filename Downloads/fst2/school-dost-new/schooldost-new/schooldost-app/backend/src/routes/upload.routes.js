// Upload Routes
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const { 
  uploadAvatar, 
  uploadCover, 
  uploadSingle, 
  uploadMultiple,
  handleUploadError 
} = require('../middleware/upload.middleware');
const uploadController = require('../controllers/upload.controller');

// Avatar upload
router.post(
  '/avatar',
  authenticate,
  uploadAvatar,
  handleUploadError,
  uploadController.uploadAvatar
);

// Cover photo upload
router.post(
  '/cover',
  authenticate,
  uploadCover,
  handleUploadError,
  uploadController.uploadCover
);

// Single post image upload
router.post(
  '/image',
  authenticate,
  uploadSingle,
  handleUploadError,
  uploadController.uploadPostImage
);

// Multiple post images upload
router.post(
  '/images',
  authenticate,
  uploadMultiple,
  handleUploadError,
  uploadController.uploadPostImages
);

// Delete file
router.delete(
  '/file',
  authenticate,
  uploadController.deleteFile
);

module.exports = router;
