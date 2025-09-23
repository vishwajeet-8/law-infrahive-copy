import React, { useState, useRef, useEffect } from 'react';

const FilterBar = ({ dateOptions, selectedDate, onDateChange, searchQuery, onSearchChange }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Selected date label
  const selectedDateLabel = dateOptions.find(option => option.value === selectedDate)?.label || 'Last 15 days';

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="flex justify-between items-center mb-4">
      <div className="relative" ref={dropdownRef}>
        <button
          className="flex items-center justify-between min-w-40 px-4 py-2 bg-white rounded shadow-sm"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          <span>{selectedDateLabel}</span>
          <span className="ml-2 text-xs">▼</span>
        </button>
        
        {isDropdownOpen && (
          <div className="absolute mt-1 w-40 bg-white rounded shadow-md z-10">
            {dateOptions.map((option) => (
              <div
                key={option.value}
                className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${
                  selectedDate === option.value ? 'bg-gray-100 font-medium' : ''
                }`}
                onClick={() => {
                  onDateChange(option.value);
                  setIsDropdownOpen(false);
                }}
              >
                {option.label}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="relative flex-1 ml-4">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <span className="text-gray-500">🔍</span>
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-2 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Search notifications..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
    </div>
  );
};

export default FilterBar;
