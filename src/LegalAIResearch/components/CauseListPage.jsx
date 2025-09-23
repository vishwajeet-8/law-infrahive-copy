

import React, { useState } from "react";
import { Search, Calendar, Filter } from "lucide-react";

const CauseListPage = () => {
  // State for input fields
  const [date, setDate] = useState("");
  const [type, setType] = useState("CRIMINAL");
  const [courtId, setCourtId] = useState("");
  
  // State for results and UI states
  const [causeList, setCauseList] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);

  // Mock data matching your provided sample
  const mockCauseList = [
    {
      "#": "1",
      "stage": "Misc./ Appearance",
      "title": "STATE vs UNTRACE",
      "advocate": "",
      "caseNumber": "Cr. Case/12994/2023",
      "cnr": "DLSW020604702023"
    },
    {
      "#": "2",
      "stage": "Judgement",
      "title": "STATE vs Sonu@Joginder",
      "advocate": "",
      "caseNumber": "Cr. Case/5714/2017",
      "cnr": "DLSW020196712017"
    },
    {
      "#": "3",
      "stage": "Arguments",
      "title": "STATE vs SURESH KUMAR",
      "advocate": "RAJIV MOHAN",
      "caseNumber": "Cr. Case/8532/2022",
      "cnr": "DLSW020375842022"
    },
    {
      "#": "4",
      "stage": "Evidence",
      "title": "STATE vs RAKESH SHARMA & ORS",
      "advocate": "AMIT SAHNI",
      "caseNumber": "Cr. Case/9876/2021",
      "cnr": "DLSW020426531021"
    },
    {
      "#": "5",
      "stage": "Misc./ Appearance",
      "title": "STATE vs RAJU & ANR",
      "advocate": "PRATEEK KUMAR",
      "caseNumber": "Cr. Case/5421/2023",
      "cnr": "DLSW020234562023"
    }
  ];

  // Format date from yyyy-mm-dd to dd-mm-yyyy for display
  const formatDateForDisplay = (inputDate) => {
    if (!inputDate) return "";
    
    // Check if already in DD-MM-YYYY format
    if (/^\d{2}-\d{2}-\d{4}$/.test(inputDate)) {
      return inputDate;
    }
    
    // Convert from YYYY-MM-DD to DD-MM-YYYY for display
    const [year, month, day] = inputDate.split('-');
    return `${day}-${month}-${year}`;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!date || !courtId) return;
    
    // Show loading state
    setIsLoading(true);
    
    // Simulate API delay
    setTimeout(() => {
      setCauseList(mockCauseList);
      setIsLoading(false);
      setSearchPerformed(true);
    }, 800);
  };
  
  // Reset all form fields
  const handleClear = () => {
    setDate("");
    setType("CRIMINAL");
    setCourtId("");
    setCauseList(null);
    setSearchPerformed(false);
  };

  // Display date in readable format for the heading
  const getDisplayDate = () => {
    if (!date) return "";
    
    // If input is in YYYY-MM-DD format from the date picker
    if (date.includes('-')) {
      const dateObj = new Date(date);
      return dateObj.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    }
    
    // Otherwise return as is
    return date;
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Court Cause List</h2>
      <div className="bg-white p-6 rounded-md border border-gray-200 max-w-xl shadow-sm">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="date-input" className="block text-sm font-medium mb-1 text-gray-700">
                Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  id="date-input"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full border border-gray-200 rounded-md p-2 pr-10 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  required
                />
                {/* <Calendar className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" /> */}
              </div>
              <p className="mt-1 text-xs text-gray-500">Select date for cause list</p>
            </div>
            
            <div>
              <label htmlFor="type-select" className="block text-sm font-medium mb-1 text-gray-700">
                Case Type
              </label>
              <div className="relative">
                <select
                  id="type-select"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full border border-gray-200 rounded-md p-2 pr-10 focus:outline-none focus:ring-1 focus:ring-blue-600 appearance-none"
                >
                  <option value="CRIMINAL">CRIMINAL</option>
                  <option value="CIVIL">CIVIL</option>
                  <option value="BOTH">BOTH</option>
                </select>
                <Filter className="absolute right-3 top-2.5 h-5 w-5 text-gray-400 pointer-events-none" />
              </div>
            </div>
            
            <div className="col-span-2">
              <label htmlFor="court-id" className="block text-sm font-medium mb-1 text-gray-700">
                Court ID
              </label>
              <input
                type="text"
                id="court-id"
                value={courtId}
                onChange={(e) => setCourtId(e.target.value)}
                className="w-full border border-gray-200 rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-blue-600"
                placeholder="e.g. ff886fdc"
                required
              />
              <p className="mt-1 text-xs text-gray-500">Enter the court ID</p>
            </div>
            
            <div className="col-span-2 flex justify-between pt-2">
              <button
                type="button"
                onClick={handleClear}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Clear
              </button>
              
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                disabled={isLoading || !date || !courtId}
              >
                {isLoading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-r-transparent"></div>
                    <span>Loading...</span>
                  </>
                ) : (
                  <>
                    <Search size={16} />
                    <span>Get Cause List</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Results Section */}
      {isLoading && (
        <div className="mt-6 p-4 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-2 text-gray-600">Fetching cause list...</p>
        </div>
      )}

      {causeList && causeList.length > 0 && (
        <div className="mt-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-3 gap-2">
            <h3 className="text-lg font-medium">Cause List - {getDisplayDate()}</h3>
            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full inline-block">
              {type} Cases • {causeList.length} items
            </span>
          </div>

          <div className="bg-white rounded-md border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border-b border-gray-200 p-3 text-left">#</th>
                    <th className="border-b border-gray-200 p-3 text-left">Case Number</th>
                    <th className="border-b border-gray-200 p-3 text-left">Title</th>
                    <th className="border-b border-gray-200 p-3 text-left">Stage</th>
                    <th className="border-b border-gray-200 p-3 text-left">Advocate</th>
                    <th className="border-b border-gray-200 p-3 text-left">CNR</th>
                  </tr>
                </thead>
                <tbody>
                  {causeList.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="border-b border-gray-200 p-3">{item["#"]}</td>
                      <td className="border-b border-gray-200 p-3">{item.caseNumber}</td>
                      <td className="border-b border-gray-200 p-3 max-w-xs truncate" title={item.title}>
                        {item.title}
                      </td>
                      <td className="border-b border-gray-200 p-3">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          item.stage === "Judgement" 
                            ? "bg-blue-100 text-blue-800" 
                            : item.stage === "Arguments"
                              ? "bg-purple-100 text-purple-800"
                              : item.stage === "Evidence"
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                        }`}>
                          {item.stage}
                        </span>
                      </td>
                      <td className="border-b border-gray-200 p-3">{item.advocate || "—"}</td>
                      <td className="border-b border-gray-200 p-3 text-gray-600 text-sm">{item.cnr}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {searchPerformed && (!causeList || causeList.length === 0) && !isLoading && (
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-md p-4 text-yellow-700">
          No cause list entries found for the selected date and court. Please verify your search criteria or try a different date.
        </div>
      )}
    </div>
  );
};

export default CauseListPage;