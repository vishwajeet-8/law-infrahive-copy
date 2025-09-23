import React, { useState } from "react";
import {
  ChevronRight,
  MessageCircle,
  Loader2,
  X,
  FileText,
  Download,
  Database,
  Eye,
  Search,
  ChevronLeft,
} from "lucide-react";
import FloatingChatBot from "./FloatingChatBot";

const DataView = ({
  extractedData = [],
  onBack,
  onDocumentSelect,
  uploadedFiles = [],
  onChatOpen,
  onChatClose,
}) => {
  const [selectedDoc, setSelectedDoc] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showChat, setShowChat] = useState(false);

  // Format the data to match expected structure
  const formattedData = extractedData.map((item) => ({
    fileName: item.fileName,
    extractedData: item.extractedData || {},
    usage: item.usage,
  }));

  // Get all unique keys from extracted data
  const allKeys = [
    ...new Set(
      formattedData.flatMap((data) =>
        data.extractedData ? Object.keys(data.extractedData) : []
      )
    ),
  ];

  const formatValue = (value, key) => {
    if (!value) return "-";

    // Handle address fields differently
    const addressFields = [
      "address",
      "location",
      "premises",
      "property",
      "site",
    ];
    const isAddressField = addressFields.some((field) =>
      key.toLowerCase().includes(field)
    );

    if (Array.isArray(value)) {
      return value.join(", ");
    }

    if (typeof value === "object") {
      return JSON.stringify(value);
    }

    return isAddressField ? (
      <div
        className="max-h-[4.5em] overflow-hidden text-ellipsis"
        style={{
          WebkitLineClamp: 3,
          display: "-webkit-box",
          WebkitBoxOrient: "vertical",
        }}
      >
        {String(value)}
      </div>
    ) : (
      String(value)
    );
  };

  const cleanFileName = (fileName) => {
    return fileName ? fileName.replace(/\.[^/.]+$/, "") : "";
  };

  const handleChatClose = () => {
    setShowChat(false);
    onChatClose?.();
  };

  const exportData = () => {
    try {
      if (!formattedData || formattedData.length === 0) {
        console.warn("No data to export");
        return;
      }

      const headers = ["Document Name", ...allKeys];
      const rows = [
        headers.join(","),
        ...formattedData.map(({ fileName, extractedData }) => {
          const rowData = [
            `"${cleanFileName(fileName)}"`,
            ...allKeys.map((key) => {
              const value = extractedData?.[key];
              return `"${value ? String(value).replace(/"/g, '""') : ""}"`;
            }),
          ];
          return rowData.join(",");
        }),
      ];

      const csvContent = "data:text/csv;charset=utf-8," + rows.join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "extracted_data.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error exporting data:", error);
    }
  };

  if (!Array.isArray(formattedData) || formattedData.length === 0) {
    return (
      <div className="space-y-8">
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                No Data Available
              </h3>
              <p className="text-gray-700 text-sm">
                Upload documents to start extracting data.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-start">
          <button
            onClick={onBack}
            className="inline-flex items-center px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 text-sm font-medium"
          >
            <ChevronRight className="w-4 h-4 mr-2 rotate-180" />
            Back to Configuration
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Modern Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
            <Database className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">
              Extracted Data
            </h2>
            <p className="text-gray-500">
              Review and interact with your processed documents
            </p>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4" />
                    <span>Document Name</span>
                  </div>
                </th>
                {allKeys.map((key) => (
                  <th
                    key={key}
                    className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                  >
                    {key
                      .replace(/_/g, " ")
                      .replace(/([A-Z])/g, " $1")
                      .toLowerCase()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-50">
              {formattedData.map(({ fileName, extractedData }, index) => (
                <tr
                  key={index}
                  className="hover:bg-gray-50 transition-colors duration-150"
                >
                  <td className="px-6 py-4 whitespace-normal break-words text-sm font-medium text-gray-900">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FileText className="w-4 h-4 text-blue-500" />
                      </div>
                      <div className="max-w-[200px] break-words">
                        {cleanFileName(fileName)}
                      </div>
                    </div>
                  </td>

                  {allKeys.map((key) => (
                    <td
                      key={`${index}-${key}`}
                      className="px-6 py-4 text-sm text-gray-700"
                    >
                      <div className="max-w-xs">
                        {formatValue(extractedData?.[key], key)}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center pt-4">
        <button
          onClick={onBack}
          className="inline-flex items-center px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 text-sm font-medium"
        >
          <ChevronRight className="w-4 h-4 mr-2 rotate-180" />
          Back to Configuration
        </button>

        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-500">
            {formattedData.length} document
            {formattedData.length !== 1 ? "s" : ""} processed
          </div>
          <button
            onClick={exportData}
            className="inline-flex items-center px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 text-sm font-medium"
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </button>
        </div>
      </div>

      <FloatingChatBot
        documentName={selectedDoc}
        onClose={handleChatClose}
        isOpen={showChat}
      />
    </div>
  );
};

export default DataView;
