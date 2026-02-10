// Events Controller - Create, RSVP, Calendar
const prisma = require('../config/database');

// Create event
const createEvent = async (req, res) => {
    try {
        const { title, description, location, dateTime, endTime, category, imageUrl, isPublic = true, groupId } = req.body;

        if (!title?.trim() || !dateTime) {
            return res.status(400).json({ error: 'Title and date/time are required' });
        }

        const event = await prisma.event.create({
            data: {
                title: title.trim(),
                description: description?.trim(),
                location: location?.trim(),
                dateTime: new Date(dateTime),
                endTime: endTime ? new Date(endTime) : null,
                category: category?.trim() || null,
                imageUrl,
                isPublic,
                groupId: groupId || null,
                organizerId: req.user.id
            },
            include: {
                organizer: {
                    select: { id: true, fullName: true, username: true, avatarUrl: true }
                },
                _count: { select: { rsvps: true } }
            }
        });

        res.status(201).json({ event });
    } catch (error) {
        console.error('Create event error:', error);
        res.status(500).json({ error: 'Failed to create event' });
    }
};

// Get upcoming events
const getEvents = async (req, res) => {
    try {
        const { category, past, limit = 20, page = 1 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const where = { isPublic: true };
        if (category) where.category = category;

        if (past === 'true') {
            where.dateTime = { lt: new Date() };
        } else {
            where.dateTime = { gte: new Date() };
        }

        const events = await prisma.event.findMany({
            where,
            skip,
            take: parseInt(limit),
            include: {
                organizer: {
                    select: { id: true, fullName: true, username: true, avatarUrl: true }
                },
                _count: { select: { rsvps: true } }
            },
            orderBy: { dateTime: past === 'true' ? 'desc' : 'asc' }
        });

        res.json({ events });
    } catch (error) {
        console.error('Get events error:', error);
        res.status(500).json({ error: 'Failed to get events' });
    }
};

// Get single event
const getEvent = async (req, res) => {
    try {
        const { id } = req.params;

        const event = await prisma.event.findUnique({
            where: { id },
            include: {
                organizer: {
                    select: { id: true, fullName: true, username: true, avatarUrl: true }
                },
                rsvps: {
                    include: {
                        user: {
                            select: { id: true, fullName: true, username: true, avatarUrl: true }
                        }
                    }
                },
                _count: { select: { rsvps: true } }
            }
        });

        if (!event) return res.status(404).json({ error: 'Event not found' });

        // Check user's RSVP status
        let myRSVP = null;
        if (req.user) {
            const rsvp = event.rsvps.find(r => r.userId === req.user.id);
            myRSVP = rsvp?.status || null;
        }

        // Count by status
        const goingCount = event.rsvps.filter(r => r.status === 'going').length;
        const interestedCount = event.rsvps.filter(r => r.status === 'interested').length;

        res.json({ event: { ...event, myRSVP, goingCount, interestedCount } });
    } catch (error) {
        console.error('Get event error:', error);
        res.status(500).json({ error: 'Failed to get event' });
    }
};

// RSVP to event
const rsvpEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // 'going', 'interested', 'not_going'

        if (!['going', 'interested', 'not_going'].includes(status)) {
            return res.status(400).json({ error: 'Invalid RSVP status' });
        }

        const event = await prisma.event.findUnique({ where: { id } });
        if (!event) return res.status(404).json({ error: 'Event not found' });

        if (status === 'not_going') {
            // Remove RSVP
            await prisma.eventRSVP.deleteMany({
                where: { userId: req.user.id, eventId: id }
            });
            return res.json({ message: 'RSVP removed' });
        }

        await prisma.eventRSVP.upsert({
            where: { userId_eventId: { userId: req.user.id, eventId: id } },
            create: { userId: req.user.id, eventId: id, status },
            update: { status }
        });

        res.json({ message: `RSVP updated to ${status}` });
    } catch (error) {
        console.error('RSVP error:', error);
        res.status(500).json({ error: 'Failed to RSVP' });
    }
};

// Get my events (organized + RSVP'd)
const getMyEvents = async (req, res) => {
    try {
        const organized = await prisma.event.findMany({
            where: { organizerId: req.user.id },
            include: {
                _count: { select: { rsvps: true } }
            },
            orderBy: { dateTime: 'asc' }
        });

        const rsvps = await prisma.eventRSVP.findMany({
            where: { userId: req.user.id },
            include: {
                event: {
                    include: {
                        organizer: {
                            select: { id: true, fullName: true, username: true, avatarUrl: true }
                        },
                        _count: { select: { rsvps: true } }
                    }
                }
            }
        });

        res.json({
            organized,
            attending: rsvps.filter(r => r.status === 'going').map(r => r.event),
            interested: rsvps.filter(r => r.status === 'interested').map(r => r.event)
        });
    } catch (error) {
        console.error('Get my events error:', error);
        res.status(500).json({ error: 'Failed to get events' });
    }
};

// Delete event (organizer only)
const deleteEvent = async (req, res) => {
    try {
        const { id } = req.params;

        const event = await prisma.event.findUnique({ where: { id } });
        if (!event) return res.status(404).json({ error: 'Event not found' });
        if (event.organizerId !== req.user.id) {
            return res.status(403).json({ error: 'Only the organizer can delete this event' });
        }

        await prisma.event.delete({ where: { id } });
        res.json({ message: 'Event deleted' });
    } catch (error) {
        console.error('Delete event error:', error);
        res.status(500).json({ error: 'Failed to delete event' });
    }
};

module.exports = { createEvent, getEvents, getEvent, rsvpEvent, getMyEvents, deleteEvent };
