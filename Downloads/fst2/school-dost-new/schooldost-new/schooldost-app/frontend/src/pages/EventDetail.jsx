import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { eventAPI } from '../services/api';
import { getAvatarUrl } from '../utils/imageUtils';
import { FiCalendar, FiMapPin, FiClock, FiCheck, FiUser, FiTrash2, FiShare2, FiHeart } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function EventDetail() {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [rsvpStatus, setRsvpStatus] = useState(null); // 'going', 'interested', 'not_going', null

    useEffect(() => {
        loadEvent();
    }, [eventId]);

    const loadEvent = async () => {
        try {
            const { data } = await eventAPI.get(eventId);
            setEvent(data.event);
            setRsvpStatus(data.event.myRSVP);
        } catch (error) {
            console.error('Load event error:', error);
            toast.error('Event not found');
            navigate('/events');
        } finally {
            setLoading(false);
        }
    };

    const handleRSVP = async (status) => {
        try {
            await eventAPI.rsvp(eventId, status);
            setRsvpStatus(status);
            toast.success(status === 'not_going' ? 'Removed from event' : `You are ${status}!`);
            // Refresh to update counts/lists
            loadEvent();
        } catch (error) {
            toast.error('Failed to RSVP');
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Delete this event?')) return;
        try {
            await eventAPI.delete(eventId);
            toast.success('Event deleted');
            navigate('/events');
        } catch (error) {
            toast.error('Failed to delete');
        }
    };

    if (loading) return <div className="app-layout"><Sidebar /><div className="main-content"><div className="spinner"></div></div></div>;
    if (!event) return null;

    const isOrganizer = event.organizerId === user.id;
    const startDate = new Date(event.dateTime);

    return (
        <div className="app-layout">
            <Sidebar />
            <main className="main-content">
                <div className="event-detail-container">
                    {/* Header Image */}
                    <div className="event-cover" style={{
                        backgroundImage: event.imageUrl ? `url(${event.imageUrl})` : 'var(--accent-gradient)',
                        backgroundColor: event.imageUrl ? 'transparent' : 'var(--primary-color)'
                    }}>
                        <button className="back-btn" onClick={() => navigate('/events')}>&larr; Back</button>
                    </div>

                    <div className="event-content-body">
                        <div className="event-main">
                            <span className="category-badge">{event.category || 'Event'}</span>
                            <h1 className="event-title">{event.title}</h1>

                            <div className="organizer-row">
                                <img src={getAvatarUrl(event.organizer)} className="avatar-sm" alt="" />
                                <span>Hosted by <strong>{event.organizer.fullName}</strong></span>
                            </div>

                            <div className="event-meta-grid">
                                <div className="meta-item">
                                    <div className="icon-box"><FiCalendar /></div>
                                    <div>
                                        <strong>{startDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</strong>
                                        <span>{startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                </div>
                                <div className="meta-item">
                                    <div className="icon-box"><FiMapPin /></div>
                                    <div>
                                        <strong>{event.location || 'Online'}</strong>
                                        <span>Location</span>
                                    </div>
                                </div>
                            </div>

                            <div className="event-description">
                                <h3>About Event</h3>
                                <p>{event.description || 'No description provided.'}</p>
                            </div>

                            <div className="rsvp-section card">
                                <h3>Your RSVP</h3>
                                <div className="rsvp-buttons">
                                    <button
                                        className={`btn ${rsvpStatus === 'going' ? 'btn-primary' : 'btn-outline'}`}
                                        onClick={() => handleRSVP('going')}
                                    >
                                        <FiCheck /> Going
                                    </button>
                                    <button
                                        className={`btn ${rsvpStatus === 'interested' ? 'btn-secondary' : 'btn-outline'}`}
                                        onClick={() => handleRSVP('interested')}
                                    >
                                        <FiHeart /> Interested
                                    </button>
                                    {rsvpStatus && (
                                        <button className="btn btn-outline text-danger" onClick={() => handleRSVP('not_going')}>
                                            Not Going
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="event-sidebar">
                            {isOrganizer && (
                                <div className="card admin-card">
                                    <h3>Organizer Controls</h3>
                                    <button className="btn btn-danger w-100" onClick={handleDelete}><FiTrash2 /> Delete Event</button>
                                </div>
                            )}

                            <div className="card attendees-card">
                                <h3>Attendees</h3>
                                <div className="stats-row">
                                    <div><strong>{event.goingCount}</strong> Going</div>
                                    <div><strong>{event.interestedCount}</strong> Interested</div>
                                </div>

                                <div className="attendees-list">
                                    {event.rsvps && event.rsvps.filter(r => r.status === 'going').slice(0, 10).map(rsvp => (
                                        <div key={rsvp.user.id} className="attendee-row" title={rsvp.user.fullName}>
                                            <img src={getAvatarUrl(rsvp.user)} className="avatar-xs" alt="" />
                                            <span>{rsvp.user.fullName}</span>
                                        </div>
                                    ))}
                                    {event.goingCount === 0 && <p className="text-muted small">Be the first to join!</p>}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <style>{`
         .event-cover {
            height: 250px;
            border-radius: 16px;
            position: relative;
            background-size: cover;
            background-position: center;
            margin-bottom: 20px;
         }
         .back-btn {
            position: absolute;
            top: 20px;
            left: 20px;
            background: rgba(0,0,0,0.5);
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 20px;
            cursor: pointer;
            backdrop-filter: blur(4px);
         }
         .event-content-body {
            display: grid;
            grid-template-columns: 2fr 1fr;
            gap: 24px;
         }
         @media (max-width: 768px) {
            .event-content-body {
               grid-template-columns: 1fr;
            }
         }
         .category-badge {
            background: var(--primary-color);
            color: white;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.8rem;
            text-transform: uppercase;
            font-weight: bold;
         }
         .event-title {
            margin: 10px 0;
            font-size: 2rem;
         }
         .organizer-row {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 24px;
            color: var(--text-muted);
         }
         .event-meta-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 30px;
            background: var(--bg-card);
            padding: 20px;
            border-radius: 12px;
            border: 1px solid var(--border-color);
         }
         .meta-item {
            display: flex;
            align-items: center;
            gap: 15px;
         }
         .icon-box {
            width: 40px;
            height: 40px;
            background: var(--bg-secondary);
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--primary-color);
            font-size: 1.2rem;
         }
         .rsvp-buttons {
            display: flex;
            gap: 10px;
            margin-top: 15px;
            flex-wrap: wrap;
         }
         .btn-outline {
            background: transparent;
            border: 1px solid var(--border-color);
            color: var(--text-primary);
         }
         .stats-row {
            display: flex;
            gap: 15px;
            margin-bottom: 15px;
            font-size: 0.9rem;
         }
         .attendee-row {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 8px 0;
            border-bottom: 1px solid var(--border-color);
         }
         .avatar-xs {
            width: 24px;
            height: 24px;
            border-radius: 50%;
            object-fit: cover;
         }
      `}</style>
        </div>
    );
}
