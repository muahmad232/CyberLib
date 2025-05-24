import React, { useState, useEffect } from 'react';

const SearchBar = ({ query, onSearch }) => {
  const [localQuery, setLocalQuery] = useState(query || '');

  useEffect(() => {
    setLocalQuery(query); // sync if route changes externally
  }, [query]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(localQuery);
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setLocalQuery(value);
    onSearch(value); // trigger debounced search
  };

  return (
    <form onSubmit={handleSubmit} className="mb-8">
      <div className="flex">
        <input
          type="text"
          value={localQuery}
          onChange={handleChange}
          placeholder="Search books or authors..."
          className="flex-grow px-4 py-2 border rounded-l-lg focus:outline-none"
        />
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700"
        >
          Search
        </button>
      </div>
    </form>
  );
};

export default SearchBar;
