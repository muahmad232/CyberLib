import React, { useState, useEffect, useRef, useTransition } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import SearchBar from '../components/SearchBar';
import SearchResults from '../components/SearchResults';
import './SearchPage.css';

const SearchPage = () => {
  const [searchResults, setSearchResults] = useState({ books: [], authors: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isPending, startTransition] = useTransition();

  const location = useLocation();
  const navigate = useNavigate();
  const debounceTimeout = useRef(null);

  const searchQuery = new URLSearchParams(location.search).get('q') || '';

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    if (searchQuery) {
      fetchResults(searchQuery);
    } else {
      setSearchResults({ books: [], authors: [] }); // clear on empty
    }
  }, [searchQuery, navigate]);

  const fetchResults = async (query) => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');

      const res = await axios.get(`/api/books/search?q=${encodeURIComponent(query)}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      setSearchResults(res.data.results || { books: [], authors: [] });
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
        setError('Session expired. Please login again.');
      } else {
        setError(err.response?.data?.error || err.message || 'Search failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query) => {
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

    debounceTimeout.current = setTimeout(() => {
      startTransition(() => {
        navigate(`/search?q=${encodeURIComponent(query)}`);
      });
    }, 400); // smooth debounce
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <SearchBar 
        query={searchQuery}
        onSearch={handleSearch}
      />

      {loading && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Searching...</p>
        </div>
      )}

      {error && (
        <div className="text-center py-12 text-red-500">
          <p className="text-lg">{error}</p>
          {error.includes('Session expired') && (
            <button 
              onClick={() => navigate('/login')}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Go to Login
            </button>
          )}
        </div>
      )}

      <SearchResults results={searchResults} />
    </div>
  );
};

export default SearchPage;
