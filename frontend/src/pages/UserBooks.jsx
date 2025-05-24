import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import "./UserBooks.css";

const UserBooks = () => {
  const [readBooks, setReadBooks] = useState([]);
  const [wishlistBooks, setWishlistBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [visibleCount, setVisibleCount] = useState(5);
  
  const readListRef = useRef(null);
  const wishlistRef = useRef(null);
  
  const token = localStorage.getItem('token');

  useEffect(() => {
    const updateVisibleCount = () => {
      const width = window.innerWidth;
      if (width < 480) setVisibleCount(2);
      else if (width < 768) setVisibleCount(3);
      else if (width < 1024) setVisibleCount(4);
      else setVisibleCount(5);
    };

    updateVisibleCount();
    window.addEventListener('resize', updateVisibleCount);
    return () => window.removeEventListener('resize', updateVisibleCount);
  }, []);

  useEffect(() => {
    const fetchUserBooks = async () => {
      try {
        const resRead = await axios.get('http://localhost:5000/api/user/books/read', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const resWishlist = await axios.get('http://localhost:5000/api/user/books/wishlist', {
          headers: { Authorization: `Bearer ${token}` },
        });

        setReadBooks(resRead.data);
        setWishlistBooks(resWishlist.data);
      } catch (err) {
        setError('Failed to fetch books');
      } finally {
        setLoading(false);
      }
    };

    fetchUserBooks();
  }, [token]);

  const scroll = (ref, direction) => {
    const container = ref.current;
    const cardWidth = container.querySelector('.book-card')?.offsetWidth || 200;
    const gap = 16; // Gap between cards in pixels
    const scrollAmount = (cardWidth + gap) * visibleCount * (direction === 'left' ? -1 : 1);
    
    container.scrollBy({
      left: scrollAmount,
      behavior: 'smooth'
    });
  };

  if (loading) return <div className="text-neon-cyan p-4">Loading your books...</div>;
  if (error) return <div className="text-red-500 p-4">{error}</div>;

  return (
    <div className="user-books-container">
      {/* Read List Section */}
      <div className="books-section">
        <h2 className="section-title">
          Read List
          <div className="title-underline"></div>
        </h2>
        
        {readBooks.length > 0 ? (
          <div className="books-wrapper">
            <button 
              onClick={() => scroll(readListRef, 'left')} 
              className={`scroll-button left ${readBooks.length <= visibleCount ? 'disabled' : ''}`}
              aria-label="Scroll read list left"
              disabled={readBooks.length <= visibleCount}
            >
              &lt;
            </button>
            
            <div className="books-container">
              <div 
                ref={readListRef}
                className="books-grid"
              >
                {readBooks.map((book) => (
                  <div key={book.bookId._id} className="book-card">
                    <Link to={`/book/${book.bookId._id}`}>
                      <div className="book-image-wrapper">
                        <img
                          src={book.bookId.coverImage || 'https://via.placeholder.com/128x180?text=No+Image'}
                          alt={book.bookId.title}
                          className="book-image"
                        />
                      </div>
                      <div className="book-details">
                        <h3 className="book-title">{book.bookId.title}</h3>
                        <div className="book-stats">
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
            
            <button 
              onClick={() => scroll(readListRef, 'right')} 
              className={`scroll-button right ${readBooks.length <= visibleCount ? 'disabled' : ''}`}
              aria-label="Scroll read list right"
              disabled={readBooks.length <= visibleCount}
            >
              &gt;
            </button>
          </div>
        ) : (
          <p className="empty-message">No books in your read list.</p>
        )}
      </div>

      {/* Wishlist Section */}
      <div className="books-section">
        <h2 className="section-title">
          Wishlist
          <div className="title-underline"></div>
        </h2>
        
        {wishlistBooks.length > 0 ? (
          <div className="books-wrapper">
            <button 
              onClick={() => scroll(wishlistRef, 'left')} 
              className={`scroll-button left ${wishlistBooks.length <= visibleCount ? 'disabled' : ''}`}
              aria-label="Scroll wishlist left"
              disabled={wishlistBooks.length <= visibleCount}
            >
              &lt;
            </button>
            
            <div className="books-container">
              <div 
                ref={wishlistRef}
                className="books-grid"
              >
                {wishlistBooks.map((book) => (
                  <div key={book.bookId._id} className="book-card">
                    <Link to={`/book/${book.bookId._id}`}>
                      <div className="book-image-wrapper">
                        <img
                          src={book.bookId.coverImage || 'https://via.placeholder.com/128x180?text=No+Image'}
                          alt={book.bookId.title}
                          className="book-image"
                        />
                      </div>
                      <div className="book-details">
                        <h3 className="book-title">{book.bookId.title}</h3>
                        <div className="book-stats">
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
            
            <button 
              onClick={() => scroll(wishlistRef, 'right')} 
              className={`scroll-button right ${wishlistBooks.length <= visibleCount ? 'disabled' : ''}`}
              aria-label="Scroll wishlist right"
              disabled={wishlistBooks.length <= visibleCount}
            >
              &gt;
            </button>
          </div>
        ) : (
          <p className="empty-message">No books in your wishlist.</p>
        )}
      </div>
    </div>
  );
};

export default UserBooks;