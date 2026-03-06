import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faSpinner, faTimes } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import './SmartSearch.css';

const GEO_URL = 'https://geocoding-api.open-meteo.com/v1/search';

const SmartSearch = ({ onCitySelect }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [error, setError] = useState('');
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.length < 2) {
        setSuggestions([]);
        return;
      }

      setLoading(true);
      setError('');

      try {
        const response = await axios.get(GEO_URL, {
          params: {
            name: query,
            count: 8,
            language: 'en',
            format: 'json'
          }
        });
        
        if (response.data.results && response.data.results.length > 0) {
          const cities = response.data.results.map(city => ({
            name: city.name,
            country: city.country,
            country_code: city.country_code,
            lat: city.latitude,
            lon: city.longitude,
            population: city.population || 0,
            displayName: `${city.name}, ${city.country}`
          }));
          
          setSuggestions(cities);
        } else {
          setSuggestions([]);
        }
      } catch (err) {
        setError('Failed to load suggestions');
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  const handleInputChange = (e) => {
    setQuery(e.target.value);
    setShowSuggestions(true);
    setError('');
  };

  const handleSuggestionClick = (city) => {
    setQuery(city.displayName);
    setShowSuggestions(false);
    onCitySelect(city);
  };

  const handleClear = () => {
    setQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (suggestions.length > 0) {
      handleSuggestionClick(suggestions[0]);
    }
  };

  return (
    <div className="smart-search" ref={wrapperRef}>
      <form onSubmit={handleSubmit} className="smart-search-form">
        <div className="search-input-wrapper">
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={() => setShowSuggestions(true)}
            placeholder="Search for a city..."
            className="smart-search-input"
          />
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="clear-button"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          )}
          <button
            type="submit"
            className="search-submit-button"
            disabled={loading}
          >
            {loading ? (
              <FontAwesomeIcon icon={faSpinner} spin />
            ) : (
              <FontAwesomeIcon icon={faSearch} />
            )}
          </button>
        </div>
      </form>

      {error && <div className="search-error">{error}</div>}

      {showSuggestions && suggestions.length > 0 && (
        <ul className="suggestions-list">
          {suggestions.map((city, index) => (
            <li
              key={`${city.name}-${city.lat}-${city.lon}-${index}`}
              onClick={() => handleSuggestionClick(city)}
              className="suggestion-item"
            >
              <span className="city-name">{city.name}</span>
              <span className="country-name">, {city.country}</span>
            </li>
          ))}
        </ul>
      )}

      {showSuggestions && query.length >= 2 && suggestions.length === 0 && !loading && (
        <div className="no-suggestions">
          No cities found. Try another search.
        </div>
      )}
    </div>
  );
};

export default SmartSearch;