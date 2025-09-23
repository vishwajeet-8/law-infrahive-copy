import React, { useState, useEffect } from "react";
import Slider from "./Slider"; // Import the Slider component
import { NavLink } from "react-router-dom";

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
    console.log("Selected card clicked", card)
    if(card.url) {
      window.location.href = item.url;
      console.log(item.url);
    } else {
      setSelectedCard(card); // Set the selected card, which opens the slider
    }
  };

  const handleCloseSlider = () => {
    setSelectedCard(null); // Reset selected card, which closes the slider
  };

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
            : // Render actual data cards
            data.map((item) => (
              item.url ? (
                <NavLink 
                  to={item.url} 
                  key={item.id} 
                  className="w-full md:w-[30%] flex items-center border border-[#c7c7c7] rounded-lg p-4 transition-all duration-300 hover:border-blue-500 cursor-pointer"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 object-contain mr-4"
                  />
                  <h3 className="text-lg font-semibold text-gray-700 overflow-hidden">
                    {item.name}
                  </h3>
                </NavLink>
              ) : (
                <div
                  key={item.id}
                  className="w-full md:w-[30%] flex items-center border border-[#c7c7c7] rounded-lg p-4 transition-all duration-300 hover:border-blue-500 cursor-pointer"
                  onClick={() => handleCardClick(item)} // Call the existing function
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 object-contain mr-4"
                  />
                  <h3 className="text-lg font-semibold text-gray-700 overflow-hidden">
                    {item.name}
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
          onClose={handleCloseSlider} // Close slider by resetting selectedCard
        />
      )}
    </div>
  );
};

export default KnowledgeCards;
