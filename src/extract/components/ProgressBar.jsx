// components/ProgressBar.jsx
import React from 'react';

const ProgressBar = ({ currentStep }) => {
  return (
    <div className="mb-12 relative">
      <div className="flex items-center">
        <div className="relative">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'
          }`}>
            {currentStep > 1 ? '✓' : '1'}
          </div>
          <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-sm">
            Upload Files
          </span>
        </div>

        <div className="flex-1 h-1 mx-4 bg-gray-200">
          <div
            className={`h-full ${currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}
            style={{ width: currentStep >= 2 ? '100%' : '0%' }}
          />
        </div>

        <div className="relative">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'
          }`}>
            {currentStep > 2 ? '✓' : '2'}
          </div>
          <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-sm">
            Add Extraction Tags
          </span>
        </div>

        <div className="flex-1 h-1 mx-4 bg-gray-200">
          <div
            className={`h-full ${currentStep >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`}
            style={{ width: currentStep >= 3 ? '100%' : '0%' }}
          />
        </div>

        <div className="relative">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            currentStep >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200'
          }`}>
            3
          </div>
          <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-sm">
            View Data
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;