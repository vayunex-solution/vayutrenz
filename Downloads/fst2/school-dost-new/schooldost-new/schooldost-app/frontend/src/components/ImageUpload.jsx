import { useState, useRef } from 'react';
import { uploadAPI } from '../services/api';
import { FiImage, FiX, FiUploadCloud } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

export default function ImageUpload({ onUpload, defaultImage, label = "Upload Image" }) {
  const [preview, setPreview] = useState(defaultImage || null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate size (e.g., 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File too large (max 5MB)');
      return;
    }

    // Preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Upload
    setUploading(true);
    try {
      const { data } = await uploadAPI.image(file);
      onUpload(data.imageUrl); // Return URL to parent
      toast.success('Image uploaded');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
      setPreview(null); // Revert preview on error
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    setPreview(null);
    onUpload('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="image-upload-container">
       <label className="upload-label">{label}</label>
       <div 
          className="upload-area" 
          onClick={() => fileInputRef.current?.click()}
          style={{ backgroundImage: preview ? `url(${preview})` : 'none' }}
       >
          <input 
             type="file" 
             ref={fileInputRef} 
             onChange={handleFileSelect} 
             accept="image/*" 
             style={{ display: 'none' }} 
          />
          
          {uploading && (
             <div className="upload-overlay">
                <div className="spinner-sm"></div>
             </div>
          )}

          {!preview && !uploading && (
             <div className="upload-placeholder">
                <FiUploadCloud size={24} />
                <span>Click to upload</span>
             </div>
          )}

          {preview && !uploading && (
             <button type="button" className="remove-btn" onClick={handleRemove}>
                <FiX />
             </button>
          )}
       </div>

       <style>{`
          .image-upload-container {
             margin-bottom: 15px;
          }
          .upload-label {
             display: block;
             margin-bottom: 8px;
             font-weight: 500;
             font-size: 0.9rem;
          }
          .upload-area {
             width: 100%;
             height: 150px;
             border: 2px dashed var(--border-color);
             border-radius: 12px;
             background-color: var(--bg-secondary);
             background-size: cover;
             background-position: center;
             display: flex;
             align-items: center;
             justify-content: center;
             cursor: pointer;
             position: relative;
             transition: border-color 0.2s;
          }
          .upload-area:hover {
             border-color: var(--primary-color);
          }
          .upload-placeholder {
             display: flex;
             flex-direction: column;
             align-items: center;
             gap: 8px;
             color: var(--text-muted);
             font-size: 0.9rem;
          }
          .upload-overlay {
             position: absolute;
             top: 0; left: 0; right: 0; bottom: 0;
             background: rgba(0,0,0,0.5);
             display: flex;
             align-items: center;
             justify-content: center;
             border-radius: 10px;
          }
          .spinner-sm {
             width: 20px;
             height: 20px;
             border: 2px solid #fff;
             border-top-color: transparent;
             border-radius: 50%;
             animation: spin 1s linear infinite;
          }
          .remove-btn {
             position: absolute;
             top: 8px;
             right: 8px;
             background: rgba(0,0,0,0.6);
             color: white;
             border: none;
             width: 24px;
             height: 24px;
             border-radius: 50%;
             display: flex;
             align-items: center;
             justify-content: center;
             cursor: pointer;
          }
       `}</style>
    </div>
  );
}
