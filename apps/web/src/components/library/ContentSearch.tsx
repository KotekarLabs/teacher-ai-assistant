import React, { useState, useEffect } from "react";

interface ContentSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const ContentSearch: React.FC<ContentSearchProps> = ({
  value,
  onChange,
  placeholder = "Search resources by title, subject, or topic...",
}) => {
  const [searchTerm, setSearchTerm] = useState(value);
  const [prevValue, setPrevValue] = useState(value);

  if (value !== prevValue) {
    setPrevValue(value);
    setSearchTerm(value);
  }

  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchTerm !== value) {
        onChange(searchTerm);
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [searchTerm, onChange, value]);

  const handleClear = () => {
    setSearchTerm("");
    onChange("");
  };

  return (
    <div className="relative flex-1 min-w-[240px]">
      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>
      <input
        type="text"
        data-testid="content-search-input"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder={placeholder}
        aria-label="Search teaching resources"
        className="w-full pl-10 pr-10 py-2.5 bg-white text-slate-900 placeholder-slate-400 text-sm font-medium rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm transition-all"
      />
      {searchTerm && (
        <button
          type="button"
          data-testid="clear-search-btn"
          onClick={handleClear}
          aria-label="Clear search"
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  );
};
