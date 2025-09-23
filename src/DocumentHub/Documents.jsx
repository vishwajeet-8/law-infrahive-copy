import React, { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import api from "@/utils/api";
import { Trash2, Loader2 } from "lucide-react";
import AutoDraft from "./AutoDraft";

const Icons = {
  Folder: () => <span style={{ fontSize: "24px" }}>📁</span>,
  FileText: () => <span style={{ fontSize: "24px" }}>📄</span>,
  Home: () => <span style={{ fontSize: "16px" }}>🏠</span>,
  ChevronRight: () => <span style={{ fontSize: "16px" }}>▶</span>,
  Search: () => <span style={{ fontSize: "16px" }}>🔍</span>,
  Upload: () => <span style={{ fontSize: "48px" }}>⬆️</span>,
  X: () => <span style={{ fontSize: "20px" }}>✕</span>,
  Plus: () => <span style={{ fontSize: "16px" }}>➕</span>,
};

const Documents = ({ onSelectDocument, onClose }) => {
  const { workspaceId } = useParams();
  const fileInputRef = useRef(null);

  const [files, setFiles] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showUploadArea, setShowUploadArea] = useState(false);
  const [isFetchingFiles, setIsFetchingFiles] = useState(false);
  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [folderPath, setFolderPath] = useState([]);

  const fetchItems = async (folderId = null) => {
    try {
      setIsFetchingFiles(true);
      const response = await api.get(`/list-documents/${workspaceId}`, {
        params: { folderId },
      });
      setFiles(response.data);
    } catch (err) {
      console.error("Error fetching items:", err);
    } finally {
      setIsFetchingFiles(false);
    }
  };

  useEffect(() => {
    fetchItems(currentFolderId);
  }, [workspaceId, currentFolderId]);

  const handleFileUpload = async (selectedFiles) => {
    if (!selectedFiles || selectedFiles.length === 0) return;

    const formData = new FormData();
    for (const file of selectedFiles) {
      formData.append("files", file);
    }
    formData.append("workspaceId", workspaceId);
    if (currentFolderId) {
      formData.append("folderId", currentFolderId);
    }

    setIsUploading(true);
    try {
      const token = localStorage.getItem("token");
      await api.post("/upload-documents", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      await fetchItems(currentFolderId);
      setShowUploadArea(false);
    } catch (err) {
      console.error("Upload error:", err);
      alert("Upload failed. Try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleCreateFolder = async () => {
    const token = localStorage.getItem("token");
    if (!newFolderName.trim()) {
      alert("Folder name cannot be empty.");
      return;
    }

    try {
      await api.post(
        "/create-folder",
        {
          workspaceId,
          folderName: newFolderName,
          parentFolderId: currentFolderId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setNewFolderName("");
      setShowCreateFolderModal(false);
      await fetchItems(currentFolderId);
    } catch (err) {
      console.error("Create folder error:", err);
      alert("Failed to create folder.");
    }
  };

  const handleDelete = async (item) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete this ${
        item.type === "folder" ? "folder" : "file"
      }? This action cannot be undone and will delete all contents if it's a folder.`
    );
    if (!confirmed) return;

    try {
      await api.delete(
        `/${item.type === "folder" ? "delete-item" : "delete-item"}/${item.id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      await fetchItems(currentFolderId);
    } catch (err) {
      console.error("Delete error:", err);
      alert(`Failed to delete ${item.type}.`);
    }
  };

  const handleFileInputChange = (e) => {
    handleFileUpload(e.target.files);
    e.target.value = "";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileUpload(e.dataTransfer.files);
  };

  const handleFolderClick = (folder) => {
    setCurrentFolderId(folder.id);
    setFolderPath([...folderPath, { id: folder.id, name: folder.filename }]);
  };

  const navigateToFolder = (index) => {
    const newPath = folderPath.slice(0, index + 1);
    setFolderPath(newPath);
    setCurrentFolderId(index === -1 ? null : newPath[newPath.length - 1].id);
  };

  const getFileIcon = (item) =>
    item.type === "folder" ? <Icons.Folder /> : <Icons.FileText />;

  const filteredItems = files.filter((item) =>
    (item.filename || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  return (
    <div>
      <div className="m-5 mx-auto bg-white rounded-lg shadow-lg overflow-hidden flex flex-col">
        <div className="bg-gray-50 border-b border-gray-200 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-1 text-sm flex-wrap">
              <button
                onClick={() => navigateToFolder(-1)}
                className="flex items-center"
              >
                <Icons.Home style={{ cursor: "pointer" }} />
              </button>
              {folderPath.map((folder, index) => (
                <div key={folder.id} className="flex items-center">
                  <Icons.ChevronRight />
                  <button
                    onClick={() => navigateToFolder(index)}
                    className="text-gray-700 hover:underline"
                  >
                    {folder.name}
                  </button>
                </div>
              ))}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowCreateFolderModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                <Icons.Plus />
                <span>New Folder</span>
              </button>
              <button
                onClick={() => setShowUploadArea(!showUploadArea)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                <Icons.Plus />
                <span>Upload Files</span>
              </button>
            </div>
          </div>
          <div className="mt-4 relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <Icons.Search />
            </div>
            <input
              type="text"
              placeholder="Search files and folders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {showUploadArea && (
            <div className="mt-4 relative">
              <button
                onClick={() => setShowUploadArea(false)}
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              >
                <Icons.X />
              </button>
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-lg p-8 text-center ${
                  isDragOver
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-300 bg-gray-50"
                } ${isUploading ? "opacity-50 pointer-events-none" : ""}`}
              >
                <Icons.Upload />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {isUploading ? "Uploading..." : "Upload Files"}
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  Drag and drop or click to browse
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  {isUploading ? "Uploading..." : "Choose Files"}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileInputChange}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif"
                />
              </div>
            </div>
          )}
          {showCreateFolderModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Create New Folder</h3>
                  <button
                    onClick={() => setShowCreateFolderModal(false)}
                    className="text-gray-500"
                  >
                    <Icons.X />
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Folder name"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg mb-4"
                />
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => setShowCreateFolderModal(false)}
                    className="px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateFolder}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                  >
                    Create
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {isFetchingFiles ? (
          <div className="flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : (
          <div className="p-4 flex-1 overflow-auto">
            {filteredItems.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <span style={{ fontSize: "64px" }}>📁</span>
                <p>No files or folders found</p>
                {!showUploadArea && (
                  <button
                    onClick={() => setShowUploadArea(true)}
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    Upload Your First File
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      if (item.type === "folder") {
                        handleFolderClick(item);
                      } else if (item.type === "file" && onSelectDocument) {
                        onSelectDocument({
                          id: item.id,
                          filename: item.filename,
                          s3_key_original: item.s3_key_original,
                          parent_folder_id: item.parent_folder_id,
                        });
                        if (onClose) onClose();
                      }
                    }}
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    {getFileIcon(item)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {item.filename}
                        </p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(item);
                          }}
                          className="text-red-500 hover:text-red-700"
                          title="Delete"
                        >
                          <Trash2 />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="bg-gray-50 border-t border-gray-200 px-4 py-3">
          <p className="text-sm text-gray-500">
            {filteredItems.length} item{filteredItems.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>
      <AutoDraft />
    </div>
  );
};

export default Documents;
