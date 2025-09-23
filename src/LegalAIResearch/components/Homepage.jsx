



import React, { useState, useEffect } from "react";
import Slider from "../../components/Slider"; // Import the Slider component - adjust path if needed
import { NavLink } from "react-router-dom";

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

const KnowledgeCards = ({ data }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCard, setSelectedCard] = useState(null); // Track selected card

  // Simulate a loading delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500); // Display skeleton for 500ms

    return () => clearTimeout(timer); // Cleanup timer on component unmount
  }, []);

  const handleCardClick = (card) => {
    console.log("Selected card clicked", card);
    if (card.url) {
      window.location.href = card.url;
      console.log(card.url);
    } else {
      setSelectedCard(card); // Set the selected card, which opens the slider
    }
  };

  const handleCloseSlider = () => {
    setSelectedCard(null); // Reset selected card, which closes the slider
  };

  // Use knowledgeData if no data is provided
  const displayData = Array.isArray(data) && data.length > 0 ? data : knowledgeData;

  return (
    <div className="w-full h-screen flex flex-col">
      {/* Header Section */}
      <div className="flex justify-between items-center px-16 py-6 bg-white">
        <p className="text-xl font-semibold text-gray-800">Knowledge Management</p>
      </div>

      {/* Description Section */}
      <p className="px-16 py-4 text-gray-600 text-base">
        InfraHive Legal AI works best when you can search across all the tools
        you and your team use every day. Connect all data sources you need by
        clicking on each and following the steps shown.
      </p>

      {/* Scrollable Cards Section */}
      <div className="flex-1 overflow-y-auto px-16 py-4">
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
                    className="w-full md:w-[30%] flex items-center border border-[#c7c7c7] rounded-lg p-4 transition-all duration-300 hover:border-blue-500 cursor-pointer"
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
                    className="w-full md:w-[30%] flex items-center border border-[#c7c7c7] rounded-lg p-4 transition-all duration-300 hover:border-blue-500 cursor-pointer"
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

export default KnowledgeCards;




