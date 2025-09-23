import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Info,
  ArrowUpDown,
  ChevronDown,
  ChevronUp,
  Loader2,
} from "lucide-react";
import api from "@/utils/api";

const Extractions = () => {
  const { workspaceId } = useParams();
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [expandedAgents, setExpandedAgents] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchExtractedData = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/extracted-data-workspace/${workspaceId}`);
        setDocuments(res.data);
      } catch (err) {
        console.error("Failed to load extracted documents", err);
      } finally {
        setLoading(false);
      }
    };

    if (workspaceId) fetchExtractedData();
  }, [workspaceId]);

  const groupedDocuments = documents.reduce((acc, doc) => {
    const agent = doc.agent || "Unassigned";
    if (!acc[agent]) {
      acc[agent] = [];
    }
    acc[agent].push(doc);
    return acc;
  }, {});

  const toggleAgent = (agent) => {
    setExpandedAgents((prev) => ({
      ...prev,
      [agent]: !prev[agent],
    }));
  };

  const filteredAgents = Object.keys(groupedDocuments).filter(
    (agent) =>
      agent.toLowerCase().includes(searchQuery.toLowerCase()) ||
      groupedDocuments[agent].some((doc) =>
        doc.file_name.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  const handleClick = () => {
    navigate(`/workspaces/${workspaceId}/ExtractChat`);
  };

  const handleViewAgent = (agent) => {
    navigate(
      `/workspaces/${workspaceId}/extracted/${encodeURIComponent(agent)}`,
      {
        state: {
          agentDocuments: groupedDocuments[agent].map((doc) => ({
            id: doc.id,
            file_name: doc.file_name,
            extracted_data: doc.extracted_data || {},
            created_at: doc.created_at,
            tags: doc.tags,
            user_instructions: doc.user_instructions,
            usage: doc.usage,
          })),
        },
      }
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
        <div className="flex items-center mb-4 sm:mb-0">
          <h1 className="text-xl font-bold text-gray-800">Extraction Studio</h1>
          <Info size={18} className="ml-2 text-gray-400" />
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handleClick}
            className="flex items-center bg-blue-900 hover:bg-blue-800 text-white px-4 py-2 rounded transition-colors font-medium"
          >
            <span>New Extraction</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
        <div className="w-full sm:w-1/2 mb-4 sm:mb-0">
          <input
            type="text"
            placeholder="Search Agent or Document"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-100"
          />
        </div>
      </div>

      {filteredAgents.length > 0 ? (
        filteredAgents.map((agent) => (
          <div key={agent} className="mb-4">
            <div
              className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg py-3 px-4 cursor-pointer hover:bg-gray-100"
              onClick={() => toggleAgent(agent)}
            >
              <div className="w-full flex items-center justify-between space-x-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    onChange={(e) => e.stopPropagation()}
                  />
                  <span className="text-sm font-semibold text-gray-800">
                    {agent} ({groupedDocuments[agent].length})
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewAgent(agent);
                    }}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    View
                  </button>
                  {expandedAgents[agent] ? (
                    <ChevronUp size={18} className="text-gray-500" />
                  ) : (
                    <ChevronDown size={18} className="text-gray-500" />
                  )}
                </div>
              </div>
            </div>

            {expandedAgents[agent] && (
              <div className="border border-gray-200 rounded-lg mt-2 overflow-hidden bg-white shadow-sm">
                <div className="grid grid-cols-12 gap-4 border-b border-gray-200 py-3 px-4 bg-gray-50 text-gray-600 text-sm font-medium">
                  <div className="col-span-5 flex items-center">
                    <span className="flex items-center ml-10">
                      File Name
                      <ArrowUpDown size={14} className="ml-1 text-gray-400" />
                    </span>
                  </div>
                  <div className="col-span-5 flex items-center">
                    <span className="flex items-center">
                      Run Time
                      <ArrowUpDown size={14} className="ml-1 text-gray-400" />
                    </span>
                  </div>
                  <div className="col-span-2 text-right">Actions</div>
                </div>

                {groupedDocuments[agent].map((doc) => (
                  <div
                    key={doc.id}
                    className="grid grid-cols-12 gap-4 border-b border-gray-200 py-3 px-4 hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
                    onClick={() =>
                      navigate(`/workspaces/${workspaceId}/extracted/${doc.id}`)
                    }
                  >
                    <div className="col-span-5 flex items-center">
                      <input
                        type="checkbox"
                        className="mr-3 h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      />
                      <span className="truncate font-medium text-gray-800">
                        {doc.file_name}
                      </span>
                    </div>
                    <div className="col-span-5 flex items-center text-sm text-gray-600">
                      <span className="truncate">
                        {new Date(doc.created_at).toLocaleString()}
                      </span>
                    </div>
                    <div className="col-span-2 flex justify-end">
                      <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                        View
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))
      ) : (
        <div className="text-center py-8 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
          <p className="text-gray-500 text-sm">No extractions found</p>
          <p className="text-gray-400 text-xs mt-1">
            Start a new extraction to see results here
          </p>
        </div>
      )}
    </div>
  );
};

export default Extractions;
