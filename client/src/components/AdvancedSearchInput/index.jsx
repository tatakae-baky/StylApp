import React, { useRef, useEffect } from 'react';
import { IoSearch, IoTime, IoClose } from 'react-icons/io5';
import { MdHistory } from 'react-icons/md';

const SearchSuggestions = ({ 
  suggestions, 
  searchHistory, 
  onSelectSuggestion, 
  onClearHistory, 
  isVisible, 
  searchQuery,
  onClose 
}) => {
  const suggestionsRef = useRef(null);

  if (!isVisible) return null;

  const hasContent = suggestions.length > 0 || searchHistory.length > 0;

  if (!hasContent) return null;

  return (
    <div
      ref={suggestionsRef}
      className="absolute top-full left-0 right-0 bg-white border border-gray-200 shadow-lg max-h-80 overflow-y-auto z-50"
    >
      {/* Search History Section */}
      {searchHistory.length > 0 && !searchQuery.trim() && (
        <div className="p-2">
          <div className="flex items-center justify-between mb-2 px-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MdHistory className="text-gray-400" />
              <span>Recent searches</span>
            </div>
            <button
              onMouseDown={(e) => {
                e.preventDefault();
                onClearHistory();
              }}
              className="text-xs text-blue-600 hover:text-blue-800 transition-colors"
            >
              Clear all
            </button>
          </div>
          {searchHistory.slice(0, 5).map((item, index) => (
            <button
              key={`history-${index}`}
              onMouseDown={(e) => {
                e.preventDefault();
                onSelectSuggestion(item);
              }}
              className="w-full text-left px-3 py-2 hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <IoTime className="text-gray-400 text-sm" />
              <span className="text-sm text-gray-700 truncate">{item}</span>
            </button>
          ))}
        </div>
      )}

      {/* Suggestions Section */}
      {suggestions.length > 0 && (
        <div className="border-t border-gray-100">
          {suggestions.map((suggestion, index) => (
            <button
              key={`suggestion-${index}`}
              onMouseDown={(e) => {
                e.preventDefault();
                onSelectSuggestion(suggestion.text);
              }}
              className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors flex items-center gap-3"
            >
              {suggestion.type === 'history' ? (
                <IoTime className="text-gray-400 text-sm flex-shrink-0" />
              ) : (
                <IoSearch className="text-gray-400 text-sm flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="text-sm text-gray-900 truncate">
                  {suggestion.text}
                </div>
                {suggestion.type === 'product' && suggestion.product && (
                  <div className="text-xs text-gray-500 truncate">
                    {suggestion.product.brand?.name && `${suggestion.product.brand.name} • `}
                    {suggestion.product.catName}
                  </div>
                )}
                {suggestion.type === 'history' && (
                  <div className="text-xs text-gray-400">From history</div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* No results message */}
      {searchQuery.trim() && suggestions.length === 0 && (
        <div className="p-4 text-center text-gray-500 text-sm">
          No suggestions found for "{searchQuery}"
        </div>
      )}
    </div>
  );
};

const AdvancedSearchInput = ({ 
  searchQuery, 
  onSearchQueryChange, 
  suggestions, 
  searchHistory, 
  showSuggestions, 
  onShowSuggestions, 
  onSearch, 
  onClearHistory, 
  isLoading, 
  placeholder = "Search for products...",
  className = "" 
}) => {
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  const handleInputChange = (e) => {
    onSearchQueryChange(e.target.value);
  };

  const handleInputFocus = () => {
    onShowSuggestions(true);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onSearch(searchQuery);
      onShowSuggestions(false);
      inputRef.current?.blur();
    } else if (e.key === 'Escape') {
      onShowSuggestions(false);
      inputRef.current?.blur();
    }
  };

  const handleSelectSuggestion = (suggestionText) => {
    console.log('🎯 Suggestion clicked:', suggestionText);
    onSearchQueryChange(suggestionText);
    onSearch(suggestionText);
    onShowSuggestions(false);
    inputRef.current?.blur();
  };

  const handleCloseSuggestions = () => {
    onShowSuggestions(false);
  };

  const handleClearInput = () => {
    onSearchQueryChange('');
    inputRef.current?.focus();
  };

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if the click is outside the container
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        onShowSuggestions(false);
      }
    };

    if (showSuggestions) {
      // Use mousedown to catch the event before click handlers
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSuggestions, onShowSuggestions]);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full h-10 pl-4 pr-20 border border-gray-300 focus:outline-none"
          autoComplete="off"
        />
        
        {/* Clear button */}
        {searchQuery && (
          <button
            onClick={handleClearInput}
            className="absolute right-12 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <IoClose className="text-lg" />
          </button>
        )}

        {/* Search button */}
        <button
          onClick={() => onSearch(searchQuery)}
          disabled={isLoading}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2  text-[#242424]  transition-colors"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-[#242424] border-t-transparent rounded-full animate-spin" />
          ) : (
            <IoSearch className="text-lg" />
          )}
        </button>
      </div>

      {/* Suggestions dropdown */}
      <SearchSuggestions
        suggestions={suggestions}
        searchHistory={searchHistory}
        onSelectSuggestion={handleSelectSuggestion}
        onClearHistory={onClearHistory}
        isVisible={showSuggestions}
        searchQuery={searchQuery}
        onClose={handleCloseSuggestions}
      />
    </div>
  );
};

export default AdvancedSearchInput;
