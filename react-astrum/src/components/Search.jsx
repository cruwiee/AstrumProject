import React, { useState } from 'react';
import './Search.css';

const Search = ({ onSearchChange }) => {
  const [query, setQuery] = useState('');

  const handleInputChange = (e) => {
    setQuery(e.target.value);
    onSearchChange(e.target.value);
  };

  return (
    <div className="search-container">
      <input
        type="text"
        placeholder="Поиск товаров..."
        value={query}
        onChange={handleInputChange}
      />
    </div>
  );
};

export default Search;
