// components/FontDropdown.jsx - Dropdown Component
import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';

const FontDropdown = ({ 
  value, 
  onChange, 
  options, 
  placeholder, 
  icon, 
  className = "" 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value) || options[0];

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <div className="flex items-center gap-2 min-w-0">
          {icon && <span className="text-gray-400 flex-shrink-0">{icon}</span>}
          <span 
            className="truncate" 
            style={selectedOption?.style || {}}
          >
            {selectedOption?.label || placeholder}
          </span>
        </div>
        <ChevronDown 
          className={`h-4 w-4 text-gray-400 transition-transform flex-shrink-0 ${
            isOpen ? 'transform rotate-180' : ''
          }`} 
        />
      </button>
      
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {placeholder && (
            <div className="p-2 border-b border-gray-100 text-xs text-gray-500 font-medium">
              {placeholder}
            </div>
          )}
          {options.map((option, index) => (
            <button
              key={`${option.value}-${index}`}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              disabled={option.disabled}
              className={`w-full text-left px-3 py-2 text-sm transition-colors flex items-center ${
                option.disabled 
                  ? 'text-gray-400 cursor-not-allowed bg-gray-50' 
                  : value === option.value 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'text-gray-900 hover:bg-gray-50'
              }`}
              style={option.disabled ? {} : (option.style || {})}
            >
              <span className="truncate flex-1">{option.label}</span>
              {value === option.value && !option.disabled && (
                <span className="ml-auto text-blue-600 flex-shrink-0">✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default FontDropdown;