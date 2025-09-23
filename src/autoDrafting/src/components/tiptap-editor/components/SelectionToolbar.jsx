import React, { useState, useEffect, useRef } from "react";
import { X, Copy, Replace, Loader2, Edit3, Send } from "lucide-react";
import api from "@/utils/api";

const SelectionToolbar = ({ editor, onRefine }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [selectedText, setSelectedText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [resultText, setResultText] = useState("");
  const [error, setError] = useState("");
  const [isInteracting, setIsInteracting] = useState(false);
  const [hasSelectedText, setHasSelectedText] = useState(false);
  const [usage, setUsage] = useState(null);
  const [customPrompt, setCustomPrompt] = useState("");
  const toolbarRef = useRef(null);
  const hideTimeoutRef = useRef(null);
  const debounceTimeoutRef = useRef(null);

  // Configuration for the refine endpoint
  const REFINE_ENDPOINT = `${import.meta.env.VITE_PY_LEGAL_API}/async-refine`;
  const USE_STREAMING = true;

  useEffect(() => {
    if (!editor) return;

    // Function to check and update selection
    const updateSelection = () => {
      if (isInteracting || isProcessing || showResult) return;

      const { selection } = editor.state;
      const { from, to, empty } = selection;

      if (empty) {
        if (!hasSelectedText && !isInteracting) {
          setIsVisible(false);
          setSelectedText("");
          setHasSelectedText(false);
        }
        return;
      }

      const text = editor.state.doc.textBetween(from, to, " ");

      if (text.trim().length > 3) {
        setSelectedText(text);
        setHasSelectedText(true);

        const { view } = editor;
        const start = view.coordsAtPos(from);
        const end = view.coordsAtPos(to);

        const x = (start.left + end.left) / 2;
        const y = start.top - 60;

        setPosition({ x, y });
        setIsVisible(true);
      } else {
        setIsVisible(false);
        setSelectedText("");
        setHasSelectedText(false);
      }
    };

    // Debounced selection update
    const debouncedUpdateSelection = () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      debounceTimeoutRef.current = setTimeout(updateSelection, 100);
    };

    // Handle mouse and keyboard selection completion
    const handleSelectionComplete = (event) => {
      // Check if the event is within the editor's DOM
      const editorElement = editor.view.dom;
      if (editorElement.contains(event.target)) {
        debouncedUpdateSelection();
      }
    };

    const handleEditorBlur = () => {
      hideTimeoutRef.current = setTimeout(() => {
        if (
          !isInteracting &&
          !isProcessing &&
          !showResult &&
          !hasSelectedText
        ) {
          setIsVisible(false);
          setHasSelectedText(false);
          setSelectedText("");
        }
      }, 200);
    };

    const handleEditorFocus = () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
        hideTimeoutRef.current = null;
      }
    };

    // Add event listeners for mouseup and keyup
    const editorElement = editor.view.dom;
    editorElement.addEventListener("mouseup", handleSelectionComplete);
    editorElement.addEventListener("keyup", handleSelectionComplete);
    editor.on("focus", handleEditorFocus);
    editor.on("blur", handleEditorBlur);

    return () => {
      editorElement.removeEventListener("mouseup", handleSelectionComplete);
      editorElement.removeEventListener("keyup", handleSelectionComplete);
      editor.off("focus", handleEditorFocus);
      editor.off("blur", handleEditorBlur);

      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [editor, isInteracting, isProcessing, showResult, hasSelectedText]);

  // Handle streaming response with real-time updates
  const handleStreamingResponse = async (response) => {
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let content = "";
    let usage = null;

    setShowResult(true);
    setResultText("");

    try {
      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n").filter((line) => line.trim());

        for (const line of lines) {
          try {
            const data = JSON.parse(line);

            if (data.content) {
              content = data.content;
              setResultText(content);
            }

            if (data.usage) {
              usage = data.usage;
              await api.post(
                "/extraction-credit",
                {
                  userId: JSON.parse(localStorage.getItem("user")).id,
                  usage: usage.output_tokens,
                  type: "Drafting Editor",
                },
                {
                  headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                  },
                }
              );
              setUsage(usage);
            }
          } catch (e) {
            console.warn("Invalid JSON in stream:", line);
          }
        }
      }
    } finally {
      reader.releaseLock();
    }

    return { content, usage };
  };

  // Generic function to call the refine endpoint
  const callRefineEndpoint = async (
    userPrompt,
    content,
    isStreaming = USE_STREAMING
  ) => {
    const endpoint = isStreaming
      ? `${import.meta.env.VITE_PY_LEGAL_API}/async-refine`
      : `${import.meta.env.VITE_PY_LEGAL_API}/refine`;

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_prompt: userPrompt,
        content: content,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    if (isStreaming) {
      return handleStreamingResponse(response);
    } else {
      return await response.json();
    }
  };

  const handleRefine = async () => {
    if (!selectedText.trim() || !editor || !customPrompt.trim()) return;

    setIsProcessing(true);
    setError("");
    setResultText("");
    setUsage(null);

    try {
      const result = await callRefineEndpoint(customPrompt, selectedText);

      if (!USE_STREAMING && result.content && result.content.trim()) {
        setResultText(result.content.trim());
        setUsage(result.usage);
        setShowResult(true);
      }

      if (onRefine) {
        onRefine(
          selectedText,
          result.content?.trim() || resultText,
          customPrompt
        );
      }
    } catch (error) {
      console.error("Error refining text:", error);
      setError(error.message || "Failed to refine text. Please try again.");
      setShowResult(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopyResult = () => {
    navigator.clipboard.writeText(resultText);
  };

  const handleReplaceResult = () => {
    if (!editor || !resultText) return;

    const { selection } = editor.state;
    editor
      .chain()
      .focus()
      .deleteRange({ from: selection.from, to: selection.to })
      .insertContent(resultText)
      .run();

    setShowResult(false);
    setIsVisible(false);
    setIsInteracting(false);
    setHasSelectedText(false);
    setCustomPrompt("");
  };

  const handleClose = () => {
    setIsVisible(false);
    setShowResult(false);
    setResultText("");
    setError("");
    setUsage(null);
    setIsInteracting(false);
    setHasSelectedText(false);
    setCustomPrompt("");
    editor?.commands.focus();
  };

  const handleCloseResult = () => {
    setShowResult(false);
    setResultText("");
    setError("");
    setUsage(null);
  };

  const handleToolbarMouseEnter = () => {
    setIsInteracting(true);
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
  };

  const handleToolbarMouseLeave = () => {
    setIsInteracting(false);
    if (!isProcessing && !showResult && !hasSelectedText) {
      hideTimeoutRef.current = setTimeout(() => {
        if (!isInteracting && !hasSelectedText) {
          setIsVisible(false);
        }
      }, 300);
    }
  };

  if (!isVisible) return null;

  return (
    <div
      ref={toolbarRef}
      className="fixed z-50 animate-in fade-in-0 zoom-in-95 duration-200"
      style={{
        left: Math.max(10, position.x - 200),
        top: Math.max(10, position.y),
      }}
      onMouseEnter={handleToolbarMouseEnter}
      onMouseLeave={handleToolbarMouseLeave}
    >
      <div
        className={`bg-white border border-gray-200 rounded-lg shadow-xl p-4 transition-all duration-300 ${
          showResult ? "w-[800px]" : "w-96"
        }`}
      >
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Edit3 className="w-4 h-4 text-blue-600" />
            <h3 className="font-medium text-gray-900">Refine Text</h3>
          </div>
          <button
            onClick={handleClose}
            className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
            title="Close toolbar"
            aria-label="Close refine toolbar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className={`flex gap-4 ${showResult ? "" : "max-w-96"}`}>
          {/* Prompt Input Card */}
          <div className={`${showResult ? "flex-1" : "w-full"}`}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter your prompt:
              </label>
              <textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="e.g., Make this text more formal and professional, translate to Spanish, add more details..."
                className="w-full h-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
                disabled={isProcessing}
                aria-label="Enter prompt for refining selected text"
              />
            </div>

            <div className="mb-4">
              <button
                onClick={handleRefine}
                disabled={isProcessing || !customPrompt.trim()}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-md transition-colors"
                title="Refine selected text with custom prompt"
                aria-label="Refine selected text"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Refining...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Refine</span>
                  </>
                )}
              </button>
            </div>

            <div className="pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-500 mb-1">
                Selected text ({selectedText.length} chars):
              </p>
              <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded max-h-16 overflow-y-auto">
                {selectedText.length > 100
                  ? selectedText.slice(0, 100) + "..."
                  : selectedText}
              </p>
            </div>
          </div>

          {/* Arrow (only show when result is visible) */}
          {showResult && (
            <div className="flex items-center justify-center py-8">
              <div className="text-gray-400">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </div>
            </div>
          )}

          {/* Result Card (only show when result is available) */}
          {showResult && (
            <div className="flex-1 animate-in slide-in-from-right-4 duration-300">
              <div className="mb-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-gray-700">
                    Refined Result
                  </h4>
                  <button
                    onClick={handleCloseResult}
                    className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                    title="Close result"
                    aria-label="Close refined result"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
                <p className="text-xs text-gray-500">
                  ({resultText.length} characters)
                </p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-3 h-32 overflow-y-auto mb-4">
                {isProcessing && !resultText ? (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Generating response...</span>
                  </div>
                ) : (
                  <div className="text-sm text-gray-700 leading-relaxed">
                    {resultText}
                    {isProcessing && (
                      <span
                        className="inline-block w-2 h-4 bg-gray-400 animate-pulse ml-1"
                        title="Streaming..."
                      ></span>
                    )}
                  </div>
                )}
              </div>

              <div className="flex gap-2 mb-4">
                <button
                  onClick={handleCopyResult}
                  disabled={isProcessing || !resultText.trim()}
                  className="flex items-center gap-1 px-2 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-700 hover:bg-gray-50 border border-gray-200 rounded-md transition-colors flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Copy result to clipboard"
                  aria-label="Copy refined text"
                >
                  <Copy className="w-3 h-3" />
                  Copy
                </button>
                <button
                  onClick={handleReplaceResult}
                  disabled={isProcessing || !resultText.trim()}
                  className="flex items-center gap-1 px-2 py-1.5 text-xs font-medium text-white bg-green-600 hover:bg-green-700 rounded-md transition-colors flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Replace original text with result"
                  aria-label="Replace text with refined result"
                >
                  <Replace className="w-3 h-3" />
                  Replace
                </button>
              </div>

              {usage && (
                <div className="pt-2 border-t border-gray-100">
                  <p className="text-xs text-gray-500">
                    Tokens: {usage.input_tokens} in, {usage.output_tokens} out
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-white border border-red-200 rounded-lg shadow-lg p-3 mt-2 animate-in fade-in-0 slide-in-from-top-2 duration-200">
          <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">
            <X className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span className="leading-relaxed">{error}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SelectionToolbar;
