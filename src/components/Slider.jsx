import{React, useEffect, useState} from "react";

const Slider = ({
  selectedApp,
  contentArray,
  handleAppDialog,
  handleInviteDialog,
  onClose, // Parent-provided function to handle close
}) => {


    const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Add the animation class after a slight delay
    const timer = setTimeout(() => {
      setIsAnimating(true);
    }, 50); // Slight delay for smooth appearance
    return () => clearTimeout(timer); // Cleanup on unmount
  }, []);

  const handleClose = () => {
    setIsAnimating(false); // Remove animation class to slide out
    setTimeout(() => {
      onClose(); // Notify parent to reset state after animation ends
    }, 300); // Match the animation duration
  };
  return (
    <div
      className={`fixed top-0 right-0 h-full w-full md:w-4/5 lg:w-5/6 bg-[#F6F6F6] shadow-lg z-50 overflow-y-auto transition-transform duration-300 ${
        isAnimating ? "translate-x-0" : "translate-x-full"
      }`}
    >
      {/* Header Section */}
      <div className="relative flex flex-col">
        <div className="flex justify-between px-4 h-[73px] py-4 border-b border-gray-200">
          {/* Back to Apps Button */}
          <button
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800"
            onClick={onClose}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-4 h-4"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            <span>Back to Apps</span>
          </button>

          {/* Invite a Teammate Button */}
          <button
            className="text-sm text-blue-600 hover:underline"
            onClick={handleInviteDialog}
          >
            Invite a teammate to set this up
          </button>
        </div>

        {/* Content Section */}
        <div className="p-6 flex flex-col gap-6">
          {/* App Header */}
          <div className="flex justify-between items-center pl-8">
            {/* App Info */}
            <div className="flex flex-col items-center justify-center">
              <div className="w-12 h-12 mb-2">
                <img
                  src={selectedApp?.image}
                  alt={selectedApp?.name}
                  className="object-cover"
                />
              </div>
              <p className="text-lg font-semibold text-center text-black">
                {selectedApp?.name}
              </p>
            </div>

            {/* Features List */}
            <div className="flex flex-col gap-2">
              {contentArray?.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    className="w-4 h-4 text-green-600"
                  >
                    <path d="M10.5 17.25L6 12.75L7.5 11.25L10.5 14.25L16.5 8.25L18 9.75L10.5 17.25Z" />
                  </svg>
                  <p className="text-sm text-gray-500">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <hr className="border-t border-gray-300" />

          {/* Steps Section */}
          <div className="flex flex-col gap-8">
            {/* Step 1 */}
            <div className="flex items-start gap-4">
              <div className="flex items-center justify-center w-7 h-7 border-[0.5px] border-gray-500 text-gray-500 rounded-full font-semibold">
                1
              </div>
              <div className="flex flex-col">
                <p className="text-sm text-gray-700">
                  Grant access in {selectedApp?.name} by installing the Glean app. Follow the instructions and document provided below.
                </p>
                <button
                  className="flex items-center mt-2 gap-2 text-sm text-blue-600 hover:underline"
                  onClick={handleAppDialog}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-4 h-4"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
                  </svg>
                  <span>Connect {selectedApp?.name} 🔗</span>
                </button>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-start gap-4">
              <div className="flex items-center justify-center w-7 h-7 border-[0.5px] border-gray-500 text-gray-500 rounded-full font-semibold">
                2
              </div>
              <div className="flex flex-col">
                <p className="text-sm text-gray-700">
                  Provide the following information about your {selectedApp?.name} instance:
                </p>
                <div className="flex flex-col gap-4 mt-2">
                  <div>
                    <label className="block text-sm text-gray-600">Your Atlassian Domain</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600">Default Group</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-start gap-4">
              <div className="flex items-center justify-center w-7 h-7 border-[.5px] border-gray-500 text-gray-500 rounded-full font-semibold">
                3
              </div>
              <div className="flex flex-col">
                <p className="text-sm text-gray-700">
                  Navigate to your newly created instance in Admin Apps Setup page and follow the instructions to set up a webhook and activity plugin.
                </p>
                <button
                  className="mt-4 px-6 py-2 text-sm text-white w-20 bg-[#DDDDDD] rounded-md"
                  onClick={handleAppDialog}
                >

                  <span className="text-black">Save</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Slider;
