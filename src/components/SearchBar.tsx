// Search Bar Component
// Provides search functionality across projects, workspaces, templates, and files

import { useState, useEffect, useRef } from 'react';
import { Search, X, Clock, File, Folder, Layout, Briefcase } from 'lucide-react';
import { searchService, SearchResult } from '../lib/search-service';

export default function SearchBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      setRecentSearches(searchService.getRecentSearches());
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setResults([]);
      setSuggestions([]);
    }
  }, [isOpen]);

  const handleSearch = async (searchQuery: string) => {
    setQuery(searchQuery);
    
    if (searchQuery.length < 2) {
      setResults([]);
      setSuggestions([]);
      return;
    }

    setLoading(true);
    try {
      const [searchResults, searchSuggestions] = await Promise.all([
        searchService.search({ query: searchQuery, limit: 10 }),
        searchService.getSuggestions(searchQuery, 'current-user', 5)
      ]);
      setResults(searchResults);
      setSuggestions(searchSuggestions);
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectResult = (result: SearchResult) => {
    if (result.url) {
      window.location.href = result.url;
    }
    searchService.saveSearch(query);
    setIsOpen(false);
  };

  const handleSelectSuggestion = (suggestion: string) => {
    setQuery(suggestion);
    handleSearch(suggestion);
  };

  const handleSelectRecent = (recent: string) => {
    setQuery(recent);
    handleSearch(recent);
  };

  const handleClearRecent = () => {
    searchService.clearRecentSearches();
    setRecentSearches([]);
  };

  const getResultIcon = (type: SearchResult['type']) => {
    const icons = {
      project: <Briefcase className="w-4 h-4" />,
      file: <File className="w-4 h-4" />,
      workspace: <Folder className="w-4 h-4" />,
      template: <Layout className="w-4 h-4" />
    };
    return icons[type] || <Search className="w-4 h-4" />;
  };

  const getResultColor = (type: SearchResult['type']) => {
    const colors = {
      project: 'bg-blue-100 text-blue-600',
      file: 'bg-gray-100 text-gray-600',
      workspace: 'bg-purple-100 text-purple-600',
      template: 'bg-green-100 text-green-600'
    };
    return colors[type] || 'bg-gray-100 text-gray-600';
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      >
        <Search className="w-4 h-4 text-gray-500" />
        <span className="text-sm text-gray-600 dark:text-gray-300">Search...</span>
        <kbd className="hidden sm:inline-flex px-1.5 py-0.5 text-xs font-mono bg-gray-200 dark:bg-gray-700 rounded">⌘K</kbd>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/50">
      <div className="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-xl shadow-2xl overflow-hidden">
        {/* Search Input */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search projects, workspaces, templates, files..."
              className="flex-1 text-lg outline-none bg-transparent"
              autoFocus
            />
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="max-h-[60vh] overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Searching...</div>
          ) : query.length < 2 ? (
            <div className="p-6">
              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-500 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Recent Searches
                    </h3>
                    <button
                      onClick={handleClearRecent}
                      className="text-xs text-gray-400 hover:text-gray-600"
                    >
                      Clear
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((recent) => (
                      <button
                        key={recent}
                        onClick={() => handleSelectRecent(recent)}
                        className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                      >
                        {recent}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Search Tips */}
              <div className="text-sm text-gray-500">
                <p className="font-semibold mb-2">Search Tips:</p>
                <ul className="space-y-1 text-gray-400">
                  <li>• Search by project name, workspace name, or file name</li>
                  <li>• Use keywords to find specific resources</li>
                  <li>• Results are sorted by relevance</li>
                </ul>
              </div>
            </div>
          ) : (
            <>
              {/* Suggestions */}
              {suggestions.length > 0 && results.length === 0 && (
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-sm font-semibold text-gray-500 mb-2">Suggestions</h3>
                  <div className="space-y-1">
                    {suggestions.map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => handleSelectSuggestion(suggestion)}
                        className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Results */}
              {results.length > 0 ? (
                <div className="p-2">
                  {results.map((result) => (
                    <button
                      key={result.id}
                      onClick={() => handleSelectResult(result)}
                      className="w-full flex items-center gap-3 p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-left"
                    >
                      <div className={`p-2 rounded-lg ${getResultColor(result.type)}`}>
                        {getResultIcon(result.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold truncate">{result.title}</h4>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${getResultColor(result.type)}`}>
                            {result.type}
                          </span>
                        </div>
                        {result.description && (
                          <p className="text-sm text-gray-500 truncate">{result.description}</p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500">
                  <Search className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No results found for "{query}"</p>
                  <p className="text-sm mt-1">Try different keywords or check your spelling</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Use ↑↓ to navigate, Enter to select, Esc to close</span>
            <span>{results.length} results</span>
          </div>
        </div>
      </div>
    </div>
  );
}
