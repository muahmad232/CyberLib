import React from 'react';
import { useNavigate } from 'react-router-dom';

const SearchResults = ({ results }) => {
  const navigate = useNavigate();

  const handleAuthorClick = (authorId) => {
    navigate(`/author/${authorId}`); // Navigate to AuthorDetails page
  };

  const handleBookClick = (bookId) => {
    navigate(`/book/${bookId}`);
  };

  // CSS styles
  const styles = {
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '0 15px'
    },
    sectionTitle: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      marginBottom: '1rem',
      color: '#00ffcc'
    },
    authorsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
      gap: '1rem',
      marginBottom: '2rem'
    },
    booksGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
      gap: '1rem',
      marginBottom: '2rem'
    },
    authorCard: {
      border: '1px solid #00ff88',
      padding: '1.5rem',
      borderRadius: '8px',
      backgroundColor: '#1a1a1a',
      transition: 'all 0.3s ease',
      cursor: 'pointer',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center'
    },
    authorImageContainer: {
      width: '100%',
      height: '200px',
      overflow: 'hidden',
      marginBottom: '1rem',
      borderRadius: '8px'
    },
    authorImage: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      filter: 'grayscale(20%) contrast(110%)',
      transition: 'all 0.3s ease'
    },
    bookCard: {
      border: '1px solid #00ff88',
      padding: '0.75rem',
      borderRadius: '8px',
      backgroundColor: '#1a1a1a',
      transition: 'all 0.3s ease',
      cursor: 'pointer',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
      position: 'relative'
    },
    bookImageContainer: {
      width: '100%',
      height: '192px',
      marginBottom: '0.75rem',
      overflow: 'hidden',
      borderRadius: '4px'
    },
    bookImage: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      filter: 'grayscale(20%) contrast(110%)',
      transition: 'all 0.3s ease'
    },
    bookTitle: {
      fontSize: '1rem',
      fontWeight: '600',
      color: '#ffffff',
      display: '-webkit-box',
      WebkitLineClamp: '2',
      WebkitBoxOrient: 'vertical',
      overflow: 'hidden'
    },
    bookAuthors: {
      fontSize: '0.75rem',
      color: '#e2e8f0',
      marginTop: '0.25rem'
    },
    neonAccent: {
      position: 'absolute',
      top: '0',
      left: '0',
      width: '100%',
      height: '4px',
      background: '#00ff88'
    },
    neonText: {
      color: '#00ffcc'
    },
    emptyState: {
      textAlign: 'center',
      padding: '3rem 0',
      color: '#e2e8f0'
    },
    hoverEffects: {
      boxShadow: '0 0 15px rgba(0, 255, 136, 0.5)',
      transform: 'translateY(-3px)'
    },
    imageHover: {
      filter: 'grayscale(0%) contrast(125%)',
      transform: 'scale(1.03)'
    }
  };

  return (
    <div style={styles.container}>
      {/* Authors Results */}
      {results.authors.length > 0 && (
        <div style={{ marginBottom: '2rem', marginTop: '1.5rem' }}>
          <h2 style={styles.sectionTitle}>Authors</h2>
          <div style={styles.authorsGrid}>
            {results.authors.map(author => (
              <div 
                key={author._id} 
                style={styles.authorCard}
                onClick={() => handleAuthorClick(author._id)}  // Updated to navigate to AuthorDetails page
                onMouseEnter={(e) => e.currentTarget.style.boxShadow = styles.hoverEffects.boxShadow}
                onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
              >
                <div style={styles.authorImageContainer}>
                  <img
                    src={author.image || 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR_rkyWrItQFyC2l0wW3rkjzAprIkFJGpaJoA&s'}
                    alt={author.name}
                    style={styles.authorImage}
                  />
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#ffffff' }}>{author.name}</h3>
                {author.top_work && (
                  <p style={{ fontSize: '0.875rem', color: '#e2e8f0', marginTop: '0.5rem' }}>
                    <span style={styles.neonText}>Top Work:</span> {author.top_work}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Books Results */}
      {results.books.length > 0 && (
        <div style={{ marginBottom: '2rem', marginTop: '1.5rem' }}>
          <h2 style={styles.sectionTitle}>Books</h2>
          <div style={styles.booksGrid}>
            {results.books.map(book => (
              <div 
                key={book._id}
                style={styles.bookCard}
                onClick={() => handleBookClick(book._id)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = styles.hoverEffects.boxShadow;
                  e.currentTarget.style.transform = styles.hoverEffects.transform;
                  e.currentTarget.querySelector('.book-image').style.filter = styles.imageHover.filter;
                  e.currentTarget.querySelector('.book-image').style.transform = styles.imageHover.transform;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.querySelector('.book-image').style.filter = 'grayscale(20%) contrast(110%)';
                  e.currentTarget.querySelector('.book-image').style.transform = 'none';
                }}
              >
                <div style={styles.bookImageContainer}>
                  <img
                    src={book.coverImage || 'https://media.istockphoto.com/id/2155680219/photo/blank-black-cover-book-mockup.jpg?s=612x612&w=0&k=20&c=j4nsTEmP4An1FWv6UG7HFq43EI9PnIqfWmrjXMhBSaY='}
                    alt={book.title}
                    className="book-image"
                    style={styles.bookImage}
                  />
                </div>
                <h3 style={styles.bookTitle}>{book.title}</h3>
                {book.authors?.length > 0 && (
                  <p style={styles.bookAuthors}>
                    <span style={styles.neonText}>By:</span> {book.authors.join(', ')}
                  </p>
                )}
                <div style={styles.neonAccent}></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {results.books.length === 0 && results.authors.length === 0 && (
        <div style={styles.emptyState}>
          <p>No results found</p>
        </div>
      )}
    </div>
  );
};

export default SearchResults;
