// Post Controller
const prisma = require('../config/database');

// Create a new post
const createPost = async (req, res) => {
    try {
        const { content, imageUrl, videoUrl, batchTag } = req.body;

        if (!content && !imageUrl && !videoUrl) {
            return res.status(400).json({ error: 'Post must have content or media' });
        }

        const post = await prisma.post.create({
            data: {
                content: content || '',
                imageUrl,
                videoUrl,
                batchTag,
                authorId: req.user.id
            },
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
                    select: { likes: true, comments: true }
                }
            }
        });

        // Extract and update hashtags
        const hashtags = content?.match(/#\w+/g) || [];
        for (const tag of hashtags) {
            const tagName = tag.toLowerCase();
            await prisma.hashtag.upsert({
                where: { name: tagName },
                update: { count: { increment: 1 } },
                create: { name: tagName, count: 1 }
            });
        }

        res.status(201).json({ post });
    } catch (error) {
        console.error('Create post error:', error);
        res.status(500).json({ error: 'Failed to create post' });
    }
};

// Get feed posts
const getFeed = async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const posts = await prisma.post.findMany({
            skip,
            take: parseInt(limit),
            orderBy: { createdAt: 'desc' },
            include: {
                author: {
                    select: {
                        id: true,
                        fullName: true,
                        username: true,
                        avatarUrl: true,
                        batch: true
                    }
                },
                _count: {
                    select: { likes: true, comments: true }
                },
                likes: req.user ? {
                    where: { userId: req.user.id },
                    select: { id: true }
                } : false
            }
        });

        // Add isLiked field
        const postsWithLikeStatus = posts.map(post => ({
            ...post,
            isLiked: req.user ? post.likes?.length > 0 : false,
            likes: undefined // Remove likes array from response
        }));

        res.json({ posts: postsWithLikeStatus });
    } catch (error) {
        console.error('Get feed error:', error);
        res.status(500).json({ error: 'Failed to get feed' });
    }
};

// Get single post
const getPost = async (req, res) => {
    try {
        const { id } = req.params;

        const post = await prisma.post.findUnique({
            where: { id },
            include: {
                author: {
                    select: {
                        id: true,
                        fullName: true,
                        username: true,
                        avatarUrl: true,
                        batch: true
                    }
                },
                comments: {
                    orderBy: { createdAt: 'desc' },
                    include: {
                        user: {
                            select: {
                                id: true,
                                fullName: true,
                                username: true,
                                avatarUrl: true
                            }
                        }
                    }
                },
                _count: {
                    select: { likes: true, comments: true }
                }
            }
        });

        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        // Check if current user liked this post
        let isLiked = false;
        if (req.user) {
            const like = await prisma.like.findUnique({
                where: {
                    userId_postId: {
                        userId: req.user.id,
                        postId: id
                    }
                }
            });
            isLiked = !!like;
        }

        res.json({ post: { ...post, isLiked } });
    } catch (error) {
        console.error('Get post error:', error);
        res.status(500).json({ error: 'Failed to get post' });
    }
};

// Delete post
const deletePost = async (req, res) => {
    try {
        const { id } = req.params;

        const post = await prisma.post.findUnique({
            where: { id },
            select: { authorId: true }
        });

        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        if (post.authorId !== req.user.id) {
            return res.status(403).json({ error: 'Not authorized to delete this post' });
        }

        await prisma.post.delete({ where: { id } });

        res.json({ message: 'Post deleted successfully' });
    } catch (error) {
        console.error('Delete post error:', error);
        res.status(500).json({ error: 'Failed to delete post' });
    }
};

// Like post
const likePost = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if post exists
        const post = await prisma.post.findUnique({
            where: { id },
            select: { authorId: true }
        });

        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        // Check if already liked
        const existingLike = await prisma.like.findUnique({
            where: {
                userId_postId: {
                    userId: req.user.id,
                    postId: id
                }
            }
        });

        if (existingLike) {
            // Unlike
            await prisma.like.delete({
                where: { id: existingLike.id }
            });
            return res.json({ message: 'Post unliked', liked: false });
        }

        // Like
        await prisma.like.create({
            data: {
                userId: req.user.id,
                postId: id
            }
        });

        // Create notification (if not own post)
        if (post.authorId !== req.user.id) {
            await prisma.notification.create({
                data: {
                    type: 'like',
                    receiverId: post.authorId,
                    senderId: req.user.id,
                    postId: id
                }
            });
        }

        res.json({ message: 'Post liked', liked: true });
    } catch (error) {
        console.error('Like post error:', error);
        res.status(500).json({ error: 'Failed to like post' });
    }
};

// Comment on post
const commentOnPost = async (req, res) => {
    try {
        const { id } = req.params;
        const { content } = req.body;

        if (!content?.trim()) {
            return res.status(400).json({ error: 'Comment content is required' });
        }

        // Check if post exists
        const post = await prisma.post.findUnique({
            where: { id },
            select: { authorId: true }
        });

        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        const comment = await prisma.comment.create({
            data: {
                content: content.trim(),
                userId: req.user.id,
                postId: id
            },
            include: {
                user: {
                    select: {
                        id: true,
                        fullName: true,
                        username: true,
                        avatarUrl: true
                    }
                }
            }
        });

        // Create notification (if not own post)
        if (post.authorId !== req.user.id) {
            await prisma.notification.create({
                data: {
                    type: 'comment',
                    receiverId: post.authorId,
                    senderId: req.user.id,
                    postId: id
                }
            });
        }

        res.status(201).json({ comment });
    } catch (error) {
        console.error('Comment error:', error);
        res.status(500).json({ error: 'Failed to add comment' });
    }
};

// Get user's posts
const getUserPosts = async (req, res) => {
    try {
        const { userId } = req.params;
        const { page = 1, limit = 20 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const posts = await prisma.post.findMany({
            where: { authorId: userId },
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
                    select: { likes: true, comments: true }
                }
            }
        });

        res.json({ posts });
    } catch (error) {
        console.error('Get user posts error:', error);
        res.status(500).json({ error: 'Failed to get posts' });
    }
};

// Get trending hashtags
const getTrending = async (req, res) => {
    try {
        const { limit = 10 } = req.query;

        const hashtags = await prisma.hashtag.findMany({
            take: parseInt(limit),
            orderBy: { count: 'desc' }
        });

        res.json({ hashtags });
    } catch (error) {
        console.error('Get trending error:', error);
        res.status(500).json({ error: 'Failed to get trending' });
    }
};

module.exports = {
    createPost,
    getFeed,
    getPost,
    deletePost,
    likePost,
    commentOnPost,
    getUserPosts,
    getTrending
};
