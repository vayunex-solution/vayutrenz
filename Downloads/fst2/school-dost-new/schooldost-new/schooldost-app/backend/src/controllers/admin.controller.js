// Admin Controller - Dashboard, Users, Content Management
const prisma = require('../config/database');

// Get dashboard stats
const getDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalPosts,
      totalMatches,
      totalGroups,
      newUsersToday,
      newPostsToday,
      activeUsers,
      reportedContent
    ] = await Promise.all([
      prisma.user.count(),
      prisma.post.count(),
      prisma.match.count(),
      prisma.group.count(),
      prisma.user.count({
        where: {
          createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        }
      }),
      prisma.post.count({
        where: {
          createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        }
      }),
      prisma.user.count({
        where: { isOnline: true }
      }),
      prisma.report.count({
        where: { status: 'PENDING' }
      })
    ]);

    // Get user growth (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const userGrowth = await prisma.user.groupBy({
      by: ['createdAt'],
      where: { createdAt: { gte: sevenDaysAgo } },
      _count: true
    });

    res.json({
      stats: {
        totalUsers,
        totalPosts,
        totalMatches,
        totalGroups,
        newUsersToday,
        newPostsToday,
        activeUsers,
        reportedContent
      },
      userGrowth
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to get dashboard stats' });
  }
};

// Get all users with pagination
const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '', role = '' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    
    if (search) {
      where.OR = [
        { fullName: { contains: search } },
        { username: { contains: search } },
        { email: { contains: search } }
      ];
    }
    
    if (role) {
      where.role = role;
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          fullName: true,
          username: true,
          email: true,
          avatarUrl: true,
          role: true,
          isVerified: true,
          emailVerified: true,
          isOnline: true,
          createdAt: true,
          _count: {
            select: {
              posts: true,
              followers: true,
              following: true
            }
          }
        }
      }),
      prisma.user.count({ where })
    ]);

    res.json({
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to get users' });
  }
};

// Update user role
const updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!['USER', 'MODERATOR', 'ADMIN'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        fullName: true,
        username: true,
        role: true
      }
    });

    res.json({ message: 'User role updated', user });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ error: 'Failed to update user role' });
  }
};

// Ban/Suspend user
const banUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { banned, reason } = req.body;

    const user = await prisma.user.update({
      where: { id: userId },
      data: { 
        isBanned: banned,
        banReason: reason || null
      },
      select: {
        id: true,
        fullName: true,
        username: true,
        isBanned: true
      }
    });

    res.json({ 
      message: banned ? 'User banned' : 'User unbanned', 
      user 
    });
  } catch (error) {
    console.error('Ban user error:', error);
    res.status(500).json({ error: 'Failed to update user ban status' });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Delete all user related data
    await prisma.$transaction([
      prisma.like.deleteMany({ where: { userId } }),
      prisma.comment.deleteMany({ where: { userId } }),
      prisma.post.deleteMany({ where: { authorId: userId } }),
      prisma.message.deleteMany({ where: { OR: [{ senderId: userId }, { receiverId: userId }] } }),
      prisma.follow.deleteMany({ where: { OR: [{ followerId: userId }, { followingId: userId }] } }),
      prisma.swipe.deleteMany({ where: { OR: [{ fromUserId: userId }, { toUserId: userId }] } }),
      prisma.match.deleteMany({ where: { OR: [{ user1Id: userId }, { user2Id: userId }] } }),
      prisma.groupMember.deleteMany({ where: { userId } }),
      prisma.notification.deleteMany({ where: { OR: [{ userId }, { fromUserId: userId }] } }),
      prisma.user.delete({ where: { id: userId } })
    ]);

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
};

// Get all posts for moderation
const getPosts = async (req, res) => {
  try {
    const { page = 1, limit = 20, reported = false } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (reported === 'true') {
      where.reports = { some: { status: 'PENDING' } };
    }

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          author: {
            select: {
              id: true,
              fullName: true,
              username: true,
              avatarUrl: true
            }
          },
          _count: {
            select: {
              likes: true,
              comments: true,
              reports: true
            }
          }
        }
      }),
      prisma.post.count({ where })
    ]);

    res.json({
      posts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ error: 'Failed to get posts' });
  }
};

// Delete post
const deletePost = async (req, res) => {
  try {
    const { postId } = req.params;

    await prisma.$transaction([
      prisma.like.deleteMany({ where: { postId } }),
      prisma.comment.deleteMany({ where: { postId } }),
      prisma.report.deleteMany({ where: { postId } }),
      prisma.post.delete({ where: { id: postId } })
    ]);

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ error: 'Failed to delete post' });
  }
};

// Get reports
const getReports = async (req, res) => {
  try {
    const { page = 1, limit = 20, status = 'PENDING' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (status) {
      where.status = status;
    }

    const [reports, total] = await Promise.all([
      prisma.report.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          reporter: {
            select: {
              id: true,
              fullName: true,
              username: true,
              avatarUrl: true
            }
          },
          post: {
            include: {
              author: {
                select: {
                  id: true,
                  fullName: true,
                  username: true
                }
              }
            }
          },
          user: {
            select: {
              id: true,
              fullName: true,
              username: true,
              avatarUrl: true
            }
          }
        }
      }),
      prisma.report.count({ where })
    ]);

    res.json({
      reports,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({ error: 'Failed to get reports' });
  }
};

// Handle report
const handleReport = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { action, note } = req.body; // action: 'dismiss', 'warn', 'delete', 'ban'

    const report = await prisma.report.findUnique({
      where: { id: reportId },
      include: { post: true, user: true }
    });

    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    // Handle based on action
    if (action === 'delete' && report.postId) {
      await prisma.$transaction([
        prisma.like.deleteMany({ where: { postId: report.postId } }),
        prisma.comment.deleteMany({ where: { postId: report.postId } }),
        prisma.post.delete({ where: { id: report.postId } })
      ]);
    }

    if (action === 'ban' && report.userId) {
      await prisma.user.update({
        where: { id: report.userId },
        data: { isBanned: true, banReason: note || 'Violated community guidelines' }
      });
    }

    // Update report status
    await prisma.report.update({
      where: { id: reportId },
      data: {
        status: 'RESOLVED',
        resolvedAt: new Date(),
        resolvedBy: req.user.id,
        actionTaken: action,
        adminNote: note
      }
    });

    res.json({ message: 'Report handled successfully' });
  } catch (error) {
    console.error('Handle report error:', error);
    res.status(500).json({ error: 'Failed to handle report' });
  }
};

module.exports = {
  getDashboardStats,
  getUsers,
  updateUserRole,
  banUser,
  deleteUser,
  getPosts,
  deletePost,
  getReports,
  handleReport
};
