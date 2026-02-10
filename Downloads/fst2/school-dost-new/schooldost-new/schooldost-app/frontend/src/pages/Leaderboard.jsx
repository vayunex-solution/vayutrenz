import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { gamificationAPI } from '../services/api';
import { getAvatarUrl } from '../utils/imageUtils';
import { FiAward, FiTrendingUp, FiStar, FiShield } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

export default function Leaderboard() {
    const { user } = useAuth();
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadLeaderboard();
    }, []);

    const loadLeaderboard = async () => {
        try {
            const { data } = await gamificationAPI.getLeaderboard();
            setLeaderboard(data.leaderboard || []);
        } catch (error) {
            console.error('Load leaderboard error:', error);
            toast.error('Failed to load leaderboard');
        } finally {
            setLoading(false);
        }
    };

    const getRankIcon = (index) => {
        if (index === 0) return <span className="rank-icon gold">🥇</span>;
        if (index === 1) return <span className="rank-icon silver">🥈</span>;
        if (index === 2) return <span className="rank-icon bronze">🥉</span>;
        return <span className="rank-number">{index + 1}</span>;
    };

    return (
        <div className="app-layout">
            <Sidebar />
            <main className="main-content">
                <div className="page-header">
                    <div>
                        <h1>Campus Leaderboard</h1>
                        <p className="subtitle">Top students making an impact</p>
                    </div>
                    <div className="my-stats-badge">
                        <FiStar className="star-icon" />
                        <div>
                            <strong>{user?.points || 0} Points</strong>
                            <span>Level {user?.level || 1}</span>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="loading-spinner-container"><div className="spinner"></div></div>
                ) : (
                    <div className="leaderboard-card card">
                        <div className="leaderboard-header">
                            <div className="col-rank">Rank</div>
                            <div className="col-user">Student</div>
                            <div className="col-college">College</div>
                            <div className="col-points">Points</div>
                        </div>

                        <div className="leaderboard-list">
                            {leaderboard.length === 0 ? <div className="text-center p-4">No data yet.</div> : (
                                leaderboard.map((u, index) => (
                                    <div key={u.id} className={`leaderboard-row ${u.id === user?.id ? 'current-user' : ''}`}>
                                        <div className="col-rank">
                                            {getRankIcon(index)}
                                        </div>
                                        <div className="col-user">
                                            <img src={getAvatarUrl(u)} className="avatar-sm" alt="" />
                                            <div>
                                                <strong>{u.fullName}</strong>
                                                <div className="badges-row">
                                                    <span className="level-badge">Lvl {u.level}</span>
                                                    {u._count?.badges > 0 && <span className="badge-count"><FiAward /> {u._count.badges}</span>}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-college text-muted">{u.college || 'N/A'}</div>
                                        <div className="col-points">
                                            <strong>{u.points}</strong>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </main>

            <style>{`
         .my-stats-badge {
            background: var(--bg-card);
            padding: 10px 20px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            gap: 15px;
            box-shadow: var(--shadow-sm);
            border: 1px solid var(--border-color);
         }
         .star-icon {
            font-size: 1.5rem;
            color: var(--accent-yellow);
         }
         .leaderboard-card {
            padding: 0;
            overflow: hidden;
         }
         .leaderboard-header {
            display: grid;
            grid-template-columns: 60px 2fr 1.5fr 1fr;
            padding: 15px 20px;
            background: var(--bg-secondary);
            font-weight: 600;
            color: var(--text-secondary);
            border-bottom: 1px solid var(--border-color);
         }
         .leaderboard-list {
            max-height: 600px;
            overflow-y: auto;
         }
         .leaderboard-row {
            display: grid;
            grid-template-columns: 60px 2fr 1.5fr 1fr;
            padding: 15px 20px;
            align-items: center;
            border-bottom: 1px solid var(--border-color);
            transition: background 0.2s;
         }
         .leaderboard-row:hover {
            background: var(--bg-secondary);
         }
         .leaderboard-row.current-user {
            background: rgba(var(--primary-rgb), 0.1);
            border-left: 3px solid var(--primary-color);
         }
         .col-rank {
            display: flex;
            justify-content: center;
            align-items: center;
            font-weight: bold;
            font-size: 1.2rem;
         }
         .rank-number {
            color: var(--text-muted);
            font-size: 1rem;
         }
         .col-user {
            display: flex;
            align-items: center;
            gap: 12px;
         }
         .badges-row {
            display: flex;
            gap: 6px;
            margin-top: 2px;
            font-size: 0.75rem;
         }
         .level-badge {
            background: var(--bg-secondary);
            border: 1px solid var(--border-color);
            padding: 1px 6px;
            border-radius: 4px;
            color: var(--text-secondary);
         }
         .badge-count {
            display: flex;
            align-items: center;
            gap: 2px;
            color: var(--accent-yellow);
         }
         .col-points {
            text-align: right;
            font-size: 1.1rem;
            color: var(--primary-color);
         }
         @media (max-width: 600px) {
            .leaderboard-header, .leaderboard-row {
               grid-template-columns: 40px 1fr 60px;
            }
            .col-college { display: none; }
         }
      `}</style>
        </div>
    );
}
