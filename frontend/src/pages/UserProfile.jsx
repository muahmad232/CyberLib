import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './UserProfile.css';

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [showGenresModal, setShowGenresModal] = useState(false); // For showing genre update modal
  const [selectedGenres, setSelectedGenres] = useState([]); // To manage selected genres

  useEffect(() => {
    const getUserProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/profile', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUser(response.data);
        setSelectedGenres(response.data.interests || []); // Set current genres
      } catch (error) {
        setError('Failed to load user profile.');
      } finally {
        setLoading(false);
      }
    };
    getUserProfile();
  }, []);

  useEffect(() => {
    if (!imageFile) {
      setPreviewUrl('');
      return;
    }
    const fileReader = new FileReader();
    fileReader.onload = () => {
      setPreviewUrl(fileReader.result);
    };
    fileReader.readAsDataURL(imageFile);
  }, [imageFile]);

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files.length === 1) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleImageUpload = async () => {
    if (!imageFile) {
      setError('Please select an image.');
      return;
    }

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('image', imageFile);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5000/api/profile/upload', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      setUser(prev => ({
        ...prev,
        image: response.data.image,
      }));
      setImageFile(null);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to upload image.');
    } finally {
      setUploading(false);
    }
  };

  const handleUpdateGenres = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/user/update-interests', {
        userId: user._id,
        interests: selectedGenres,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setError(null);
      setShowGenresModal(false); // Close modal after update
      setUser(prev => ({
        ...prev,
        interests: selectedGenres, // Update user interests in state
      }));
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to update interests.');
    }
  };

  const handleGenreSelect = (genre) => {
    if (selectedGenres.includes(genre)) {
      setSelectedGenres(selectedGenres.filter(item => item !== genre));
    } else {
      setSelectedGenres([...selectedGenres, genre]);
    }
  };

  if (loading) return <div className="loading-text">LOADING USER PROFILE...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!user) return <div className="no-data">NO USER DATA FOUND</div>;

  return (
    <div className="user-profile">
      <h1 className="profile-title">USER PROFILE</h1>

      <div className="profile-header">
        <div className="profile-picture-container">
          <img
            src={previewUrl || user.image || 'https://via.placeholder.com/128'}
            alt="Profile"
            className="profile-picture"
          />
          <label className="upload-label">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="upload-input"
            />
            <span className="upload-icon">+</span>
          </label>
        </div>
        <div className="profile-info">
          <h2 className="profile-name">{user.name}</h2>
          <p className="profile-username">@{user.username}</p>
          <p className="profile-email">{user.email}</p>
        </div>
      </div>

      {imageFile && (
        <div className="upload-section">
          <button
            onClick={handleImageUpload}
            className={`upload-btn ${uploading ? 'uploading' : ''}`}
            disabled={uploading}
          >
            {uploading ? 'UPLOADING...' : 'CONFIRM UPLOAD'}
          </button>
        </div>
      )}

      <div className="profile-section">
        <h3 className="section-title">INTERESTS</h3>
        <div className="interests-grid">
          {user.interests?.length > 0 ? (
            user.interests.map((interest, index) => (
              <span key={index} className="interest-tag">
                {interest}
              </span>
            ))
          ) : (
            <p className="no-interests">No interests selected</p>
          )}
        </div>
        <button
          className="update-genres-btn"
          onClick={() => setShowGenresModal(true)}
        >
          Update Genres
        </button>
      </div>

      {showGenresModal && (
        <div className="genre-modal">
          <div className="genre-modal-content">
            <h3>Select Genres</h3>
            <div className="genre-list">
              {['philosophical fiction',
    'historical',
    'thriller',
    'biography',
    'self-help',
    'dystopian',
    'horror',
    'adventure',
    'classic',
    'satire',
    'psychological drama',
    'philosophy',
    'Fiction',
    'Science Fiction',
    'Fantasy',
    'Mystery',
    'Biography',
    'History',
    'Romance',
    'Horror',
    'Self-Help',
    'Health',
    'Science',
    'Business',
    'Art',
    'Children',
    'Travel',
    'Religion',
    'Erotica'
].map((genre) => (
                <div key={genre} className="genre-item">
                  <input
                    type="checkbox"
                    checked={selectedGenres.includes(genre)}
                    onChange={() => handleGenreSelect(genre)}
                  />
                  <span>{genre}</span>
                </div>
              ))}
            </div>
            <button onClick={handleUpdateGenres}>Update Interests</button>
            <button onClick={() => setShowGenresModal(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div className="stats-container">
        <div className="stat-card">
          <span className="stat-label">BOOKS READ</span>
          <span className="stat-value">{user.readCount || 0}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">WANT TO READ</span>
          <span className="stat-value">{user.wantToReadCount || 0}</span>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
