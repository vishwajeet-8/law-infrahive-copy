import api from "@/utils/api";
import React from "react";
import toast from "react-hot-toast";

const AutoDraft = () => {
  const [drafting, setDrafting] = React.useState([]);
  const [template, setTemplate] = React.useState([]);
  const [invalidated, setInvalidated] = React.useState(false);
  const [expandedFolders, setExpandedFolders] = React.useState(new Set());

  const folders = [
    { name: "Drafting", files: drafting },
    { name: "Template", files: template },
  ];

  const toggleFolder = (folderName) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderName)) {
      newExpanded.delete(folderName);
    } else {
      newExpanded.add(folderName);
    }
    setExpandedFolders(newExpanded);
  };

  const removeDraft = async (id) => {
    try {
      await api.delete(`/auto-drafts/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setInvalidated((prev) => !prev);
      toast.success("Draft removed successfully");
    } catch (error) {
      toast.error("Failed to remove draft");
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };
  React.useEffect(() => {
    const f = async () => {
      const [draftingRes, templateRes] = await Promise.all([
        api.get(`/auto-drafts?folder=drafting`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }),
        api.get(`/auto-drafts?folder=template`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }),
      ]);
      setDrafting(draftingRes.data.autoDrafts);
      setTemplate(templateRes.data.autoDrafts);
    };
    f();
  }, [invalidated]);

  return (
    <div className="p-1 select-none">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 rounded-t-lg">
          <h2 className="text-xl font-bold text-gray-800">Auto Draft</h2>
          <p className="text-sm text-gray-600 mt-1">
            Auto drafts saved documents for template and drafting.
          </p>
        </div>
        {folders.map(({ name: folderName, files }) => {
          const isExpanded = expandedFolders.has(folderName);

          return (
            <div
              key={folderName}
              className="border-b border-gray-100 last:border-b-0"
            >
              {/* Folder Header */}
              <div
                className="flex items-center justify-between p-4 hover:bg-gray-50 cursor-pointer transition-colors duration-150"
                onClick={() => toggleFolder(folderName)}
              >
                <div className="flex items-center space-x-3">
                  {/* Expand/Collapse Arrow */}
                  <div
                    className={`transform transition-transform duration-200 ${
                      isExpanded ? "rotate-90" : "rotate-0"
                    }`}
                  >
                    <svg
                      className="w-4 h-4 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>

                  {/* Folder Icon */}
                  <div className="text-2xl">{isExpanded ? "📂" : "📁"}</div>

                  {/* Folder Name */}
                  <span className="text-lg font-semibold text-gray-800">
                    {folderName}
                  </span>

                  {/* File Count */}
                  <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    {files.length} {files.length === 1 ? "file" : "files"}
                  </span>
                </div>
              </div>

              {/* Files List */}
              {isExpanded && (
                <div className="bg-gray-50">
                  {files.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-3 ml-8 border-l-2 border-gray-200 hover:bg-white cursor-pointer transition-colors duration-150"
                    >
                      <div className="flex items-center space-x-3 flex-1">
                        {/* File Icon */}
                        <span className="text-xl">📄</span>

                        {/* File Details */}
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-900 truncate">
                              {file.file}
                            </span>
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${
                                file.user_role === "Owner"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-green-100 text-green-800"
                              }`}
                            >
                              {file.user_role}
                            </span>
                          </div>
                          <div className="flex items-center space-x-4 mt-1">
                            <span className="text-xs text-gray-500">
                              {file.user_email.split("@")[0]}
                            </span>
                            <span className="text-xs text-gray-400">
                              {formatDate(file.created_at)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action Menu */}
                      <div className="flex items-center space-x-2">
                        <button
                          className="p-1 hover:bg-red-100 rounded transition-colors duration-150 group"
                          onClick={() => removeDraft(file.id)}
                        >
                          <svg
                            className="w-4 h-4 text-gray-400 group-hover:text-red-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AutoDraft;
