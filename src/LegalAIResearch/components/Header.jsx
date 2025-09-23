


// components/Header.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Search, ExternalLink, X } from 'lucide-react';

// Create a separate SearchResultsPage component
const SearchResultsPage = ({ results, onClose }) => {
  return (
    <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-semibold text-gray-800">Search Results</h1>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-500">Similar Domains</h3>
            <p className="text-xs text-gray-400">Ordered by similarity score</p>
          </div>
          
          <div className="divide-y divide-gray-100">
            <div className="grid grid-cols-12 px-4 py-3 text-xs font-medium text-gray-500 bg-gray-50">
              <div className="col-span-3">DOMAIN</div>
              <div className="col-span-6">INFORMATION</div>
              <div className="col-span-2 text-center">SIMILARITY</div>
              <div className="col-span-1 text-center">ACTIONS</div>
            </div>

            {results.map((result, index) => (
              <div key={index} className="grid grid-cols-12 gap-2 p-4 hover:bg-gray-50">
                <div className="col-span-3 flex items-center">
                  <div className={`w-10 h-10 ${result.iconBg} rounded-md flex items-center justify-center text-gray-700 font-semibold mr-3`}>
                    {result.icon}
                  </div>
                  <div className="text-sm text-gray-600">{result.domain}</div>
                </div>
                <div className="col-span-6">
                  <div className="text-sm font-medium text-gray-700">{result.information}</div>
                  <div className="text-xs text-gray-500">{result.description}</div>
                </div>
                <div className="col-span-2 flex items-center justify-center">
                  <span className={`${result.similarityColor} font-medium`}>{result.similarity}</span>
                </div>
                <div className="col-span-1 flex items-center justify-center">
                  <button className="text-gray-400 hover:text-blue-500">
                    <ExternalLink size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {results.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              No results found. Try a different search term.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Header = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [showFullPage, setShowFullPage] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const searchRef = useRef(null);

  // Mock search results - in a real app, this would come from an API
  const mockResults = [
    {
      domain: 'Writesonic.com/',
      icon: 'W',
      iconBg: 'bg-blue-100',
      information: 'Writesonic - AI Article Writer & AI Marketing Agent',
      description: 'Research, create content that humans love to read, optimize for SEO, and publish on one platform. Automate marketing workflows with your AI Marketing Agent and AI Article Writer.',
      similarity: '94.8%',
      similarityColor: 'text-green-500'
    },
    {
      domain: 'textify.ai/',
      icon: 'T',
      iconBg: 'bg-purple-100',
      information: 'Textify Analytics : Affordable Insights at the Speed of AI',
      description: 'Unlock the power of your data with Textify Analytics! Leverage cutting-edge generative AI to enhance your analytics capabilities.',
      similarity: '70.3%',
      similarityColor: 'text-blue-500'
    },
    {
      domain: 'vengreso.com/',
      icon: 'V',
      iconBg: 'bg-violet-100',
      information: 'FlyMSG: AI Writer, Text Expander, & AI Sales Prospecting Tools',
      description: 'FlyMSG is an AI writer, text expander, sales training & sales prospecting tool used to connect with customers & save sellers 1 hr. per day.',
      similarity: '66.6%',
      similarityColor: 'text-blue-500'
    }
  ];

  // Handle search input changes
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    // Don't show dropdown results while typing - only prepare the filtered results
    if (query.trim().length > 0) {
      // Filter results based on query (in a real app, this would be a backend call)
      setSearchResults(mockResults.filter(result => 
        result.domain.toLowerCase().includes(query.toLowerCase()) ||
        result.information.toLowerCase().includes(query.toLowerCase())
      ));
    } else {
      setShowResults(false);
    }
  };

  // Handle key press for search input
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && searchQuery.trim().length > 0) {
      e.preventDefault();
      setShowFullPage(true);
      setShowResults(false);
    }
  };

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <>
      <header className="bg-gray-800 shadow-sm z-10 h-14">
        <div className="flex items-center justify-between px-6 py-3">
          <h1 className="text-xl font-semibold text-white">Indian Courts Dashboard</h1>
          
        </div>
      </header>

      {/* Full Page Search Results */}
      {showFullPage && (
        <SearchResultsPage 
          results={searchResults} 
          onClose={() => setShowFullPage(false)} 
        />
      )}
    </>
  );
};

export default Header;