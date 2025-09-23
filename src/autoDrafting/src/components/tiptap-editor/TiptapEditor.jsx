/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useCallback, useEffect, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableHeader from "@tiptap/extension-table-header";
import TableCell from "@tiptap/extension-table-cell";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";
import FontFamily from "@tiptap/extension-font-family";
import TextStyle from "@tiptap/extension-text-style";
import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";
import EditorHeader from "./components/EditorHeader.jsx";
import EditorToolbar from "./components/EditorToolbar";
import EditorFooter from "./components/EditorFooter";
import SlashCommandMenu from "./components/SlashCommandMenu";
import EditorModals from "./components/EditorModals";
import SelectionToolbar from "./components/SelectionToolbar";
import { AIFloatingWindow } from "./components/AIFloatingWindow";
import "./styles/EditorStyles.css";
import {
  FileText,
  Upload,
  Edit3,
  Check,
  ChevronDown,
  Download,
  Save,
  Plus,
} from "lucide-react";
import {
  useNavigate,
  useParams,
  useResolvedPath,
  useSearchParams,
} from "react-router-dom";
import api from "@/utils/api";
import axios from "axios";
import SelectTemplate from "./components/select-template.jsx";
import SelectDrafting from "./components/select-drafting.jsx";

// Variable Highlighting Extension
const VariableHighlight = Extension.create({
  name: "variableHighlight",
  addOptions() {
    return {
      onVariableClick: null,
      currentVariables: [],
    };
  },
  addProseMirrorPlugins() {
    const { onVariableClick, currentVariables } = this.options;
    return [
      new Plugin({
        key: new PluginKey("variableHighlight"),
        state: {
          init() {
            return DecorationSet.empty;
          },
          apply(tr, decorationSet) {
            const doc = tr.doc;
            const decorations = [];
            const variableIds = new Set(
              currentVariables.map((v) => v.unique_id)
            );
            doc.descendants((node, pos) => {
              if (node.isText) {
                const text = node.text;
                const variableRegex = /\{\{([^}]+)\}\}/g;
                let match;
                while ((match = variableRegex.exec(text)) !== null) {
                  const variableId = match[1].trim();
                  const isKnownVariable = variableIds.has(variableId);
                  const decoration = Decoration.inline(
                    pos + match.index,
                    pos + match.index + match[0].length,
                    {
                      class: `variable-highlight ${
                        isKnownVariable ? "known-variable" : "unknown-variable"
                      }`,
                      "data-variable-id": variableId,
                    }
                  );
                  decorations.push(decoration);
                }
              }
            });
            return DecorationSet.create(doc, decorations);
          },
        },
        props: {
          decorations(state) {
            return this.getState(state);
          },
          handleClick(view, pos, event) {
            const target = event.target;
            if (
              target.classList.contains("variable-highlight") ||
              target.hasAttribute("data-variable-id")
            ) {
              const variableId =
                target.getAttribute("data-variable-id") ||
                target.dataset?.variableId;
              if (variableId && onVariableClick) {
                onVariableClick(variableId);
                return true;
              }
            }
            return false;
          },
        },
      }),
    ];
  },
  addGlobalAttributes() {
    return [
      {
        types: ["textStyle"],
        attributes: {
          variableId: {
            default: null,
          },
        },
      },
    ];
  },
});

let FontSize, SlashCommands;

try {
  const CustomExtensions = require("./extensions/CustomExtensions.js");
  FontSize = CustomExtensions.FontSize;
  SlashCommands = CustomExtensions.SlashCommands;
} catch (error) {
  console.warn("Custom extensions not found, using fallbacks");
  FontSize = TextStyle.extend({
    name: "fontSize",
    addOptions() {
      return {
        types: ["textStyle"],
      };
    },
    addGlobalAttributes() {
      return [
        {
          types: this.options.types,
          attributes: {
            fontSize: {
              default: null,
              parseHTML: (element) =>
                element.style.fontSize?.replace(/['"]+/g, ""),
              renderHTML: (attributes) => {
                if (!attributes.fontSize) {
                  return {};
                }
                return {
                  style: `font-size: ${attributes.fontSize}`,
                };
              },
            },
          },
        },
      ];
    },
    addCommands() {
      return {
        setFontSize:
          (fontSize) =>
          ({ chain }) => {
            return chain().setMark("textStyle", { fontSize }).run();
          },
        unsetFontSize:
          () =>
          ({ chain }) => {
            return chain()
              .setMark("textStyle", { fontSize: null })
              .removeEmptyTextStyle()
              .run();
          },
      };
    },
  });
}

// Utility function to convert base64 to ArrayBuffer
const base64ToArrayBuffer = (base64) => {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
};

// Utility function to convert base64 to Blob
const base64ToBlob = (base64, mimeType) => {
  const arrayBuffer = base64ToArrayBuffer(base64);
  return new Blob([arrayBuffer], { type: mimeType });
};

// Utility function to generate sequential variable ID
const generateSequentialVariableId = (currentVariables) => {
  const count = currentVariables.length;
  return `variable_${count + 1}`;
};

const TiptapEditor = () => {
  const { workspaceId } = useParams();
  const navigate = useNavigate();
  const pathname = useResolvedPath().pathname;
  const [searchParams] = useSearchParams();
  const [editorState, setEditorState] = useState({});
  const [documentTitle, setDocumentTitle] = useState("Untitled Document");
  const [editorContent, setEditorContent] = useState("");
  const [contentUpdateTrigger, setContentUpdateTrigger] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const editorRef = useRef(null);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showSaveAsModal, setShowSaveAsModal] = useState(false);
  const [showCustomFontSizeInput, setShowCustomFontSizeInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [saveAsTitle, setSaveAsTitle] = useState("");
  const [customFontSize, setCustomFontSize] = useState("");
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [slashMenuPosition, setSlashMenuPosition] = useState({ x: 0, y: 0 });
  const [slashQuery, setSlashQuery] = useState("");
  const [slashRange, setSlashRange] = useState(null);
  const [showTableMenu, setShowTableMenu] = useState(false);
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);
  const [tableWithHeader, setTableWithHeader] = useState(true);
  const [showVariablesPanel, setShowVariablesPanel] = useState(true);
  const [editingVariable, setEditingVariable] = useState(null);
  const [editingValues, setEditingValues] = useState({});
  const [isImporting, setIsImporting] = useState(false);
  const [currentVariables, setCurrentVariables] = useState([]);
  const [variableValues, setVariableValues] = useState({});
  const [highlightedVariable, setHighlightedVariable] = useState(null);
  const [availableDocuments, setAvailableDocuments] = useState([]);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [showDocumentMenu, setShowDocumentMenu] = useState(false);
  const [placeholderStatus, setPlaceholderStatus] = useState({});
  const [showCustomVariableInput, setShowCustomVariableInput] = useState(false);
  const [newVariableName, setNewVariableName] = useState("");
  const [showAIFloatingWindow, setShowAIFloatingWindow] = useState(false);

  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [folderPath, setFolderPath] = useState([]);
  const inputRefs = useRef({});
  const fileInputRef = useRef(null);

  // Fetch documents from the server
  // const fetchDocuments = async () => {
  //   try {
  //     const response = await api.get(`/list-documents/${workspaceId}`);
  //     const docs = response.data
  //       .filter(
  //         (item) => item.type !== "folder" && item.filename.endsWith(".docx")
  //       )
  //       .map((item) => ({
  //         filename: item.filename,
  //         s3_key_original: item.s3_key_original,
  //       }));
  //     setAvailableDocuments(docs);
  //   } catch (error) {
  //     setAvailableDocuments([]);
  //   }
  // };

  const fetchDocuments = async (folderId = null) => {
    try {
      const response = await api.get(`/list-documents/${workspaceId}`, {
        params: { folderId },
      });
      setAvailableDocuments(response.data);
    } catch (error) {
      console.error("Error fetching documents:", error);
      setAvailableDocuments([]);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [workspaceId]);

  const handleVariableClick = useCallback(
    (variableId) => {
      if (!showVariablesPanel) {
        setShowVariablesPanel(true);
      }
      setEditingVariable(variableId);
      setHighlightedVariable(variableId);
      setTimeout(() => {
        setHighlightedVariable(null);
      }, 2000);
      setTimeout(() => {
        const variableElement = document.querySelector(
          `[data-variable-id="${variableId}"]`
        );
        if (variableElement) {
          variableElement.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
        if (inputRefs.current[variableId]) {
          inputRefs.current[variableId].focus();
        }
      }, 100);
    },
    [showVariablesPanel]
  );

  const editor = useEditor(
    {
      extensions: [
        StarterKit.configure({
          bulletList: { keepMarks: true, keepAttributes: false },
          orderedList: { keepMarks: true, keepAttributes: false },
        }),
        Underline,
        TextStyle,
        FontFamily,
        FontSize,
        TextAlign.configure({
          types: ["heading", "paragraph"],
          alignments: ["left", "center", "right", "justify"],
          defaultAlignment: "left",
        }),
        Link.configure({
          openOnClick: false,
          autolink: true,
          defaultProtocol: "https",
        }),
        Image.configure({
          inline: false,
          allowBase64: true,
        }),
        Table.configure({
          resizable: true,
          handleWidth: 5,
          cellMinWidth: 25,
          allowTableNodeSelection: true,
        }),
        TableRow,
        TableHeader,
        TableCell,
        Placeholder.configure({
          placeholder: ({ node }) => {
            if (node.type.name === "paragraph") {
              return 'Start typing or press "/" for commands...';
            }
            return "";
          },
          showOnlyWhenEditable: true,
          showOnlyCurrent: false,
          includeChildren: false,
        }),
        CharacterCount.configure({ limit: 1000000000000 }),
        VariableHighlight.configure({
          onVariableClick: handleVariableClick,
          currentVariables: currentVariables,
        }),
        SlashCommands,
      ].filter(Boolean),
      content: editorContent,
      editorProps: {
        attributes: {
          class:
            "prose prose-lg max-w-none focus:outline-none tiptap-editor-content",
        },
      },
      onUpdate: ({ editor }) => {
        updateEditorState();
        const currentHtml = editor.getHTML();
        const charCount = currentHtml.length;
        setEditorContent(currentHtml);
        if (isLoading && currentHtml !== "<p></p>") {
          setIsLoading(false);
        }
        if (charCount >= 10000000000) {
          console.warn("Approaching character limit, content may be truncated");
        }
      },
      onCreate: ({ editor }) => {
        editorRef.current = editor;
      },
    },
    [currentVariables, handleVariableClick]
  );

  useEffect(() => {
    if (editor) {
      const variableHighlightExt = editor.extensionManager.extensions.find(
        (ext) => ext.name === "variableHighlight"
      );
      if (variableHighlightExt) {
        variableHighlightExt.options.currentVariables = currentVariables;
        editor.view.dispatch(editor.state.tr);
      }
    }
  }, [editor, currentVariables]);

  const updateEditorState = useCallback(() => {
    if (!editor) return;
    try {
      setEditorState({
        bold: editor.isActive("bold"),
        italic: editor.isActive("italic"),
        underline: editor.isActive("underline"),
        strike: editor.isActive("strike"),
        code: editor.isActive("code"),
        codeBlock: editor.isActive("codeBlock"),
        bulletList: editor.isActive("bulletList"),
        orderedList: editor.isActive("orderedList"),
        blockquote: editor.isActive("blockquote"),
        link: editor.isActive("link"),
        table: editor.isActive("table"),
        textAlignLeft: editor.isActive({ textAlign: "left" }),
        textAlignCenter: editor.isActive({ textAlign: "center" }),
        textAlignRight: editor.isActive({ textAlign: "right" }),
        heading1: editor.isActive("heading", { level: 1 }),
        heading2: editor.isActive("heading", { level: 2 }),
        heading3: editor.isActive("heading", { level: 3 }),
        heading4: editor.isActive("heading", { level: 4 }),
        heading5: editor.isActive("heading", { level: 5 }),
        heading6: editor.isActive("heading", { level: 6 }),
        fontSize: editor.getAttributes("textStyle").fontSize || "",
        fontFamily: editor.getAttributes("textStyle").fontFamily || "inherit",
      });
    } catch (error) {
      console.error("Error updating editor state:", error);
    }
  }, [editor]);

  const updateEditorContent = (htmlContent) => {
    if (!editor) return;
    if (!htmlContent || htmlContent.trim() === "") {
      console.warn("No valid HTML content to update");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      setEditorContent(htmlContent);
      setTimeout(() => {
        editor
          .chain()
          .focus()
          .setContent(htmlContent, false, { preserveWhitespace: true })
          .run();
        setContentUpdateTrigger((prev) => prev + 1);
        updateEditorState();
        const currentHtml = editor.getHTML();
        if (currentHtml !== htmlContent) {
          console.warn(
            "Partial content loaded, forcing re-init. Expected length:",
            htmlContent.length,
            "Got:",
            currentHtml.length
          );
          editor.destroy();
          editorRef.current = useEditor({
            extensions: editor.extensionManager.extensions,
            content: htmlContent,
            editorProps: editor.options.editorProps,
            onUpdate: editor.options.onUpdate,
            onCreate: editor.options.onCreate,
          });
        } else if (currentHtml === "<p></p>") {
          console.warn("Content parsing failed, using raw text fallback");
          const textFallback =
            htmlContent.replace(/<[^>]+>/g, "").trim() ||
            "Imported content failed to parse";
          editor
            .chain()
            .focus()
            .setContent(`<p>${textFallback}</p>`, false)
            .run();
        }
        setIsLoading(false);
      }, 0);
    } catch (error) {
      console.error("Failed to set content:", error);
      setIsLoading(false);
    }
  };

  const handleInsertContent = useCallback(
    (htmlContent) => {
      if (!editor) return;
      setIsLoading(true);
      try {
        // Clear existing variables
        setCurrentVariables([]);
        setVariableValues({});
        setPlaceholderStatus({});
        setEditingVariable(null);
        setEditingValues({});
        setHighlightedVariable(null);
        // Set document title to a default value
        setDocumentTitle("AI Generated Document");
        // Update editor content
        updateEditorContent(htmlContent);
        // Show variables panel if needed
        setShowVariablesPanel(true);
        // Extract any potential variables from the inserted content
        const placeholderMatches = htmlContent.match(/\{\{[^}]+\}\}/g) || [];
        if (placeholderMatches.length > 0) {
          const newVariables = placeholderMatches
            .map((match) => match.slice(2, -2).trim())
            .filter((value, index, self) => self.indexOf(value) === index) // Remove duplicates
            .map((unique_id, index) => ({
              unique_id,
              label: `Variable ${index + 1}`,
              type: "text",
            }));
          setCurrentVariables(newVariables);
          const initialValues = {};
          const initialStatus = {};
          newVariables.forEach((variable) => {
            initialValues[variable.unique_id] = "";
            initialStatus[variable.unique_id] = "Found";
          });
          setVariableValues(initialValues);
          setPlaceholderStatus(initialStatus);
          alert(
            `Inserted content with ${
              newVariables.length
            } variables detected: ${newVariables
              .map((v) => v.unique_id)
              .join(", ")}`
          );
        } else {
          alert("Content inserted successfully. No variables detected.");
        }
      } catch (error) {
        console.error("Error inserting content:", error);
        alert(`Failed to insert content: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    },
    [editor, updateEditorContent]
  );

  const handleImportWord = useCallback(
    ({ html, fileName }) => {
      if (!editor) return;
      if (!html || html.trim() === "") {
        console.error("No HTML received from import:", html);
        alert("Failed to import: No content extracted from .docx");
        setIsLoading(false);
        return;
      }
      setDocumentTitle(fileName);
      updateEditorContent(html);
    },
    [editor]
  );

  const handleImportPDF = useCallback(
    ({ json, fileName }) => {
      if (!editor) return;
      setDocumentTitle(fileName);
      const html = `<p>${json.content
        .map((item) => item.content[0].text)
        .join("</p><p>")}</p>`;
      updateEditorContent(html);
    },
    [editor]
  );

  const preprocessHtmlContent = (html, variables) => {
    let processedHtml = html;
    const foundPlaceholders = new Set(
      (html.match(/\{\{[^}]+\}\}/g) || []).map((p) => p.slice(2, -2).trim())
    );
    const variableIds = new Set(variables.map((v) => v.unique_id));
    const status = {};
    variables.forEach((v) => {
      status[v.unique_id] = foundPlaceholders.has(v.unique_id)
        ? "Found"
        : "Missing";
    });
    setPlaceholderStatus(status);
    variables.forEach((variable) => {
      const placeholder = `{{${variable.unique_id}}}`;
      const escapedPlaceholder = placeholder.replace(
        /[-[\]{}()*+?.,\\^$|#\s]/g,
        "\\$&"
      );
      const regex = new RegExp(
        `\\{\\{\\s*${variable.unique_id}\\s*\\}\\}`,
        "gi"
      );
      processedHtml = processedHtml.replace(regex, placeholder);
    });
    const unmatchedVariables = variables.filter(
      (v) => !foundPlaceholders.has(v.unique_id)
    );
    if (unmatchedVariables.length > 0) {
      console.warn(
        "Variables with no placeholders in content:",
        unmatchedVariables.map((v) => v.unique_id)
      );
    }
    return processedHtml;
  };

  const sanitizeHtmlContent = (content) =>
    content
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");

  const handleVariableChange = useCallback((variableId, newValue) => {
    setEditingValues((prev) => ({
      ...prev,
      [variableId]: newValue,
    }));
  }, []);

  const saveVariableEdit = useCallback(
    (variableId) => {
      if (!editingValues[variableId]) return;
      setVariableValues((prev) => ({
        ...prev,
        [variableId]: editingValues[variableId],
      }));
      setEditingValues((prev) => {
        const newState = { ...prev };
        delete newState[variableId];
        return newState;
      });
      setEditingVariable(null);
    },
    [editingValues]
  );

  const handleAddCustomVariable = useCallback(() => {
    if (!newVariableName.trim()) {
      alert("Please enter a variable name.");
      return;
    }
    const newVariable = {
      unique_id: generateSequentialVariableId(currentVariables),
      label: newVariableName.trim(),
      type: "text",
    };
    setCurrentVariables((prev) => [...prev, newVariable]);
    setVariableValues((prev) => ({
      ...prev,
      [newVariable.unique_id]: "",
    }));
    setPlaceholderStatus((prev) => ({
      ...prev,
      [newVariable.unique_id]: "Missing",
    }));
    setNewVariableName("");
    setShowCustomVariableInput(false);
    alert(
      `Custom variable "${newVariable.label}" added successfully! Use the "Insert Placeholder" button to add {{${newVariable.unique_id}}} to the document.`
    );
  }, [newVariableName, currentVariables]);

  const handleClearAllVariables = useCallback(() => {
    const confirmClear = window.confirm(
      "Are you sure you want to clear all variables? This action cannot be undone.\n\n" +
        "This will:\n" +
        "• Remove all variable definitions\n" +
        "• Clear all variable values\n" +
        "• Reset placeholder status\n" +
        "• Keep placeholders in the document as plain text"
    );

    if (!confirmClear) return;

    try {
      setCurrentVariables([]);
      setVariableValues({});
      setPlaceholderStatus({});
      setEditingVariable(null);
      setEditingValues({});
      setHighlightedVariable(null);

      if (editor) {
        let updatedContent = editor.getHTML();

        updatedContent = updatedContent.replace(
          /<span[^>]*class="[^"]*variable-highlight[^"]*"[^>]*data-variable-id="([^"]*)"[^>]*>([^<]*)<\/span>/gi,
          "{{$1}}"
        );

        editor
          .chain()
          .setContent(updatedContent, false, { preserveWhitespace: true })
          .run();

        const variableHighlightExt = editor.extensionManager.extensions.find(
          (ext) => ext.name === "variableHighlight"
        );
        if (variableHighlightExt) {
          variableHighlightExt.options.currentVariables = [];
          editor.view.dispatch(editor.state.tr);
        }
      }

      setShowCustomVariableInput(false);
      setNewVariableName("");

      alert("All variables have been cleared successfully!");
    } catch (error) {
      console.error("Error clearing variables:", error);
      alert(`Failed to clear variables: ${error.message}`);
    }
  }, [editor]);

  const handleClearVariableDefinitionsOnly = useCallback(() => {
    const confirmClear = window.confirm(
      "Clear all variable definitions?\n\n" +
        "This will:\n" +
        "• Remove all variable definitions and values\n" +
        "• Keep placeholders in the document unchanged\n" +
        "• You can re-import or redefine variables later"
    );

    if (!confirmClear) return;

    try {
      setCurrentVariables([]);
      setVariableValues({});
      setPlaceholderStatus({});
      setEditingVariable(null);
      setEditingValues({});
      setHighlightedVariable(null);
      setShowCustomVariableInput(false);
      setNewVariableName("");

      if (editor) {
        const variableHighlightExt = editor.extensionManager.extensions.find(
          (ext) => ext.name === "variableHighlight"
        );
        if (variableHighlightExt) {
          variableHighlightExt.options.currentVariables = [];
          editor.view.dispatch(editor.state.tr);
        }
      }

      alert(
        "Variable definitions cleared successfully! Placeholders remain in the document."
      );
    } catch (error) {
      console.error("Error clearing variable definitions:", error);
      alert(`Failed to clear variable definitions: ${error.message}`);
    }
  }, [editor]);

  const handleClearSpecificVariable = useCallback(
    (variableId) => {
      const confirmClear = window.confirm(
        `Are you sure you want to remove the variable "${variableId}"?\n\n` +
          "This will remove the variable definition but keep any placeholders in the document."
      );

      if (!confirmClear) return;

      try {
        setCurrentVariables((prev) =>
          prev.filter((v) => v.unique_id !== variableId)
        );

        setVariableValues((prev) => {
          const newValues = { ...prev };
          delete newValues[variableId];
          return newValues;
        });

        setPlaceholderStatus((prev) => {
          const newStatus = { ...prev };
          delete newStatus[variableId];
          return newStatus;
        });

        if (editingVariable === variableId) {
          setEditingVariable(null);
        }

        setEditingValues((prev) => {
          const newValues = { ...prev };
          delete newValues[variableId];
          return newValues;
        });

        if (highlightedVariable === variableId) {
          setHighlightedVariable(null);
        }

        alert(`Variable "${variableId}" removed successfully!`);
      } catch (error) {
        console.error("Error removing variable:", error);
        alert(`Failed to remove variable: ${error.message}`);
      }
    },
    [editingVariable, highlightedVariable]
  );

  const handleApplyAllVariables = useCallback(async () => {
    if (!editor) return;
    let updatedContent = editor.getHTML();
    let replacementsMade = 0;
    const unmatchedVariables = [];
    Object.entries(variableValues).forEach(([variableId, value]) => {
      const escapedVariableId = variableId.replace(
        /[-[\]{}()*+?.,\\^$|#\s]/g,
        "\\$&"
      );
      const regex = new RegExp(
        `(?:<span[^>]*data-variable-id="${escapedVariableId}"[^>]*>[^<]+</span>|\\{\\{\\s*${escapedVariableId}\\s*\\}\\})`,
        "gi"
      );
      const sanitizedValue =
        value && value.trim() !== ""
          ? sanitizeHtmlContent(value)
          : `{{${variableId}}}`;
      const replacement =
        value && value.trim() !== ""
          ? `<span class="variable-highlight known-variable applied-variable" data-variable-id="${variableId}">${sanitizedValue}</span>`
          : `{{${variableId}}}`;
      const matchCount = (updatedContent.match(regex) || []).length;
      if (matchCount > 0) {
        replacementsMade += matchCount;
        updatedContent = updatedContent.replace(regex, replacement);
      } else {
        console.warn(
          `No matches found for variable ${variableId} in content. Placeholder status:`,
          placeholderStatus[variableId] || "Unknown"
        );
        unmatchedVariables.push(variableId);
      }
    });
    try {
      editor
        .chain()
        .setContent(updatedContent, false, { preserveWhitespace: true })
        .run();
      if (replacementsMade > 0) {
        await api.put(
          `/auto-draft/${searchParams.get("draftId")}`,
          {
            content: updatedContent,
            variables: currentVariables,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        alert(
          `Applied ${replacementsMade} variable${
            replacementsMade === 1 ? "" : "s"
          } successfully!`
        );
      } else {
        alert(
          "No variables were applied. Check if placeholders exist in the document."
        );
      }
      if (unmatchedVariables.length > 0) {
        alert(
          `The following variables have no matching placeholders: ${unmatchedVariables.join(
            ", "
          )}. Ensure their placeholders (e.g., {{variableId}}) exist in the document.`
        );
      }
    } catch (error) {
      console.error("Failed to apply all variables:", error);
      alert("Failed to apply variables due to an error.");
    }
  }, [editor, variableValues, placeholderStatus]);

  const handleImportDocument = useCallback(
    async (source, fileOrDoc) => {
      setIsImporting(true);
      try {
        let file;
        let fileName;
        const token = localStorage.getItem("token");
        if (source === "server") {
          const doc = fileOrDoc;
          const response = await api.get(
            `/get-signed-url?key=${encodeURIComponent(doc.s3_key_original)}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          const signedUrl = response.data.url;
          const fileResponse = await fetch(signedUrl);
          if (!fileResponse.ok) {
            throw new Error(
              `Failed to fetch document: ${fileResponse.statusText}`
            );
          }
          const arrayBuffer = await fileResponse.arrayBuffer();
          file = new Blob([arrayBuffer], {
            type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          });
          fileName = doc.filename;
        } else if (source === "local") {
          file = fileOrDoc;
          fileName = file.name;
        } else {
          throw new Error("Invalid import source");
        }
        const arrayBuffer = await file.arrayBuffer();
        const mammoth = await import("mammoth");
        const mammothResult = await mammoth.convertToHtml({ arrayBuffer });
        let htmlContent = mammothResult.value;
        const formData = new FormData();
        formData.append("file", file, fileName);
        const apiResponse = await axios.post(
          `${import.meta.env.VITE_PY_LEGAL_API}/template-convert`,
          formData
        );
        if (!apiResponse.data) {
          throw new Error("API request failed: No data returned");
        }
        const apiData = apiResponse.data;
        await api.post(
          "/extraction-credit",
          {
            userId: JSON.parse(localStorage.getItem("user")).id,
            usage: apiData.usage.output_tokens,
            type: "Drafting Template Convert",
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (apiData.file) {
          try {
            const processedDocxBlob = base64ToBlob(
              apiData.file,
              "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            );
            const processedArrayBuffer = await processedDocxBlob.arrayBuffer();
            const processedResult = await mammoth.convertToHtml({
              arrayBuffer: processedArrayBuffer,
            });
            htmlContent = processedResult.value;
          } catch (fileError) {
            console.error("Error processing base64 file:", fileError);
          }
        }
        let variables = [];
        try {
          if (!apiData.mapping) {
            console.warn("No mapping field in API response");
            variables = [];
          } else {
            if (typeof apiData.mapping === "string") {
              variables = JSON.parse(apiData.mapping);
            } else if (Array.isArray(apiData.mapping)) {
              variables = apiData.mapping;
            } else if (typeof apiData.mapping === "object") {
              variables = Object.values(apiData.mapping);
            } else {
              throw new Error(
                `Unexpected mapping type: ${typeof apiData.mapping}`
              );
            }
            variables = variables.map((v, index) => ({
              unique_id: v.unique_id || `variable_${index + 1}`,
              label: v.label || `Variable ${index + 1}`,
              type: v.type || "text",
            }));
          }
        } catch (mappingError) {
          console.error("Error parsing mapping:", mappingError.message);
          alert(
            "Failed to parse variable mapping from API. Variables may not be available."
          );
          variables = [];
        }
        if (variables.length > 0) {
          htmlContent = preprocessHtmlContent(htmlContent, variables);
        }
        setDocumentTitle(fileName.replace(".docx", ""));

        updateEditorContent(htmlContent);
        setCurrentVariables(variables);
        const autoDraft = await api.post(
          "/auto-draft",
          {
            content: htmlContent,
            file: fileName.replace(".docx", ""),
            folder: "template",
            variables,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        navigate(`${pathname}?draftId=${autoDraft.data.autoDraft.id}`);
        const initialValues = {};
        variables.forEach((variable) => {
          initialValues[variable.unique_id] =
            variableValues[variable.unique_id] || "";
        });
        setVariableValues(initialValues);
        setShowVariablesPanel(true);
        setShowDocumentMenu(false);
        setSelectedDocument(null);
        const placeholderMatches = htmlContent.match(/\{\{[^}]+\}\}/g) || [];
        const missingPlaceholders = variables.filter(
          (v) => !placeholderMatches.some((p) => p.includes(v.unique_id))
        );
        if (missingPlaceholders.length > 0) {
          console.warn("Variables missing placeholders:", missingPlaceholders);
          alert(
            `Warning: The following variables have no placeholders in the document: ${missingPlaceholders
              .map((v) => v.unique_id)
              .join(", ")}. Use the "Insert Placeholder" button to add them.`
          );
        }
        if (apiData.usage) {
          console.log("API Usage:", apiData.usage);
        }
        console.log("Document import completed successfully:", fileName);
        alert(
          `Document "${fileName}" imported successfully with ${variables.length} variables!`
        );
      } catch (error) {
        console.error("Error importing document:", error);
        const placeholderContent = `
          <h1>Document: ${fileName || "Unknown"}</h1>
          <p><strong>Error:</strong> ${error.message}</p>
          <p>This is a placeholder content. The actual document content could not be loaded.</p>
          <p>Please check:</p>
          <ul>
            <li>Network connection</li>
            <li>API server status</li>
            <li>Document file format</li>
          </ul>
        `;
        setDocumentTitle((fileName || "Unknown").replace(".docx", ""));
        updateEditorContent(placeholderContent);
        setCurrentVariables([]);
        setVariableValues({});
        alert(`Failed to import document: ${error.message}`);
      } finally {
        setIsImporting(false);
        if (source === "local" && fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    },
    [editor, variableValues, workspaceId]
  );

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.name.endsWith(".docx")) {
      handleImportDocument("local", file);
    } else {
      alert("Please select a valid .docx file.");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // const handleServerDocumentSelect = () => {
  //   if (selectedDocument) {
  //     handleImportDocument("server", selectedDocument);
  //   }
  // };
  const handleServerDocumentSelect = () => {
    if (selectedDocument) {
      setFolderPath([]);
      setCurrentFolderId(null);
      handleImportDocument("server", selectedDocument);
    }
  };

  const handleSummarizeText = useCallback((originalText, summarizedText) => {},
  []);

  const handleImproveWriting = useCallback((originalText, improvedText) => {},
  []);

  const handleSave = useCallback(() => {
    if (!editor) return;
    const content = editor.getJSON();
    const docData = {
      title: documentTitle,
      content: content,
      variables: variableValues,
      lastModified: new Date().toISOString(),
    };
    const savedDocs = JSON.parse(
      localStorage.getItem("tiptap-documents") || "[]"
    );
    const existingIndex = savedDocs.findIndex(
      (doc) => doc.title === documentTitle
    );
    if (existingIndex >= 0) {
      savedDocs[existingIndex] = docData;
    } else {
      savedDocs.push(docData);
    }
    localStorage.setItem("tiptap-documents", JSON.stringify(savedDocs));
    alert(`Document "${documentTitle}" saved successfully!`);
  }, [editor, documentTitle, variableValues]);

  const handleSaveAs = useCallback(() => {
    setSaveAsTitle(documentTitle);
    setShowSaveAsModal(true);
  }, [documentTitle]);

  const handleExportPDF = useCallback(() => {
    if (!editor) return;
    const content = editor.getHTML();
    const printWindow = window.open("", "_blank");
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${documentTitle}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #374151; max-width: 8.5in; margin: 0 auto; padding: 1in; background: white; }
          h1 { font-size: 2rem; font-weight: 700; margin: 1.5rem 0 1rem 0; color: #1f2937; }
          h2 { font-size: 1.5rem; font-weight: 600; margin: 1.25rem 0 0.75rem 0; color: #374151; }
          p { margin: 1rem 0; line-height: 1.6; }
          ul, ol { margin: 1rem 0; padding-left: 2rem; }
          blockquote { margin: 1.5rem 0; padding: 1rem 1.5rem; border-left: 4px solid #3b82f6; background: #f8fafc; font-style: italic; }
          img { max-width: 100%; height: auto; }
          table { border-collapse: collapse; width: 100%; margin: 1rem 0; }
          th, td { border: 1px solid #e5e7eb; padding: 0.5rem; }
        </style>
      </head>
      <body>${content}</body>
      </html>
    `;
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 250);
  }, [editor, documentTitle]);

  const handleExportDOCX = useCallback(() => {
    if (!editor) return;
    const content = editor.getHTML();
    const wordContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset='utf-8'><title>${documentTitle}</title></head>
      <body>${content}</body>
      </html>
    `;
    const blob = new Blob(["\ufeff", wordContent], {
      type: "application/msword",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${documentTitle}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [editor, documentTitle]);

  useEffect(() => {
    if (!editor) return;
    const handleTabKey = (event) => {
      if (event.key === "Tab" && !event.shiftKey) {
        const { selection, doc } = editor.state;
        const { $from } = selection;
        const currentNode = $from.parent;
        const currentNodeType = currentNode.type.name;
        const exitableBlocks = [
          "blockquote",
          "codeBlock",
          "heading",
          "bulletList",
          "orderedList",
          "listItem",
        ];
        if (exitableBlocks.includes(currentNodeType)) {
          event.preventDefault();
          try {
            if (currentNodeType === "listItem") {
              const canLift = editor.can().liftListItem("listItem");
              if (canLift) {
                editor.chain().focus().liftListItem("listItem").run();
                return;
              } else {
                const pos = $from.end($from.depth - 1);
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
            if (
              currentNodeType === "bulletList" ||
              currentNodeType === "orderedList"
            ) {
              const isEmpty = currentNode.textContent.trim() === "";
              if (isEmpty) {
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
            if (
              ["blockquote", "codeBlock", "heading"].includes(currentNodeType)
            ) {
              let pos = $from.after($from.depth);
              if (pos > doc.content.size) {
                pos = doc.content.size;
              }
              editor
                .chain()
                .focus()
                .setTextSelection(pos)
                .insertContent("<p></p>")
                .setTextSelection(pos + 1)
                .run();
              return;
            }
          } catch (error) {
            console.error("Error handling tab exit:", error);
            try {
              const currentPos = $from.pos;
              editor
                .chain()
                .focus()
                .setTextSelection(currentPos)
                .insertContent("<p><br></p>")
                .run();
            } catch (fallbackError) {
              console.error("Fallback also failed:", fallbackError);
            }
          }
        } else {
          console.log(
            "Not in an exitable block, allowing default tab behavior"
          );
        }
      }
    };
    const editorElement = editor.view.dom;
    editorElement.addEventListener("keydown", handleTabKey);
    return () => {
      editorElement.removeEventListener("keydown", handleTabKey);
    };
  }, [editor]);

  useEffect(() => {
    if (!editor) return;
    const handleKeyDown = (e) => {
      if (e.key === "/" && !showSlashMenu) {
        e.preventDefault();
        const { selection } = editor.state;
        const { from, to } = selection;
        const coords = editor.view.coordsAtPos(from);
        const editorElement = editor.view.dom;
        const editorRect = editorElement.getBoundingClientRect();
        const parentContainer =
          editorElement.closest(".relative") || document.body;
        const parentRect = parentContainer.getBoundingClientRect();
        let x = coords.left - parentRect.left + editorElement.scrollLeft;
        let y = coords.bottom - parentRect.top + editorElement.scrollTop + 5;
        const menuWidth = 200;
        const menuHeight = 250;
        const maxX = editorRect.width - menuWidth;
        const maxY = editorRect.height - menuHeight;
        if (x + menuWidth > editorRect.right - parentRect.left) {
          x = Math.max(0, editorRect.right - parentRect.left - menuWidth - 10);
        }
        if (y + menuHeight > editorRect.bottom - parentRect.top) {
          y =
            coords.top -
            parentRect.top +
            editorElement.scrollTop -
            menuHeight -
            5;
        }
        setShowSlashMenu(true);
        setSlashQuery("");
        setSlashRange({ from: from - 1, to });
        setSlashMenuPosition({ x, y });
      }
      if (showSlashMenu) {
        if (e.key === "Escape") {
          e.preventDefault();
          setShowSlashMenu(false);
          setSlashQuery("");
          setSlashRange(null);
        } else if (e.key === "Enter") {
          e.preventDefault();
          const commands = [
            {
              label: "Heading 1",
              key: "h1",
              description: "Large section heading",
              command: () =>
                editor
                  .chain()
                  .focus()
                  .deleteRange(slashRange)
                  .toggleHeading({ level: 1 })
                  .run(),
            },
            {
              label: "Heading 2",
              key: "h2",
              description: "Medium section heading",
              command: () =>
                editor
                  .chain()
                  .focus()
                  .deleteRange(slashRange)
                  .toggleHeading({ level: 2 })
                  .run(),
            },
            {
              label: "Heading 3",
              key: "h3",
              description: "Small section heading",
              command: () =>
                editor
                  .chain()
                  .focus()
                  .deleteRange(slashRange)
                  .toggleHeading({ level: 3 })
                  .run(),
            },
            {
              label: "Bullet List",
              key: "bullet",
              description: "Create a bullet list",
              command: () =>
                editor
                  .chain()
                  .focus()
                  .deleteRange(slashRange)
                  .toggleBulletList()
                  .run(),
            },
            {
              label: "Numbered List",
              key: "numbered",
              description: "Create a numbered list",
              command: () =>
                editor
                  .chain()
                  .focus()
                  .deleteRange(slashRange)
                  .toggleOrderedList()
                  .run(),
            },
            {
              label: "Quote",
              key: "quote",
              description: "Create a blockquote",
              command: () =>
                editor
                  .chain()
                  .focus()
                  .deleteRange(slashRange)
                  .toggleBlockquote()
                  .run(),
            },
            {
              label: "Code Block",
              key: "code",
              description: "Create a code block",
              command: () =>
                editor
                  .chain()
                  .focus()
                  .deleteRange(slashRange)
                  .toggleCodeBlock()
                  .run(),
            },
            {
              label: "Horizontal Rule",
              key: "hr",
              description: "Add a horizontal divider",
              command: () =>
                editor
                  .chain()
                  .focus()
                  .deleteRange(slashRange)
                  .setHorizontalRule()
                  .run(),
            },
          ].filter(
            (item) =>
              !slashQuery ||
              item.label.toLowerCase().includes(slashQuery.toLowerCase()) ||
              item.key.toLowerCase().includes(slashQuery.toLowerCase())
          );
          if (commands.length > 0) {
            commands[0].command();
            setShowSlashMenu(false);
            setSlashQuery("");
            setSlashRange(null);
          }
        } else if (e.key === "Backspace") {
          e.preventDefault();
          setSlashQuery((prev) => prev.slice(0, -1));
        } else if (e.key.length === 1 && /[a-zA-Z0-9]/.test(e.key)) {
          e.preventDefault();
          setSlashQuery((prev) => prev + e.key);
        }
      }
    };
    const editorElement = editor.view.dom;
    editorElement.addEventListener("keydown", handleKeyDown);
    return () => {
      editorElement.removeEventListener("keydown", handleKeyDown);
    };
  }, [editor, handleSave, showSlashMenu, slashQuery, slashRange]);

  useEffect(() => {
    if (!editor) return;
    const updateSlashMenu = () => {
      const slashPlugin = editor.state.plugins.find(
        (plugin) => plugin.spec.key && plugin.spec.key.key === "slashCommands$"
      );
      if (!slashPlugin) {
        console.warn("SlashCommands plugin not found");
        return;
      }
      const pluginState = slashPlugin.getState(editor.state);
      if (pluginState.active && showSlashMenu) {
        setSlashQuery(pluginState.query);
        setSlashRange(pluginState.range);
      } else if (!pluginState.active && showSlashMenu) {
        setShowSlashMenu(false);
        setSlashQuery("");
        setSlashRange(null);
      }
    };
    editor.on("update", updateSlashMenu);
    return () => {
      editor.off("update", updateSlashMenu);
    };
  }, [editor, showSlashMenu]);

  if (!editor) {
    return (
      <div className="w-full max-w-5xl mx-auto bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-600">
              Loading Enhanced Tiptap Editor...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="my-3 flex bg-gray-50">
      <style>{`
        .ProseMirror .is-editor-empty::before,
        .ProseMirror .is-empty::before {
          color: #9ca3af !important;
          content: attr(data-placeholder) !important;
          float: left;
          height: 0;
          pointer-events: none;
          font-style: italic;
          opacity: 1 !important;
        }
        .ProseMirror p:not(:first-child).is-empty::before,
        .ProseMirror p:not(:first-child).is-editor-empty::before {
          display: none !important;
        }
        .ProseMirror p:first-child.is-empty::before,
        .ProseMirror p:first-child.is-editor-empty::before {
          display: block !important;
          color: #9ca3af !important;
          content: attr(data-placeholder) !important;
          float: left;
          height: 0;
          pointer-events: none;
          font-style: italic;
          opacity: 1 !important;
        }
        .ProseMirror h1.is-empty::before,
        .ProseMirror h2.is-empty::before,
        .ProseMirror h3.is-empty::before,
        .ProseMirror h4.is-empty::before,
        .ProseMirror h5.is-empty::before,
        .ProseMirror h6.is-empty::before,
        .ProseMirror li.is-empty::before,
        .ProseMirror blockquote.is-empty::before {
          display: none !important;
        }
        .variable-highlight {
          position: relative;
          padding: 2px 4px;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s ease;
          font-weight: 500;
          border: 1px solid transparent;
        }
        .variable-highlight.known-variable {
          background-color: #dbeafe;
          color: #1e40af;
          border-color: #93c5fd;
        }
        .variable-highlight.unknown-variable {
          background-color: #fef3c7;
          color: #92400e;
          border-color: #fbbf24;
        }
        .variable-highlight.applied-variable {
          background-color: #d1fae5;
          color: #065f46;
          border-color: #6ee7b7;
          font-weight: 600;
        }
        .variable-highlight:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .variable-highlight.known-variable:hover {
          background-color: #bfdbfe;
          border-color: #60a5fa;
        }
        .variable-highlight.unknown-variable:hover {
          background-color: #fde68a;
          border-color: #f59e0b;
        }
        .variable-highlight.applied-variable:hover {
          background-color: #a7f3d0;
          border-color: #34d399;
        }
        .variable-highlight-pulse {
          animation: variablePulse 2s ease-in-out;
        }
        @keyframes variablePulse {
          0%, 100% {
            background-color: #dbeafe;
          }
          50% {
            background-color: #3b82f6;
            color: white;
          }
        }
        .slash-menu {
          position: absolute;
          z-index: 9999;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
            0 2px 4px -1px rgba(0, 0, 0, 0.06);
          min-width: 200px;
          max-height: 250px;
          overflow-y: auto;
        }
      `}</style>

      <div
        className={`flex-1 ${
          showVariablesPanel ? "mr-2" : ""
        } transition-all duration-300`}
      >
        <div className="w-full mx-auto bg-white shadow-lg border border-gray-200 overflow-hidden h-full">
          <EditorHeader
            documentTitle={documentTitle}
            editor={editor}
            onSave={handleSave}
            onSaveAs={handleSaveAs}
            onExportPDF={handleExportPDF}
            onExportDOCX={handleExportDOCX}
            onImportWord={handleImportWord}
            onImportPDF={handleImportPDF}
          />
          <EditorToolbar
            editor={editor}
            content={editorContent}
            editorState={editorState}
            updateEditorState={updateEditorState}
            showTableMenu={showTableMenu}
            setShowTableMenu={setShowTableMenu}
            tableRows={tableRows}
            setTableRows={setTableRows}
            tableCols={tableCols}
            setTableCols={setTableCols}
            tableWithHeader={tableWithHeader}
            setTableWithHeader={setTableWithHeader}
            setShowLinkModal={setShowLinkModal}
            setShowImageModal={setShowImageModal}
            setShowCustomFontSizeInput={setShowCustomFontSizeInput}
          />
          <div className="relative bg-white w-[60vw]">
            <div className="h-[65vh] overflow-y-auto px-8 py-6 w-full">
              <EditorContent editor={editor} key={contentUpdateTrigger} />
              <SelectionToolbar
                editor={editor}
                onSummarize={handleSummarizeText}
                onImproveWriting={handleImproveWriting}
              />
              {showSlashMenu && slashRange && (
                <div
                  className="slash-menu w-[600px]"
                  style={{
                    left: `${slashMenuPosition.x}px`,
                    top: `${slashMenuPosition.y}px`,
                    width: "305px",
                  }}
                >
                  <div className="text-xs text-gray-400 p-2 border-b border-gray-100">
                    Debug: Query="{slashQuery}" Range={slashRange?.from}-
                    {slashRange?.to}
                  </div>
                  {typeof SlashCommandMenu !== "undefined" ? (
                    <SlashCommandMenu
                      editor={editor}
                      range={slashRange}
                      query={slashQuery}
                      onSelect={() => {
                        setShowSlashMenu(false);
                        setSlashQuery("");
                        setSlashRange(null);
                      }}
                    />
                  ) : (
                    <div className="p-2 w-[300px]">
                      <div className="text-sm text-gray-600 p-2 border-b border-gray-100 mb-2">
                        Slash Commands{" "}
                        {slashQuery && `(filtering: "${slashQuery}")`}
                      </div>
                      {(() => {
                        const commands = [
                          {
                            label: "Heading 1",
                            key: "h1",
                            description: "Large section heading",
                            command: () => {
                              editor
                                .chain()
                                .focus()
                                .deleteRange(slashRange)
                                .toggleHeading({ level: 1 })
                                .run();
                            },
                          },
                          {
                            label: "Heading 2",
                            key: "h2",
                            description: "Medium section heading",
                            command: () => {
                              editor
                                .chain()
                                .focus()
                                .deleteRange(slashRange)
                                .toggleHeading({ level: 2 })
                                .run();
                            },
                          },
                          {
                            label: "Heading 3",
                            key: "h3",
                            description: "Small section heading",
                            command: () => {
                              editor
                                .chain()
                                .focus()
                                .deleteRange(slashRange)
                                .toggleHeading({ level: 3 })
                                .run();
                            },
                          },
                          {
                            label: "Bullet List",
                            key: "bullet",
                            description: "Create a bullet list",
                            command: () => {
                              editor
                                .chain()
                                .focus()
                                .deleteRange(slashRange)
                                .toggleBulletList()
                                .run();
                            },
                          },
                          {
                            label: "Numbered List",
                            key: "numbered",
                            description: "Create a numbered list",
                            command: () => {
                              editor
                                .chain()
                                .focus()
                                .deleteRange(slashRange)
                                .toggleOrderedList()
                                .run();
                            },
                          },
                          {
                            label: "Quote",
                            key: "quote",
                            description: "Create a blockquote",
                            command: () => {
                              editor
                                .chain()
                                .focus()
                                .deleteRange(slashRange)
                                .toggleBlockquote()
                                .run();
                            },
                          },
                          {
                            label: "Code Block",
                            key: "code",
                            description: "Create a code block",
                            command: () => {
                              editor
                                .chain()
                                .focus()
                                .deleteRange(slashRange)
                                .toggleCodeBlock()
                                .run();
                            },
                          },
                          {
                            label: "Horizontal Rule",
                            key: "hr",
                            description: "Add a horizontal divider",
                            command: () => {
                              editor
                                .chain()
                                .focus()
                                .deleteRange(slashRange)
                                .setHorizontalRule()
                                .run();
                            },
                          },
                        ];
                        const filteredCommands = commands.filter(
                          (item) =>
                            !slashQuery ||
                            item.label
                              .toLowerCase()
                              .includes(slashQuery.toLowerCase()) ||
                            item.key
                              .toLowerCase()
                              .includes(slashQuery.toLowerCase())
                        );
                        return filteredCommands.length > 0 ? (
                          filteredCommands.map((item, index) => (
                            <button
                              key={index}
                              onClick={() => {
                                try {
                                  item.command();
                                  setShowSlashMenu(false);
                                  setSlashQuery("");
                                  setSlashRange(null);
                                } catch (error) {
                                  console.error(
                                    "Error executing command:",
                                    item.label,
                                    error
                                  );
                                }
                              }}
                              className="w-full text-left px-3 py-2 hover:bg-blue-50 hover:text-blue-700 rounded text-sm flex flex-col"
                            >
                              <span className="font-medium">{item.label}</span>
                              <span className="text-xs text-gray-500">
                                {item.description}
                              </span>
                            </button>
                          ))
                        ) : (
                          <div className="px-3 py-2 text-sm text-gray-500">
                            No commands found for "{slashQuery}"
                          </div>
                        );
                      })()}
                      <div className="text-xs text-gray-400 p-2 border-t border-gray-100 mt-2">
                        Type to filter commands, click to execute
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            {/* <AIFloatingWindow
              isOpen={showAIFloatingWindow}
              onClose={() => setShowAIFloatingWindow(false)}
              onInsert={handleInsertContent}
            /> */}

            <AIFloatingWindow
              isOpen={showAIFloatingWindow}
              onClose={() => setShowAIFloatingWindow(false)}
              onInsert={handleInsertContent}
              // workspaceId={workspaceId}
              // availableDocuments={availableDocuments}
            />
          </div>
          <EditorFooter editor={editor} />
          <EditorModals
            showSaveAsModal={showSaveAsModal}
            setShowSaveAsModal={setShowSaveAsModal}
            saveAsTitle={saveAsTitle}
            setSaveAsTitle={setSaveAsTitle}
            onConfirmSaveAs={(title) => {
              setDocumentTitle(title);
              setShowSaveAsModal(false);
              setSaveAsTitle("");
              handleSave();
            }}
            showCustomFontSizeInput={showCustomFontSizeInput}
            setShowCustomFontSizeInput={setShowCustomFontSizeInput}
            customFontSize={customFontSize}
            setCustomFontSize={setCustomFontSize}
            onApplyCustomFontSize={(size) => {
              if (editor) {
                editor.chain().focus().setFontSize(size).run();
              }
              setShowCustomFontSizeInput(false);
              setCustomFontSize("");
            }}
            showLinkModal={showLinkModal}
            setShowLinkModal={setShowLinkModal}
            linkUrl={linkUrl}
            setLinkUrl={setLinkUrl}
            onSetLink={(url) => {
              if (!editor) return;
              if (url === "") {
                editor
                  .chain()
                  .focus()
                  .extendMarkRange("link")
                  .unsetLink()
                  .run();
              } else {
                editor
                  .chain()
                  .focus()
                  .extendMarkRange("link")
                  .setLink({ href: url })
                  .run();
              }
              setShowLinkModal(false);
              setLinkUrl("");
            }}
            showImageModal={showImageModal}
            setShowImageModal={setShowImageModal}
            imageUrl={imageUrl}
            setImageUrl={setImageUrl}
            onAddImage={(url) => {
              if (editor && url) {
                editor.chain().focus().setImage({ src: url }).run();
              }
              setShowImageModal(false);
              setImageUrl("");
            }}
          />
        </div>
      </div>

      {!showVariablesPanel && (
        <button
          onClick={() => setShowVariablesPanel(true)}
          className="fixed top-20 right-4 z-50 flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-full shadow-lg hover:bg-blue-700 transition-all duration-300"
          title="Open Variables Panel"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4v16m8-8H4"
            />
          </svg>
          <span>Open Panel</span>
        </button>
      )}

      {showVariablesPanel && (
        <div className="h-screen bg-white border-l border-gray-200 flex flex-col shadow-lg rounded-md">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900">
                Document Variables
              </h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleClearAllVariables}
                  disabled={currentVariables.length === 0}
                  className="px-2 py-1 text-xs bg-red-100 text-red-700 border border-red-300 rounded-md hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                  title="Clear all variables and remove highlighting"
                >
                  <svg
                    className="w-3 h-3"
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
                  <span>Delete All</span>
                </button>

                <button
                  onClick={() => setShowVariablesPanel(false)}
                  className="p-1 text-gray-400 hover:text-gray-600"
                  title="Close Variables Panel (Ctrl+V)"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>
            <div className="space-y-3">
              <div className="relative">
                {/* <button
                  onClick={() => setShowDocumentMenu(!showDocumentMenu)}
                  className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-left"
                >
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-gray-500" />
                    <span className="text-sm truncate">
                      {selectedDocument?.filename || "Select from Datahub"}
                    </span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button> */}
                <button
                  onClick={() => {
                    setShowDocumentMenu(!showDocumentMenu);
                    fetchDocuments(currentFolderId);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-left"
                >
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-gray-500" />
                    <span className="text-sm truncate">
                      {selectedDocument?.filename || "Select from Datahub"}
                      {folderPath.length > 0 &&
                        ` (in ${folderPath.map((f) => f.name).join("/")})`}
                    </span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>
                {/* {showDocumentMenu && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10 max-h-48 overflow-y-auto">
                    {availableDocuments.length > 0 ? (
                      availableDocuments.map((doc) => (
                        <button
                          key={doc.s3_key_original}
                          onClick={() => {
                            setSelectedDocument(doc);
                            setShowDocumentMenu(false);
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm border-b border-gray-100 last:border-b-0"
                        >
                          {doc.filename}
                        </button>
                      ))
                    ) : (
                      <div className="px-3 py-2 text-sm text-gray-500">
                        No documents found
                      </div>
                    )}
                  </div>
                )} */}

                {showDocumentMenu && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10 max-h-96 overflow-y-auto">
                    {folderPath.length > 0 && (
                      <button
                        onClick={() => {
                          const newPath = [...folderPath];
                          newPath.pop();
                          setFolderPath(newPath);
                          fetchDocuments(
                            newPath.length > 0
                              ? newPath[newPath.length - 1].id
                              : null
                          );
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm border-b border-gray-100 flex items-center"
                      >
                        <span className="mr-2">←</span> Back
                      </button>
                    )}

                    {availableDocuments.length > 0 ? (
                      availableDocuments.map((item) => (
                        <div key={item.id || item.s3_key_original}>
                          {item.type === "folder" ? (
                            <button
                              onClick={() => {
                                setFolderPath([
                                  ...folderPath,
                                  { id: item.id, name: item.filename },
                                ]);
                                fetchDocuments(item.id);
                              }}
                              className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm border-b border-gray-100 flex items-center"
                            >
                              <span className="mr-2">📁</span>
                              {item.filename}
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                setSelectedDocument(item);
                                setShowDocumentMenu(false);
                              }}
                              className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm border-b border-gray-100 flex items-center"
                            >
                              <span className="mr-2">📄</span>
                              {item.filename}
                            </button>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="px-3 py-2 text-sm text-gray-500">
                        No documents found
                      </div>
                    )}
                  </div>
                )}
              </div>
              <SelectTemplate
                setEditorContent={setEditorContent}
                setDocumentTitle={setDocumentTitle}
                setCurrentVariables={setCurrentVariables}
              />
              <SelectDrafting
                setEditorContent={setEditorContent}
                setDocumentTitle={setDocumentTitle}
                setCurrentVariables={setCurrentVariables}
              />
              <button
                onClick={() => handleServerDocumentSelect()}
                disabled={!selectedDocument || isImporting}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isImporting && selectedDocument ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Importing...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>Import Document</span>
                  </>
                )}
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isImporting}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isImporting && !selectedDocument ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Importing...</span>
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4" />
                    <span>Upload Document</span>
                  </>
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".docx"
                onChange={handleFileSelect}
                className="hidden"
              />
              <button
                onClick={() => setShowCustomVariableInput(true)}
                disabled={
                  currentVariables.length === 0 || showCustomVariableInput
                }
                className="w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Custom Variable</span>
              </button>
              {showCustomVariableInput && (
                <div className="flex flex-col space-y-2">
                  <input
                    type="text"
                    value={newVariableName}
                    onChange={(e) => setNewVariableName(e.target.value)}
                    placeholder="Enter variable name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={handleAddCustomVariable}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center justify-center space-x-2"
                    >
                      <Check className="w-4 h-4" />
                      <span>Confirm</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowCustomVariableInput(false);
                        setNewVariableName("");
                      }}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center justify-center space-x-2"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                      <span>Cancel</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-3">
              {currentVariables.length > 0 ? (
                currentVariables.map((variable) => (
                  <div
                    key={variable.unique_id}
                    className={`bg-gray-50 rounded-lg p-3 transition-all duration-300 ${
                      highlightedVariable === variable.unique_id
                        ? "bg-blue-100 border-2 border-blue-300 shadow-lg transform scale-105"
                        : "border border-transparent"
                    }`}
                    data-variable-id={variable.unique_id}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-gray-700">
                        {variable.label}
                      </label>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() =>
                            handleClearSpecificVariable(variable.unique_id)
                          }
                          className="p-1 text-red-400 hover:text-red-600"
                          title="Remove this variable"
                        >
                          <svg
                            className="w-4 h-4"
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
                        {editingVariable === variable.unique_id ? (
                          <button
                            onClick={() => saveVariableEdit(variable.unique_id)}
                            className="p-1 text-green-600 hover:text-green-700"
                            title="Save"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() =>
                              setEditingVariable(variable.unique_id)
                            }
                            className="p-1 text-gray-400 hover:text-gray-600"
                            title="Edit"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                    {editingVariable === variable.unique_id ? (
                      variable.type === "date" ? (
                        <input
                          type="date"
                          value={
                            editingValues[variable.unique_id] ||
                            variableValues[variable.unique_id] ||
                            ""
                          }
                          onChange={(e) =>
                            handleVariableChange(
                              variable.unique_id,
                              e.target.value
                            )
                          }
                          ref={(el) =>
                            (inputRefs.current[variable.unique_id] = el)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      ) : variable.type === "decimal" ? (
                        <input
                          type="number"
                          step="0.01"
                          value={
                            editingValues[variable.unique_id] ||
                            variableValues[variable.unique_id] ||
                            ""
                          }
                          onChange={(e) =>
                            handleVariableChange(
                              variable.unique_id,
                              e.target.value
                            )
                          }
                          ref={(el) =>
                            (inputRefs.current[variable.unique_id] = el)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        <input
                          type="text"
                          value={
                            editingValues[variable.unique_id] ||
                            variableValues[variable.unique_id] ||
                            ""
                          }
                          onChange={(e) =>
                            handleVariableChange(
                              variable.unique_id,
                              e.target.value
                            )
                          }
                          ref={(el) =>
                            (inputRefs.current[variable.unique_id] = el)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      )
                    ) : (
                      <div className="px-3 py-2 bg-white border border-gray-200 rounded-md text-sm min-h-[40px] flex items-center">
                        <span className="break-words">
                          {variableValues[variable.unique_id] ||
                            `{{${variable.unique_id}}}`}
                        </span>
                      </div>
                    )}
                    <div className="mt-2 text-xs text-gray-500">
                      Type: {variable.type} | ID: {variable.unique_id} | Status:{" "}
                      {placeholderStatus[variable.unique_id] || "Unknown"}
                    </div>
                    {placeholderStatus[variable.unique_id] === "Missing" && (
                      <button
                        onClick={() => {
                          if (editor) {
                            const placeholder = `{{${variable.unique_id}}}`;
                            editor
                              .chain()
                              .focus()
                              .insertContent(placeholder)
                              .run();
                            setPlaceholderStatus((prev) => ({
                              ...prev,
                              [variable.unique_id]: "Found",
                            }));
                          }
                        }}
                        className="mt-2 w-full px-2 py-1 text-xs text-blue-600 hover:text-blue-800 border border-blue-300 hover:border-blue-500 rounded-md flex items-center justify-center space-x-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>
                          Insert {`{{${variable.unique_id}}}`} Placeholder
                        </span>
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-sm text-gray-500 text-center">
                  No variables defined. Import a .docx document to add
                  variables.
                </div>
              )}
            </div>
            {currentVariables.length > 0 && (
              <div className="mt-4">
                <button
                  onClick={handleApplyAllVariables}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center justify-center space-x-2"
                >
                  <Check className="w-4 h-4" />
                  <span>Apply All Variables</span>
                </button>
                <button
                  onClick={() => {
                    const confirmClear = window.confirm(
                      "Clear all variable values but keep definitions?"
                    );
                    if (confirmClear) {
                      const clearedValues = {};
                      currentVariables.forEach((v) => {
                        clearedValues[v.unique_id] = "";
                      });
                      setVariableValues(clearedValues);
                      setEditingValues({});
                      alert("All variable values cleared!");
                    }
                  }}
                  className="w-full px-4 py-2 mt-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center justify-center space-x-2"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414 6.414a2 2 0 001.414.586H19a2 2 0 002-2V7a2 2 0 00-2-2h-8.172a2 2 0 00-1.414.586L3 12z"
                    />
                  </svg>
                  <span>Clear All Values</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TiptapEditor;
