import React from 'react';

const Sidebar = ({ menuOptions, activeSection, onSectionChange }) => {
  return (
    <div className="w-60 h-full bg-amber-50 shadow-md">
      <div className="py-4">
        {menuOptions.map((option) => (
          <button
            key={option.id}
            className={`w-full text-left py-3 px-6 text-lg font-medium transition-colors ${
              activeSection === option.id
                ? 'bg-amber-100 border-l-4 border-blue-900'
                : 'hover:bg-amber-100'
            }`}
            onClick={() => onSectionChange(option.id)}
          >
            {option.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;