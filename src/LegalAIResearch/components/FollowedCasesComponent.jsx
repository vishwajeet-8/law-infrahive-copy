

import React, { useState } from 'react';

const FollowedCasesComponent = ({ followedCases, onUnfollow, onViewDetails, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('followedAt'); // followedAt, title, caseNumber, type, court
  const [sortDirection, setSortDirection] = useState('desc'); // asc, desc
  const [cronDays, setCronDays] = useState('');
  const [cronHours, setCronHours] = useState('');
  const [cronMessage, setCronMessage] = useState('');

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Toggle sort direction or change sort field
  const handleSort = (field) => {
    if (field === sortBy) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('asc');
    }
  };

  // Filter and sort followed cases
  const getFilteredAndSortedCases = () => {
    const casesArray = Object.entries(followedCases).map(([cnr, caseData]) => ({
      cnr,
      ...caseData
    }));

    // Filter by search query
    const filtered = searchQuery ? 
      casesArray.filter(caseItem => 
        (caseItem.title && caseItem.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (caseItem.cnr && caseItem.cnr.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (caseItem.caseNumber && caseItem.caseNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (caseItem.type && caseItem.type.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (caseItem.court && caseItem.court.toLowerCase().includes(searchQuery.toLowerCase()))
      ) : 
      casesArray;

    // Sort
    return filtered.sort((a, b) => {
      let comparison = 0;
      
      if (sortBy === 'followedAt') {
        comparison = new Date(a.followedAt) - new Date(b.followedAt);
      } else {
        comparison = (a[sortBy] || '').localeCompare(b[sortBy] || '');
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  };

  const filteredAndSortedCases = getFilteredAndSortedCases();

  // Handle cron job interval submission
  const handleSetCronInterval = async (e) => {
    e.preventDefault();
    if (!cronDays || !cronHours || cronDays < 0 || cronHours < 0 || cronHours >= 24) {
      setCronMessage('Please enter valid days and hours (0-23)');
      return;
    }

    try {
      const response = await fetch('/api/set-cron-interval', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ days: parseInt(cronDays), hours: parseInt(cronHours) }),
      });
      const data = await response.json();
      setCronMessage(data.message || 'Cron job updated successfully');
      setCronDays('');
      setCronHours('');
    } catch (error) {
      setCronMessage('Failed to set cron interval');
    }
  };

  return (
    <div className="bg-white rounded-md shadow-sm">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <div className="flex items-center">
          <h3 className="text-md font-medium text-gray-800">
            Followed Cases ({Object.keys(followedCases).length})
          </h3>
        </div>
        
        <div className="flex space-x-2">
          <div className="relative w-64">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <svg className="w-4 h-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
              </svg>
            </div>
            <input
              type="text"
              className="block w-full p-2 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Search followed cases..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <button
            onClick={onClose}
            className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition duration-150"
          >
            Back to Search
          </button>
        </div>
      </div>
      
      <div className="p-4">
        {/* Cron Job Interval Form */}
        <form onSubmit={handleSetCronInterval} className="mb-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex space-x-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Days</label>
              <input
                type="number"
                className="mt-1 block w-24 p-2 border border-gray-300 rounded-md"
                value={cronDays}
                onChange={(e) => setCronDays(e.target.value)}
                min="0"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Hours</label>
              <input
                type="number"
                className="mt-1 block w-24 p-2 border border-gray-300 rounded-md"
                value={cronHours}
                onChange={(e) => setCronHours(e.target.value)}
                min="0"
                max="23"
                placeholder="0"
              />
            </div>
            <button
              type="submit"
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-150"
            >
              Set Cron Interval
            </button>
          </div>
          {cronMessage && (
            <p className="mt-2 text-sm text-gray-600">{cronMessage}</p>
          )}
        </form>

        {Object.keys(followedCases).length === 0 ? (
          <div className="p-8 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No followed cases</h3>
            <p className="mt-1 text-sm text-gray-500">
              Start following cases to see them here.
            </p>
          </div>
        ) : filteredAndSortedCases.length === 0 ? (
          <div className="p-8 text-center">
            <h3 className="text-sm font-medium text-gray-900">No matches found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try changing your search query.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg shadow">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th 
                    scope="col" 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('title')}
                  >
                    <div className="flex items-center">
                      Case Title
                      {sortBy === 'title' && (
                        <span className="ml-1">
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('caseNumber')}
                  >
                    <div className="flex items-center">
                      Case Number
                      {sortBy === 'caseNumber' && (
                        <span className="ml-1">
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('type')}
                  >
                    <div className="flex items-center">
                      Type
                      {sortBy === 'type' && (
                        <span className="ml-1">
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('court')}
                  >
                    <div className="flex items-center">
                      Court
                      {sortBy === 'court' && (
                        <span className="ml-1">
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('followedAt')}
                  >
                    <div className="flex items-center">
                      Followed On
                      {sortBy === 'followedAt' && (
                        <span className="ml-1">
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAndSortedCases.map((caseItem, index) => (
                  <tr key={caseItem.cnr} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {caseItem.title || 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {caseItem.caseNumber || 'N/A'}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {caseItem.type || 'N/A'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {caseItem.court || 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {formatDate(caseItem.followedAt)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => onViewDetails(caseItem.cnr)}
                          className="flex items-center px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-150"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Details
                        </button>
                        <button
                          onClick={() => onUnfollow(caseItem.cnr)}
                          className="flex items-center px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition duration-150"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Unfollow
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Export functionality */}
        {Object.keys(followedCases).length > 0 && (
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => {
                const dataStr = JSON.stringify(followedCases, null, 2);
                const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
                
                const exportFileDefaultName = `followed_cases_${new Date().toISOString().slice(0,10)}.json`;
                
                const linkElement = document.createElement('a');
                linkElement.setAttribute('href', dataUri);
                linkElement.setAttribute('download', exportFileDefaultName);
                linkElement.click();
              }}
              className="flex items-center px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition duration-150"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export Cases
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FollowedCasesComponent;