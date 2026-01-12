// Admin Middleware - Check if user is admin
const prisma = require('../config/database');

const isAdmin = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { role: true }
    });

    if (!user || user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Access denied. Admin only.' });
    }

    next();
  } catch (error) {
    console.error('Admin check error:', error);
    res.status(500).json({ error: 'Authorization failed' });
  }
};

// Check if user is moderator or admin
const isModerator = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { role: true }
    });

    if (!user || (user.role !== 'ADMIN' && user.role !== 'MODERATOR')) {
      return res.status(403).json({ error: 'Access denied. Moderator or Admin only.' });
    }

    next();
  } catch (error) {
    console.error('Moderator check error:', error);
    res.status(500).json({ error: 'Authorization failed' });
  }
};

module.exports = { isAdmin, isModerator };
