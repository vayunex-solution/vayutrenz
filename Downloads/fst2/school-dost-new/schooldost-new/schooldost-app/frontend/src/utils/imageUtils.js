// Image URL Helper
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
// Remove /api from the end to get base URL
export const API_BASE_URL = API_URL.replace(/\/api$/, '');

export const getImageUrl = (path) => {
  if (!path) return null;

  // If it's already a full URL (Google auth, Cloudinary, etc.)
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }

  // If path starts with /, remove it to avoid double slashes
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;

  return `${API_BASE_URL}/${cleanPath}`;
};

export const getAvatarUrl = (user) => {
  if (!user) return 'https://api.dicebear.com/8.x/initials/svg?seed=User';
  if (user.avatarUrl) {
    return user.avatarUrl.startsWith('http')
      ? user.avatarUrl
      : `${API_BASE_URL}${user.avatarUrl}`;
  }
  return `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(user.fullName || 'User')}&backgroundColor=facc15&textColor=000`;
};

export const getCoverUrl = (user) => {
  if (user?.coverUrl) {
    return user.coverUrl.startsWith('http')
      ? user.coverUrl
      : `${API_BASE_URL}${user.coverUrl}`;
  }
  return null;
};
