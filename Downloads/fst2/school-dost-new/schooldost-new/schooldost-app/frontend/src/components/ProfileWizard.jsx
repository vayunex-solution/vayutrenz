import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { userAPI, uploadAPI, verificationAPI } from '../services/api';
import './ProfileWizard.css';

// Verification roles
const ROLES = [
  { id: 'STUDENT', label: 'Student', icon: '👨‍🎓', desc: 'Verify with College ID' },
  { id: 'TEACHER', label: 'Teacher', icon: '👨‍🏫', desc: 'Secure verification required' },
  { id: 'PROFESSOR', label: 'Professor', icon: '🎓', desc: 'Official badge & access' }
];

const ProfileWizard = ({ isOpen, onClose }) => {
  const { user, updateUser } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    role: 'STUDENT',
    fullName: user?.fullName || '',
    avatarUrl: user?.avatarUrl || '',
    college: user?.college || '',
    department: user?.department || '',
    batch: user?.batch || '',
    bio: user?.bio || '',
    interests: user?.interests || [],
    idCardUrl: ''
  });

  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatarUrl);

  const [idCardFile, setIdCardFile] = useState(null);
  const [idCardPreview, setIdCardPreview] = useState(null);

  // Interest options
  const interestOptions = [
    "Coding", "Design", "Music", "Sports", "Photography", "Gaming", "Reading", "Travel", "Foodie", "Art", "Science", "Politics"
  ];

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRoleSelect = (roleId) => {
    setFormData(prev => ({ ...prev, role: roleId }));
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      if (type === 'avatar') {
        setAvatarFile(file);
        setAvatarPreview(objectUrl);
      } else if (type === 'idCard') {
        setIdCardFile(file);
        setIdCardPreview(objectUrl);
      }
    }
  };

  const uploadFile = async (file, type) => {
    if (type === 'avatar') return uploadAPI.avatar(file);
    // Re-using avatar upload endpoint or create a specific one for docs
    // For now using images endpoint
    return uploadAPI.images([file]).then(res => ({ data: { imageUrl: res.data.imageUrls[0] } }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      let avatarUrl = formData.avatarUrl;
      let idCardUrl = formData.idCardUrl;

      // Upload files
      if (avatarFile) {
        const res = await uploadFile(avatarFile, 'avatar');
        avatarUrl = res.data.imageUrl;
      }

      if (idCardFile) {
        const res = await uploadFile(idCardFile, 'idCard');
        idCardUrl = res.data.imageUrl;
      }

      // 1. Submit Verification Request
      if (idCardUrl || formData.role !== 'STUDENT') {
        await verificationAPI.request({
          role: formData.role,
          idCardUrl
        });
      }

      // 2. Update Profile Data
      const updateData = {
        fullName: formData.fullName,
        college: formData.college,
        department: formData.department,
        batch: formData.batch,
        bio: formData.bio,
        interests: formData.interests,
        avatarUrl: avatarUrl,
        isProfileComplete: true
      };

      const { data } = await userAPI.updateProfile(updateData);
      updateUser(data.user);
      onClose();

    } catch (err) {
      console.error("Wizard Error:", err);
      setError(err.response?.data?.error || 'Failed to complete profile.');
    } finally {
      setLoading(false);
    }
  };

  // Steps Configuration
  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  return (
    <div className="wizard-overlay">
      <div className="wizard-container glass-panel">
        <div className="wizard-header">
          <h2>Setup Profile</h2>
          <div className="progress-bar">
            {[1, 2, 3, 4].map(num => (
              <React.Fragment key={num}>
                <div className={`step ${step >= num ? 'active' : ''}`}>{num}</div>
                {num < 4 && <div className={`line ${step > num ? 'active' : ''}`}></div>}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="wizard-body">
          {error && <div className="error-message">{error}</div>}

          {step === 1 && (
            <div className="step-content">
              <h3>Who are you? (Role Selection)</h3>
              <div className="roles-grid">
                {ROLES.map(role => (
                  <div
                    key={role.id}
                    className={`role-card ${formData.role === role.id ? 'selected' : ''}`}
                    onClick={() => handleRoleSelect(role.id)}
                  >
                    <div className="role-icon">{role.icon}</div>
                    <div className="role-label">{role.label}</div>
                    <div className="role-desc">{role.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="step-content">
              <h3>Basic Details</h3>
              <div className="avatar-upload-section">
                <div className="avatar-preview">
                  <img src={avatarPreview || '/default-avatar.png'} alt="Avatar" />
                </div>
                <label className="upload-btn">
                  Upload Photo
                  <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'avatar')} hidden />
                </label>
              </div>
              <input
                className="input-field"
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder="Full Name"
              />
            </div>
          )}

          {step === 3 && (
            <div className="step-content">
              <h3>Academic Info</h3>
              <input className="input-field" type="text" name="college" value={formData.college} onChange={handleInputChange} placeholder="College Name" />
              <input className="input-field" type="text" name="department" value={formData.department} onChange={handleInputChange} placeholder="Department" />
              <input className="input-field" type="text" name="batch" value={formData.batch} onChange={handleInputChange} placeholder="Batch Year (e.g. 2025)" />

              <div className="verification-section">
                <h4>Institutional ID verification</h4>
                <p className="verify-note">
                  {formData.role === 'STUDENT' ? 'Optional for Verified Badge' : 'Mandatory for Faculty Verification'}
                </p>
                <div className="id-card-upload">
                  {idCardPreview ? (
                    <div className="id-preview">
                      <img src={idCardPreview} alt="ID Card" />
                      <button onClick={() => { setIdCardFile(null); setIdCardPreview(null) }} className="remove-id">×</button>
                    </div>
                  ) : (
                    <label className="id-upload-box">
                      <span>📄 Upload ID Card</span>
                      <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'idCard')} hidden />
                    </label>
                  )}
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="step-content">
              <h3>Personal Touch</h3>
              <textarea className="input-field" name="bio" value={formData.bio} onChange={handleInputChange} placeholder="Bio..." rows="3" />
              <div className="tags-container">
                {interestOptions.map(tag => (
                  <span
                    key={tag}
                    className={`tag ${formData.interests.includes(tag) ? 'selected' : ''}`}
                    onClick={() => {
                      const newInterests = formData.interests.includes(tag)
                        ? formData.interests.filter(i => i !== tag)
                        : [...formData.interests, tag];
                      setFormData({ ...formData, interests: newInterests });
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="wizard-footer">
          {step > 1 && <button className="btn-secondary" onClick={prevStep}>Back</button>}
          {step < 4 ? (
            <button className="btn-primary" onClick={nextStep}>Next</button>
          ) : (
            <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
              {loading ? 'Completing...' : 'Finish Profile'}
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

export default ProfileWizard;
