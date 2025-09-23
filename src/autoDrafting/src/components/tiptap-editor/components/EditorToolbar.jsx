import React, { useRef, useEffect, useState } from "react";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify, // NEW: Added AlignJustify
  Link as LinkIcon,
  Image as ImageIcon,
  Type,
  Minus,
  Hash,
  Table as TableIcon,
  Settings,
  Upload,
  X,
  Maximize2,
  ArrowRightFromLine,
  FilePlus, // New icon for New Block
} from "lucide-react";

import FontDropdown from "./FontDropdown";
import TableControls from "./TableControls";
import { Button } from "../../ui/button";
import { useSearchParams } from "react-router-dom";
import api from "@/utils/api";
import toast from "react-hot-toast";

// Enhanced ImageModal with Size Management
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

  const handleInsert = () => {
    let finalImageUrl = "";
    if (activeTab === "url" && imageUrl.trim()) {
      finalImageUrl = imageUrl.trim();
    } else if (activeTab === "upload" && previewUrl) {
      finalImageUrl = previewUrl;
    }

    if (finalImageUrl) {
      // Create image attributes object
      const imageAttrs = { src: finalImageUrl };

      // Add size attributes if specified
      if (imageSize.width) {
        if (imageSize.unit === "px") {
          imageAttrs.width = parseInt(imageSize.width);
        } else {
          imageAttrs.style = `width: ${imageSize.width}${imageSize.unit};`;
        }
      }

      if (imageSize.height) {
        if (imageSize.unit === "px") {
          imageAttrs.height = parseInt(imageSize.height);
        } else {
          const existingStyle = imageAttrs.style || "";
          imageAttrs.style = `${existingStyle} height: ${imageSize.height}${imageSize.unit};`;
        }
      }

      onInsert(imageAttrs);
    }
    handleClose();
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
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

const EditorToolbar = ({
  content,
  editor,
  editorState,
  updateEditorState,
  showTableMenu,
  setShowTableMenu,
  tableRows,
  setTableRows,
  tableCols,
  setTableCols,
  tableWithHeader,
  setTableWithHeader,
  setShowLinkModal,
  setShowCustomFontSizeInput,
}) => {
  const [searchParams] = useSearchParams();
  const tableMenuRef = useRef(null);
  const [showImageModal, setShowImageModal] = useState(false);

  // Font options
  const fontFamilies = [
    { label: "Default Font", value: "inherit" },
    {
      label: "Inter",
      value: "Inter, sans-serif",
      style: { fontFamily: "Inter, sans-serif" },
    },
    {
      label: "Helvetica",
      value: "Helvetica, sans-serif",
      style: { fontFamily: "Helvetica, sans-serif" },
    },
    {
      label: "Arial",
      value: "Arial, sans-serif",
      style: { fontFamily: "Arial, sans-serif" },
    },
    {
      label: "Roboto",
      value: "Roboto, sans-serif",
      style: { fontFamily: "Roboto, sans-serif" },
    },
    {
      label: "Open Sans",
      value: "Open Sans, sans-serif",
      style: { fontFamily: "Open Sans, sans-serif" },
    },
    {
      label: "Times New Roman",
      value: "Times New Roman, serif",
      style: { fontFamily: "Times New Roman, serif" },
    },
    {
      label: "Georgia",
      value: "Georgia, serif",
      style: { fontFamily: "Georgia, serif" },
    },
    {
      label: "Monaco",
      value: "Monaco, monospace",
      style: { fontFamily: "Monaco, monospace" },
    },
    {
      label: "Courier New",
      value: "Courier New, monospace",
      style: { fontFamily: "Courier New, monospace" },
    },
  ];

  const fontSizes = [
    { label: "Default", value: "" },
    { label: "8px", value: "8px" },
    { label: "10px", value: "10px" },
    { label: "12px", value: "12px" },
    { label: "14px", value: "14px" },
    { label: "16px", value: "16px" },
    { label: "18px", value: "18px" },
    { label: "20px", value: "20px" },
    { label: "24px", value: "24px" },
    { label: "28px", value: "28px" },
    { label: "32px", value: "32px" },
    { label: "36px", value: "36px" },
    { label: "48px", value: "48px" },
    { label: "Custom...", value: "custom" },
  ];

  // Close table menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        tableMenuRef.current &&
        !tableMenuRef.current.contains(event.target)
      ) {
        setShowTableMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setShowTableMenu]);

  const handleImageInsert = (imageAttrs) => {
    if (editor && imageAttrs) {
      // Handle both old format (string URL) and new format (attributes object)
      if (typeof imageAttrs === "string") {
        editor.chain().focus().setImage({ src: imageAttrs }).run();
      } else {
        editor.chain().focus().setImage(imageAttrs).run();
      }
    }
    setShowImageModal(false);
  };

  // NEW: Handle New Block insertion
  const handleNewBlock = () => {
    if (!editor) return;

    try {
      // Clear all marks and node attributes (like text alignment, font family, etc.)
      editor
        .chain()
        .focus()
        .unsetAllMarks()
        .setParagraph()
        .unsetFontFamily()
        .unsetFontSize()
        .unsetTextAlign()
        .insertContent("<p><br></p>")
        .run();

      console.log("Inserted new empty paragraph block");

      // Update editor state
      setTimeout(() => updateEditorState(), 10);
    } catch (error) {
      console.error("Error inserting new block:", error);
    }
  };

  // NEW: Exit Block functionality
  const handleExitBlock = () => {
    if (!editor) return;

    const { selection, doc } = editor.state;
    const { $from } = selection;
    const currentNode = $from.parent;
    const currentNodeType = currentNode.type.name;

    console.log("Exit Block button clicked, current node:", currentNodeType);

    // Define which block types should be exited
    const exitableBlocks = [
      "blockquote",
      "codeBlock",
      "heading",
      "bulletList",
      "orderedList",
      "listItem",
    ];

    // Check if we're in an exitable block
    if (exitableBlocks.includes(currentNodeType)) {
      try {
        // Strategy 1: For list items, try to lift out of the list
        if (currentNodeType === "listItem") {
          const canLift = editor.can().liftListItem("listItem");
          if (canLift) {
            console.log("Lifting list item");
            editor.chain().focus().liftListItem("listItem").run();
            return;
          } else {
            // If we can't lift, try to exit the list entirely
            console.log("Cannot lift, trying to exit list");
            const pos = $from.end($from.depth - 1); // End of the list
            editor
              .chain()
              .focus()
              .setTextSelection(pos)
              .insertContent("<p></p>")
              .setTextSelection(pos + 1)
              .run();
            return;
          }
        }

        // Strategy 2: For lists themselves, check if we're in an empty item
        if (
          currentNodeType === "bulletList" ||
          currentNodeType === "orderedList"
        ) {
          const isEmpty = currentNode.textContent.trim() === "";
          if (isEmpty) {
            console.log("Exiting empty list");
            const pos = $from.after($from.depth);
            editor
              .chain()
              .focus()
              .setTextSelection(pos)
              .insertContent("<p></p>")
              .setTextSelection(pos + 1)
              .run();
            return;
          }
        }

        // Strategy 3: For blockquotes, headings, and code blocks
        if (["blockquote", "codeBlock", "heading"].includes(currentNodeType)) {
          console.log("Exiting block:", currentNodeType);

          // Try to find the position after the current block
          let pos = $from.after($from.depth);

          // If we're at the end of the document, the position might be invalid
          if (pos > doc.content.size) {
            pos = doc.content.size;
          }

          // Insert a new paragraph after the current block
          editor
            .chain()
            .focus()
            .setTextSelection(pos)
            .insertContent("<p></p>")
            .setTextSelection(pos + 1)
            .run();

          console.log(
            "Successfully created new paragraph at position:",
            pos + 1
          );
          return;
        }

        console.log("No specific handler for node type:", currentNodeType);
      } catch (error) {
        console.error("Error handling exit block:", error);

        // Ultimate fallback: try to insert a paragraph at the current position
        try {
          const currentPos = $from.pos;
          editor
            .chain()
            .focus()
            .setTextSelection(currentPos)
            .insertContent("<p><br></p>")
            .run();
          console.log("Used fallback paragraph insertion");
        } catch (fallbackError) {
          console.error("Fallback also failed:", fallbackError);
        }
      }
    } else {
      console.log("Not in an exitable block, current type:", currentNodeType);
      // Optional: Show a brief message to user
      // You could add a toast notification here
    }

    // Update editor state after the operation
    setTimeout(() => updateEditorState(), 10);
  };

  // Check if we're currently in an exitable block to show active state
  const isInExitableBlock = () => {
    if (!editor) return false;

    const { selection } = editor.state;
    const { $from } = selection;
    const currentNodeType = $from.parent.type.name;

    const exitableBlocks = [
      "blockquote",
      "codeBlock",
      "heading",
      "bulletList",
      "orderedList",
      "listItem",
    ];
    return exitableBlocks.includes(currentNodeType);
  };

  const ToolbarButton = ({
    onClick,
    isActive,
    disabled,
    children,
    title,
    className = "",
  }) => (
    <button
      onClick={(e) => {
        e.preventDefault();
        onClick();
        setTimeout(() => updateEditorState(), 10);
      }}
      disabled={disabled}
      title={title}
      className={`p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
        isActive ? "bg-blue-100 text-blue-600" : "text-gray-700"
      } ${className}`}
    >
      {children}
    </button>
  );

  const handleFontFamilyChange = (fontFamily) => {
    if (!editor) return;
    if (fontFamily === "inherit" || fontFamily === "") {
      editor.chain().focus().unsetFontFamily().run();
    } else {
      editor.chain().focus().setFontFamily(fontFamily).run();
    }
  };

  const handleFontSizeChange = (fontSize) => {
    if (!editor) return;

    if (fontSize === "custom") {
      setShowCustomFontSizeInput(true);
      return;
    }

    if (fontSize === "") {
      editor.chain().focus().unsetFontSize().run();
    } else {
      editor.chain().focus().setFontSize(fontSize).run();
    }
  };

  return (
    <>
      <div className="sticky top-0 z-10 border-b border-gray-200 bg-white/95 backdrop-blur-sm shadow-sm">
        <div className="px-6 py-4 space-y-3">
          {/* First Row - History & Font Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* History Group */}
              <div className="flex items-center gap-1 px-2 py-1 bg-gray-50 rounded-lg">
                <ToolbarButton
                  onClick={() => editor.chain().focus().undo().run()}
                  disabled={!editor.can().chain().focus().undo().run()}
                  title="Undo (Ctrl+Z)"
                  className="hover:bg-white"
                >
                  <Undo size={16} />
                </ToolbarButton>

                <ToolbarButton
                  onClick={() => editor.chain().focus().redo().run()}
                  disabled={!editor.can().chain().focus().redo().run()}
                  title="Redo (Ctrl+Shift+Z)"
                  className="hover:bg-white"
                >
                  <Redo size={16} />
                </ToolbarButton>
              </div>

              {/* Font Controls Group */}
              <div className="flex items-center gap-3">
                <FontDropdown
                  value={editorState.fontFamily}
                  onChange={handleFontFamilyChange}
                  options={fontFamilies}
                  placeholder="Font Family"
                  icon={<Type size={16} />}
                  className="min-w-[180px]"
                />

                <FontDropdown
                  value={editorState.fontSize}
                  onChange={handleFontSizeChange}
                  options={fontSizes}
                  placeholder="Font Size"
                  className="w-[120px]"
                />
              </div>

              {/* Headings */}
              <FontDropdown
                value={
                  editorState.heading1
                    ? "1"
                    : editorState.heading2
                    ? "2"
                    : editorState.heading3
                    ? "3"
                    : editorState.heading4
                    ? "4"
                    : editorState.heading5
                    ? "5"
                    : editorState.heading6
                    ? "6"
                    : "paragraph"
                }
                onChange={(value) => {
                  if (value === "paragraph") {
                    editor.chain().focus().setParagraph().run();
                  } else {
                    const level = parseInt(value);
                    editor.chain().focus().toggleHeading({ level }).run();
                  }
                }}
                options={[
                  { value: "paragraph", label: "Paragraph" },
                  { value: "1", label: "Heading 1" },
                  { value: "2", label: "Heading 2" },
                  { value: "3", label: "Heading 3" },
                  { value: "4", label: "Heading 4" },
                  { value: "5", label: "Heading 5" },
                  { value: "6", label: "Heading 6" },
                ]}
                placeholder="Style"
                icon={<Hash size={16} />}
                className="min-w-[140px]"
              />

              {/* Text Formatting Group */}
              <div className="flex items-center gap-1 px-2 py-1 bg-gray-50 rounded-lg">
                <ToolbarButton
                  onClick={() => editor.chain().focus().toggleBold().run()}
                  isActive={editorState.bold}
                  title="Bold (Ctrl+B)"
                  className="hover:bg-white"
                >
                  <Bold size={16} />
                </ToolbarButton>

                <ToolbarButton
                  onClick={() => editor.chain().focus().toggleItalic().run()}
                  isActive={editorState.italic}
                  title="Italic (Ctrl+I)"
                  className="hover:bg-white"
                >
                  <Italic size={16} />
                </ToolbarButton>

                <ToolbarButton
                  onClick={() => editor.chain().focus().toggleUnderline().run()}
                  isActive={editorState.underline}
                  title="Underline (Ctrl+U)"
                  className="hover:bg-white"
                >
                  <UnderlineIcon size={16} />
                </ToolbarButton>

                <ToolbarButton
                  onClick={() => editor.chain().focus().toggleStrike().run()}
                  isActive={editorState.strike}
                  title="Strikethrough"
                  className="hover:bg-white"
                >
                  <Strikethrough size={16} />
                </ToolbarButton>

                <ToolbarButton
                  onClick={() => editor.chain().focus().toggleCode().run()}
                  isActive={editorState.code}
                  title="Inline Code"
                  className="hover:bg-white"
                >
                  <Code size={16} />
                </ToolbarButton>
              </div>
            </div>

            {/* Settings - Right aligned */}
            <ToolbarButton
              title="Editor Settings"
              className="hover:bg-gray-100"
            >
              <Settings size={18} />
            </ToolbarButton>
          </div>

          {/* Second Row - Structure & Media Tools */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Lists Group */}
              <div className="flex items-center gap-1 px-2 py-1 bg-gray-50 rounded-lg">
                <ToolbarButton
                  onClick={() =>
                    editor.chain().focus().toggleBulletList().run()
                  }
                  isActive={editorState.bulletList}
                  title="Bullet List"
                  className="hover:bg-white"
                >
                  <List size={16} />
                </ToolbarButton>

                <ToolbarButton
                  onClick={() =>
                    editor.chain().focus().toggleOrderedList().run()
                  }
                  isActive={editorState.orderedList}
                  title="Numbered List"
                  className="hover:bg-white"
                >
                  <ListOrdered size={16} />
                </ToolbarButton>
              </div>

              {/* Blocks Group */}
              <div className="flex items-center gap-1 px-2 py-1 bg-gray-50 rounded-lg">
                <ToolbarButton
                  onClick={() =>
                    editor.chain().focus().toggleBlockquote().run()
                  }
                  isActive={editorState.blockquote}
                  title="Blockquote"
                  className="hover:bg-white"
                >
                  <Quote size={16} />
                </ToolbarButton>

                <ToolbarButton
                  onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                  isActive={editorState.codeBlock}
                  title="Code Block"
                  className="hover:bg-white"
                >
                  <Hash size={16} />
                </ToolbarButton>

                {/* NEW: New Block Button */}
                <ToolbarButton
                  onClick={handleNewBlock}
                  title="Insert New Block (Ctrl+Enter)"
                  className="hover:bg-white"
                >
                  <FilePlus size={16} />
                </ToolbarButton>

                {/* Exit Block Button */}
                <ToolbarButton
                  onClick={handleExitBlock}
                  isActive={isInExitableBlock()}
                  title="Exit Current Block (Tab)"
                  className="hover:bg-white"
                >
                  <ArrowRightFromLine size={16} />
                </ToolbarButton>
              </div>

              {/* Alignment Group - UPDATED WITH JUSTIFY */}
              <div className="flex items-center gap-1 px-2 py-1 bg-gray-50 rounded-lg">
                <ToolbarButton
                  onClick={() =>
                    editor.chain().focus().setTextAlign("left").run()
                  }
                  isActive={editorState.textAlignLeft}
                  title="Align Left"
                  className="hover:bg-white"
                >
                  <AlignLeft size={16} />
                </ToolbarButton>

                <ToolbarButton
                  onClick={() =>
                    editor.chain().focus().setTextAlign("center").run()
                  }
                  isActive={editorState.textAlignCenter}
                  title="Align Center"
                  className="hover:bg-white"
                >
                  <AlignCenter size={16} />
                </ToolbarButton>

                <ToolbarButton
                  onClick={() =>
                    editor.chain().focus().setTextAlign("right").run()
                  }
                  isActive={editorState.textAlignRight}
                  title="Align Right"
                  className="hover:bg-white"
                >
                  <AlignRight size={16} />
                </ToolbarButton>

                {/* NEW: Justify Alignment Button */}
                <ToolbarButton
                  onClick={() =>
                    editor.chain().focus().setTextAlign("justify").run()
                  }
                  isActive={editorState.textAlignJustify}
                  title="Justify Text"
                  className="hover:bg-white"
                >
                  <AlignJustify size={16} />
                </ToolbarButton>
              </div>

              {/* Media Group */}
              <div className="flex items-center gap-1 px-2 py-1 bg-gray-50 rounded-lg">
                <ToolbarButton
                  onClick={() => setShowLinkModal(true)}
                  isActive={editorState.link}
                  title="Add Link (Ctrl+K)"
                  className="hover:bg-white"
                >
                  <LinkIcon size={16} />
                </ToolbarButton>

                <ToolbarButton
                  onClick={() => setShowImageModal(true)}
                  title="Add Image with Size Options"
                  className="hover:bg-white"
                >
                  <ImageIcon size={16} />
                </ToolbarButton>

                {/* Table Button with Dropdown */}
                <div className="relative" ref={tableMenuRef}>
                  <ToolbarButton
                    onClick={() => setShowTableMenu(!showTableMenu)}
                    isActive={editorState.table || showTableMenu}
                    title="Table Options"
                    className="hover:bg-white"
                  >
                    <TableIcon size={16} />
                  </ToolbarButton>

                  {showTableMenu && (
                    <TableControls
                      editor={editor}
                      editorState={editorState}
                      tableRows={tableRows}
                      setTableRows={setTableRows}
                      tableCols={tableCols}
                      setTableCols={setTableCols}
                      tableWithHeader={tableWithHeader}
                      setTableWithHeader={setTableWithHeader}
                      onClose={() => setShowTableMenu(false)}
                    />
                  )}
                </div>
              </div>

              {searchParams.get("draftId") && (
                <Button
                  className="bg-[#f0fdf4] text-[#07a250] hover:bg-[#e6f4ea]"
                  onClick={async () => {
                    await api.put(
                      `/auto-draft/${searchParams.get("draftId")}`,
                      {
                        content: content,
                      },
                      {
                        headers: {
                          Authorization: `Bearer ${localStorage.getItem(
                            "token"
                          )}`,
                        },
                      }
                    );
                    toast.success("Draft saved successfully");
                  }}
                >
                  Save Draft
                </Button>
              )}
            </div>

            {/* Utilities - Right aligned */}
            <div className="flex items-center gap-1 px-2 py-1 bg-gray-50 rounded-lg">
              <ToolbarButton
                onClick={() => editor.chain().focus().unsetAllMarks().run()}
                title="Clear Formatting"
                className="hover:bg-white"
              >
                <Type size={16} />
              </ToolbarButton>

              <ToolbarButton
                onClick={() => editor.chain().focus().setHorizontalRule().run()}
                title="Horizontal Rule"
                className="hover:bg-white"
              >
                <Minus size={16} />
              </ToolbarButton>
            </div>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      <ImageModal
        isOpen={showImageModal}
        onClose={() => setShowImageModal(false)}
        onInsert={handleImageInsert}
      />
    </>
  );
};

export default EditorToolbar;
