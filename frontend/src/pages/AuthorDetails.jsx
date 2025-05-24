import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import './BookDetails.css';

const AuthorDetails = () => {
  const { id } = useParams();
  const [author, setAuthor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState(false);

  const token = localStorage.getItem('token');

  // Fetch author details - using correct API endpoint
  useEffect(() => {
    const fetchAuthorDetails = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/authors/author/${id}`);
        setAuthor(res.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Error fetching author details');
      } finally {
        setLoading(false);
      }
    };

    fetchAuthorDetails();
  }, [id]);

  // Submit review - using correct API endpoints
  const submitReview = async () => {
    setError(null);
    
    try {
      // Submit rating if provided
      if (rating > 0) {
        await axios.post(
          `http://localhost:5000/api/authors/author/${id}/rate`,
          { rating },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      // Submit review text if provided
      if (reviewText.trim()) {
        await axios.post(
          `http://localhost:5000/api/authors/author/${id}/review`,
          { reviewText, rating: rating || 0 },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      setReviewSuccess(true);
      setRating(0);
      setReviewText("");

      // Refresh author data
      const res = await axios.get(`http://localhost:5000/api/authors/author/${id}`);
      setAuthor(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Error submitting review');
    }
  };

  if (loading) return <div className="loading">LOADING...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!author) return <div className="error">NO AUTHOR FOUND</div>;

  return (
    <div className="book-details">
      <h2>{author.name}</h2>
      <img 
      src={author.image || 'https://via.placeholder.com/300x450?text=No+Image'} 
      alt={author.name} 
      className="author-image"
    />

      <div className="detail-section">
        <span className="detail-label">BIOGRAPHY:</span>
        <p className="detail-value">{author.bio || 'No biography available'}</p>
      </div>

      <div className="detail-section">
        <span className="detail-label">TOP WORK:</span>
        <span className="detail-value">{author.top_work || 'Unknown'}</span>
      </div>

      <div className="detail-section">
        <span className="detail-label">RATING:</span>
        <span className="detail-value">
          {author.rating ? `${author.rating.toFixed(1)}/5` : 'Not rated yet'}
        </span>
      </div>

      <div className="detail-section">
        <span className="detail-label">REVIEWS:</span>
        <span className="detail-value">
          {author.reviews?.length || 0} reviews
        </span>
      </div>

      {token && (
        <>
          <div className="rating-section">
            <strong>YOUR RATING:</strong>
            <div className="star-rating">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  onClick={() => setRating(star)}
                  className={`star ${star <= rating ? 'selected' : ''}`}
                >
                  ★
                </span>
              ))}
            </div>
          </div>

          <div className="review-input">
            <textarea
              className="cyber-textarea"
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="WRITE YOUR REVIEW..."
            />
            <button className="submit-review" onClick={submitReview}>
              SUBMIT REVIEW
            </button>
          </div>
        </>
      )}

      {author.reviews?.length > 0 && (
        <div className="reviews-section">
          <h3>USER REVIEWS</h3>
          {author.reviews.map((review, index) => (
            <div key={index} className="review">
              <p><strong>User {index + 1}</strong></p>
              <p>Rating: {review.rating}/5</p>
              <p>{review.reviewText}</p>
            </div>
          ))}
        </div>
      )}

      {reviewSuccess && (
        <div className="success-message">REVIEW SUBMITTED SUCCESSFULLY!</div>
      )}
    </div>
  );
};

export default AuthorDetails;