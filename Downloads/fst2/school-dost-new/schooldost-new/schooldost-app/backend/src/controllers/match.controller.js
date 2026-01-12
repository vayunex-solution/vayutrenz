// Match Controller with EdgeRank Algorithm
// EdgeRank Formula: Match Score = Affinity × Weight × Decay
const prisma = require('../config/database');

/**
 * EdgeRank Algorithm for SchoolDost Matching
 * 
 * AFFINITY SCORE (0-100): How similar/connected users are
 * - Same college: +30 points
 * - Same batch: +25 points
 * - Same department: +20 points
 * - Mutual followers: +5 points each (max 25)
 * - Same location: +10 points
 * 
 * WEIGHT SCORE (0-100): User quality/importance
 * - Profile complete: +30 points
 * - Verified: +25 points
 * - Has avatar: +15 points
 * - Active (posted recently): +20 points
 * - Has bio: +10 points
 * 
 * DECAY SCORE (0-1): Freshness factor
 * - New accounts get higher score
 * - Recently active users get higher score
 * - Formula: 1 / (1 + days_since_last_active * 0.1)
 */

// Calculate Affinity Score (0-100)
const calculateAffinity = async (currentUser, targetUser) => {
  let score = 0;

  // Same college (+30)
  if (currentUser.college && targetUser.college &&
    currentUser.college.toLowerCase() === targetUser.college.toLowerCase()) {
    score += 30;
  }

  // Same batch (+25)
  if (currentUser.batch && targetUser.batch &&
    currentUser.batch === targetUser.batch) {
    score += 25;
  }

  // Same department (+20)
  if (currentUser.department && targetUser.department &&
    currentUser.department.toLowerCase() === targetUser.department.toLowerCase()) {
    score += 20;
  }

  // Same location (+10)
  if (currentUser.location && targetUser.location &&
    currentUser.location.toLowerCase() === targetUser.location.toLowerCase()) {
    score += 10;
  }

  // Mutual followers (check if they follow each other's following)
  try {
    const mutualCount = await prisma.follow.count({
      where: {
        followerId: currentUser.id,
        following: {
          followers: {
            some: { followerId: targetUser.id }
          }
        }
      }
    });
    score += Math.min(mutualCount * 5, 25); // Max 25 points
  } catch (e) {
    // Continue without mutual followers score
  }

  return Math.min(score, 100);
};

// Calculate Weight Score (0-100)
const calculateWeight = (user) => {
  let score = 0;

  // Profile completeness
  if (user.college) score += 10;
  if (user.department) score += 10;
  if (user.batch) score += 10;
  if (user.bio) score += 10;
  if (user.avatarUrl) score += 15;
  if (user.location) score += 5;

  // Verification status
  if (user.isVerified) score += 25;
  if (user.emailVerified) score += 5;

  // Activity (has posts)
  if (user._count?.posts > 0) score += 10;
  if (user._count?.posts > 5) score += 10;

  return Math.min(score, 100);
};

// Calculate Decay Score (0-1)
const calculateDecay = (user) => {
  const now = new Date();
  let lastActive = user.lastSeen || user.createdAt;

  // If currently online, highest score
  if (user.isOnline) return 1;

  const daysSinceActive = (now - new Date(lastActive)) / (1000 * 60 * 60 * 24);

  // Decay formula: 1 / (1 + days * 0.1)
  // Day 0: 1.0, Day 7: 0.59, Day 14: 0.42, Day 30: 0.25
  return 1 / (1 + daysSinceActive * 0.1);
};

// Calculate final EdgeRank score
const calculateEdgeRank = async (currentUser, targetUser) => {
  const affinity = await calculateAffinity(currentUser, targetUser);
  const weight = calculateWeight(targetUser);
  const decay = calculateDecay(targetUser);

  // Normalize: Affinity (0-100) × Weight (0-100) × Decay (0-1) / 100
  // Results in score 0-100
  const edgeRank = (affinity * weight * decay) / 100;

  return {
    total: Math.round(edgeRank * 100) / 100,
    affinity,
    weight,
    decay: Math.round(decay * 100) / 100
  };
};

// Get users for discovery with EdgeRank scoring
const getDiscoverUsers = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    // Get current user with full profile
    const currentUser = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        _count: { select: { following: true, followers: true } }
      }
    });

    // Get IDs of users already swiped
    const swipedUsers = await prisma.swipe.findMany({
      where: { fromId: req.user.id },
      select: { toId: true }
    });
    const swipedIds = swipedUsers.map(s => s.toId);

    // Get potential matches (not swiped, not self, not banned)
    const users = await prisma.user.findMany({
      where: {
        id: { notIn: [...swipedIds, req.user.id] },
        isBanned: false
      },
      take: 50, // Get more to rank
      select: {
        id: true,
        fullName: true,
        username: true,
        avatarUrl: true,
        bio: true,
        college: true,
        department: true,
        batch: true,
        location: true,
        isVerified: true,
        emailVerified: true,
        isOnline: true,
        lastSeen: true,
        createdAt: true,
        _count: {
          select: { posts: true, followers: true }
        }
      }
    });

    // Calculate EdgeRank for each user
    const rankedUsers = await Promise.all(
      users.map(async (user) => {
        const edgeRank = await calculateEdgeRank(currentUser, user);
        return {
          ...user,
          matchScore: edgeRank
        };
      })
    );

    // Sort by EdgeRank score (descending) and limit
    rankedUsers.sort((a, b) => b.matchScore.total - a.matchScore.total);
    const topUsers = rankedUsers.slice(0, parseInt(limit));

    res.json({
      users: topUsers,
      algorithm: 'EdgeRank',
      message: 'Sorted by compatibility score'
    });
  } catch (error) {
    console.error('Get discover error:', error);
    res.status(500).json({ error: 'Failed to get users' });
  }
};

// Swipe on a user
const swipe = async (req, res) => {
  try {
    const { userId, direction } = req.body;

    if (!userId || !['left', 'right'].includes(direction)) {
      return res.status(400).json({ error: 'Invalid swipe data' });
    }

    if (userId === req.user.id) {
      return res.status(400).json({ error: 'Cannot swipe on yourself' });
    }

    // Check if already swiped
    const existing = await prisma.swipe.findUnique({
      where: {
        fromId_toId: {
          fromId: req.user.id,
          toId: userId
        }
      }
    });

    if (existing) {
      return res.status(400).json({ error: 'Already swiped on this user' });
    }

    // Create swipe
    await prisma.swipe.create({
      data: {
        fromId: req.user.id,
        toId: userId,
        direction
      }
    });

    // Check for mutual match (if right swipe)
    let match = null;
    if (direction === 'right') {
      const otherSwipe = await prisma.swipe.findFirst({
        where: {
          fromId: userId,
          toId: req.user.id,
          direction: 'right'
        }
      });

      if (otherSwipe) {
        // It's a match!
        match = await prisma.match.create({
          data: {
            user1Id: req.user.id,
            user2Id: userId
          },
          include: {
            user2: {
              select: {
                id: true,
                fullName: true,
                username: true,
                avatarUrl: true
              }
            }
          }
        });

        // Create notifications for both users
        await prisma.notification.createMany({
          data: [
            {
              type: 'match',
              message: 'matched with you!',
              receiverId: req.user.id,
              senderId: userId
            },
            {
              type: 'match',
              message: 'matched with you!',
              receiverId: userId,
              senderId: req.user.id
            }
          ]
        });
      }
    }

    res.json({
      message: direction === 'right' ? 'Liked!' : 'Passed',
      match: match ? {
        id: match.id,
        user: match.user2
      } : null
    });
  } catch (error) {
    console.error('Swipe error:', error);
    res.status(500).json({ error: 'Swipe failed' });
  }
};

// Get all matches
const getMatches = async (req, res) => {
  try {
    const matches = await prisma.match.findMany({
      where: {
        OR: [
          { user1Id: req.user.id },
          { user2Id: req.user.id }
        ]
      },
      include: {
        user1: {
          select: {
            id: true,
            fullName: true,
            username: true,
            avatarUrl: true,
            lastSeen: true,
            isOnline: true
          }
        },
        user2: {
          select: {
            id: true,
            fullName: true,
            username: true,
            avatarUrl: true,
            lastSeen: true,
            isOnline: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Format matches to show the other user
    const formattedMatches = matches.map(match => ({
      id: match.id,
      createdAt: match.createdAt,
      user: match.user1Id === req.user.id ? match.user2 : match.user1
    }));

    res.json({ matches: formattedMatches });
  } catch (error) {
    console.error('Get matches error:', error);
    res.status(500).json({ error: 'Failed to get matches' });
  }
};

// Unmatch
const unmatch = async (req, res) => {
  try {
    const { id } = req.params;

    const match = await prisma.match.findUnique({
      where: { id }
    });

    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }

    if (match.user1Id !== req.user.id && match.user2Id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await prisma.match.delete({ where: { id } });

    res.json({ message: 'Unmatched successfully' });
  } catch (error) {
    console.error('Unmatch error:', error);
    res.status(500).json({ error: 'Failed to unmatch' });
  }
};

// Get match compatibility score between two users
const getCompatibility = async (req, res) => {
  try {
    const { userId } = req.params;

    const currentUser = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        _count: { select: { posts: true, followers: true } }
      }
    });

    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const score = await calculateEdgeRank(currentUser, targetUser);

    res.json({
      userId,
      compatibility: score,
      breakdown: {
        affinity: `${score.affinity}/100 (Common interests & connections)`,
        weight: `${score.weight}/100 (Profile quality)`,
        decay: `${score.decay} (Activity freshness)`
      }
    });
  } catch (error) {
    console.error('Get compatibility error:', error);
    res.status(500).json({ error: 'Failed to calculate compatibility' });
  }
};

module.exports = {
  getDiscoverUsers,
  swipe,
  getMatches,
  unmatch,
  getCompatibility
};
