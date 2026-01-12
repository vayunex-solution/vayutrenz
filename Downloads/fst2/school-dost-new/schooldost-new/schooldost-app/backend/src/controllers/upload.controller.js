// Upload Controller - Handle file uploads
const prisma = require('../config/database');
const path = require('path');
const fs = require('fs');

// Upload profile avatar
const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const avatarUrl = `/uploads/${req.file.filename}`;

    // Delete old avatar if exists
    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    if (user.avatarUrl && user.avatarUrl.startsWith('/uploads/')) {
      const oldPath = path.join(__dirname, '../../', user.avatarUrl);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    // Update user with new avatar
    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: { avatarUrl },
      select: {
        id: true,
        fullName: true,
        username: true,
        email: true,
        avatarUrl: true
      }
    });

    res.json({ 
      message: 'Avatar uploaded successfully',
      user: updatedUser,
      avatarUrl
    });
  } catch (error) {
    console.error('Upload avatar error:', error);
    res.status(500).json({ error: 'Failed to upload avatar' });
  }
};

// Upload cover photo
const uploadCover = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const coverUrl = `/uploads/${req.file.filename}`;

    // Delete old cover if exists
    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    if (user.coverUrl && user.coverUrl.startsWith('/uploads/')) {
      const oldPath = path.join(__dirname, '../../', user.coverUrl);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    // Update user with new cover
    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: { coverUrl },
      select: {
        id: true,
        fullName: true,
        username: true,
        coverUrl: true
      }
    });

    res.json({ 
      message: 'Cover photo uploaded successfully',
      user: updatedUser,
      coverUrl
    });
  } catch (error) {
    console.error('Upload cover error:', error);
    res.status(500).json({ error: 'Failed to upload cover photo' });
  }
};

// Upload post image
const uploadPostImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const imageUrl = `/uploads/${req.file.filename}`;

    res.json({ 
      message: 'Image uploaded successfully',
      imageUrl
    });
  } catch (error) {
    console.error('Upload post image error:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
};

// Upload multiple images for post
const uploadPostImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const imageUrls = req.files.map(file => `/uploads/${file.filename}`);

    res.json({ 
      message: 'Images uploaded successfully',
      imageUrls
    });
  } catch (error) {
    console.error('Upload post images error:', error);
    res.status(500).json({ error: 'Failed to upload images' });
  }
};

// Delete uploaded file
const deleteFile = async (req, res) => {
  try {
    const { fileUrl } = req.body;

    if (!fileUrl || !fileUrl.startsWith('/uploads/')) {
      return res.status(400).json({ error: 'Invalid file URL' });
    }

    const filePath = path.join(__dirname, '../../', fileUrl);
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      res.json({ message: 'File deleted successfully' });
    } else {
      res.status(404).json({ error: 'File not found' });
    }
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({ error: 'Failed to delete file' });
  }
};

module.exports = {
  uploadAvatar,
  uploadCover,
  uploadPostImage,
  uploadPostImages,
  deleteFile
};
