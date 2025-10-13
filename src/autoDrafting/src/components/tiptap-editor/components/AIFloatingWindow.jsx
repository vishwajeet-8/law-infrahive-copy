import { useRef, useState, useEffect } from "react";
import {
  X,
  Sparkles,
  Send,
  Loader2,
  CheckCircle,
  AlertCircle,
  File as FileIcon,
  Search,
  Folder,
  ChevronDown,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { renderToString } from "react-dom/server";
import api from "@/utils/api";
import { useNavigate, useResolvedPath } from "react-router-dom";
import sanitizeHtml from "sanitize-html";
import { jwtDecode } from "jwt-decode";

export const AIFloatingWindow = ({ isOpen, onClose, onInsert }) => {
  const navigate = useNavigate();
  const pathname = useResolvedPath().pathname;
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState("");
  const [error, setError] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Data hub related state
  const [showDataHub, setShowDataHub] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [dataHubSelectedFiles, setDataHubSelectedFiles] = useState([]);
  const [availableDocuments, setAvailableDocuments] = useState([]);
  const [workspaces, setWorkspaces] = useState([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState(null);
  const [loadingWorkspaces, setLoadingWorkspaces] = useState(false);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [folderPath, setFolderPath] = useState([]);

  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  // Common prompts for quick selection
  const quickPrompts = [
    "Draft an NDA",
    "Create a project proposal",
    "Write a meeting agenda",
    "Generate a product requirements document",
    "Create a marketing brief",
    "Write a press release",
    "Draft a job description",
    "Create a project timeline",
    "Write a user story",
    "Generate a business plan outline",
  ];

  // Filter available documents by search term
  const filteredDataHubFiles = availableDocuments.filter(
    (file) =>
      !searchTerm ||
      (file.filename &&
        file.filename.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Fetch workspaces from API
  const fetchWorkspaces = async () => {
    setLoadingWorkspaces(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_NODE_SERVER}/get-workspaces`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch workspaces: ${response.statusText}`);
      }

      const workspacesData = await response.json();
      setWorkspaces(workspacesData);

      // Auto-select default workspace or first workspace
      const defaultWorkspace =
        workspacesData.find((ws) => ws.is_default) || workspacesData[0];
      if (defaultWorkspace) {
        setSelectedWorkspace(defaultWorkspace);
        // Fetch documents for the selected workspace
        fetchDocuments(defaultWorkspace.id);
      }
    } catch (error) {
      console.error("Error fetching workspaces:", error);
      setError("Failed to load workspaces");
    } finally {
      setLoadingWorkspaces(false);
    }
  };

  // Fetch documents for a specific workspace
  const fetchDocuments = async (workspaceId, folderId = null) => {
    if (!workspaceId) return;

    setLoadingDocuments(true);
    try {
      const token = localStorage.getItem("token");
      const params = new URLSearchParams();
      if (folderId) params.append("folderId", folderId);

      const url = `${
        import.meta.env.VITE_NODE_SERVER
      }/list-documents/${workspaceId}${
        params.toString() ? `?${params.toString()}` : ""
      }`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch documents: ${response.statusText}`);
      }

      const documents = await response.json();
      setAvailableDocuments(documents);
    } catch (error) {
      console.error("Error fetching documents:", error);
      setAvailableDocuments([]);
    } finally {
      setLoadingDocuments(false);
    }
  };

  // Handle folder navigation
  const handleFolderClick = (folder) => {
    setFolderPath((prev) => [
      ...prev,
      { id: folder.id, name: folder.filename },
    ]);
    setCurrentFolderId(folder.id);
    fetchDocuments(selectedWorkspace.id, folder.id);
  };

  // Handle back navigation
  const handleBackNavigation = () => {
    const newPath = [...folderPath];
    newPath.pop();
    setFolderPath(newPath);
    const newFolderId =
      newPath.length > 0 ? newPath[newPath.length - 1].id : null;
    setCurrentFolderId(newFolderId);
    fetchDocuments(selectedWorkspace.id, newFolderId);
  };

  // Load data when component opens
  useEffect(() => {
    if (isOpen) {
      fetchWorkspaces();
    }
  }, [isOpen]);

  // Auto-show data hub if documents are available and no files are uploaded
  useEffect(() => {
    if (
      isOpen &&
      availableDocuments.length > 0 &&
      uploadedFiles.length === 0 &&
      !showDataHub
    ) {
      setShowDataHub(true);
    }
  }, [isOpen, availableDocuments.length, uploadedFiles.length]);

  // Get file content from data hub
  const getDataHubFileContent = async (file) => {
    try {
      const token = localStorage.getItem("token");
      const response = await api.get(
        `/get-signed-url?key=${encodeURIComponent(file.s3_key_original)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const signedUrl = response.data.url;
      const fileResponse = await fetch(signedUrl);

      if (!fileResponse.ok) {
        throw new Error(`Failed to fetch document: ${fileResponse.statusText}`);
      }

      if (file.filename.endsWith(".docx")) {
        const arrayBuffer = await fileResponse.arrayBuffer();
        const mammoth = await import("mammoth");
        const result = await mammoth.convertToHtml({ arrayBuffer });

        // Extract plain text from HTML
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = result.value;
        return tempDiv.textContent || tempDiv.innerText || "";
      } else if (file.filename.endsWith(".txt")) {
        return await fileResponse.text();
      } else {
        return await fileResponse.text();
      }
    } catch (error) {
      console.error("Error loading file content:", error);
      throw error;
    }
  };

  // Handle data hub file selection
  const handleDataHubFileSelect = async (file) => {
    if (getAllFiles().length >= 2) return;

    try {
      // Instead of getting content, get the actual file from S3
      const token = localStorage.getItem("token");
      const response = await api.get(
        `/get-signed-url?key=${encodeURIComponent(file.s3_key_original)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const signedUrl = response.data.url;
      const fileResponse = await fetch(signedUrl);

      if (!fileResponse.ok) {
        throw new Error(`Failed to fetch document: ${fileResponse.statusText}`);
      }

      // Get the actual file as blob
      const fileBlob = await fileResponse.blob();

      // Create a proper File object from the blob
      const actualFile = new File([fileBlob], file.filename, {
        type: file.filename.endsWith(".docx")
          ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          : "text/plain",
      });

      // Create a file object that mimics uploaded files structure
      const fileWithContent = {
        id: `datahub-${file.s3_key_original}`,
        name: file.filename,
        file: actualFile, // Use the actual file, not text content
        isFromDataHub: true,
        mimeType: actualFile.type,
        originalFile: file,
      };

      setDataHubSelectedFiles((prev) => [...prev, fileWithContent]);
      setSelectedFiles((prev) => [...prev, fileWithContent.id]);
    } catch (error) {
      console.error("Error selecting file from data hub:", error);
      alert(`Failed to load file: ${error.message}`);
    }
  };

  const handleFileSelection = (id) => {
    setSelectedFiles((prev) => {
      if (prev.includes(id)) {
        return prev.filter((fileId) => fileId !== id);
      } else if (prev.length < 2) {
        return [...prev, id];
      }
      return prev;
    });
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files || []).slice(
      0,
      2 - getAllFiles().length
    );
    const newFiles = files.map((file, index) => ({
      id: `file-${Date.now()}-${index}`,
      name: file.name,
      file: file,
      mimeType: file.type,
    }));

    setUploadedFiles((prev) => {
      const updatedFiles = [...prev, ...newFiles].slice(0, 2);
      return updatedFiles;
    });
    setSelectedFiles((prev) => {
      const updatedSelection = [
        ...prev,
        ...newFiles.map((file) => file.id),
      ].slice(0, 2);
      return updatedSelection;
    });
  };

  const removeFile = (id) => {
    setUploadedFiles((prev) => prev.filter((file) => file.id !== id));
    setDataHubSelectedFiles((prev) => prev.filter((file) => file.id !== id));
    setSelectedFiles((prev) => prev.filter((fileId) => fileId !== id));
  };

  // Get all files (uploaded + data hub selected)
  const getAllFiles = () => [...uploadedFiles, ...dataHubSelectedFiles];

  // const handleGenerate = async () => {
  //   if (!prompt.trim()) return;

  //   setIsGenerating(true);
  //   setError("");
  //   setGeneratedContent("");

  //   try {
  //     // Step 1: Upload files to backend for conversion and Gemini URI
  //     const uploadedFilesToProcess = selectedFiles
  //       .map((id) => uploadedFiles.find((f) => f.id === id)?.file)
  //       .filter(Boolean);

  //     // Get data hub files (now they have actual file objects)
  //     const dataHubFilesToProcess = selectedFiles
  //       .map((id) => dataHubSelectedFiles.find((f) => f.id === id)?.file)
  //       .filter(Boolean);

  //     let geminiUris = [];

  //     // Combine all files (uploaded + data hub) and process them together
  //     const allFilesToProcess = [
  //       ...uploadedFilesToProcess,
  //       ...dataHubFilesToProcess,
  //     ];

  //     if (allFilesToProcess.length > 0) {
  //       const formData = new FormData();
  //       allFilesToProcess.forEach((file) => {
  //         formData.append("files", file);
  //       });

  //       const uploadResponse = await fetch(
  //         `${import.meta.env.VITE_NODE_SERVER}/gemini-uri`,
  //         {
  //           method: "POST",
  //           body: formData,
  //         }
  //       );

  //       if (!uploadResponse.ok) {
  //         const errorData = await uploadResponse.json();
  //         console.error("Upload error response:", errorData);
  //         throw new Error(errorData.message || "Failed to process files");
  //       }

  //       const uploadData = await uploadResponse.json();
  //       geminiUris = uploadData.files.map(
  //         (file) =>
  //           `https://generativelanguage.googleapis.com/v1beta/${file.uri}`
  //       );
  //     }

  //     // Step 2: Call /draft endpoint with JSON payload
  //     const draftPayload = {
  //       user_prompt: prompt,
  //       files: geminiUris,
  //     };

  //     const draftResponse = await fetch(
  //       `${import.meta.env.VITE_PY_LEGAL_API}/draft`,
  //       {
  //         method: "POST",
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //         body: JSON.stringify(draftPayload),
  //       }
  //     );

  //     if (!draftResponse.ok) {
  //       const errorData = await draftResponse.json();
  //       console.error("Draft error response:", errorData);
  //       throw new Error(
  //         errorData.error?.message || "Failed to generate content"
  //       );
  //     }

  //     const reader = draftResponse.body.getReader();
  //     console.log(reader);
  //     const decoder = new TextDecoder();
  //     let contentMap = new Map();
  //     let buffer = ""; // Buffer to handle incomplete JSON

  //     while (true) {
  //       const { done, value } = await reader.read();
  //       if (done) break;

  //       const chunk = decoder.decode(value, { stream: true });

  //       buffer += chunk;

  //       const lines = buffer.split("\n");

  //       buffer = lines.pop(); // Keep last (potentially incomplete) line in buffer

  //       for (const line of lines) {
  //         if (line.trim()) {
  //           try {
  //             const parsed = JSON.parse(line);
  //             if ("usage" in parsed) {
  //               await api.post(
  //                 "/extraction-credit",
  //                 {
  //                   userId: JSON.parse(localStorage.getItem("user")).id,
  //                   usage: parsed.usage.output_tokens,
  //                   type: "Drafting Editor",
  //                 },
  //                 {
  //                   headers: {
  //                     Authorization: `Bearer ${localStorage.getItem("token")}`,
  //                   },
  //                 }
  //               );
  //             }

  //             if (parsed.sequence !== undefined && parsed.content) {
  //               contentMap.set(parsed.sequence, parsed.content);
  //               const sortedContent = Array.from(contentMap.entries())
  //                 .sort(([seqA], [seqB]) => seqA - seqB)
  //                 .map(([, content]) => content)
  //                 .join("\n\n");

  //               setGeneratedContent(sortedContent);
  //             } else if (parsed.error) {
  //               throw new Error(
  //                 parsed.error.message || "Server error in stream"
  //               );
  //             }
  //           } catch (e) {
  //             console.error("Error parsing JSON chunk:", e, "Raw line:", line);
  //           }
  //         }
  //       }
  //     }

  //     // Try parsing any remaining buffered data
  //     if (buffer.trim()) {
  //       try {
  //         const parsed = JSON.parse(buffer);

  //         if (parsed.sequence !== undefined && parsed.content) {
  //           contentMap.set(parsed.sequence, parsed.content);
  //           const sortedContent = Array.from(contentMap.entries())
  //             .sort(([seqA], [seqB]) => seqA - seqB)
  //             .map(([, content]) => content)
  //             .join("\n\n");
  //           setGeneratedContent(sortedContent);
  //         }
  //       } catch (e) {
  //         console.error(
  //           "Error parsing final buffer:",
  //           e,
  //           "Raw buffer:",
  //           buffer
  //         );
  //       }
  //     }

  //     if (contentMap.size === 0) {
  //       throw new Error("No valid content received from the server");
  //     }
  //   } catch (err) {
  //     setError(err.message);
  //   } finally {
  //     setIsGenerating(false);
  //   }
  // };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    const token = localStorage.getItem("token");
    const { sub } = jwtDecode(token);

    setIsGenerating(true);
    setError("");
    setGeneratedContent("");

    try {
      // Get all files to process
      const uploadedFilesToProcess = selectedFiles
        .map((id) => uploadedFiles.find((f) => f.id === id)?.file)
        .filter(Boolean);

      const dataHubFilesToProcess = selectedFiles
        .map((id) => dataHubSelectedFiles.find((f) => f.id === id)?.file)
        .filter(Boolean);

      const allFilesToProcess = [
        ...uploadedFilesToProcess,
        ...dataHubFilesToProcess,
      ];

      let geminiUris = [];

      if (allFilesToProcess.length > 0) {
        const formData = new FormData();
        allFilesToProcess.forEach((file) => {
          formData.append("files", file);
        });

        // Update the upload part
        const uploadResponse = await fetch(
          `${import.meta.env.VITE_NODE_SERVER}/gemini-uri`,
          {
            method: "POST",
            body: formData,
            // Add progress tracking if needed
          }
        );

        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json();
          throw new Error(errorData.message || "Failed to process files");
        }

        const uploadData = await uploadResponse.json();
        geminiUris = uploadData.files.map(
          (file) =>
            `https://generativelanguage.googleapis.com/v1beta/${file.uri}`
        );
      }

      // Step 2: Call /draft endpoint with JSON payload
      const draftPayload = {
        user_prompt: prompt,
        files: geminiUris,
      };

      const draftResponse = await fetch(
        `${import.meta.env.VITE_PY_LEGAL_API}/draft`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(draftPayload),
        }
      );

      if (!draftResponse.ok) {
        const errorData = await draftResponse.json();
        console.error("Draft error response:", errorData);
        throw new Error(
          errorData.error?.message || "Failed to generate content"
        );
      }

      const reader = draftResponse.body.getReader();
      console.log(reader);
      const decoder = new TextDecoder();
      let contentMap = new Map();
      let buffer = ""; // Buffer to handle incomplete JSON

      const token = localStorage.getItem("token");
      const { sub } = jwtDecode(token);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });

        buffer += chunk;

        const lines = buffer.split("\n");

        buffer = lines.pop(); // Keep last (potentially incomplete) line in buffer

        for (const line of lines) {
          if (line.trim()) {
            try {
              const parsed = JSON.parse(line);
              if ("usage" in parsed) {
                await api.post(
                  "/extraction-credit",
                  {
                    userId: sub,
                    usage: parsed.usage.output_tokens,
                    type: "Drafting Editor",
                  },
                  {
                    headers: {
                      Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                  }
                );
              }

              if (parsed.sequence !== undefined && parsed.content) {
                contentMap.set(parsed.sequence, parsed.content);
                const sortedContent = Array.from(contentMap.entries())
                  .sort(([seqA], [seqB]) => seqA - seqB)
                  .map(([, content]) => content)
                  .join("\n\n");

                setGeneratedContent(sortedContent);
              } else if (parsed.error) {
                throw new Error(
                  parsed.error.message || "Server error in stream"
                );
              }
            } catch (e) {
              console.error("Error parsing JSON chunk:", e, "Raw line:", line);
            }
          }
        }
      }

      // Try parsing any remaining buffered data
      if (buffer.trim()) {
        try {
          const parsed = JSON.parse(buffer);

          if (parsed.sequence !== undefined && parsed.content) {
            contentMap.set(parsed.sequence, parsed.content);
            const sortedContent = Array.from(contentMap.entries())
              .sort(([seqA], [seqB]) => seqA - seqB)
              .map(([, content]) => content)
              .join("\n\n");
            setGeneratedContent(sortedContent);
          }
        } catch (e) {
          console.error(
            "Error parsing final buffer:",
            e,
            "Raw buffer:",
            buffer
          );
        }
      }

      if (contentMap.size === 0) {
        throw new Error("No valid content received from the server");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleInsert = async () => {
    if (generatedContent.trim()) {
      // Sanitize generatedContent to remove image-related content and invalid HTML
      const sanitizedContent = sanitizeHtml(generatedContent, {
        allowedTags: [
          "h1",
          "h2",
          "h3",
          "p",
          "ul",
          "ol",
          "li",
          "strong",
          "em",
          "table",
          "thead",
          "tbody",
          "tr",
          "th",
          "td",
          "code",
          "pre",
        ],
        allowedAttributes: {}, // Disallow all attributes for safety
        textFilter: (text) => {
          return text
            .replace(/Description automatically generated/g, "") // Remove specific text
            .replace(/data:image\/[a-zA-Z0-9+\/=]+/g, "") // Remove base64 data URLs
            .trim();
        },
      }).trim();

      // Log sanitized content for debugging
      console.log("Sanitized content for ReactMarkdown:", sanitizedContent);

      // Render the sanitized Markdown content to HTML using ReactMarkdown
      const markdownComponents = {
        h1: ({ node, ...props }) => (
          <h1
            className="text-lg font-bold text-gray-900 mt-4 mb-2"
            {...props}
          />
        ),
        h2: ({ node, ...props }) => (
          <h2
            className="text-base font-semibold text-gray-900 mt-3 mb-2"
            {...props}
          />
        ),
        h3: ({ node, ...props }) => (
          <h3
            className="text-sm font-semibold text-gray-900 mt-2 mb-1"
            {...props}
          />
        ),
        p: ({ node, ...props }) => <p className="mb-2" {...props} />,
        strong: ({ node, ...props }) => (
          <strong className="font-semibold" {...props} />
        ),
        em: ({ node, ...props }) => <em className="italic" {...props} />,
        ul: ({ node, ...props }) => (
          <ul className="list-disc list-inside mb-2 pl-2" {...props} />
        ),
        ol: ({ node, ...props }) => (
          <ol className="list-decimal list-inside mb-2 pl-2" {...props} />
        ),
        li: ({ node, ...props }) => <li className="mb-1" {...props} />,
        table: ({ node, ...props }) => (
          <div className="overflow-x-auto">
            <table
              className="min-w-full border border-gray-200 rounded-lg"
              {...props}
            />
          </div>
        ),
        thead: ({ node, ...props }) => (
          <thead className="bg-gray-100" {...props} />
        ),
        th: ({ node, ...props }) => (
          <th
            className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200"
            {...props}
          />
        ),
        td: ({ node, ...props }) => (
          <td
            className="px-4 py-2 text-xs text-gray-700 border-b border-gray-200"
            {...props}
          />
        ),
        code: ({ node, inline, ...props }) =>
          inline ? (
            <code
              className="bg-gray-100 text-gray-800 rounded px-1"
              {...props}
            />
          ) : (
            <pre
              className="bg-gray-100 p-2 rounded text-xs text-gray-800 overflow-x-auto"
              {...props}
            />
          ),
      };

      const renderedContent = renderToString(
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={markdownComponents}
        >
          {sanitizedContent}
        </ReactMarkdown>
      );

      const uploadedFilesToProcess = selectedFiles
        .map((id) => uploadedFiles.find((f) => f.id === id)?.file)
        .filter(Boolean);

      const dataHubFilesToProcess = selectedFiles
        .map((id) => dataHubSelectedFiles.find((f) => f.id === id)?.file)
        .filter(Boolean);

      const allFilesToProcess = [
        ...uploadedFilesToProcess,
        ...dataHubFilesToProcess,
      ];

      try {
        const autoDraft = await api.post(
          "/auto-draft",
          {
            content: renderedContent,
            file: allFilesToProcess
              .map((file) => file.name.replace(".docx", ""))
              .join(", "),
            folder: "drafting",
            variables: [],
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        navigate(`${pathname}?draftId=${autoDraft.data.autoDraft.id}`);
      } catch (error) {
        console.error("Error saving auto-draft:", error);
        setError("Failed to save draft. Please try again.");
        return;
      }

      onInsert(sanitizedContent); // Pass sanitized Markdown to handleAIInsert
      handleClose();
    }
  };

  const handleClose = () => {
    setPrompt("");
    setGeneratedContent("");
    setError("");
    setSelectedFiles([]);
    setUploadedFiles([]);
    setDataHubSelectedFiles([]);
    setShowDataHub(false);
    setSearchTerm("");
    setAvailableDocuments([]);
    setWorkspaces([]);
    setSelectedWorkspace(null);
    setCurrentFolderId(null);
    setFolderPath([]);
    setIsGenerating(false);
    onClose();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleGenerate();
    }
  };

  useEffect(() => {
    if (isOpen && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const allFiles = getAllFiles();
  // You can also add a progress bar in your UI
  {
    isGenerating && (
      <div className="w-full bg-gray-200 rounded-full h-1.5 mb-4">
        <div
          className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
          style={{ width: `${uploadProgress}%` }}
        ></div>
      </div>
    );
  }

  return (
    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[10000]">
      <div className="bg-white rounded-xl shadow-2xl border border-gray-300 w-[640px] max-h-[560px] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
              <Sparkles size={14} className="text-blue-600" />
            </div>
            <h2 className="text-base font-semibold text-gray-900">Ask AI</h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
            aria-label="Close AI Assistant"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content - Two Column Layout */}
        <div className="grid grid-cols-2 h-[450px]">
          {/* Left Column - Input */}
          <div className="p-4 space-y-4 overflow-y-auto">
            {/* File Upload */}
            {/* <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Upload Files (up to 2)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  multiple
                  disabled={allFiles.length >= 2}
                  className="hidden"
                  aria-label="Upload files"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={allFiles.length >= 2}
                  className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <FileIcon size={12} />
                  Choose Files
                </button>
                <span className="text-xs text-gray-500">
                  {allFiles.length}/2 file(s) selected
                </span>
              </div>
            </div> */}

            {/* Data Hub Section */}
            {(availableDocuments.length > 0 ||
              loadingDocuments ||
              loadingWorkspaces) && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-medium text-gray-700">
                    Select from Data Hub
                    {selectedWorkspace && (
                      <span className="text-blue-600 ml-1">
                        ({selectedWorkspace.name})
                      </span>
                    )}
                  </label>
                  <button
                    onClick={() => setShowDataHub(!showDataHub)}
                    className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
                    disabled={loadingWorkspaces || loadingDocuments}
                  >
                    {showDataHub ? "Hide" : "Show"}
                    <ChevronDown
                      size={12}
                      className={`transition-transform ${
                        showDataHub ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                </div>

                {showDataHub && (
                  <div className="border border-gray-200 rounded-lg p-2 bg-gray-50 max-h-32 overflow-y-auto">
                    {/* Loading States */}
                    {loadingWorkspaces || loadingDocuments ? (
                      <div className="flex items-center justify-center py-4">
                        <Loader2 className="w-3 h-3 animate-spin mr-1" />
                        <span className="text-xs text-gray-500">
                          {loadingWorkspaces
                            ? "Loading workspaces..."
                            : "Loading files..."}
                        </span>
                      </div>
                    ) : (
                      <>
                        {/* Search */}
                        <div className="relative mb-2">
                          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400" />
                          <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search files..."
                            className="w-full pl-6 pr-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </div>

                        {/* Breadcrumb Navigation */}
                        {folderPath.length > 0 && (
                          <div className="mb-2 text-xs text-gray-600">
                            <button
                              onClick={() => {
                                setFolderPath([]);
                                setCurrentFolderId(null);
                                fetchDocuments(selectedWorkspace.id, null);
                              }}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              Root
                            </button>
                            {folderPath.map((folder, index) => (
                              <span key={folder.id}>
                                <span className="mx-1">/</span>
                                <button
                                  onClick={() => {
                                    const newPath = folderPath.slice(
                                      0,
                                      index + 1
                                    );
                                    setFolderPath(newPath);
                                    setCurrentFolderId(folder.id);
                                    fetchDocuments(
                                      selectedWorkspace.id,
                                      folder.id
                                    );
                                  }}
                                  className="text-blue-600 hover:text-blue-800"
                                >
                                  {folder.name}
                                </button>
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Back Button */}
                        {folderPath.length > 0 && (
                          <button
                            onClick={handleBackNavigation}
                            className="w-full text-left p-1 hover:bg-gray-100 text-xs border-b border-gray-200 flex items-center mb-2"
                          >
                            <span className="mr-2">←</span> Back
                          </button>
                        )}

                        {/* File List */}
                        {filteredDataHubFiles.length === 0 ? (
                          <div className="text-center py-4 text-gray-500 text-xs">
                            {searchTerm
                              ? `No files found matching "${searchTerm}"`
                              : "No files available"}
                          </div>
                        ) : (
                          <div className="space-y-1">
                            {filteredDataHubFiles.map((file, index) => (
                              <div
                                key={file.id || file.s3_key_original || index}
                                className="flex items-center justify-between p-1 hover:bg-gray-100 rounded cursor-pointer text-xs"
                                onClick={() => {
                                  if (file.type === "folder") {
                                    handleFolderClick(file);
                                  } else if (allFiles.length < 2) {
                                    handleDataHubFileSelect(file);
                                  }
                                }}
                              >
                                <div className="flex items-center space-x-1 flex-1 truncate">
                                  {file.type === "folder" ? (
                                    <Folder className="w-3 h-3 text-yellow-600 flex-shrink-0" />
                                  ) : (
                                    <FileIcon className="w-3 h-3 text-gray-500 flex-shrink-0" />
                                  )}
                                  <span
                                    className="truncate"
                                    title={file.filename}
                                  >
                                    {file.filename || "Unnamed file"}
                                  </span>
                                </div>
                                {file.type === "folder" ? (
                                  <span className="text-xs text-gray-400">
                                    📁
                                  </span>
                                ) : allFiles.length >= 2 ? (
                                  <span className="text-xs text-gray-400">
                                    Full
                                  </span>
                                ) : null}
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* File Selection */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Select Files (up to 2)
              </label>
              <div className="bg-gray-50 p-2 rounded-lg max-h-20 overflow-y-auto">
                {allFiles.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center gap-2 py-1 text-sm text-gray-700"
                  >
                    <input
                      type="checkbox"
                      value={file.id}
                      checked={selectedFiles.includes(file.id)}
                      onChange={() => handleFileSelection(file.id)}
                      disabled={
                        !selectedFiles.includes(file.id) &&
                        selectedFiles.length >= 2
                      }
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      aria-checked={selectedFiles.includes(file.id)}
                      aria-label={`Select ${file.name}`}
                    />
                    <span className="truncate flex-1 text-xs">
                      {file.name}
                      {file.isFromDataHub && (
                        <span className="text-blue-600 ml-1">(Hub)</span>
                      )}
                    </span>
                    <button
                      onClick={() => removeFile(file.id)}
                      className="text-gray-400 hover:text-gray-600"
                      aria-label={`Remove ${file.name}`}
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
                {allFiles.length === 0 && (
                  <p className="text-xs text-gray-500">No files uploaded</p>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">Select up to 2 files</p>
            </div>

            {/* Prompt Input */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                What would you like me to write?
              </label>
              <textarea
                ref={textareaRef}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="E.g., Draft an NDA for a software company..."
                className="w-full px-3 py-2 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none h-16 text-xs"
                aria-label="Enter your prompt"
              />
              <p className="text-xs text-gray-500 mt-1">
                Press Cmd/Ctrl + Enter to generate
              </p>
            </div>

            {/* Quick Prompts */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Quick Prompts
              </label>
              <div className="bg-gray-100 p-2 rounded-lg space-y-1 max-h-20 overflow-y-auto">
                {quickPrompts.slice(0, 4).map((quickPrompt, index) => (
                  <button
                    key={index}
                    onClick={() => setPrompt(quickPrompt)}
                    className="w-full text-left px-2 py-1 text-xs text-gray-700 hover:bg-gray-200 rounded transition-colors"
                  >
                    {quickPrompt}
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <div className="mt-4">
              <button
                onClick={handleGenerate}
                disabled={!prompt.trim() || isGenerating}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs font-medium"
                aria-label="Generate content"
              >
                {isGenerating ? (
                  <>
                    <Loader2 size={12} className="animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Send size={12} />
                    Generate
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Column - Generated Content */}
          <div className="p-4 flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-medium text-gray-700">
                Generated Content
              </label>
              {generatedContent && !isGenerating && (
                <div className="flex items-center gap-1 text-green-600">
                  <CheckCircle size={10} />
                  <span className="text-xs">Ready</span>
                </div>
              )}
            </div>

            {/* Content Display */}
            <div className="flex-1 overflow-y-auto h-[calc(100%-2rem)] border border-gray-300 bg-gray-50 rounded-lg p-3">
              {error ? (
                <div className="flex items-start gap-2 text-red-600">
                  <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium">Error</p>
                    <p className="text-xs text-red-500">{error}</p>
                  </div>
                </div>
              ) : generatedContent ? (
                <div className="text-xs text-gray-800 leading-relaxed overflow-y-auto h-[360px]">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      h1: ({ node, ...props }) => (
                        <h1
                          className="text-lg font-bold text-gray-900 mt-4 mb-2"
                          {...props}
                        />
                      ),
                      h2: ({ node, ...props }) => (
                        <h2
                          className="text-base font-semibold text-gray-900 mt-3 mb-2"
                          {...props}
                        />
                      ),
                      h3: ({ node, ...props }) => (
                        <h3
                          className="text-sm font-semibold text-gray-900 mt-2 mb-1"
                          {...props}
                        />
                      ),
                      p: ({ node, ...props }) => (
                        <p className="mb-2" {...props} />
                      ),
                      strong: ({ node, ...props }) => (
                        <strong className="font-semibold" {...props} />
                      ),
                      em: ({ node, ...props }) => (
                        <em className="italic" {...props} />
                      ),
                      ul: ({ node, ...props }) => (
                        <ul
                          className="list-disc list-inside mb-2 pl-2"
                          {...props}
                        />
                      ),
                      ol: ({ node, ...props }) => (
                        <ol
                          className="list-decimal list-inside mb-2 pl-2"
                          {...props}
                        />
                      ),
                      li: ({ node, ...props }) => (
                        <li className="mb-1" {...props} />
                      ),
                      table: ({ node, ...props }) => (
                        <div className="overflow-x-auto">
                          <table
                            className="min-w-full border border-gray-200 rounded-lg"
                            {...props}
                          />
                        </div>
                      ),
                      thead: ({ node, ...props }) => (
                        <thead className="bg-gray-100" {...props} />
                      ),
                      th: ({ node, ...props }) => (
                        <th
                          className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200"
                          {...props}
                        />
                      ),
                      td: ({ node, ...props }) => (
                        <td
                          className="px-4 py-2 text-xs text-gray-700 border-b border-gray-200"
                          {...props}
                        />
                      ),
                      code: ({ node, inline, ...props }) =>
                        inline ? (
                          <code
                            className="bg-gray-100 text-gray-800 rounded px-1"
                            {...props}
                          />
                        ) : (
                          <pre
                            className="bg-gray-100 p-2 rounded text-xs text-gray-800 overflow-x-auto"
                            {...props}
                          />
                        ),
                    }}
                  >
                    {generatedContent}
                  </ReactMarkdown>
                  {isGenerating && (
                    <span className="inline-block w-1 h-3 bg-blue-600 animate-pulse ml-1"></span>
                  )}
                </div>
              ) : (
                <div className="text-center text-gray-500 flex flex-col items-center justify-center h-full">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mb-2">
                    <Sparkles size={16} className="text-gray-400" />
                  </div>
                  <p className="text-xs">Generated content will appear here</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50">
          <div className="text-xs text-gray-500 ">AI-generated content</div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleClose}
              className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
              aria-label="Cancel"
            >
              Cancel
            </button>
            <button
              onClick={handleInsert}
              disabled={!generatedContent.trim() || isGenerating}
              className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Insert content"
            >
              Insert Content
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
