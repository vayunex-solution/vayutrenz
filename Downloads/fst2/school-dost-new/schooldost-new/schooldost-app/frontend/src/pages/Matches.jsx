// Matches Page - Tinder-style Discovery
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { matchAPI } from '../services/api';
import { FiHeart, FiX, FiMessageCircle } from 'react-icons/fi';

export default function Matches() {
    const navigate = useNavigate();
    const [discoverUsers, setDiscoverUsers] = useState([]);
    const [matches, setMatches] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('discover');
    const [matchPopup, setMatchPopup] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [discoverRes, matchesRes] = await Promise.all([
                matchAPI.getDiscover(),
                matchAPI.getMatches()
            ]);
            setDiscoverUsers(discoverRes.data.users || []);
            setMatches(matchesRes.data.matches || []);
        } catch (error) {
            console.error('Load matches error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSwipe = async (direction) => {
        const user = discoverUsers[currentIndex];
        if (!user) return;

        try {
            const { data } = await matchAPI.swipe(user.id, direction);

            if (data.match) {
                setMatchPopup(data.match);
                setMatches(prev => [data.match, ...prev]);
            }

            // Move to next user
            if (currentIndex < discoverUsers.length - 1) {
                setCurrentIndex(prev => prev + 1);
            } else {
                // Reload discover list
                const { data: newUsers } = await matchAPI.getDiscover();
                setDiscoverUsers(newUsers.users || []);
                setCurrentIndex(0);
            }
        } catch (error) {
            console.error('Swipe error:', error);
        }
    };

    const currentUser = discoverUsers[currentIndex];

    return (
        <div className="app-layout">
            <Sidebar />

            <main className="main-content" style={{ maxWidth: 'calc(100% - var(--sidebar-width))' }}>
                <h1 style={{ marginBottom: '20px' }}>Matches</h1>

                {/* Tabs */}
                <div className="tabs">
                    <button
                        className={`tab ${activeTab === 'discover' ? 'active' : ''}`}
                        onClick={() => setActiveTab('discover')}
                    >
                        Discover
                    </button>
                    <button
                        className={`tab ${activeTab === 'matches' ? 'active' : ''}`}
                        onClick={() => setActiveTab('matches')}
                    >
                        Matches ({matches.length})
                    </button>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '60px' }}>
                        <div className="spinner"></div>
                    </div>
                ) : activeTab === 'discover' ? (
                    /* Discover Section */
                    currentUser ? (
                        <div style={{
                            maxWidth: '400px',
                            margin: '0 auto',
                            background: 'var(--bg-card)',
                            borderRadius: 'var(--border-radius)',
                            overflow: 'hidden'
                        }}>
                            <div style={{
                                height: '300px',
                                background: currentUser.avatarUrl
                                    ? `url(${currentUser.avatarUrl}) center/cover`
                                    : `url(https://api.dicebear.com/8.x/initials/svg?seed=${currentUser.fullName}) center/cover`,
                            }} />

                            <div style={{ padding: '20px' }}>
                                <h2>{currentUser.fullName}</h2>
                                <p style={{ color: 'var(--text-muted)' }}>@{currentUser.username}</p>
                                {currentUser.college && (
                                    <p style={{ marginTop: '10px' }}>{currentUser.college}</p>
                                )}
                                {currentUser.bio && (
                                    <p style={{ marginTop: '10px', color: 'var(--text-secondary)' }}>{currentUser.bio}</p>
                                )}

                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    gap: '30px',
                                    marginTop: '30px'
                                }}>
                                    <button
                                        onClick={() => handleSwipe('left')}
                                        style={{
                                            width: '60px',
                                            height: '60px',
                                            borderRadius: '50%',
                                            background: 'var(--bg-hover)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '1.5rem',
                                            color: '#f44336'
                                        }}
                                    >
                                        <FiX />
                                    </button>
                                    <button
                                        onClick={() => handleSwipe('right')}
                                        style={{
                                            width: '60px',
                                            height: '60px',
                                            borderRadius: '50%',
                                            background: 'var(--accent-primary)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '1.5rem',
                                            color: '#000'
                                        }}
                                    >
                                        <FiHeart />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
                            <p>No more users to discover. Check back later!</p>
                        </div>
                    )
                ) : (
                    /* Matches Section */
                    matches.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
                            <p>No matches yet. Keep swiping!</p>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px', marginTop: '20px' }}>
                            {matches.map(match => (
                                <div key={match.id} className="widget-card" style={{ textAlign: 'center' }}>
                                    <img
                                        src={match.user?.avatarUrl || `https://api.dicebear.com/8.x/initials/svg?seed=${match.user?.fullName}`}
                                        alt={match.user?.fullName}
                                        style={{ width: '80px', height: '80px', borderRadius: '50%', margin: '0 auto 15px' }}
                                    />
                                    <h3 style={{ fontSize: '1rem' }}>{match.user?.fullName}</h3>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>@{match.user?.username}</p>
                                    <button
                                        className="btn btn-primary"
                                        style={{ marginTop: '15px' }}
                                        onClick={() => navigate(`/messages/${match.user?.id}`)}
                                    >
                                        <FiMessageCircle /> Message
                                    </button>
                                </div>
                            ))}
                        </div>
                    )
                )}

                {/* Match Popup */}
                {matchPopup && (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0,0,0,0.8)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000
                    }} onClick={() => setMatchPopup(null)}>
                        <div style={{
                            background: 'var(--bg-card)',
                            padding: '40px',
                            borderRadius: 'var(--border-radius)',
                            textAlign: 'center'
                        }} onClick={e => e.stopPropagation()}>
                            <h2 style={{ color: 'var(--accent-primary)', marginBottom: '20px' }}>🎉 It's a Match!</h2>
                            <img
                                src={matchPopup.user?.avatarUrl || `https://api.dicebear.com/8.x/initials/svg?seed=${matchPopup.user?.fullName}`}
                                alt={matchPopup.user?.fullName}
                                style={{ width: '100px', height: '100px', borderRadius: '50%', marginBottom: '15px' }}
                            />
                            <h3>{matchPopup.user?.fullName}</h3>
                            <div style={{ display: 'flex', gap: '15px', marginTop: '25px', justifyContent: 'center' }}>
                                <button className="btn btn-secondary" onClick={() => setMatchPopup(null)}>
                                    Keep Swiping
                                </button>
                                <button
                                    className="btn btn-primary"
                                    onClick={() => {
                                        setMatchPopup(null);
                                        navigate(`/messages/${matchPopup.user?.id}`);
                                    }}
                                >
                                    Send Message
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
