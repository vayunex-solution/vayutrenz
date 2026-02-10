// Discover / Explore Page (Tinder Style)
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { matchAPI } from '../services/api';
import Sidebar from '../components/Sidebar';
import '../components/SwipeCard.css';
import { FiX, FiHeart, FiStar, FiMapPin, FiBriefcase } from 'react-icons/fi';
import { getAvatarUrl } from '../utils/imageUtils';

export default function Discover() {
    const [profiles, setProfiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [matchModal, setMatchModal] = useState(null);

    useEffect(() => {
        loadProfiles();
    }, []);

    const loadProfiles = async () => {
        try {
            const { data } = await matchAPI.getDiscover();
            setProfiles(data.users || []);
        } catch (error) {
            console.error('Load profiles error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSwipe = async (direction, user) => {
        // Remove card from stack
        setProfiles(prev => prev.filter(p => p.id !== user.id));

        try {
            const { data } = await matchAPI.swipe(user.id, direction);

            if (data.match) {
                setMatchModal(data.match.user);
            }
        } catch (error) {
            console.error('Swipe error:', error);
        }
    };

    return (
        <div className="app-layout discover-page">
            <Sidebar />

            <main className="main-content" style={{ overflow: 'hidden' }}>
                <header className="page-header" style={{ textAlign: 'center' }}>
                    <h1>Discover</h1>
                    <p>Find your perfect Study Dost based on interests</p>
                </header>

                <div className="swipe-container">
                    {loading ? (
                        <div className="spinner"></div>
                    ) : profiles.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-state-icon">🎉</div>
                            <h3>You've seen everyone!</h3>
                            <p>Come back later for more potential matches.</p>
                            <button className="btn btn-primary" onClick={loadProfiles}>
                                Refresh
                            </button>
                        </div>
                    ) : (
                        <AnimatePresence>
                            {profiles.map((profile, index) => (
                                <Card
                                    key={profile.id}
                                    profile={profile}
                                    onSwipe={handleSwipe}
                                    isTop={index === profiles.length - 1}
                                />
                            ))}
                        </AnimatePresence>
                    )}
                </div>

                {matchModal && (
                    <div className="match-popup" onClick={() => setMatchModal(null)}>
                        <div className="empty-state" style={{ background: 'white', color: 'black', padding: '40px', borderRadius: '20px' }}>
                            <h1 style={{ fontSize: '3rem', margin: '0 0 10px 0', background: 'linear-gradient(45deg, #ff4b1f, #ff9068)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                It's a Match!
                            </h1>
                            <p style={{ fontSize: '1.2rem', color: '#666' }}>
                                You and {matchModal.fullName} liked each other!
                            </p>
                            <div style={{ display: 'flex', gap: '20px', marginTop: '20px', justifyContent: 'center' }}>
                                <img src={getAvatarUrl(matchModal)} style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover' }} />
                            </div>
                            <button className="btn btn-primary" style={{ marginTop: '20px', width: '100%' }}>
                                Send Message
                            </button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

function Card({ profile, onSwipe, isTop }) {
    const x = useMotionValue(0);
    const rotate = useTransform(x, [-200, 200], [-10, 10]);
    const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);

    // Only allow drag if it's the top card
    const dragProps = isTop ? {
        drag: "x",
        dragConstraints: { left: 0, right: 0 },
        onDragEnd: (e, { offset, velocity }) => {
            const swipeThreshold = 50;
            if (offset.x > swipeThreshold) {
                onSwipe('right', profile);
            } else if (offset.x < -swipeThreshold) {
                onSwipe('left', profile);
            }
        }
    } : {};

    return (
        <motion.div
            className="swipe-card"
            style={{ x, rotate, opacity, zIndex: isTop ? 100 : 0 }}
            {...dragProps}
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            exit={{ x: x.get() < 0 ? -1000 : 1000, opacity: 0 }}
            transition={{ duration: 0.3 }}
        >
            <div className="card-image-container">
                <img
                    draggable="false"
                    src={getAvatarUrl(profile)}
                    alt={profile.fullName}
                    className="card-image"
                />
                <div className="card-gradient"></div>
                <div className="match-score-badge">
                    <FiStar color="#facc15" fill="#facc15" />
                    {Math.round(profile.matchScore?.total || 0)}% Match
                </div>
            </div>

            <div className="card-info">
                <div>
                    <h2 style={{ fontSize: '1.8rem', marginBottom: '4px' }}>
                        {profile.fullName}, <span style={{ fontWeight: 'normal', fontSize: '1.4rem' }}>{profile.batch || 'Fresher'}</span>
                    </h2>
                    <p style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <FiBriefcase /> {profile.college}
                    </p>
                    <p style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem' }}>
                        <FiMapPin /> {profile.location || 'Campus'}
                    </p>
                </div>

                <div className="swipe-buttons">
                    <button className="swipe-btn pass" onClick={() => onSwipe('left', profile)}>
                        <FiX />
                    </button>
                    <button className="swipe-btn like" onClick={() => onSwipe('right', profile)}>
                        <FiHeart fill="currentColor" />
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
