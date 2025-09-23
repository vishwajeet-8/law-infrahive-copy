// DocumentPicker.jsx
import React from "react";
import { FileText } from "lucide-react";

const DocumentPicker = ({ files, onSelect, onClose }) => {
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 shadow-lg max-w-md w-full max-h-[80vh] overflow-auto">
        <h3 className="text-lg font-semibold mb-4">
          Choose Files from Documents
        </h3>
        {files.length === 0 ? (
          <p className="text-gray-500">No saved documents found.</p>
        ) : (
          <div className="space-y-2">
            {files.map((file, index) => (
              <div
                key={file.id || index}
                className="flex items-center justify-between border p-2 rounded hover:bg-gray-100 cursor-pointer"
                onClick={() => onSelect(file)}
              >
                <div className="flex items-center space-x-3">
                  <FileText className="w-6 h-6 text-red-500" />
                  <p className="truncate max-w-xs">{file.name}</p>
                </div>
              </div>
            ))}
          </div>
        )}
        <button
          onClick={onClose}
          className="mt-4 px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default DocumentPicker;
