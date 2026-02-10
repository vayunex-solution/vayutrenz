import { useState, useRef } from 'react';
import { FiImage, FiVideo, FiBarChart2, FiHash, FiX, FiPlus, FiTrash2 } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { postAPI, uploadAPI } from '../services/api';
import { getAvatarUrl } from '../utils/imageUtils';
import './CreatePost.css';

export default function CreatePost({ onPostCreated }) {
  const { user } = useAuth();
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);
  const [content, setContent] = useState('');
  const [mediaFiles, setMediaFiles] = useState([]); // Array of File objects
  const [previews, setPreviews] = useState([]); // Array of { url, type }
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(false);
  
  // Poll State
  const [showPoll, setShowPoll] = useState(false);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '']);

  const handleMediaClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Validate files (max 10MB each, max 5 files total)
    if (mediaFiles.length + files.length > 5) {
      alert('You can only upload up to 5 files');
      return;
    }

    const newPreviews = [];
    const validFiles = [];

    files.forEach(file => {
      if (file.size > 10 * 1024 * 1024) {
        alert(`File ${file.name} is too large (max 10MB)`);
        return;
      }

      validFiles.push(file);

      // Create local preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews(prev => [...prev, {
          url: reader.result,
          type: file.type.startsWith('video/') ? 'VIDEO' : 'IMAGE'
        }]);
      };
      reader.readAsDataURL(file);
    });

    setMediaFiles(prev => [...prev, ...validFiles]);
  };

  const removeMedia = (index) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  // Poll Functions
  const togglePoll = () => {
    setShowPoll(!showPoll);
    if (showPoll) {
      // Closing poll - reset
      setPollQuestion('');
      setPollOptions(['', '']);
    }
  };

  const addPollOption = () => {
    if (pollOptions.length < 4) {
      setPollOptions([...pollOptions, '']);
    }
  };

  const removePollOption = (index) => {
    if (pollOptions.length > 2) {
      setPollOptions(pollOptions.filter((_, i) => i !== index));
    }
  };

  const updatePollOption = (index, value) => {
    const newOptions = [...pollOptions];
    newOptions[index] = value;
    setPollOptions(newOptions);
  };

  // Hashtag Function
  const insertHashtag = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newContent = content.slice(0, start) + '#' + content.slice(end);
      setContent(newContent);
      // Focus and set cursor after #
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + 1, start + 1);
      }, 0);
    } else {
      setContent(content + ' #');
    }
  };

  const handleSubmit = async () => {
    const hasContent = content.trim();
    const hasMedia = mediaFiles.length > 0;
    const hasPoll = showPoll && pollQuestion.trim() && pollOptions.filter(o => o.trim()).length >= 2;

    if (!hasContent && !hasMedia && !hasPoll) return;

    setLoading(true);
    try {
      let uploadedMedia = [];

      // Upload files if any
      if (mediaFiles.length > 0) {
        setUploadProgress(true);
        const { data } = await uploadAPI.images(mediaFiles);
        // Map response urls to media structure
        uploadedMedia = data.imageUrls.map((url, index) => ({
          url,
          type: mediaFiles[index].type.startsWith('video/') ? 'VIDEO' : 'IMAGE'
        }));
        setUploadProgress(false);
      }

      // Prepare post data
      const postData = {
        content,
        media: uploadedMedia
      };

      // Add poll if active
      if (showPoll && pollQuestion.trim()) {
        const validOptions = pollOptions.filter(o => o.trim());
        if (validOptions.length >= 2) {
          postData.poll = {
            question: pollQuestion.trim(),
            options: validOptions
          };
        }
      }

      // Create post
      const { data } = await postAPI.create(postData);

      // Reset form
      setContent('');
      setMediaFiles([]);
      setPreviews([]);
      setShowPoll(false);
      setPollQuestion('');
      setPollOptions(['', '']);

      if (onPostCreated) onPostCreated(data.post);
    } catch (error) {
      console.error('Create post error:', error);
      alert('Failed to create post');
    } finally {
      setLoading(false);
      setUploadProgress(false);
    }
  };

  const canSubmit = content.trim() || mediaFiles.length > 0 || 
    (showPoll && pollQuestion.trim() && pollOptions.filter(o => o.trim()).length >= 2);

  return (
    <div className="create-post">
      <div className="create-post-top">
        <img
          src={getAvatarUrl(user)}
          alt={user?.fullName}
          className="create-post-avatar"
        />
        <div className="create-post-input-container">
          <textarea
            ref={textareaRef}
            placeholder={`What's happening, ${user?.fullName?.split(' ')[0]}?`}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="create-post-textarea"
            rows={2}
          />

          {/* Media Previews */}
          {previews.length > 0 && (
            <div className="media-preview-grid">
              {previews.map((preview, index) => (
                <div key={index} className="media-preview-item">
                  {preview.type === 'VIDEO' ? (
                    <video src={preview.url} className="media-preview-content" controls />
                  ) : (
                    <img src={preview.url} alt="Preview" className="media-preview-content" />
                  )}
                  <button
                    className="media-remove-btn"
                    onClick={() => removeMedia(index)}
                  >
                    <FiX />
                  </button>
                </div>
              ))}
              {previews.length < 5 && (
                <button className="add-more-media-btn" onClick={handleMediaClick}>
                  <FiPlus />
                </button>
              )}
            </div>
          )}

          {/* Poll Creation UI */}
          {showPoll && (
            <div className="poll-creator">
              <div className="poll-header">
                <span>📊 Create Poll</span>
                <button className="poll-close-btn" onClick={togglePoll}>
                  <FiX size={18} />
                </button>
              </div>
              <input
                type="text"
                placeholder="Ask a question..."
                value={pollQuestion}
                onChange={(e) => setPollQuestion(e.target.value)}
                className="poll-question-input"
              />
              <div className="poll-options">
                {pollOptions.map((option, index) => (
                  <div key={index} className="poll-option-input-wrapper">
                    <input
                      type="text"
                      placeholder={`Option ${index + 1}`}
                      value={option}
                      onChange={(e) => updatePollOption(index, e.target.value)}
                      className="poll-option-input"
                    />
                    {pollOptions.length > 2 && (
                      <button
                        className="poll-option-remove"
                        onClick={() => removePollOption(index)}
                      >
                        <FiTrash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {pollOptions.length < 4 && (
                <button className="add-poll-option-btn" onClick={addPollOption}>
                  <FiPlus size={16} /> Add Option
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="create-post-actions">
        <div className="create-post-icons">
          <button
            className="icon-btn"
            onClick={handleMediaClick}
            title="Add photos/videos"
          >
            <FiImage className="action-icon" />
            <span>Photo/Video</span>
          </button>

          <button 
            className={`icon-btn ${showPoll ? 'active' : ''}`}
            onClick={togglePoll}
            title="Create a poll"
          >
            <FiBarChart2 className="action-icon" />
            <span>Poll</span>
          </button>

          <button 
            className="icon-btn"
            onClick={insertHashtag}
            title="Add hashtag"
          >
            <FiHash className="action-icon" />
            <span>Hashtag</span>
          </button>
        </div>

        <button
          className="post-submit-btn"
          onClick={handleSubmit}
          disabled={loading || !canSubmit}
        >
          {loading ? (uploadProgress ? 'Uploading...' : 'Posting...') : 'Post'}
        </button>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        multiple
        accept="image/*,video/*"
        style={{ display: 'none' }}
      />
    </div>
  );
}
