import React, { useState, useEffect } from 'react';
import { ExternalLink, FileText, Download, Loader2 } from 'lucide-react';

// Create a separate PDF Viewer component
const PDFViewer = ({ pdfData, caseId, onClose }) => {
  const [pdfUrl, setPdfUrl] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (pdfData) {
      try {
        // Create a blob from the PDF data
        const blob = new Blob([pdfData], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        setPdfUrl(url);
        
        // Clean up the URL object when the component unmounts
        return () => {
          URL.revokeObjectURL(url);
        };
      } catch (err) {
        console.error('Error creating PDF URL:', err);
        setError('Failed to create PDF viewer. Please try again or contact support.');
      }
    }
  }, [pdfData]);

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg max-w-lg w-full">
          <h3 className="text-xl font-semibold text-red-600 mb-4">Error</h3>
          <p className="text-gray-700 mb-4">{error}</p>
          <div className="flex justify-between">
            <button 
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
            >
              Close
            </button>
            <a 
              href={`https://indiankanoon.org/doc/${caseId}/`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Open on Indian Kanoon
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (!pdfUrl) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg max-w-lg w-full text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600 mb-4" />
          <p className="text-gray-700">Loading PDF viewer...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex flex-col z-50">
      <div className="bg-gray-800 text-white p-4 flex justify-between items-center">
        <h3 className="text-lg font-semibold">Document Viewer - Case {caseId}</h3>
        <div className="flex items-center gap-4">
          <a 
            href={pdfUrl} 
            download={`case-${caseId}.pdf`}
            className="flex items-center text-sm text-blue-300 hover:text-blue-100"
          >
            <Download className="h-4 w-4 mr-1" />
            Download
          </a>
          <a 
            href={`https://indiankanoon.org/doc/${caseId}/`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center text-sm text-green-300 hover:text-green-100"
          >
            <ExternalLink className="h-4 w-4 mr-1" />
            Open on Indian Kanoon
          </a>
          <button 
            onClick={onClose}
            className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
          >
            Close
          </button>
        </div>
      </div>
      <div className="flex-1 bg-gray-100">
        <object 
          data={pdfUrl} 
          type="application/pdf" 
          width="100%" 
          height="100%"
          className="h-full w-full"
        >
          <div className="flex items-center justify-center h-full w-full bg-gray-100 p-8">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full text-center">
              <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-4">
                <h4 className="font-semibold mb-2">Unable to display PDF</h4>
                <p>Your browser doesn't support PDF viewing or the file might be corrupted.</p>
              </div>
              <div className="flex justify-between">
                <button 
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                >
                  Close
                </button>
                <a 
                  href={`https://indiankanoon.org/doc/${caseId}/`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Open on Indian Kanoon
                </a>
              </div>
            </div>
          </div>
        </object>
      </div>
    </div>
  );
};

export default PDFViewer;