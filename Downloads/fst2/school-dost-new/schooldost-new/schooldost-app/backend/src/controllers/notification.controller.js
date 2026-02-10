// Notification Controller
const prisma = require('../config/database');

// Get all notifications for current user
const getNotifications = async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { receiverId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        sender: {
          select: {
            id: true,
            fullName: true,
            username: true,
            avatarUrl: true
          }
        }
      }
    });

    res.json({ notifications });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Failed to get notifications' });
  }
};

// Get unread count
const getUnreadCount = async (req, res) => {
  try {
    const count = await prisma.notification.count({
      where: {
        receiverId: req.user.id,
        isRead: false
      }
    });

    res.json({ count });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ error: 'Failed to get unread count' });
  }
};

// Mark notification as read
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    // RLS: Verify ownership before updating
    const notification = await prisma.notification.findUnique({
      where: { id },
      select: { receiverId: true }
    });

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    if (notification.receiverId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await prisma.notification.update({
      where: { id },
      data: { isRead: true }
    });

    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ error: 'Failed to mark as read' });
  }
};

// Mark all as read
const markAllAsRead = async (req, res) => {
  try {
    await prisma.notification.updateMany({
      where: {
        receiverId: req.user.id,
        isRead: false
      },
      data: { isRead: true }
    });

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({ error: 'Failed to mark all as read' });
  }
};

// Delete notification
const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    // RLS: Verify ownership before deleting
    const notification = await prisma.notification.findUnique({
      where: { id },
      select: { receiverId: true }
    });

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    if (notification.receiverId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await prisma.notification.delete({
      where: { id }
    });

    res.json({ message: 'Notification deleted' });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ error: 'Failed to delete notification' });
  }
};

const webPush = require('web-push');

// Configure Web Push with safety check
const publicVapidKey = process.env.VAPID_PUBLIC_KEY;
const privateVapidKey = process.env.VAPID_PRIVATE_KEY;

if (publicVapidKey && privateVapidKey) {
  try {
    webPush.setVapidDetails(
      'mailto:developer@schooldost.com',
      publicVapidKey,
      privateVapidKey
    );
    console.log('✅ Web Push notifications configured');
  } catch (err) {
    console.error('❌ Failed to configure Web Push:', err.message);
  }
} else {
  console.warn('⚠️ Web Push keys missing in .env. Push notifications will be disabled.');
}

// Subscribe to Push Notifications
const subscribeToPush = async (req, res) => {
  try {
    const subscription = req.body;

    // Save subscription to DB
    await prisma.pushSubscription.create({
      data: {
        userId: req.user.id,
        endpoint: subscription.endpoint,
        keys: JSON.stringify(subscription.keys)
      }
    });

    res.status(201).json({ message: 'Push subscription saved' });
  } catch (error) {
    // Ignore duplicate key errors (if user re-subscribes)
    if (error.code === 'P2002') return res.status(200).json({ message: 'Already subscribed' });
    console.error('Subscribe error:', error);
    res.status(500).json({ error: 'Failed to subscribe' });
  }
};

// ... existing functions ...

// Helper: Send Push
const sendPush = async (userId, payload) => {
  try {
    const subscriptions = await prisma.pushSubscription.findMany({
      where: { userId }
    });

    const notificationPayload = JSON.stringify(payload);

    const promises = subscriptions.map(sub => {
      const pushConfig = {
        endpoint: sub.endpoint,
        keys: JSON.parse(sub.keys)
      };
      return webPush.sendNotification(pushConfig, notificationPayload)
        .catch(err => {
          if (err.statusCode === 410 || err.statusCode === 404) {
            // Expired/Invalid subscription, delete it
            return prisma.pushSubscription.delete({ where: { id: sub.id } });
          }
          console.error('Push send error:', err);
        });
    });

    await Promise.all(promises);
  } catch (error) {
    console.error('Send push helper error:', error);
  }
};

// Create notification helper (Modified for Grouping)
const createNotification = async ({ receiverId, senderId, type, postId = null, message }) => {
  try {
    // Don't notify yourself
    if (receiverId === senderId) return;

    // Grouping logic for LIKES
    if (type === 'LIKE' && postId) {
      const existing = await prisma.notification.findFirst({
        where: {
          receiverId,
          type: 'LIKE',
          postId,
          isRead: false
        }
      });

      if (existing) {
        // Get generic like count
        const count = await prisma.like.count({
          where: { postId }
        });

        const sender = await prisma.user.findUnique({
          where: { id: senderId },
          select: { username: true }
        });

        if (count > 1) {
          const newMessage = `${sender.username} and ${count - 1} others liked your post`;
          await prisma.notification.update({
            where: { id: existing.id },
            data: {
              senderId, // Update to latest liker
              message: newMessage,
              updatedAt: new Date()
            }
          });
          return; // Stop here, don't create new
        }
      }
    }

    const notification = await prisma.notification.create({
      data: {
        receiverId,
        senderId,
        type,
        postId,
        message,
        isRead: false
      },
      include: {
        sender: { select: { username: true } }
      }
    });

    // Valid Push Types
    const pushMessage = notification.message || `${notification.sender?.username} performed an action`;

    // Fire and forget push
    sendPush(receiverId, {
      title: 'SchoolDost',
      body: pushMessage,
      url: postId ? `/post/${postId}` : '/notifications'
    });

  } catch (error) {
    console.error('Create notification error:', error);
  }
};

module.exports = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  createNotification,
  subscribeToPush
};

