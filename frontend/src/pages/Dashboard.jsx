import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import SearchBar from '../components/SearchBar';
import Recommendations from '../components/Recommendations';
import PopularBooks from '../components/PopularBooks';
import PopularAuthors from '../components/PopularAuthors'; 
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [books, setBooks] = useState([]);
  const [visibleBooks, setVisibleBooks] = useState(5);
  const [currentBookIndex, setCurrentBookIndex] = useState(0);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [allBooksVisited, setAllBooksVisited] = useState(false);

  const handleSearch = (query) => {
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/books/recommendations', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (res.data.length === 0) {
          setAllBooksVisited(true);
          setBooks([]);
        } else {
          setBooks(res.data);
          setAllBooksVisited(false);
        }
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load recommendations');
        setBooks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  const showNextBooks = () => {
    const newIndex = currentBookIndex + visibleBooks;
    if (newIndex < books.length) {
      setCurrentBookIndex(newIndex);
    }
  };

  const showPreviousBooks = () => {
    const newIndex = currentBookIndex - visibleBooks;
    if (newIndex >= 0) {
      setCurrentBookIndex(newIndex);
    }
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen">
      <div className="p-6 max-w-7xl mx-auto">
        {/* Search Bar */}
        <div className="mb-8">
          <SearchBar
            onSearch={handleSearch}
            query={searchQuery}
            setQuery={setSearchQuery}
          />
        </div>

        {/* Recommendations Grid */}
        <div className="recommendations-grid bg-gray-800 p-6 rounded-lg shadow-lg mb-8">
          <h2 className="text-2xl font-bold mb-6 text-center">Recommendations</h2>

          {allBooksVisited ? (
            <div className="text-center py-8">
              <p className="text-xl">You've viewed all available recommendations!</p>
              <p className="text-gray-400 mt-2">
                Try adding more interests to your profile to discover new books.
              </p>
            </div>
          ) : (
            <>
              <button
                className="arrow-button left bg-gray-700 hover:bg-gray-600 text-white"
                onClick={showPreviousBooks}
                disabled={currentBookIndex <= 0}
              >
                &#8249;
              </button>

              <Recommendations
                books={books.slice(currentBookIndex, currentBookIndex + visibleBooks)}
                loading={loading}
                error={error}
              />

              <button
                className="arrow-button right bg-gray-700 hover:bg-gray-600 text-white"
                onClick={showNextBooks}
                disabled={currentBookIndex + visibleBooks >= books.length}
              >
                &#8250;
              </button>
            </>
          )}
        </div>

        {/* Popular Books Grid */}
        <div className="popular-books-grid bg-gray-800 p-6 rounded-lg shadow-lg mb-8">
          <h2 className="text-2xl font-bold mb-6 text-center">Popular Books</h2>
          <PopularBooks />
        </div>

        {/* Popular Authors Grid */}
        <div className="popular-authors-grid bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-6 text-center">Popular Authors</h2>
          <PopularAuthors />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;