import React from 'react';
import { IoSearch, IoRefresh, IoAlert } from 'react-icons/io5';

const SearchErrorBoundary = ({ children, error, onRetry }) => {
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-red-50 rounded-lg border border-red-200">
        <IoAlert className="text-4xl text-red-500 mb-4" />
        <h3 className="text-lg font-semibold text-red-700 mb-2">Search Error</h3>
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          <IoRefresh className="text-sm" />
          Try Again
        </button>
      </div>
    );
  }

  return children;
};

const SearchLoadingState = ({ message = "Searching..." }) => (
  <div className="flex flex-col items-center justify-center p-8 text-center">
    <div className="relative mb-4">
      <IoSearch className="text-4xl text-blue-500 animate-pulse" />
      <div className="absolute inset-0 rounded-full border-2 border-blue-200 border-t-blue-500 animate-spin"></div>
    </div>
    <p className="text-gray-600">{message}</p>
  </div>
);

const NoResultsState = ({ query, suggestions = [], onSuggestionClick }) => (
  <div className="flex flex-col items-center justify-center p-8 text-center">
    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
      <IoSearch className="text-2xl text-gray-400" />
    </div>
    <h3 className="text-lg font-semibold text-gray-700 mb-2">No results found</h3>
    <p className="text-gray-500 mb-4">
      No products found for "{query}". Try searching with different keywords.
    </p>
    
    {suggestions.length > 0 && (
      <div className="w-full max-w-md">
        <p className="text-sm text-gray-600 mb-3">Try these suggestions:</p>
        <div className="flex flex-wrap gap-2">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => onSuggestionClick(suggestion)}
              className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    )}
    
    <div className="mt-6 text-left w-full max-w-md">
      <p className="text-sm text-gray-600 mb-2">Search tips:</p>
      <ul className="text-xs text-gray-500 space-y-1">
        <li>• Check your spelling</li>
        <li>• Try more general keywords</li>
        <li>• Use fewer words</li>
        <li>• Try browsing categories instead</li>
      </ul>
    </div>
  </div>
);

const SearchFeedback = ({ 
  isLoading, 
  error, 
  results, 
  query, 
  onRetry, 
  onSuggestionClick,
  children 
}) => {
  if (error) {
    return <SearchErrorBoundary error={error} onRetry={onRetry} />;
  }

  if (isLoading) {
    return <SearchLoadingState />;
  }

  if (query && results.length === 0) {
    const suggestions = [
      'shoes', 'clothing', 'electronics', 'accessories', 'beauty'
    ];
    
    return (
      <NoResultsState 
        query={query}
        suggestions={suggestions}
        onSuggestionClick={onSuggestionClick}
      />
    );
  }

  return children;
};

export { 
  SearchErrorBoundary, 
  SearchLoadingState, 
  NoResultsState, 
  SearchFeedback 
};
