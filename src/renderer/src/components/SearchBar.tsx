import React, { useRef, useEffect, useCallback } from "react";
import { useUIStore } from "../store/useUIStore";
import { useMindmapStore } from "../store/useMindmapStore";
import clsx from "clsx";

const SearchBar: React.FC = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const searchQuery = useUIStore((state) => state.searchQuery);
  const searchResults = useUIStore((state) => state.searchResults);
  const searchIndex = useUIStore((state) => state.searchIndex);
  const setSearchQuery = useUIStore((state) => state.setSearchQuery);
  const setSearchResults = useUIStore((state) => state.setSearchResults);
  const setSearchIndex = useUIStore((state) => state.setSearchIndex);
  const clearSearch = useUIStore((state) => state.clearSearch);
  const selectNode = useMindmapStore((state) => state.selectNode);
  const data = useMindmapStore((state) => state.data);

  // Get node path for display
  const getNodePath = useCallback((nodeId: string, nodes: any): string[] => {
    const path: string[] = [];
    let currentId = nodeId;
    while (currentId) {
      const node = nodes[currentId];
      if (!node) break;
      path.unshift(node.text);
      currentId = node.parentId;
    }
    return path;
  }, []);

  // Perform search
  const performSearch = useCallback((query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setSearchIndex(-1);
      return;
    }

    const sheet = data.sheets?.find((s) => s.id === data.activeSheetId);
    if (!sheet) return;

    const results: { nodeId: string; nodeText: string; path: string[] }[] = [];
    const lowerQuery = query.toLowerCase();

    Object.values(sheet.nodes).forEach((node) => {
      if (node.text.toLowerCase().includes(lowerQuery)) {
        results.push({
          nodeId: node.id,
          nodeText: node.text,
          path: getNodePath(node.id, sheet.nodes),
        });
      }
    });

    setSearchResults(results);
    setSearchIndex(results.length > 0 ? 0 : -1);
  }, [data, getNodePath, setSearchResults, setSearchIndex]);

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(searchQuery);
    }, 200);

    return () => clearTimeout(timer);
  }, [searchQuery, performSearch]);

  // Handle Enter key navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      clearSearch();
      return;
    }

    if (e.key === "Enter") {
      e.preventDefault();
      if (searchResults.length > 0) {
        const nextIndex = searchIndex >= 0 ? (searchIndex + 1) % searchResults.length : 0;
        setSearchIndex(nextIndex);
        const result = searchResults[nextIndex];
        selectNode(result.nodeId);
      }
    }
  }, [searchResults, searchIndex, setSearchIndex, selectNode, clearSearch]);

  // Focus search on Cmd/Ctrl + F
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "f") {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, []);

  // Select search result
  const handleResultClick = useCallback((index: number) => {
    setSearchIndex(index);
    const result = searchResults[index];
    selectNode(result.nodeId);
  }, [searchResults, selectNode, setSearchIndex]);

  return (
    <div className="relative no-drag">
      <div className="flex items-center no-drag">
        <svg
          className="w-4 h-4 text-ui-secondary absolute left-3 pointer-events-none"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="搜索节点..."
          className="pl-9 pr-8 py-1 text-sm bg-panel border border-ui-border rounded-md text-ui-primary placeholder:text-ui-tertiary focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-colors w-48"
        />
        {searchQuery && (
          <button
            onClick={clearSearch}
            className="absolute right-2 p-0.5 text-ui-secondary hover:text-ui-primary transition-colors"
          >
            <svg
              className="w-3.5 h-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {searchQuery && searchResults.length > 0 && (
        <div className="absolute top-full left-0 mt-1 w-80 max-h-64 overflow-y-auto bg-panel border border-ui-border rounded-md shadow-lg z-50">
          {searchResults.map((result, index) => (
            <button
              key={result.nodeId}
              onClick={() => handleResultClick(index)}
              className={clsx(
                "w-full px-3 py-2 text-left hover:bg-panel-hover transition-colors",
                searchIndex === index && "bg-panel-active"
              )}
            >
              <div className="text-sm font-medium text-ui-primary truncate">
                {result.nodeText}
              </div>
              <div className="text-xs text-ui-tertiary truncate">
                {result.path.join(" → ")}
              </div>
            </button>
          ))}
          <div className="px-3 py-1.5 border-t border-ui-border text-xs text-ui-tertiary flex justify-between">
            <span>共 {searchResults.length} 个结果</span>
            <span>Enter 切换</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
