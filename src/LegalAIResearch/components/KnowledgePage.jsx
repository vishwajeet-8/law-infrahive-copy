import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import Slider from "../../components/Slider"; // Import the Slider component - adjust path if needed

// Knowledge data embedded directly in this file
const knowledgeData = [
  { id: 1, name: "Supreme Court", image: "assets/legal-knowledge/1.png", url: "" },
  { id: 2, name: "High Court", image: "assets/legal-knowledge/2.jpg", url: "" },
  { id: 3, name: "District Court", image: "assets/legal-knowledge/3.jpg", url: "" },
  { id: 4, name: "NCLT", image: "assets/legal-knowledge/4.png", url: "" },
  { id: 5, name: "Consumer Forum", image: "assets/legal-knowledge/5.png", url: "" },
  { id: 7, name: "RBI", image: "assets/legal-knowledge/7.png", url: "/integration/rbi-chat" },
  { id: 8, name: "SEBI", image: "assets/legal-knowledge/8.png", url: "" },
  { id: 16, name: "NCLAT", image: "assets/legal-knowledge/16.png", url: "" },
  { id: 9, name: "MCA", image: "assets/legal-knowledge/9.jpg", url: "" },
  { id: 10, name: "EPFO", image: "assets/legal-knowledge/10.png", url: "" },
  { id: 11, name: "FSSAI", image: "assets/legal-knowledge/11.png", url: "" },
  { id: 12, name: "Cybersafe", image: "assets/legal-knowledge/12.jpeg", url: "" },
  { id: 14, name: "Voter", image: "assets/legal-knowledge/14.png", url: "" },
  { id: 15, name: "Vehicle Number", image: "assets/legal-knowledge/15.png", url: "" },
  { id: "oneclechat", name: "onecle", image: "assets/knowledge/onecle.svg", url: "/oneclechat" }
];

// Sample domain data that mimics the search results shown in the image
const domainData = [
  {
    id: 1,
    domain: "writesonic.com",
    letter: "W",
    information: "Writesonic - AI Article Writer & AI Marketing Agent",
    description: "Research, create content that humans love to read, optimize for SEO, and publish on one platform. Automate marketing workflows with your AI Marketing Agent and AI Article Writer.",
    similarity: 94.8
  },
  {
    id: 2,
    domain: "textify.ai",
    letter: "T",
    information: "Textify Analytics - Affordable Insights at the Speed of AI",
    description: "Unlock the power of your data with Textify Analytics! Leverage cutting-edge generative AI to enhance your analytics capabilities.",
    similarity: 70.3
  },
  {
    id: 3,
    domain: "vengreso.com",
    letter: "V",
    information: "FlyMSG: AI Writer, Text Expander, & AI Sales Prospecting Tools",
    description: "FlyMSG is an AI writer, text expander, sales training & sales prospecting tool used to connect with customers & save sellers 1 hr. per day.",
    similarity: 66.6
  },
  {
    id: 4,
    domain: "legalai.tech",
    letter: "L",
    information: "Legal AI - AI-powered legal research assistant",
    description: "Simplify legal research with AI-powered tools and document analysis to save time and improve accuracy.",
    similarity: 62.4
  },
  {
    id: 5,
    domain: "courtbench.io",
    letter: "C",
    information: "CourtBench - AI Legal Document Analysis",
    description: "Analyze court cases and legal documents in seconds with AI-powered insights and summaries.",
    similarity: 58.9
  }
];

const KnowledgePage = ({ data, showSearch = true, pageName = "home" }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCard, setSelectedCard] = useState(null); // Track selected card
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [searchResults, setSearchResults] = useState([]);

  // Simulate a loading delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500); // Display skeleton for 500ms

    return () => clearTimeout(timer); // Cleanup timer on component unmount
  }, []);

  // Handle search input changes and trigger search
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setIsSearchMode(false);
      setSearchResults([]);
      return;
    }

    setIsSearchMode(true);
    setIsLoading(true);

    // Simulate search delay
    const timer = setTimeout(() => {
      // Filter domains based on search query
      const results = domainData.filter(
        domain =>
          domain.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
          domain.information.toLowerCase().includes(searchQuery.toLowerCase()) ||
          domain.description.toLowerCase().includes(searchQuery.toLowerCase())
      );

      // Sort by similarity score (highest first)
      const sortedResults = [...results].sort((a, b) => b.similarity - a.similarity);
      
      setSearchResults(sortedResults);
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleCardClick = (card) => {
    console.log("Selected card clicked", card);
    if (card.url) {
      window.location.href = card.url;
    } else {
      setSelectedCard(card); // Set the selected card, which opens the slider
    }
  };

  const handleCloseSlider = () => {
    setSelectedCard(null); // Reset selected card, which closes the slider
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Use knowledgeData if no data is provided
  const displayData = Array.isArray(data) && data.length > 0 ? data : knowledgeData;

  return (
    <div className="w-full h-screen flex flex-col bg-gray-50">
      {/* Header Section */}
      {/* <div className="flex justify-between items-center px-16 py-6 bg-white shadow-sm">
        <p className="text-xl font-semibold text-gray-800">Knowledge Management</p>
      </div> */}

      {/* Search Input - Only show if showSearch prop is true */}
      {/* {showSearch && (
        <div className="px-16 py-4">
          <div className="relative max-w-2xl mx-auto">
            <input
              type="text"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Search for domains, tools, or services..."
              value={searchQuery}
              onChange={handleSearchChange}
            />
            <svg
              className="absolute right-3 top-3 h-6 w-6 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              ></path>
            </svg>
          </div>
        </div>
      )} */}

      {/* Description Section - show only in normal mode */}
      {!isSearchMode && (
        <p className="px-16 py-4 text-gray-600 text-base">
          InfraHive Legal AI works best when you can search across all the tools
          you and your team use every day. Connect all data sources you need by
          clicking on each and following the steps shown.
        </p>
      )}

      {/* Content Section */}
      <div className="flex-1 overflow-y-auto px-16 py-4">
        {/* Search Results View - Only shown when search is active and enabled */}
        {showSearch && isSearchMode && (
          <div className="bg-white rounded-lg shadow-md">
            {/* Header */}
            <div className="border-b border-gray-200">
              <div className="p-4">
                <h2 className="text-xl font-medium text-gray-700">Similar Domains</h2>
                <p className="text-sm text-gray-500">Ordered by similarity score</p>
              </div>
            </div>

            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 p-4 border-b border-gray-200 bg-gray-50">
              <div className="col-span-3 text-sm font-medium text-gray-500">DOMAIN</div>
              <div className="col-span-6 text-sm font-medium text-gray-500">INFORMATION</div>
              <div className="col-span-2 text-sm font-medium text-gray-500">SIMILARITY</div>
              <div className="col-span-1 text-sm font-medium text-gray-500">ACTIONS</div>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="p-8 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-blue-500"></div>
                <p className="mt-2 text-gray-600">Searching...</p>
              </div>
            )}

            {/* No Results */}
            {!isLoading && searchResults.length === 0 && (
              <div className="p-8 text-center">
                <p className="text-gray-600">No matching domains found.</p>
              </div>
            )}

            {/* Results List */}
            {!isLoading &&
              searchResults.map((result) => (
                <div
                  key={result.id}
                  className="grid grid-cols-12 gap-4 p-4 border-b border-gray-200 hover:bg-gray-50"
                >
                  {/* Domain Column */}
                  <div className="col-span-3 flex items-center">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center mr-3">
                      <span className="text-blue-600 font-semibold">{result.letter}</span>
                    </div>
                    <span className="text-gray-700">{result.domain}</span>
                  </div>

                  {/* Information Column */}
                  <div className="col-span-6">
                    <p className="text-gray-700 font-medium mb-1">{result.information}</p>
                    <p className="text-sm text-gray-500">{result.description}</p>
                  </div>

                  {/* Similarity Column */}
                  <div className="col-span-2 flex items-center">
                    <div className={`h-2 w-2 rounded-full mr-2 ${
                      result.similarity > 85 ? 'bg-green-500' : 
                      result.similarity > 60 ? 'bg-blue-500' : 
                      'bg-gray-500'
                    }`}></div>
                    <span className="text-gray-700">{result.similarity}%</span>
                  </div>

                  {/* Actions Column */}
                  <div className="col-span-1 flex items-center justify-center">
                    <button className="text-blue-500 hover:text-blue-700">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        ></path>
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* Normal Cards View - show when not in search mode or search is disabled */}
        {(!isSearchMode || !showSearch) && (
          <div className="flex flex-wrap gap-6 ml-auto mr-auto justify-center">
            {isLoading
              ? // Skeleton loading cards
                Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={index}
                    className="w-full md:w-[30%] flex items-center border border-[#e0e0e0] rounded-lg p-4 bg-gray-200 animate-pulse"
                  >
                    <div className="w-16 h-16 bg-gray-300 rounded-full mr-4"></div>
                    <div className="flex-1 h-6 bg-gray-300 rounded"></div>
                  </div>
                ))
              : // Render cards from displayData
                displayData.map((item) => (
                  item.url ? (
                    <NavLink 
                      to={item.url} 
                      key={item.id || `item-${Math.random()}`} 
                      className="w-full md:w-[30%] flex items-center border border-[#c7c7c7] rounded-lg p-4 transition-all duration-300 hover:border-blue-500 cursor-pointer bg-white"
                    >
                      <img
                        src={item.image}
                        alt={item.name || ""}
                        className="w-16 h-16 object-contain mr-4"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          const div = document.createElement('div');
                          div.className = "w-16 h-16 flex items-center justify-center bg-gray-200 rounded-full mr-4";
                          const span = document.createElement('span');
                          span.className = "text-2xl font-bold text-gray-600";
                          span.textContent = item.name ? item.name.charAt(0).toUpperCase() : 'C';
                          div.appendChild(span);
                          e.target.parentNode.insertBefore(div, e.target);
                        }}
                      />
                      <h3 className="text-lg font-semibold text-gray-700 overflow-hidden">
                        {item.name || "Unnamed Item"}
                      </h3>
                    </NavLink>
                  ) : (
                    <div
                      key={item.id || `item-${Math.random()}`}
                      className="w-full md:w-[30%] flex items-center border border-[#c7c7c7] rounded-lg p-4 transition-all duration-300 hover:border-blue-500 cursor-pointer bg-white"
                      onClick={() => handleCardClick(item)}
                    >
                      <img
                        src={item.image}
                        alt={item.name || ""}
                        className="w-16 h-16 object-contain mr-4"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          const div = document.createElement('div');
                          div.className = "w-16 h-16 flex items-center justify-center bg-gray-200 rounded-full mr-4";
                          const span = document.createElement('span');
                          span.className = "text-2xl font-bold text-gray-600";
                          span.textContent = item.name ? item.name.charAt(0).toUpperCase() : 'C';
                          div.appendChild(span);
                          e.target.parentNode.insertBefore(div, e.target);
                        }}
                      />
                      <h3 className="text-lg font-semibold text-gray-700 overflow-hidden">
                        {item.name || "Unnamed Item"}
                      </h3>
                    </div>
                  )
                ))
              }
          </div>
        )}
      </div>

      {/* Slider for Detailed View */}
      {selectedCard && (
        <Slider
          selectedApp={selectedCard}
          onClose={handleCloseSlider}
        />
      )}
    </div>
  );
};

export default KnowledgePage;



