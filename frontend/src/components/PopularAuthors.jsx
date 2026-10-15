import React, { useState, useEffect } from 'react';
import apiClient from '../apiClient';
import { useNavigate } from 'react-router-dom';  // Import useNavigate hook

const PopularAuthors = () => {
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();  // Initialize navigate

  useEffect(() => {
    const fetchPopularAuthors = async () => {
      try {
        const response = await apiClient.get('/api/popular-authors');
        setAuthors(response.data.data); // Access the data array from the response
      } catch (err) {
        setError('Failed to fetch popular authors');
      } finally {
        setLoading(false);
      }
    };

    fetchPopularAuthors();
  }, []);

  if (loading) {
    return <div>Loading popular authors...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  // Handle author click to navigate to the AuthorDetails page
  const handleAuthorClick = (authorId) => {
    navigate(`/author/${authorId}`);
  };

  const DEFAULT_AUTHOR_PLACEHOLDER = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80';

  return (
    <div className="recommendations-container">
      {authors.map((author) => (
        <div
          key={author._id}
          className="author author-card"
          onClick={() => handleAuthorClick(author._id)}
          style={{ cursor: 'pointer' }}
        >
          <div className="author-image-wrapper">
            <img
              src={author.image || DEFAULT_AUTHOR_PLACEHOLDER}
              alt={author.name || 'Author'}
              className="author-image"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = DEFAULT_AUTHOR_PLACEHOLDER;
              }}
            />
          </div>
          <div className="author-card-content">
            <h3 className="author-name" title={author.name || 'Unknown Author'}>
              {author.name || 'Unknown Author'}
            </h3>
            <div className="author-card-meta">
              <p className="author-meta-item">⭐ {author.rating ? author.rating.toFixed(1) : 'N/A'}</p>
              <p className="author-meta-item">Reviews: {author.reviewCount || 0}</p>
              <p className="author-meta-item author-top-work" title={author.top_work || ''}>
                {author.top_work ? `Top: ${author.top_work}` : '\u00A0'}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PopularAuthors;
