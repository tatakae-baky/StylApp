import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Fuse from 'fuse.js';
import { postData, fetchDataFromApi } from './api';

// Debounce hook for performance optimization
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    console.log('⏱️ DEBOUNCE: Setting timeout for value:', value, 'delay:', delay + 'ms');
    
    const handler = setTimeout(() => {
      console.log('⏱️ DEBOUNCE: Timeout executed, setting debounced value:', value);
      setDebouncedValue(value);
    }, delay);

    return () => {
      console.log('⏱️ DEBOUNCE: Clearing timeout for value:', value);
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Search history management
const useSearchHistory = () => {
  const [searchHistory, setSearchHistory] = useState([]);

  useEffect(() => {
    const savedHistory = localStorage.getItem('searchHistory');
    if (savedHistory) {
      try {
        setSearchHistory(JSON.parse(savedHistory));
      } catch (error) {
        console.error('Error loading search history:', error);
        setSearchHistory([]);
      }
    }
  }, []);

  const addToHistory = useCallback((searchTerm) => {
    if (!searchTerm.trim()) return;

    setSearchHistory(prevHistory => {
      const updatedHistory = [
        searchTerm,
        ...prevHistory.filter(item => item.toLowerCase() !== searchTerm.toLowerCase())
      ].slice(0, 10); // Keep last 10 searches

      localStorage.setItem('searchHistory', JSON.stringify(updatedHistory));
      return updatedHistory;
    });
  }, []); // No dependencies - using functional update

  const clearHistory = useCallback(() => {
    setSearchHistory([]);
    localStorage.removeItem('searchHistory');
  }, []);

  return { searchHistory, addToHistory, clearHistory };
};

// Enhanced search hook with Fuse.js integration
const useEnhancedSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Search history
  const { searchHistory, addToHistory, clearHistory } = useSearchHistory();

  // Debounced search query (600ms delay for better performance)
  const debouncedQuery = useDebounce(searchQuery, 600);

  // Refs for tracking state
  const productsLoadedRef = useRef(false);
  const currentSearchRef = useRef('');
  const currentResultsRef = useRef([]);

  // Fuse.js configuration for fuzzy matching
  const fuseOptions = useMemo(() => ({
    keys: [
      { name: 'name', weight: 0.7 },
      { name: 'brand.name', weight: 0.5 },
      { name: 'catName', weight: 0.3 },
      { name: 'subCat', weight: 0.3 },
      { name: 'thirdsubCat', weight: 0.2 }
    ],
    threshold: 0.3, // Typo tolerance level (0.0 = exact match, 1.0 = match anything)
    distance: 100,
    includeScore: true,
    includeMatches: true,
    minMatchCharLength: 2,
    useExtendedSearch: true
  }), []);

  // Create Fuse instance
  const fuse = useMemo(() => {
    if (allProducts.length > 0) {
      return new Fuse(allProducts, fuseOptions);
    }
    return null;
  }, [allProducts, fuseOptions]);

  // Load products for fuzzy search (one-time load)
  const loadProductsForFuzzySearch = useCallback(async () => {
    if (productsLoadedRef.current) return;

    try {
      // Use GET request with the correct endpoint
      const response = await fetchDataFromApi('/api/product/getAllProducts?page=1&limit=1000');
      if (response?.products) {
        setAllProducts(response.products);
        productsLoadedRef.current = true;
      }
    } catch (error) {
      console.warn('Could not load products for fuzzy search:', error);
      // Don't set error state here as fuzzy search is optional
    }
  }, []);

  // Generate autocomplete suggestions
  const generateSuggestions = useCallback((query) => {
    if (!query.trim() || query.length < 2) {
      setSuggestions([]);
      return;
    }

    const suggestions = [];

    // Add search history matches
    const historyMatches = searchHistory
      .filter(item => item.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 3)
      .map(item => ({ type: 'history', text: item }));

    suggestions.push(...historyMatches);

    // Add fuzzy search suggestions if available
    // Use current fuse instance directly instead of relying on dependency
    const currentFuse = fuse;
    if (currentFuse && suggestions.length < 5) {
      const fuzzyResults = currentFuse.search(query, { limit: 5 - suggestions.length });
      const productSuggestions = fuzzyResults
        .map(result => ({
          type: 'product',
          text: result.item.name,
          product: result.item
        }));

      suggestions.push(...productSuggestions);
    } else if (!currentFuse && allProducts.length === 0) {
      // Load products for fuzzy search if we haven't yet and user is typing
      loadProductsForFuzzySearch();
    }

    setSuggestions(suggestions.slice(0, 5));
  }, [searchHistory, allProducts.length, loadProductsForFuzzySearch]); // Removed fuse dependency

  // Perform hybrid search (server + fuzzy) - Core search logic
  const performSearch = useCallback(async (query, options = {}) => {
    console.log('🔍 SEARCH INITIATED:', query, 'options:', options);
    
    const trimmedQuery = query.trim();
    
    if (!trimmedQuery) {
      console.log('🔍 SEARCH CLEARED: Empty query');
      setSearchResults([]);
      currentResultsRef.current = []; // Clear results ref too
      setIsLoading(false); // Ensure loading is false for empty queries
      currentSearchRef.current = '';
      return [];
    }

    // Prevent duplicate searches for the same query, BUT allow explicit searches to override auto-searches
    if (currentSearchRef.current === trimmedQuery && !options.addToHistory) {
      console.log('🔍 SEARCH SKIPPED: Already auto-searching for', trimmedQuery);
      return []; // Only skip if it's another auto-search
    }

    // If this is an explicit search and we're already searching, we'll proceed to add to history
    if (currentSearchRef.current === trimmedQuery && options.addToHistory) {
      console.log('🎯 EXPLICIT SEARCH: Proceeding with history addition for ongoing search:', trimmedQuery);
      // Add to history immediately without re-doing the search
      addToHistory(trimmedQuery);
      return currentResultsRef.current; // Return current results from ref
    }

    currentSearchRef.current = trimmedQuery;
    setIsLoading(true);
    setError(null);

    try {
      const searchOptions = {
        page: options.page || 1,
        limit: options.limit || 20,
        query: trimmedQuery,
        ...options
      };

      console.log('🔍 SERVER SEARCH START:', searchOptions);
      // Primary server search
      const serverResponse = await postData('/api/product/search/get', searchOptions);
      let results = serverResponse?.products || [];
      console.log('✅ SERVER SEARCH RESULT:', results.length, 'products found');

      // If server results are limited and we have fuzzy search available
      // Use current fuse instance directly instead of relying on dependency
      const currentFuse = fuse;
      if (results.length < 10 && currentFuse) {
        console.log('🔍 FUZZY SEARCH START: Server results limited, adding fuzzy search');
        const fuzzyResults = currentFuse.search(trimmedQuery, { limit: 20 });
        const fuzzyProducts = fuzzyResults.map(result => ({
          ...result.item,
          _searchScore: result.score,
          _isFromFuzzy: true
        }));

        // Merge results, avoiding duplicates
        const serverIds = new Set(results.map(p => p._id));
        const uniqueFuzzyProducts = fuzzyProducts.filter(p => !serverIds.has(p._id));

        results = [...results, ...uniqueFuzzyProducts].slice(0, searchOptions.limit);
        console.log('✅ FUZZY SEARCH RESULT: Added', uniqueFuzzyProducts.length, 'fuzzy matches, total:', results.length);
      }

      setSearchResults(results);
      currentResultsRef.current = results; // Update ref for tracking
      console.log('✅ SEARCH COMPLETED:', results.length, 'total results');
      
      // Store results for search page
      const searchData = {
        ...serverResponse,
        products: results,
        query: trimmedQuery,
        timestamp: Date.now()
      };
      
      sessionStorage.setItem('searchResults', JSON.stringify(searchData));
      sessionStorage.setItem('searchQuery', trimmedQuery);

      // Dispatch custom event to notify search page of new search
      window.dispatchEvent(new CustomEvent('searchTriggered', {
        detail: { query: trimmedQuery, results: searchData }
      }));

      // Only add to history if this is an explicit search action
      if (options.addToHistory) {
        console.log('📝 ADDING TO SEARCH HISTORY:', trimmedQuery);
        addToHistory(trimmedQuery);
      } else {
        console.log('📝 SKIPPING HISTORY: Auto-search (typing), not adding to history');
      }

      return results;
    } catch (error) {
      console.error('💥 SEARCH ERROR:', error);
      setError('Search failed. Please try again.');
      setSearchResults([]);
      return [];
    } finally {
      console.log('🔍 SEARCH CLEANUP: Setting loading to false');
      setIsLoading(false);
    }
  }, [addToHistory]); // Removed fuse dependency to prevent infinite loop

  // Explicit search action (Enter, click search, click suggestion) - adds to history
  const performExplicitSearch = useCallback(async (query, options = {}) => {
    console.log('🎯 EXPLICIT SEARCH ACTION:', query);
    return await performSearch(query, { ...options, addToHistory: true });
  }, [performSearch]);

  // Handle search query changes (for autocomplete)
  const handleSearchQueryChange = useCallback((query) => {
    console.log('🔍 SEARCH QUERY CHANGE:', query);
    setSearchQuery(query);
    
    if (query.trim().length >= 2) {
      console.log('🔍 GENERATING SUGGESTIONS for:', query);
      generateSuggestions(query);
      setShowSuggestions(true);
    } else {
      console.log('🔍 CLEARING SUGGESTIONS: Query too short');
      setSuggestions([]);
      setShowSuggestions(false);
      setIsLoading(false); // Ensure loading is false when query is too short
    }
  }, [generateSuggestions]);

  // Perform search when debounced query changes (auto-search, no history)
  useEffect(() => {
    console.log('🔍 DEBOUNCED QUERY CHANGE:', debouncedQuery);
    
    if (debouncedQuery.trim().length >= 2) {
      console.log('🔍 TRIGGERING AUTO-SEARCH for:', debouncedQuery, '(no history)');
      performSearch(debouncedQuery, { addToHistory: false }); // Auto-search doesn't add to history
    } else {
      console.log('🔍 CLEARING SEARCH: Query too short or empty');
      setSearchResults([]);
      currentResultsRef.current = []; // Clear results ref too
      setIsLoading(false); // Ensure loading is false when clearing
      currentSearchRef.current = ''; // Clear current search ref
    }
  }, [debouncedQuery]); // Removed performSearch from dependencies to prevent infinite loop

  // Load products for fuzzy search lazily when first needed
  // Removed automatic loading on mount to improve initial page load performance

  return {
    // State
    searchQuery,
    searchResults,
    suggestions,
    isLoading,
    error,
    showSuggestions,
    searchHistory,

    // Actions
    setSearchQuery: handleSearchQueryChange,
    performSearch, // Core search function (for auto-search)
    performExplicitSearch, // Explicit search action (adds to history)
    setShowSuggestions,
    clearHistory,

    // Status
    hasFuzzySearch: !!fuse,
    totalProducts: allProducts.length
  };
};

export default useEnhancedSearch;
