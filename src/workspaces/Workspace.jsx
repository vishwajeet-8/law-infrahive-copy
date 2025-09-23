
import React, { useEffect, useState } from "react";
import {
  Trash2,
  Plus,
  Folder,
  Star,
  Search,
  RefreshCw,
  Edit3,
  ExternalLink,
  ChevronRight,
  Briefcase,
  X,
  Sparkles,
  Zap,
} from "lucide-react";
import api from "@/utils/api";

// Enhanced Workspace Modal Component with modern design
const CreateWorkspaceModal = ({ isOpen, onClose, onWorkspaceCreated }) => {
  const [workspaceName, setWorkspaceName] = useState("");
  const [workspaceDescription, setWorkspaceDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setWorkspaceName("");
      setWorkspaceDescription("");
      setError("");
    }
  }, [isOpen]);

  // Mock API function for creating workspace
  const mockCreateWorkspace = async (data) => {
    await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate API delay
    const newWorkspace = {
      id: Date.now(), // Simple ID generation for demo
      name: data.name,
      description: data.description,
      is_default: false,
      created_at: new Date().toISOString().split("T")[0],
    };
    return { data: newWorkspace };
  };

  const handleCreateWorkspace = async () => {
    if (!workspaceName.trim()) {
      setError("Workspace name is required");
      return;
    }

    const token = localStorage.getItem("token");
    setIsLoading(true);
    setError("");

    try {
      const response = await api.post(
        "workspaces",
        {
          name: workspaceName.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Workspace created:", response.data);
      setWorkspaceName("");
      onClose();
      window.location.reload();
    } catch (err) {
      console.error("Create workspace error:", err);
      const msg =
        err.response?.data?.message || "Failed to create workspace. Try again.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
    setWorkspaceName("");
    setWorkspaceDescription("");
    setError("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !isLoading && e.target.tagName !== "TEXTAREA") {
      handleCreateWorkspace();
    }
    if (e.key === "Escape") {
      handleClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay with blur effect */}
        <div
          className="fixed inset-0 transition-all duration-300 bg-black/60 backdrop-blur-sm"
          onClick={handleClose}
        ></div>

        {/* Modal panel with modern glassmorphism effect */}
        <div className="inline-block w-full max-w-md p-0 my-8 overflow-hidden text-left align-middle transition-all transform bg-white/95 backdrop-blur-xl shadow-2xl rounded-3xl border border-white/20">
          {/* Header with gradient */}
          <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 p-6 rounded-t-3xl relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>

            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                  <Briefcase className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-1">
                    Create Workspace
                  </h3>
                  <p className="text-blue-100/80 text-sm">
                    Set up your new collaborative space
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="text-white/80 hover:text-white hover:bg-white/20 rounded-xl p-2 transition-all duration-200 backdrop-blur-sm"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Error Message with modern styling */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200/50 rounded-2xl flex items-center space-x-3 animate-in slide-in-from-top duration-300">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <p className="text-red-700 text-sm font-medium">{error}</p>
              </div>
            )}

            {/* Workspace Name Input */}
            <div className="space-y-3">
              <label
                htmlFor="workspaceName"
                className="block text-sm font-semibold text-gray-800"
              >
                Workspace Name
              </label>
              <div className="relative group">
                <input
                  id="workspaceName"
                  type="text"
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="e.g., Legal Team 2025, Corporate Law Hub..."
                  className="w-full px-4 py-4 border-2 border-gray-200/60 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 text-gray-900 placeholder-gray-400 bg-gray-50/50 group-hover:border-gray-300/80 backdrop-blur-sm"
                  autoFocus
                  maxLength={50}
                  disabled={isLoading}
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <span className="text-xs text-gray-500 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-gray-200/50 font-medium">
                    {workspaceName.length}/50
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions with modern styling */}
          <div className="flex justify-end space-x-3 p-6 bg-gray-50/50 backdrop-blur-sm rounded-b-3xl border-t border-gray-200/30">
            <button
              onClick={handleClose}
              disabled={isLoading}
              className="px-6 py-3 text-sm font-medium text-gray-700 bg-white/80 backdrop-blur-sm border border-gray-300/50 rounded-xl hover:bg-gray-50 hover:border-gray-400/60 focus:outline-none focus:ring-4 focus:ring-gray-500/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateWorkspace}
              disabled={!workspaceName.trim() || isLoading}
              className="px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 border border-transparent rounded-xl hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Create Workspace
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Workspace = () => {
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Mock API function since we can't use localStorage
  const mockApi = {
    get: async (url, options) => {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return {
        data: [
          {
            id: 1,
            name: "Personal Projects",
            is_default: true,
            description: "My personal workspace for side projects",
            created_at: "2024-01-15",
          },
          {
            id: 2,
            name: "Work Dashboard",
            is_default: false,
            description: "Team collaboration workspace",
            created_at: "2024-02-10",
          },
          {
            id: 3,
            name: "Client Work",
            is_default: false,
            description: "Dedicated space for client projects",
            created_at: "2024-03-05",
          },
          {
            id: 4,
            name: "Research & Development",
            is_default: false,
            description: "Experimental features and research",
            created_at: "2024-03-20",
          },
        ],
      };
    },
    delete: async (url, options) => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return { success: true };
    },
  };

  const fetchWorkspaces = async () => {
    const token = localStorage.getItem("token");
    try {
      setLoading(true);
      setError(null);
      const response = await api.get("/get-workspaces", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setWorkspaces(response.data);
    } catch (err) {
      console.error("Error fetching workspaces:", err);
      setError("Failed to load workspaces. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (workspaceId) => {
    const workspace = workspaces.find((ws) => ws.id === workspaceId);
    const confirm = window.confirm(
      `Are you sure you want to delete "${workspace?.name}"? This action cannot be undone.`
    );
    if (!confirm) return;
    const token = localStorage.getItem("token");
    try {
      await api.delete(`/workspace/${workspaceId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Filter out the deleted workspace from state
      setWorkspaces((prev) => prev.filter((ws) => ws.id !== workspaceId));
    } catch (err) {
      console.error("Failed to delete workspace:", err);
      alert("Could not delete workspace. Please try again.");
    }
  };

  const handleCreateNew = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleWorkspaceCreated = (newWorkspace) => {
    // Add the new workspace to the beginning of the list
    setWorkspaces((prev) => [newWorkspace, ...prev]);
  };

  const handleWorkspaceClick = (workspace) => {
    // Navigate to workspace or open workspace details
    alert(`Opening workspace: ${workspace.name}`);
  };

  const handleEditWorkspace = (workspace) => {
    // Open edit modal or navigate to edit page
    alert(`Edit workspace: ${workspace.name}`);
  };

  const filteredWorkspaces = workspaces.filter(
    (ws) =>
      ws.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ws.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen text-gray-500">
        <RefreshCw className="w-8 h-8 animate-spin mb-4" />
        <p className="text-lg">Loading workspaces...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto mt-10 p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={fetchWorkspaces}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-4xl mx-auto mt-10 p-6">
        <div className="bg-white rounded-lg shadow-md border border-gray-200">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold text-gray-800 flex items-center">
                <Folder className="w-7 h-7 mr-3 text-blue-600" />
                Your Workspaces
              </h2>
              <button
                onClick={handleCreateNew}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Workspace
              </button>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search workspaces..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {filteredWorkspaces.length === 0 ? (
              <div className="text-center py-12">
                {searchTerm ? (
                  <div>
                    <Search className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500">
                      No workspaces found matching "{searchTerm}"
                    </p>
                  </div>
                ) : (
                  <div>
                    <Folder className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500 mb-4">No workspaces found.</p>
                    <button
                      onClick={handleCreateNew}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Create your first workspace
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredWorkspaces.map((ws) => (
                  <div
                    key={ws.id}
                    className="border rounded-lg hover:shadow-md transition-all bg-white hover:border-blue-200 cursor-pointer group"
                  >
                    {/* Main workspace content - clickable */}
                    <div
                      className="flex justify-between items-center p-4"
                      onClick={() => handleWorkspaceClick(ws)}
                    >
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <h3 className="font-medium text-gray-900 mr-2 group-hover:text-blue-600 transition-colors">
                            {ws.name}
                          </h3>
                          {ws.is_default && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              <Star className="w-3 h-3 mr-1" />
                              Default
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="px-4 pb-4 pt-2 border-t border-gray-100 bg-gray-50">
                      <div className="flex justify-between items-center">
                        {!ws.is_default && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(ws.id);
                            }}
                            className="flex items-center px-3 py-1 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                            title="Delete workspace"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {filteredWorkspaces.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-between items-center text-sm text-gray-600">
                <span>
                  {filteredWorkspaces.length} workspace
                  {filteredWorkspaces.length !== 1 ? "s" : ""}
                  {searchTerm && ` (filtered from ${workspaces.length} total)`}
                </span>
                <button
                  onClick={fetchWorkspaces}
                  className="flex items-center text-blue-600 hover:text-blue-700"
                >
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Refresh
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Workspace Modal */}
      <CreateWorkspaceModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onWorkspaceCreated={handleWorkspaceCreated}
      />
    </>
  );
};

export default Workspace;
