import React, { useState, useEffect, useRef } from "react";
import {
  Heading1,
  Heading2,
  Heading3,
  FileText,
  List,
  ListOrdered,
  Quote,
  Code,
  Table as TableIcon,
  Minus,
  Image as ImageIcon,
  Slash,
  Upload,
  LinkIcon,
  X,
  Maximize2,
  Sparkles,
  Send,
  Loader2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { AIFloatingWindow } from "./AIFloatingWindow";
import sanitizeHtml from "sanitize-html";

// Enhanced ImageModal Component
const ImageModal = ({ isOpen, onClose, onInsert }) => {
  const [activeTab, setActiveTab] = useState("upload");
  const [imageUrl, setImageUrl] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  // Size management state
  const [imageSize, setImageSize] = useState({
    width: "",
    height: "",
    maintainAspectRatio: true,
    unit: "px",
  });
  const [sizePreset, setSizePreset] = useState("original");

  const fileInputRef = useRef(null);

  // Size presets
  const sizePresets = [
    { label: "Original", value: "original", width: "", height: "" },
    { label: "Small (200px)", value: "small", width: "200", height: "" },
    { label: "Medium (400px)", value: "medium", width: "400", height: "" },
    { label: "Large (600px)", value: "large", width: "600", height: "" },
    { label: "Extra Large (800px)", value: "xlarge", width: "800", height: "" },
    {
      label: "Full Width (100%)",
      value: "fullwidth",
      width: "100",
      height: "",
      unit: "%",
    },
    {
      label: "Half Width (50%)",
      value: "halfwidth",
      width: "50",
      height: "",
      unit: "%",
    },
    { label: "Custom", value: "custom", width: "", height: "" },
  ];

  const units = [
    { label: "Pixels (px)", value: "px" },
    { label: "Percent (%)", value: "%" },
    { label: "Em (em)", value: "em" },
    { label: "Rem (rem)", value: "rem" },
  ];

  const handleFileSelect = (file) => {
    if (file && file.type.startsWith("image/")) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);

      // Get original dimensions
      const img = new Image();
      img.onload = () => {
        setImageSize((prev) => ({
          ...prev,
          originalWidth: img.width,
          originalHeight: img.height,
        }));
      };
      img.src = url;
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleFileInput = (e) => {
    const file = e.target.files[0];
    handleFileSelect(file);
  };

  const handlePresetChange = (preset) => {
    setSizePreset(preset.value);
    if (preset.value !== "custom") {
      setImageSize((prev) => ({
        ...prev,
        width: preset.width,
        height: preset.height,
        unit: preset.unit || "px",
      }));
    }
  };

  const handleSizeChange = (dimension, value) => {
    const newSize = { ...imageSize, [dimension]: value };

    if (
      imageSize.maintainAspectRatio &&
      imageSize.originalWidth &&
      imageSize.originalHeight
    ) {
      const aspectRatio = imageSize.originalWidth / imageSize.originalHeight;

      if (dimension === "width" && value) {
        newSize.height = Math.round(parseFloat(value) / aspectRatio).toString();
      } else if (dimension === "height" && value) {
        newSize.width = Math.round(parseFloat(value) * aspectRatio).toString();
      }
    }

    setImageSize(newSize);
    if (sizePreset !== "custom") {
      setSizePreset("custom");
    }
  };

  const getImageStyle = () => {
    const style = {};
    if (imageSize.width) {
      style.width = `${imageSize.width}${imageSize.unit}`;
    }
    if (imageSize.height) {
      style.height = `${imageSize.height}${imageSize.unit}`;
    }
    return style;
  };

  const handleInsert = (content) => {
    // Log input content for debugging
    console.log("Input Markdown for handleAIInsert:", content);

    // Split content into paragraphs and filter out empty ones
    const paragraphs = content
      .split("\n\n")
      .map((p) => p.trim())
      .filter(Boolean); // Remove empty paragraphs

    const formattedContent = paragraphs
      .map((paragraph) => {
        // Handle headings
        if (paragraph.startsWith("#")) {
          const level = paragraph.match(/^#+/)[0].length;
          const text = paragraph.replace(/^#+\s*/, "").trim();
          if (!text) return ""; // Skip empty headings
          return `<h${Math.min(level, 6)}>${text}</h${Math.min(level, 6)}>`;
        }
        // Handle bullet lists
        else if (paragraph.startsWith("-") || paragraph.startsWith("*")) {
          const items = paragraph
            .split("\n")
            .map((line) => line.replace(/^[-*]\s*/, "").trim())
            .filter((item) => item); // Remove empty items
          if (items.length === 0) return ""; // Skip empty lists
          return `<ul>${items.map((item) => `<li>${item}</li>`).join("")}</ul>`;
        }
        // Handle numbered lists
        else if (paragraph.match(/^\d+\./)) {
          const items = paragraph
            .split("\n")
            .map((line) => line.replace(/^\d+\.\s*/, "").trim())
            .filter((item) => item); // Remove empty items
          if (items.length === 0) return ""; // Skip empty lists
          return `<ol>${items.map((item) => `<li>${item}</li>`).join("")}</ol>`;
        }
        // Handle paragraphs
        else if (paragraph.trim()) {
          return `<p>${paragraph}</p>`;
        }
        return ""; // Skip any other empty or invalid content
      })
      .filter(Boolean) // Remove empty strings
      .join("");

    // Sanitize the generated HTML
    const cleanContent = sanitizeHtml(formattedContent, {
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
      ],
      allowedAttributes: {}, // Disallow all attributes for safety
      textFilter: (text) => {
        return text
          .replace(/Description automatically generated/g, "") // Remove specific text
          .replace(/data:image\/[a-zA-Z0-9+\/=]+/g, "") // Remove base64 data URLs
          .trim();
      },
    }).trim();

    // Log sanitized HTML for debugging
    console.log("Sanitized HTML for insertion:", cleanContent);

    // If no valid content, log a warning and exit
    if (!cleanContent) {
      console.warn("No valid content to insert after sanitization");
      alert("No valid content to insert. Please try again.");
      return;
    }

    // Insert content into the editor
    try {
      editor.chain().focus().insertContent(cleanContent).run();
    } catch (error) {
      console.error("Error inserting content into editor:", error);
      alert("Failed to insert content. Please try again.");
      return;
    }

    setShowAIWindow(false);
    onSelect();
  };

  const handleClose = () => {
    setImageUrl("");
    setSelectedFile(null);
    setPreviewUrl("");
    setActiveTab("upload");
    setImageSize({
      width: "",
      height: "",
      maintainAspectRatio: true,
      unit: "px",
    });
    setSizePreset("original");
    onClose();
  };

  const canInsert =
    (activeTab === "url" && imageUrl.trim()) ||
    (activeTab === "upload" && previewUrl);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10000]">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Insert Image</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab("upload")}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === "upload"
                ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Upload size={16} className="inline mr-2" />
            Upload File
          </button>
          <button
            onClick={() => setActiveTab("url")}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === "url"
                ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <LinkIcon size={16} className="inline mr-2" />
            From URL
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Upload/URL */}
            <div className="space-y-4">
              {activeTab === "upload" ? (
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                    dragActive
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileInput}
                    className="hidden"
                  />

                  {previewUrl ? (
                    <div className="space-y-3">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        style={getImageStyle()}
                        className="max-w-full max-h-40 mx-auto rounded border"
                      />
                      <p className="text-sm text-gray-600">
                        {selectedFile?.name}
                      </p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFile(null);
                          setPreviewUrl("");
                        }}
                        className="text-sm text-red-600 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <ImageIcon size={48} className="mx-auto text-gray-400" />
                      <div>
                        <p className="text-lg font-medium text-gray-700">
                          Drop an image here
                        </p>
                        <p className="text-sm text-gray-500">
                          or click to browse files
                        </p>
                      </div>
                      <p className="text-xs text-gray-400">
                        Supports JPG, PNG, GIF, WebP
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Image URL
                    </label>
                    <input
                      type="url"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="https://example.com/image.jpg"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {imageUrl.trim() && (
                    <div className="border rounded-lg p-3 bg-gray-50">
                      <p className="text-sm text-gray-600 mb-2">Preview:</p>
                      <img
                        src={imageUrl}
                        alt="Preview"
                        style={getImageStyle()}
                        className="max-w-full max-h-40 rounded border"
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.nextSibling.style.display = "block";
                        }}
                      />
                      <div className="text-red-500 text-sm hidden">
                        Failed to load image
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right Column - Size Controls */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Maximize2 size={16} className="inline mr-1" />
                  Size Options
                </label>

                {/* Size Presets */}
                <div className="space-y-3">
                  <select
                    value={sizePreset}
                    onChange={(e) => {
                      const preset = sizePresets.find(
                        (p) => p.value === e.target.value
                      );
                      if (preset) handlePresetChange(preset);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {sizePresets.map((preset) => (
                      <option key={preset.value} value={preset.value}>
                        {preset.label}
                      </option>
                    ))}
                  </select>

                  {/* Custom Size Controls */}
                  {sizePreset === "custom" && (
                    <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <input
                          type="checkbox"
                          id="aspectRatio"
                          checked={imageSize.maintainAspectRatio}
                          onChange={(e) =>
                            setImageSize((prev) => ({
                              ...prev,
                              maintainAspectRatio: e.target.checked,
                            }))
                          }
                          className="rounded"
                        />
                        <label
                          htmlFor="aspectRatio"
                          className="text-sm text-gray-700"
                        >
                          Maintain aspect ratio
                        </label>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Width
                          </label>
                          <input
                            type="number"
                            value={imageSize.width}
                            onChange={(e) =>
                              handleSizeChange("width", e.target.value)
                            }
                            placeholder="Auto"
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Height
                          </label>
                          <input
                            type="number"
                            value={imageSize.height}
                            onChange={(e) =>
                              handleSizeChange("height", e.target.value)
                            }
                            placeholder="Auto"
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Unit
                        </label>
                        <select
                          value={imageSize.unit}
                          onChange={(e) =>
                            setImageSize((prev) => ({
                              ...prev,
                              unit: e.target.value,
                            }))
                          }
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          {units.map((unit) => (
                            <option key={unit.value} value={unit.value}>
                              {unit.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Quick Size Buttons */}
                  <div className="flex flex-wrap gap-2">
                    {[
                      { label: "25%", width: "25", unit: "%" },
                      { label: "50%", width: "50", unit: "%" },
                      { label: "75%", width: "75", unit: "%" },
                      { label: "100%", width: "100", unit: "%" },
                    ].map((size) => (
                      <button
                        key={size.label}
                        onClick={() => {
                          setImageSize((prev) => ({
                            ...prev,
                            width: size.width,
                            height: "",
                            unit: size.unit,
                          }));
                          setSizePreset("custom");
                        }}
                        className="px-3 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                      >
                        {size.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Original Dimensions Display */}
                {imageSize.originalWidth && imageSize.originalHeight && (
                  <div className="mt-3 p-2 bg-blue-50 rounded text-sm text-blue-700">
                    <strong>Original:</strong> {imageSize.originalWidth} ×{" "}
                    {imageSize.originalHeight}px
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleInsert}
            disabled={!canInsert}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Insert Image
          </button>
        </div>
      </div>
    </div>
  );
};

const SlashCommandMenu = ({
  editor,
  range,
  query,
  onSelect,
  uploadedTemplates = [],
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showAIWindow, setShowAIWindow] = useState(false);
  const menuRef = useRef(null);

  const handleImageInsert = (imageAttrs) => {
    if (typeof imageAttrs === "string") {
      editor.chain().focus().setImage({ src: imageAttrs }).run();
    } else {
      editor.chain().focus().setImage(imageAttrs).run();
    }
    setShowImageModal(false);
    onSelect();
  };

  const handleAIInsert = (content) => {
    const formattedContent = content
      .split("\n\n")
      .map((paragraph) => {
        if (paragraph.startsWith("#")) {
          const level = paragraph.match(/^#+/)[0].length;
          const text = paragraph.replace(/^#+\s*/, "");
          return `<h${Math.min(level, 6)}>${text}</h${Math.min(level, 6)}>`;
        } else if (paragraph.startsWith("-") || paragraph.startsWith("*")) {
          const items = paragraph
            .split("\n")
            .map((line) => line.replace(/^[-*]\s*/, "").trim())
            .filter(Boolean);
          return `<ul>${items.map((item) => `<li>${item}</li>`).join("")}</ul>`;
        } else if (paragraph.match(/^\d+\./)) {
          const items = paragraph
            .split("\n")
            .map((line) => line.replace(/^\d+\.\s*/, "").trim())
            .filter(Boolean);
          return `<ol>${items.map((item) => `<li>${item}</li>`).join("")}</ol>`;
        } else {
          return `<p>${paragraph}</p>`;
        }
      })
      .join("");

    editor.chain().focus().insertContent(formattedContent).run();
    setShowAIWindow(false);
    onSelect();
  };

  const commands = [
    {
      title: "Ask AI",
      description: "Generate content with AI assistance",
      icon: <Sparkles size={16} />,
      command: () => {
        editor.chain().focus().deleteRange(range).run();
        setShowAIWindow(true);
      },
      keywords: [
        "ai",
        "generate",
        "write",
        "create",
        "draft",
        "assistant",
        "gpt",
      ],
    },
    {
      title: "Heading 1",
      description: "Large heading",
      icon: <Heading1 size={16} />,
      command: () =>
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .setHeading({ level: 1 })
          .run(),
      keywords: ["h1", "heading", "title", "large"],
    },
    {
      title: "Heading 2",
      description: "Medium heading",
      icon: <Heading2 size={16} />,
      command: () =>
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .setHeading({ level: 2 })
          .run(),
      keywords: ["h2", "heading", "subtitle", "medium"],
    },
    {
      title: "Heading 3",
      description: "Small heading",
      icon: <Heading3 size={16} />,
      command: () =>
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .setHeading({ level: 3 })
          .run(),
      keywords: ["h3", "heading", "small"],
    },
    {
      title: "Paragraph",
      description: "Normal text",
      icon: <FileText size={16} />,
      command: () =>
        editor.chain().focus().deleteRange(range).setParagraph().run(),
      keywords: ["p", "paragraph", "text"],
    },
    {
      title: "Bullet List",
      description: "Unordered list",
      icon: <List size={16} />,
      command: () =>
        editor.chain().focus().deleteRange(range).toggleBulletList().run(),
      keywords: ["ul", "list", "bullet", "unordered"],
    },
    {
      title: "Numbered List",
      description: "Ordered list",
      icon: <ListOrdered size={16} />,
      command: () =>
        editor.chain().focus().deleteRange(range).toggleOrderedList().run(),
      keywords: ["ol", "list", "numbered", "ordered"],
    },
    {
      title: "Quote",
      description: "Block quote",
      icon: <Quote size={16} />,
      command: () =>
        editor.chain().focus().deleteRange(range).toggleBlockquote().run(),
      keywords: ["quote", "blockquote", "citation"],
    },
    {
      title: "Code Block",
      description: "Code snippet",
      icon: <Code size={16} />,
      command: () =>
        editor.chain().focus().deleteRange(range).toggleCodeBlock().run(),
      keywords: ["code", "codeblock", "snippet", "pre"],
    },
    {
      title: "Table",
      description: "Insert table with new line",
      icon: <TableIcon size={16} />,
      command: () => {
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
          .run();

        setTimeout(() => {
          try {
            const { selection, doc } = editor.state;
            const { $from } = selection;

            let tableNode = null;
            let tablePos = null;

            for (let depth = $from.depth; depth >= 0; depth--) {
              const node = $from.node(depth);
              if (node.type.name === "table") {
                tableNode = node;
                tablePos = $from.start(depth);
                break;
              }
            }

            if (tableNode && tablePos !== null) {
              const afterTablePos = tablePos + tableNode.nodeSize;
              const nextNode = doc.nodeAt(afterTablePos);

              if (!nextNode || nextNode.type.name !== "paragraph") {
                editor
                  .chain()
                  .focus()
                  .setTextSelection(afterTablePos)
                  .insertContent("<p><br></p>")
                  .run();
              }
            }
          } catch (error) {
            console.error("Error adding paragraph after table:", error);
          }
        }, 100);
      },
      keywords: ["table", "grid", "data"],
    },
    {
      title: "Horizontal Line",
      description: "Divider",
      icon: <Minus size={16} />,
      command: () =>
        editor.chain().focus().deleteRange(range).setHorizontalRule().run(),
      keywords: ["hr", "line", "divider", "separator"],
    },
    {
      title: "Image",
      description: "Insert image with size controls",
      icon: <ImageIcon size={16} />,
      command: () => {
        editor.chain().focus().deleteRange(range).run();
        setShowImageModal(true);
      },
      keywords: ["image", "img", "picture", "photo"],
    },
    {
      title: "Text",
      description: "Insert plain slash as text",
      icon: <Slash size={16} />,
      command: () =>
        editor.chain().focus().deleteRange(range).insertContent("/").run(),
      keywords: ["text", "slash", "plain"],
    },
  ];

  const filteredCommands = commands.filter(
    (command) =>
      command.title.toLowerCase().includes(query.toLowerCase()) ||
      command.description.toLowerCase().includes(query.toLowerCase()) ||
      command.keywords.some((keyword) =>
        keyword.toLowerCase().includes(query.toLowerCase())
      )
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "ArrowUp") {
        event.preventDefault();
        setSelectedIndex((prevIndex) =>
          prevIndex > 0 ? prevIndex - 1 : filteredCommands.length - 1
        );
      } else if (event.key === "ArrowDown") {
        event.preventDefault();
        setSelectedIndex((prevIndex) =>
          prevIndex < filteredCommands.length - 1 ? prevIndex + 1 : 0
        );
      } else if (event.key === "Enter") {
        event.preventDefault();
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].command();
          if (
            !["Image", "Ask AI"].includes(filteredCommands[selectedIndex].title)
          ) {
            onSelect();
          }
        }
      } else if (event.key === "Escape") {
        event.preventDefault();
        onSelect();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [selectedIndex, filteredCommands, onSelect]);

  if (filteredCommands.length === 0) {
    return (
      <div
        ref={menuRef}
        className="bg-white border border-gray-200 rounded-lg shadow-lg w-72 p-3"
      >
        <div className="text-gray-500 text-sm text-center py-2">
          No commands found for "{query}"
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        ref={menuRef}
        className="bg-white border border-gray-200 rounded-lg shadow-lg w-72 max-h-64 overflow-y-auto"
      >
        {filteredCommands.map((command, index) => (
          <button
            key={command.title}
            onClick={() => {
              command.command();
              if (!["Image", "Ask AI"].includes(command.title)) {
                onSelect();
              }
            }}
            className={`w-full text-left p-3 hover:bg-gray-50 flex items-center gap-3 transition-colors border-none ${
              index === selectedIndex
                ? "bg-blue-50 border-r-2 border-blue-500"
                : ""
            } ${
              command.title === "Ask AI"
                ? "bg-gradient-to-r from-blue-50 to-purple-50 border-l-2 border-blue-400"
                : ""
            }`}
          >
            <div
              className={`flex-shrink-0 ${
                command.title === "Ask AI" ? "text-blue-600" : "text-gray-400"
              }`}
            >
              {command.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div
                className={`font-medium text-sm ${
                  command.title === "Ask AI" ? "text-blue-900" : "text-gray-900"
                }`}
              >
                {command.title}
              </div>
              <div
                className={`text-xs truncate ${
                  command.title === "Ask AI" ? "text-blue-600" : "text-gray-500"
                }`}
              >
                {command.description}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* AI Floating Window */}
      <AIFloatingWindow
        isOpen={showAIWindow}
        onClose={() => {
          setShowAIWindow(false);
          onSelect();
        }}
        onInsert={handleAIInsert}
      />

      {/* Image Modal */}
      <ImageModal
        isOpen={showImageModal}
        onClose={() => {
          setShowImageModal(false);
          onSelect();
        }}
        onInsert={handleImageInsert}
      />
    </>
  );
};

export default SlashCommandMenu;
