import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom'; // Import Link
import { postAPI } from '../services/api'; // Import postAPI
import Sidebar from '../components/Sidebar';
import RightSidebar from '../components/RightSidebar';
import PostCard from '../components/PostCard'; // Import PostCard
import { FiArrowLeft } from 'react-icons/fi'; // Import FiArrowLeft

export default function HashtagPage() {
  const { tag } = useParams();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPosts = async () => {
      try {
        setLoading(true);
        const { data } = await postAPI.getByTag(tag);
        setPosts(data.posts || []);
      } catch (error) {
        console.error('Load hashtag posts error:', error);
      } finally {
        setLoading(false);
      }
    };

    if (tag) {
      loadPosts();
    }
  }, [tag]);

  return (
    <div className="app-layout">
      <Sidebar />

      <main className="main-content">
        <header className="page-header" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link to="/" className="back-button">
            <FiArrowLeft size={24} />
          </Link>
          <div>
            <h1>#{tag}</h1>
            <p>{posts.length} posts</p>
          </div>
        </header>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px' }}>
            <div className="spinner"></div>
          </div>
        ) : posts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">#</div>
            <h3>No posts found</h3>
            <p>Be the first to post with #{tag}!</p>
          </div>
        ) : (
          posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onDelete={(deletedId) => setPosts(prev => prev.filter(p => p.id !== deletedId))}
            />
          ))
        )}
      </main>

      <RightSidebar />
    </div>
  );
}
