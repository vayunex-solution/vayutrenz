// Post Controller
const prisma = require('../config/database');
const { getIO } = require('../socket/socket.registry');
const { sendNotification } = require('../socket/socket.handler');

// Create a new post
const createPost = async (req, res) => {
    try {
        const { content, media, batchTag, poll } = req.body; // poll: { question, options: ['opt1', 'opt2', ...] }

        if (!content && (!media || media.length === 0) && !poll) {
            return res.status(400).json({ error: 'Post must have content, media, or poll' });
        }

        const postData = {
            content: content || '',
            batchTag,
            authorId: req.user.id
        };

        if (media && media.length > 0) {
            postData.media = {
                create: media.map((item, index) => ({
                    url: item.url,
                    type: item.type || 'IMAGE',
                    order: index
                }))
            };
        }

        // Add poll if provided
        if (poll && poll.question && poll.options && poll.options.length >= 2) {
            postData.poll = {
                create: {
                    question: poll.question,
                    options: {
                        create: poll.options.map(text => ({ text }))
                    }
                }
            };
        }

        const post = await prisma.post.create({
            data: postData,
            include: {
                author: {
                    select: {
                        id: true,
                        fullName: true,
                        username: true,
                        avatarUrl: true
                    }
                },
                media: true,
                poll: {
                    include: {
                        options: {
                            include: {
                                _count: { select: { votes: true } }
                            }
                        },
                        _count: { select: { votes: true } }
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

// Get feed posts — Smart Algorithm
const getFeed = async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const take = parseInt(limit);
        const skip = (parseInt(page) - 1) * take;

        // Get blocked user IDs to filter out
        let blockedIds = [];
        if (req.user) {
            const blocks = await prisma.block.findMany({
                where: { OR: [{ blockerId: req.user.id }, { blockedId: req.user.id }] },
                select: { blockerId: true, blockedId: true }
            });
            blockedIds = [...new Set(blocks.map(b => b.blockerId === req.user.id ? b.blockedId : b.blockerId))];
        }

        const postInclude = {
            author: {
                select: { id: true, fullName: true, username: true, avatarUrl: true, batch: true }
            },
            _count: { select: { likes: true, comments: true } },
            media: { orderBy: { order: 'asc' } },
            poll: {
                include: {
                    options: { include: { _count: { select: { votes: true } } } },
                    _count: { select: { votes: true } }
                }
            },
            likes: req.user ? { where: { userId: req.user.id }, select: { id: true } } : false,
            reposts: req.user ? { where: { userId: req.user.id }, select: { id: true } } : false,
            repostOf: {
                include: {
                    author: { select: { id: true, fullName: true, username: true, avatarUrl: true } }
                }
            },
            comments: {
                take: 3,
                orderBy: { createdAt: 'desc' },
                include: {
                    user: { select: { id: true, fullName: true, username: true, avatarUrl: true } }
                }
            }
        };

        let followedPosts = [];
        let discoveryPosts = [];

        if (req.user) {
            // Get IDs of users the current user follows
            const follows = await prisma.follow.findMany({
                where: { followerId: req.user.id },
                select: { followingId: true }
            });
            const followingIds = follows.map(f => f.followingId);

            // Followed users' posts (priority)
            if (followingIds.length > 0) {
                followedPosts = await prisma.post.findMany({
                    where: {
                        authorId: { in: [...followingIds, req.user.id] },
                        NOT: { authorId: { in: blockedIds } }
                    },
                    take: take * 2,
                    orderBy: { createdAt: 'desc' },
                    include: postInclude
                });
            }

            // Discovery posts (from non-followed users)
            discoveryPosts = await prisma.post.findMany({
                where: {
                    NOT: {
                        authorId: { in: [...followingIds, req.user.id, ...blockedIds] }
                    }
                },
                take: take,
                orderBy: { createdAt: 'desc' },
                include: postInclude
            });
        } else {
            // Non-logged-in: just chronological
            discoveryPosts = await prisma.post.findMany({
                skip,
                take,
                orderBy: { createdAt: 'desc' },
                include: postInclude
            });
        }

        // Scoring function for smart ranking
        const scorePost = (post, isFromFollowed) => {
            const ageHours = (Date.now() - new Date(post.createdAt).getTime()) / 3600000;
            const likes = post._count?.likes || 0;
            const comments = post._count?.comments || 0;
            const hasMedia = post.media?.length > 0 || post.poll ? 1 : 0;

            // Engagement score
            let score = (likes * 2) + (comments * 3) + (hasMedia * 5);
            // Recency decay (halves every 12 hours)
            score = score / (1 + ageHours / 12);
            // Boost followed users
            if (isFromFollowed) score += 20;
            // Small random factor for variety
            score += Math.random() * 3;

            return score;
        };

        // Score and merge
        const scoredFollowed = followedPosts.map(p => ({ ...p, _score: scorePost(p, true) }));
        const scoredDiscovery = discoveryPosts.map(p => ({ ...p, _score: scorePost(p, false) }));

        // Merge, deduplicate, sort by score
        const seen = new Set();
        const allPosts = [...scoredFollowed, ...scoredDiscovery]
            .filter(p => { if (seen.has(p.id)) return false; seen.add(p.id); return true; })
            .sort((a, b) => b._score - a._score)
            .slice(skip, skip + take);

        // Add isLiked/isReposted fields
        const postsWithStatus = allPosts.map(post => ({
            ...post,
            isLiked: req.user ? post.likes?.length > 0 : false,
            isReposted: req.user ? post.reposts?.length > 0 : false,
            likes: undefined,
            reposts: undefined,
            _score: undefined
        }));

        res.json({ posts: postsWithStatus });
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
                media: {
                    orderBy: { order: 'asc' }
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
            const notification = await prisma.notification.create({
                data: {
                    type: 'like',
                    receiverId: post.authorId,
                    senderId: req.user.id,
                    postId: id
                },
                include: {
                    sender: {
                        select: { id: true, fullName: true, avatarUrl: true }
                    }
                }
            });

            // Emit real-time notification
            if (getIO()) sendNotification(getIO(), post.authorId, notification);
        }

        res.json({ message: 'Post liked', liked: true });
    } catch (error) {
        console.error('Like post error:', error);
        res.status(500).json({ error: 'Failed to like post' });
    }
};

// Comment on post (supports nested replies)
const commentOnPost = async (req, res) => {
    try {
        const { id } = req.params;
        const { content, parentId } = req.body;

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

        // If replying, check parent comment exists
        if (parentId) {
            const parentComment = await prisma.comment.findUnique({ where: { id: parentId } });
            if (!parentComment) {
                return res.status(404).json({ error: 'Parent comment not found' });
            }
        }

        const comment = await prisma.comment.create({
            data: {
                content: content.trim(),
                userId: req.user.id,
                postId: id,
                parentId: parentId || null
            },
            include: {
                user: {
                    select: {
                        id: true,
                        fullName: true,
                        username: true,
                        avatarUrl: true
                    }
                },
                _count: { select: { likes: true, replies: true } }
            }
        });

        // Create notification (if not own post)
        if (post.authorId !== req.user.id) {
            const notification = await prisma.notification.create({
                data: {
                    type: 'comment',
                    receiverId: post.authorId,
                    senderId: req.user.id,
                    postId: id
                },
                include: {
                    sender: {
                        select: { id: true, fullName: true, avatarUrl: true }
                    }
                }
            });

            if (getIO()) sendNotification(getIO(), post.authorId, notification);
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
                media: {
                    orderBy: { order: 'asc' }
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


// Update post
const updatePost = async (req, res) => {
    try {
        const { id } = req.params;
        const { content } = req.body;

        const post = await prisma.post.findUnique({
            where: { id },
            select: { authorId: true }
        });

        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        if (post.authorId !== req.user.id) {
            return res.status(403).json({ error: 'Not authorized to edit this post' });
        }

        const updatedPost = await prisma.post.update({
            where: { id },
            data: { content },
            include: {
                author: {
                    select: {
                        id: true,
                        fullName: true,
                        username: true,
                        avatarUrl: true
                    }
                }
            }
        });

        res.json({ post: updatedPost });
    } catch (error) {
        console.error('Update post error:', error);
        res.status(500).json({ error: 'Failed to update post' });
    }
};

// Toggle Save Post
const savePost = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        // Check if post exists
        const post = await prisma.post.findUnique({ where: { id } });
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        // Check if already saved
        const existingSave = await prisma.savedPost.findUnique({
            where: {
                userId_postId: {
                    userId,
                    postId: id
                }
            }
        });

        if (existingSave) {
            // Unsave
            await prisma.savedPost.delete({
                where: { id: existingSave.id }
            });
            return res.json({ message: 'Post unsaved', saved: false });
        } else {
            // Save
            await prisma.savedPost.create({
                data: {
                    userId,
                    postId: id
                }
            });
            return res.json({ message: 'Post saved', saved: true });
        }
    } catch (error) {
        console.error('Save post error:', error);
        res.status(500).json({ error: 'Failed to toggle save post' });
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

// Get posts by hashtag
const getPostsByHashtag = async (req, res) => {
    try {
        const { tag } = req.params;
        const { page = 1, limit = 20 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const posts = await prisma.post.findMany({
            where: {
                content: {
                    contains: `#${tag}`
                }
            },
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
                media: {
                    orderBy: { order: 'asc' }
                },
                likes: req.user ? {
                    where: { userId: req.user.id },
                    select: { id: true }
                } : false,
                comments: {
                    take: 3,
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
                }
            }
        });

        // Add isLiked field
        const postsWithLikeStatus = posts.map(post => ({
            ...post,
            isLiked: req.user ? post.likes?.length > 0 : false,
            likes: undefined
        }));

        res.json({ posts: postsWithLikeStatus });
    } catch (error) {
        console.error('Get posts by hashtag error:', error);
        res.status(500).json({ error: 'Failed to get posts by hashtag' });
    }
};

// Vote on a poll
const votePoll = async (req, res) => {
    try {
        const { pollId, optionId } = req.body;

        if (!pollId || !optionId) {
            return res.status(400).json({ error: 'Poll ID and Option ID are required' });
        }

        // Check if already voted
        const existingVote = await prisma.pollVote.findUnique({
            where: {
                userId_pollId: {
                    userId: req.user.id,
                    pollId
                }
            }
        });

        if (existingVote) {
            return res.status(400).json({ error: 'You have already voted on this poll' });
        }

        // Create vote
        await prisma.pollVote.create({
            data: {
                userId: req.user.id,
                pollId,
                optionId
            }
        });

        // Get updated poll with vote counts
        const poll = await prisma.poll.findUnique({
            where: { id: pollId },
            include: {
                options: {
                    include: {
                        _count: { select: { votes: true } }
                    }
                },
                _count: { select: { votes: true } }
            }
        });

        res.json({ poll, voted: true });
    } catch (error) {
        console.error('Vote poll error:', error);
        res.status(500).json({ error: 'Failed to vote on poll' });
    }
};


// Delete comment
const deleteComment = async (req, res) => {
    try {
        const { commentId } = req.params;

        const comment = await prisma.comment.findUnique({
            where: { id: commentId },
            select: { userId: true }
        });

        if (!comment) return res.status(404).json({ error: 'Comment not found' });
        if (comment.userId !== req.user.id) return res.status(403).json({ error: 'Not authorized' });

        await prisma.comment.delete({ where: { id: commentId } });
        res.json({ message: 'Comment deleted' });
    } catch (error) {
        console.error('Delete comment error:', error);
        res.status(500).json({ error: 'Failed to delete comment' });
    }
};

// Edit comment  
const editComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const { content } = req.body;

        if (!content?.trim()) return res.status(400).json({ error: 'Content is required' });

        const comment = await prisma.comment.findUnique({
            where: { id: commentId },
            select: { userId: true }
        });

        if (!comment) return res.status(404).json({ error: 'Comment not found' });
        if (comment.userId !== req.user.id) return res.status(403).json({ error: 'Not authorized' });

        const updated = await prisma.comment.update({
            where: { id: commentId },
            data: { content: content.trim(), isEdited: true },
            include: {
                user: { select: { id: true, fullName: true, username: true, avatarUrl: true } },
                _count: { select: { likes: true, replies: true } }
            }
        });

        res.json({ comment: updated });
    } catch (error) {
        console.error('Edit comment error:', error);
        res.status(500).json({ error: 'Failed to edit comment' });
    }
};

// Like/Unlike comment
const likeComment = async (req, res) => {
    try {
        const { commentId } = req.params;

        const existing = await prisma.commentLike.findUnique({
            where: { userId_commentId: { userId: req.user.id, commentId } }
        });

        if (existing) {
            await prisma.commentLike.delete({ where: { id: existing.id } });
            return res.json({ liked: false });
        }

        await prisma.commentLike.create({
            data: { userId: req.user.id, commentId }
        });

        res.json({ liked: true });
    } catch (error) {
        console.error('Like comment error:', error);
        res.status(500).json({ error: 'Failed to like comment' });
    }
};

// Repost/Share a post
const repostPost = async (req, res) => {
    try {
        const { id } = req.params;
        const { content } = req.body; // optional quote text

        const post = await prisma.post.findUnique({
            where: { id },
            select: { id: true, authorId: true }
        });

        if (!post) return res.status(404).json({ error: 'Post not found' });

        // Check if already reposted
        const existing = await prisma.repost.findUnique({
            where: { userId_postId: { userId: req.user.id, postId: id } }
        });

        if (existing) {
            // Undo repost
            await prisma.repost.delete({ where: { id: existing.id } });
            return res.json({ reposted: false });
        }

        // Create repost record
        await prisma.repost.create({
            data: { userId: req.user.id, postId: id }
        });

        // If quote repost (has content), create a new post referencing original
        if (content?.trim()) {
            await prisma.post.create({
                data: {
                    content: content.trim(),
                    authorId: req.user.id,
                    repostOfId: id
                }
            });
        }

        // Notify original author
        if (post.authorId !== req.user.id) {
            await prisma.notification.create({
                data: {
                    type: 'repost',
                    receiverId: post.authorId,
                    senderId: req.user.id,
                    postId: id
                }
            });
        }

        res.json({ reposted: true });
    } catch (error) {
        console.error('Repost error:', error);
        res.status(500).json({ error: 'Failed to repost' });
    }
};

module.exports = {
    createPost,
    getFeed,
    getPost,
    updatePost,
    deletePost,
    likePost,
    commentOnPost,
    deleteComment,
    editComment,
    likeComment,
    repostPost,
    getUserPosts,
    getTrending,
    savePost,
    getPostsByHashtag,
    votePoll
};
