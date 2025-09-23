// components/Sidebar.jsx
import React from 'react';
import { Home, ChevronDown, ChevronRight } from 'lucide-react';

const Sidebar = ({ courts, activePage, setActivePage, openDropdown, toggleDropdown }) => {
  return (
    <div className="w-64 bg-white flex flex-col shadow-md">
      {/* App title */}
      <div className="bg-blue-600 p-4 flex items-center justify-center">
        <h1 className="font-bold text-lg text-white">LEGAL DASHBOARD</h1>
      </div>
      
      {/* Home button */}
      <button 
        className={`flex items-center space-x-3 px-6 py-4 hover:bg-gray-50 transition-colors duration-200 ${activePage === 'home' ? 'text-blue-600 bg-gray-50' : 'text-gray-700'}`}
        onClick={() => {
          setActivePage('home');
          toggleDropdown(null);
        }}
      >
        <Home size={20} className={activePage === 'home' ? 'text-blue-600' : 'text-gray-500'} />
        <span className="font-medium">Home</span>
      </button>

      {/* Divider */}
      <div className="mx-4 my-2 border-b border-gray-100"></div>
      
      {/* Court navigation */}
      <div className="flex-1 overflow-y-auto px-2">
        {courts.map((court) => (
          <div key={court.id} className="mb-1 overflow-hidden">
            <button 
              className={`flex items-center justify-between w-full px-4 py-3 hover:bg-gray-50 text-left transition-colors duration-200 ${openDropdown === court.id ? 'bg-gray-50 text-blue-600' : 'text-gray-700'}`}
              onClick={() => toggleDropdown(court.id)}
            >
              <span className={`font-medium ${openDropdown === court.id ? 'text-blue-600' : ''}`}>{court.name}</span>
              {openDropdown === court.id ? 
                <ChevronDown size={18} className="text-blue-600" /> : 
                <ChevronRight size={18} className="text-gray-400" />
              }
            </button>
            
            {/* Dropdown menu */}
            {openDropdown === court.id && (
              <div className="bg-gray-50 overflow-hidden ml-2">
                <button 
                  className={`w-full px-6 py-3 text-left hover:bg-gray-100 text-sm flex items-center space-x-2 transition-colors ${activePage === `${court.id}-date` ? 'text-blue-600' : 'text-gray-600'}`}
                  onClick={() => setActivePage(`${court.id}-date`)}
                >
                  <div className={`w-1 h-1 rounded-full ${activePage === `${court.id}-date` ? 'bg-blue-600' : 'bg-gray-400'}`}></div>
                  <span>Orders on Date</span>
                </button>
                <button 
                  className={`w-full px-6 py-3 text-left hover:bg-gray-100 text-sm flex items-center space-x-2 transition-colors ${activePage === `${court.id}-party` ? 'text-blue-600' : 'text-gray-600'}`}
                  onClick={() => setActivePage(`${court.id}-party`)}
                >
                  <div className={`w-1 h-1 rounded-full ${activePage === `${court.id}-party` ? 'bg-blue-600' : 'bg-gray-400'}`}></div>
                  <span>Search by Party Name</span>
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;