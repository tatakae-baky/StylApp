import React from "react";
import "../Search/style.css";
import AdvancedSearchInput from "../AdvancedSearchInput";
import useEnhancedSearch from "../../utils/useEnhancedSearch";
import { useNavigate } from "react-router-dom";

const Search = () => {
  const history = useNavigate();

  // Enhanced search functionality
  const {
    searchQuery,
    suggestions,
    isLoading,
    showSuggestions,
    searchHistory,
    setSearchQuery,
    performExplicitSearch, // Add explicit search function
    setShowSuggestions,
    clearHistory
  } = useEnhancedSearch();

  // Handle explicit search execution (Enter, click search, click suggestion)
  const handleSearch = async (query) => {
    if (query.trim()) {
      console.log('🎯 SEARCH COMPONENT: Explicit search action for:', query);
      await performExplicitSearch(query); // Wait for search to complete before navigation
      history("/search");
    }
  };

  return (
    <div className="searchBox w-[100%] h-[50px] bg-[#e5e5e5] rounded-[5px] relative p-2">
      <AdvancedSearchInput
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        suggestions={suggestions}
        searchHistory={searchHistory}
        showSuggestions={showSuggestions}
        onShowSuggestions={setShowSuggestions}
        onSearch={handleSearch}
        onClearHistory={clearHistory}
        isLoading={isLoading}
        placeholder="Search for products..."
        className="w-full"
      />
    </div>
  );
};

export default Search;
