// components/DateSearchPage.jsx
import React from 'react';
import { Search } from 'lucide-react';

const DateSearchPage = ({ court, dateInput, setDateInput, handleDateSearch }) => {
  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Search {court} Orders by Date</h2>
      <div className="bg-white p-6 rounded-md border border-gray-200 max-w-md">
        <form onSubmit={(e) => handleDateSearch(court, e)}>
          <div className="mb-4">
            <label htmlFor="date-input" className="block text-sm font-medium mb-1 text-gray-700">
              Date
            </label>
            <input 
              type="date" 
              id="date-input" 
              value={dateInput}
              onChange={(e) => setDateInput(e.target.value)}
              className="w-full border border-gray-200 rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-blue-600"
              required
            />
          </div>
          <div className="flex justify-end">
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2">
              <Search size={16} />
              <span>Search</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DateSearchPage;