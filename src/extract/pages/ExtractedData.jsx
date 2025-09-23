import api from "@/utils/api";
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  ChevronLeft,
  Download,
  FileText,
  Clock,
  Info,
  AlertCircle,
  Loader2,
  Copy,
  Check,
  Tag,
  MessageSquare,
} from "lucide-react";

const ExtractedData = () => {
  const { workspaceId, id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [activeTab, setActiveTab] = useState("data");

  // Check for agentDocuments in navigation state
  const agentDocuments = location.state?.agentDocuments;

  useEffect(() => {
    const fetchExtractedData = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/extracted-data-id/${id}`);
        setData(res.data);
      } catch (err) {
        console.error("Error fetching extracted data:", err);
        setError(err.response?.data?.message || "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    if (id && !agentDocuments) {
      fetchExtractedData();
    } else {
      setLoading(false); // No fetch needed for agentDocuments
    }
  }, [id, agentDocuments]);

  const handleCopy = (content) => {
    navigator.clipboard.writeText(JSON.stringify(content, null, 2));
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const downloadAsCsv = () => {
    if (agentDocuments) {
      // Multi-document CSV download
      const allKeys = [
        ...new Set(
          agentDocuments.flatMap((doc) =>
            doc.extracted_data ? Object.keys(doc.extracted_data) : []
          )
        ),
      ];
      const headers = ["Document Name", ...allKeys];
      const rows = [
        headers.join(","),
        ...agentDocuments.map((doc) => {
          const rowData = [
            `"${doc.file_name.replace(/\.[^/.]+$/, "").replace(/"/g, '""')}"`,
            ...allKeys.map((key) => {
              const value = doc.extracted_data?.[key];
              return `"${value ? String(value).replace(/"/g, '""') : ""}"`;
            }),
          ];
          return rowData.join(",");
        }),
      ];
      const csvContent = rows.join("\n");
      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `agent_${decodeURIComponent(id)}_extracted_data.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } else if (data && data.extracted_data) {
      // Single document CSV download
      const headers = Object.keys(data.extracted_data);
      const values = Object.values(data.extracted_data);
      let csvContent = headers.join(",") + "\n";
      csvContent +=
        values
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(",") + "\n";
      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `extraction_${data.file_name.replace(
        /\.[^/.]+$/,
        ""
      )}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  const formatValue = (value, key) => {
    if (!value) return "-";

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-800">
            <AlertCircle className="w-5 h-5" />
            <h3 className="font-medium">Error Loading Data</h3>
          </div>
          <p className="mt-2 text-sm text-red-700">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-3 px-3 py-1 text-sm bg-red-100 hover:bg-red-200 text-red-800 rounded"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data && !agentDocuments) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-blue-800">
            <Info className="w-5 h-5" />
            <h3 className="font-medium">No Data Found</h3>
          </div>
          <p className="mt-2 text-sm text-blue-700">
            The requested extraction data could not be found.
          </p>
        </div>
      </div>
    );
  }

  if (agentDocuments) {
    // Multi-document view in table format
    const allKeys = [
      ...new Set(
        agentDocuments.flatMap((doc) =>
          doc.extracted_data ? Object.keys(doc.extracted_data) : []
        )
      ),
    ];

    return (
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-sm text-gray-600 hover:text-gray-900"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to extractions
          </button>
        </div>

        <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="border-b border-gray-200 px-6 py-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-xl font-semibold flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-500" />
                  Documents for Agent: {decodeURIComponent(id)}
                </h1>
                <div className="flex items-center text-sm text-gray-500 mt-1">
                  <Clock className="w-4 h-4 mr-1" />
                  {agentDocuments.length} document(s)
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={downloadAsCsv}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded border border-gray-300"
                >
                  <Download className="w-4 h-4" />
                  Download CSV
                </button>
              </div>
            </div>
          </div>

          {/* Data Table */}
          <div className="p-6">
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
                    {agentDocuments.map((doc, index) => (
                      <tr
                        key={index}
                        className="hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
                        onClick={() =>
                          navigate(
                            `/workspaces/${workspaceId}/extracted/${doc.id}`
                          )
                        }
                      >
                        <td className="px-6 py-4 whitespace-normal break-words text-sm font-medium text-gray-900">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                              <FileText className="w-4 h-4 text-blue-500" />
                            </div>
                            <div className="max-w-[200px] break-words">
                              {doc.file_name.replace(/\.[^/.]+$/, "")}
                            </div>
                          </div>
                        </td>
                        {allKeys.map((key) => (
                          <td
                            key={`${index}-${key}`}
                            className="px-6 py-4 text-sm text-gray-700"
                          >
                            <div className="max-w-xs">
                              {formatValue(doc.extracted_data?.[key], key)}
                            </div>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Single document view (original functionality)
  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-sm text-gray-600 hover:text-gray-900"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to extractions
        </button>
      </div>

      <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-500" />
                {data.file_name}
              </h1>
              <div className="flex items-center text-sm text-gray-500 mt-1">
                <Clock className="w-4 h-4 mr-1" />
                Extracted on {new Date(data.created_at).toLocaleString()}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={downloadAsCsv}
                className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded border border-gray-300"
              >
                <Download className="w-4 h-4" />
                Download CSV
              </button>
              <button
                onClick={() => handleCopy(data)}
                className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded border border-gray-300"
              >
                {copySuccess ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
                {copySuccess ? "Copied!" : "Copy All"}
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab("data")}
              className={`px-4 py-3 text-sm font-medium border-b-2 ${
                activeTab === "data"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Extracted Data
            </button>
            <button
              onClick={() => setActiveTab("metadata")}
              className={`px-4 py-3 text-sm font-medium border-b-2 ${
                activeTab === "metadata"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Metadata
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === "data" ? (
            <div>
              <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Extracted Fields
                </h3>
                {data.extracted_data ? (
                  <div className="space-y-4">
                    {Object.entries(data.extracted_data).map(([key, value]) => (
                      <div key={key} className="border-b border-gray-100 pb-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-gray-800">{key}</p>
                            <p className="text-sm text-gray-600 mt-1">
                              {value || (
                                <span className="text-gray-400">Empty</span>
                              )}
                            </p>
                          </div>
                          <button
                            onClick={() => handleCopy({ [key]: value })}
                            className="text-gray-400 hover:text-gray-600"
                            title="Copy value"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No data extracted</p>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Extraction Details
                </h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Workspace
                      </p>
                      <p className="mt-1">{workspaceId}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Extraction ID
                      </p>
                      <p className="mt-1">{id}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Created At
                      </p>
                      <p className="mt-1">
                        {new Date(data.created_at).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        File Name
                      </p>
                      <p className="mt-1">{data.file_name}</p>
                    </div>
                  </div>
                </div>
              </div>

              {data.tags && data.tags.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    <Tag className="w-5 h-5 inline mr-1" />
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {data.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {data.user_instructions && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    <MessageSquare className="w-5 h-5 inline mr-1" />
                    User Instructions
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="whitespace-pre-wrap">
                      {data.user_instructions}
                    </p>
                  </div>
                </div>
              )}

              {data.usage && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Usage Statistics
                  </h3>
                  <pre className="bg-gray-50 p-4 rounded-lg text-sm overflow-x-auto">
                    {JSON.stringify(data.usage, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExtractedData;
