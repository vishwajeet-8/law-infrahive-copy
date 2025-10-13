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
  Link as LinkIcon,
  Image as ImageIcon,
  Type,
  Minus,
  Hash,
  Table as TableIcon,
  ChevronDown,
  Trash2,
  Settings,
  Heading1,
  Heading2,
  Heading3,
  FileText,
  Plus,
  Palette,
  Save,
  Download,
  FileDown,
  FolderOpen,
  File,
} from "lucide-react";

// Custom Font Size Extension
const FontSize = Extension.create({
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
              element.style.fontSize.replace(/['"]+/g, ""),
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

// Slash Commands Extension
const SlashCommands = Extension.create({
  name: "slashCommands",

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey("slashCommands"),
        state: {
          init() {
            return {
              active: false,
              range: null,
              query: "",
            };
          },
          apply(tr, prev) {
            const { selection } = tr;
            const { from, to } = selection;
            const text = tr.doc.textBetween(from - 1, to, "\0");

            if (text === "/") {
              return {
                active: true,
                range: { from: from - 1, to },
                query: "",
              };
            }

            if (prev.active) {
              const slashIndex = tr.doc
                .textBetween(from - 10, from, "\0")
                .lastIndexOf("/");
              if (slashIndex !== -1) {
                const query = tr.doc.textBetween(
                  from - 10 + slashIndex + 1,
                  from,
                  "\0"
                );
                if (query.includes(" ") || query.length > 20) {
                  return { active: false, range: null, query: "" };
                }
                return {
                  active: true,
                  range: { from: from - 10 + slashIndex, to: from },
                  query,
                };
              }
            }

            return { active: false, range: null, query: "" };
          },
        },
        props: {
          decorations(state) {
            const { active } = this.getState(state);
            return active ? DecorationSet.empty : null;
          },
        },
      }),
    ];
  },
});

// Slash Menu Component
const SlashMenu = ({ editor, range, query, onSelect }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const menuRef = useRef(null);

  const commands = [
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
      description: "Insert table",
      icon: <TableIcon size={16} />,
      command: () =>
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
          .run(),
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
      description: "Insert image",
      icon: <ImageIcon size={16} />,
      command: () => {
        editor.chain().focus().deleteRange(range).run();
        const url = prompt("Enter image URL:");
        if (url) {
          editor.chain().focus().setImage({ src: url }).run();
        }
      },
      keywords: ["image", "img", "picture", "photo"],
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
          onSelect();
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
        className="absolute z-50 bg-white border border-gray-200 rounded-lg shadow-lg w-72 p-2"
        style={{ transform: "translateY(8px)" }}
      >
        <div className="text-gray-500 text-sm p-2">No commands found</div>
      </div>
    );
  }

  return (
    <div
      ref={menuRef}
      className="absolute z-50 bg-white border border-gray-200 rounded-lg shadow-lg w-72 max-h-64 overflow-y-auto"
      style={{ transform: "translateY(8px)" }}
    >
      <div className="p-2 border-b border-gray-100 text-xs text-gray-500 font-medium">
        {query ? `Commands matching "${query}"` : "Commands"}
      </div>
      {filteredCommands.map((command, index) => (
        <button
          key={command.title}
          onClick={() => {
            command.command();
            onSelect();
          }}
          className={`w-full text-left p-3 hover:bg-gray-50 flex items-center gap-3 transition-colors ${
            index === selectedIndex
              ? "bg-blue-50 border-r-2 border-blue-500"
              : ""
          }`}
        >
          <div className="text-gray-400 flex-shrink-0">{command.icon}</div>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm text-gray-900">
              {command.title}
            </div>
            <div className="text-xs text-gray-500 truncate">
              {command.description}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
};

// Enhanced Font Dropdown Component
const FontDropdown = ({
  value,
  onChange,
  options,
  placeholder,
  icon,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption =
    options.find((opt) => opt.value === value) || options[0];

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <div className="flex items-center gap-2 min-w-0">
          {icon && <span className="text-gray-400 flex-shrink-0">{icon}</span>}
          <span className="truncate" style={selectedOption.style || {}}>
            {selectedOption.label}
          </span>
        </div>
        <ChevronDown
          className={`h-4 w-4 text-gray-400 transition-transform ${
            isOpen ? "transform rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          <div className="p-2 border-b border-gray-100 text-xs text-gray-500 font-medium">
            {placeholder}
          </div>
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center transition-colors ${
                value === option.value
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-900"
              }`}
              style={option.style || {}}
            >
              <span className="truncate">{option.label}</span>
              {value === option.value && (
                <span className="ml-auto text-blue-600">✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const TiptapEditor = () => {
  const [linkUrl, setLinkUrl] = useState("");
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [editorState, setEditorState] = useState({});
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [slashMenuPosition, setSlashMenuPosition] = useState({ x: 0, y: 0 });
  const [slashQuery, setSlashQuery] = useState("");
  const [slashRange, setSlashRange] = useState(null);
  const [showTableMenu, setShowTableMenu] = useState(false);
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);
  const [tableWithHeader, setTableWithHeader] = useState(true);
  const [customFontSize, setCustomFontSize] = useState("");
  const [showCustomFontSizeInput, setShowCustomFontSizeInput] = useState(false);
  const [documentTitle, setDocumentTitle] = useState("Untitled Document");
  const [showSaveAsModal, setShowSaveAsModal] = useState(false);
  const [saveAsTitle, setSaveAsTitle] = useState("");
  const tableMenuRef = useRef(null);

  // Enhanced Font options with better organization
  const fontFamilies = [
    { label: "Default Font", value: "inherit" },
    { label: "Sans Serif Fonts", value: "", disabled: true },
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
      label: "Verdana",
      value: "Verdana, sans-serif",
      style: { fontFamily: "Verdana, sans-serif" },
    },
    { label: "Serif Fonts", value: "", disabled: true },
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
      label: "Playfair Display",
      value: "Playfair Display, serif",
      style: { fontFamily: "Playfair Display, serif" },
    },
    { label: "Monospace Fonts", value: "", disabled: true },
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
    {
      label: "Source Code Pro",
      value: "Source Code Pro, monospace",
      style: { fontFamily: "Source Code Pro, monospace" },
    },
  ];

  const fontSizes = [
    { label: "Default Text", value: "" },
    { label: "6px", value: "6px" },
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
    { label: "42px", value: "42px" },
    { label: "48px", value: "48px" },
    { label: "Custom Size...", value: "custom" },
  ];

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
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
          if (node.type.name === "heading") {
            return `Heading ${node.attrs.level}`;
          }
          return 'Start typing or press "/" for commands...';
        },
      }),
      CharacterCount.configure({
        limit: 10000,
      }),
      SlashCommands,
    ],
    content: `
      <h1>Enhanced Tiptap Editor</h1>
      <p>This is a <em>fully-featured</em> rich text editor with <strong>enhanced font controls</strong>. Try the new features:</p>
      <ul>
        <li><strong>Improved Font Family Picker</strong> - Organized by category with live previews</li>
        <li><strong>Enhanced Font Size Selector</strong> - Preset sizes with custom size option</li>
        <li><strong>Better Visual Feedback</strong> - See font changes as you select them</li>
        <li><strong>Keyboard Navigation</strong> - Use arrow keys in dropdowns</li>
      </ul>
      <h2 style="font-family: Georgia, serif;">Try Different Fonts</h2>
      <p style="font-family: Inter, sans-serif; font-size: 18px;">This paragraph uses Inter font at 18px size.</p>
      <p style="font-family: Times New Roman, serif; font-size: 20px;">This uses Times New Roman at 20px.</p>
      <p style="font-family: Monaco, monospace; font-size: 14px;">And this uses Monaco monospace at 14px.</p>
      <blockquote>
        <p style="font-size: 16px;">Select any text and use the enhanced font controls in the toolbar to change typography instantly!</p>
      </blockquote>
    `,
    editorProps: {
      attributes: {
        class: "prose prose-lg max-w-none focus:outline-none",
      },
    },
    onUpdate: ({ editor }) => {
      console.log("Content updated:", editor.getHTML());
    },
  });

  // Force re-render when editor state changes
  const updateEditorState = useCallback(() => {
    if (!editor) return;

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
  }, [editor]);

  // Update state when editor content or selection changes
  useEffect(() => {
    if (!editor) return;

    const updateState = () => {
      updateEditorState();
    };

    const handleSelectionUpdate = ({ editor }) => {
      const { selection } = editor.state;
      const { from } = selection;
      const textBefore = editor.state.doc.textBetween(
        Math.max(0, from - 10),
        from,
        "\0"
      );
      const slashIndex = textBefore.lastIndexOf("/");

      if (slashIndex !== -1) {
        const query = textBefore.slice(slashIndex + 1);
        if (!query.includes(" ") && query.length <= 20) {
          const { view } = editor;
          const coords = view.coordsAtPos(from);

          setSlashQuery(query);
          setSlashRange({ from: from - query.length - 1, to: from });
          setSlashMenuPosition({ x: coords.left, y: coords.bottom });
          setShowSlashMenu(true);
          return;
        }
      }

      setShowSlashMenu(false);
    };

    editor.on("selectionUpdate", handleSelectionUpdate);
    editor.on("transaction", updateState);
    editor.on("update", updateState);
    editor.on("focus", updateState);

    // Initial state update
    updateState();

    return () => {
      editor.off("selectionUpdate", handleSelectionUpdate);
      editor.off("transaction", updateState);
      editor.off("update", updateState);
      editor.off("focus", updateState);
    };
  }, [editor, updateEditorState]);

  useEffect(() => {
    // Add keyboard shortcuts
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

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
  }, []);

  const MenuButton = ({ onClick, isActive, disabled, children, title }) => (
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
      }`}
    >
      {children}
    </button>
  );

  const MenuDivider = () => <div className="w-px h-6 bg-gray-300 mx-1" />;

  const setLink = useCallback(() => {
    if (!editor) return;

    const previousUrl = editor.getAttributes("link").href;
    setLinkUrl(previousUrl || "");
    setShowLinkModal(true);
  }, [editor]);

  const handleSetLink = () => {
    if (!editor) return;

    if (linkUrl === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    } else {
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: linkUrl })
        .run();
    }

    setShowLinkModal(false);
    setLinkUrl("");
  };

  const addImage = useCallback(() => {
    setShowImageModal(true);
  }, []);

  const handleAddImage = () => {
    if (!editor || !imageUrl) return;

    editor.chain().focus().setImage({ src: imageUrl }).run();
    setShowImageModal(false);
    setImageUrl("");
  };

  const insertTable = () => {
    if (!editor) return;
    editor
      .chain()
      .focus()
      .insertTable({
        rows: tableRows,
        cols: tableCols,
        withHeaderRow: tableWithHeader,
      })
      .run();
    setShowTableMenu(false);
  };

  const deleteTable = () => {
    if (!editor) return;
    editor.chain().focus().deleteTable().run();
    setShowTableMenu(false);
  };

  const addColumnBefore = () => {
    if (!editor) return;
    editor.chain().focus().addColumnBefore().run();
    setShowTableMenu(false);
  };

  const addColumnAfter = () => {
    if (!editor) return;
    editor.chain().focus().addColumnAfter().run();
    setShowTableMenu(false);
  };

  const deleteColumn = () => {
    if (!editor) return;
    editor.chain().focus().deleteColumn().run();
    setShowTableMenu(false);
  };

  const addRowBefore = () => {
    if (!editor) return;
    editor.chain().focus().addRowBefore().run();
    setShowTableMenu(false);
  };

  const addRowAfter = () => {
    if (!editor) return;
    editor.chain().focus().addRowAfter().run();
    setShowTableMenu(false);
  };

  const deleteRow = () => {
    if (!editor) return;
    editor.chain().focus().deleteRow().run();
    setShowTableMenu(false);
  };

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

  const handleCustomFontSize = () => {
    if (!editor || !customFontSize) return;

    let validSize = customFontSize.trim();

    // Add 'px' if no unit is specified and it's a number
    if (/^\d+$/.test(validSize)) {
      validSize += "px";
    }

    // Validate if it's a proper CSS size value
    if (/^(\d+(\.\d+)?(px|em|rem|pt|%)|\d+)$/.test(validSize)) {
      editor.chain().focus().setFontSize(validSize).run();
    }

    setCustomFontSize("");
    setShowCustomFontSizeInput(false);
  };

  // Save and Export Functions
  const handleSave = () => {
    if (!editor) return;

    const content = editor.getHTML();
    const docData = {
      title: documentTitle,
      content: content,
      lastModified: new Date().toISOString(),
    };

    // Save to localStorage for demo purposes
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

    // Show success feedback
    alert(`Document "${documentTitle}" saved successfully!`);
  };

  const handleSaveAs = () => {
    setSaveAsTitle(documentTitle);
    setShowSaveAsModal(true);
  };

  const confirmSaveAs = () => {
    if (!editor || !saveAsTitle.trim()) return;

    const newTitle = saveAsTitle.trim();
    setDocumentTitle(newTitle);

    const content = editor.getHTML();
    const docData = {
      title: newTitle,
      content: content,
      lastModified: new Date().toISOString(),
    };

    const savedDocs = JSON.parse(
      localStorage.getItem("tiptap-documents") || "[]"
    );
    savedDocs.push(docData);
    localStorage.setItem("tiptap-documents", JSON.stringify(savedDocs));

    setShowSaveAsModal(false);
    setSaveAsTitle("");
    alert(`Document saved as "${newTitle}"!`);
  };

  const handleExportPDF = () => {
    if (!editor) return;

    // Create a new window for PDF generation
    const printWindow = window.open("", "_blank");
    const content = editor.getHTML();

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${documentTitle}</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.6;
              color: #374151;
              max-width: 8.5in;
              margin: 0 auto;
              padding: 1in;
              background: white;
            }
            h1 {
              font-size: 2rem;
              font-weight: 700;
              margin: 1.5rem 0 1rem 0;
              line-height: 1.2;
              color: #1f2937;
            }
            h2 {
              font-size: 1.5rem;
              font-weight: 600;
              margin: 1.25rem 0 0.75rem 0;
              line-height: 1.3;
              color: #374151;
            }
            h3 {
              font-size: 1.25rem;
              font-weight: 600;
              margin: 1rem 0 0.5rem 0;
              line-height: 1.4;
              color: #374151;
            }
            p {
              margin: 1rem 0;
              line-height: 1.6;
            }
            ul, ol {
              margin: 1rem 0;
              padding-left: 2rem;
            }
            li {
              margin: 0.5rem 0;
              line-height: 1.6;
            }
            blockquote {
              margin: 1.5rem 0;
              padding: 1rem 1.5rem;
              border-left: 4px solid #3b82f6;
              background: #f8fafc;
              font-style: italic;
              color: #475569;
            }
            pre {
              background: #f1f5f9;
              color: #1f2937;
              font-family: 'Courier New', monospace;
              padding: 1rem;
              border-radius: 0.5rem;
              margin: 1.5rem 0;
              overflow-x: auto;
            }
            code {
              background: #f1f5f9;
              color: #dc2626;
              padding: 0.25rem 0.375rem;
              border-radius: 0.25rem;
              font-family: 'Courier New', monospace;
              font-size: 0.875rem;
            }
            pre code {
              background: transparent;
              color: inherit;
              padding: 0;
            }
            table {
              border-collapse: collapse;
              width: 100%;
              margin: 1.5rem 0;
              border: 1px solid #d1d5db;
            }
            th, td {
              border: 1px solid #d1d5db;
              padding: 0.75rem;
              text-align: left;
              vertical-align: top;
            }
            th {
              background: #f9fafb;
              font-weight: 600;
            }
            hr {
              border: none;
              border-top: 2px solid #e5e7eb;
              margin: 2rem 0;
            }
            img {
              max-width: 100%;
              height: auto;
              margin: 1rem 0;
            }
            @media print {
              body {
                margin: 0;
                padding: 0.5in;
              }
            }
          </style>
        </head>
        <body>
          ${content}
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();

    // Give the content time to load, then trigger print
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  const handleExportDOCX = () => {
    if (!editor) return;

    const content = editor.getHTML();

    // Convert HTML to Word-compatible format
    const wordContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' 
            xmlns:w='urn:schemas-microsoft-com:office:word' 
            xmlns='http://www.w3.org/TR/REC-html40'>
        <head>
          <meta charset='utf-8'>
          <title>${documentTitle}</title>
          <!--[if gte mso 9]>
          <xml>
            <w:WordDocument>
              <w:View>Print</w:View>
              <w:Zoom>90</w:Zoom>
              <w:DoNotPromptForConvert/>
              <w:DoNotShowRevisions/>
              <w:DoNotPrintBodyTextInWordArt/>
              <w:DoNotShowComments/>
              <w:DoNotShowInsertionsAndDeletions/>
              <w:DoNotShowPropertyChanges/>
            </w:WordDocument>
          </xml>
          <![endif]-->
          <style>
            @page {
              size: 8.5in 11in;
              margin: 1in;
            }
            body {
              font-family: Calibri, sans-serif;
              font-size: 11pt;
              line-height: 1.15;
              color: #000000;
            }
            h1 {
              font-size: 18pt;
              font-weight: bold;
              margin: 12pt 0 6pt 0;
              color: #1f4e79;
            }
            h2 {
              font-size: 14pt;
              font-weight: bold;
              margin: 10pt 0 4pt 0;
              color: #2e75b6;
            }
            h3 {
              font-size: 12pt;
              font-weight: bold;
              margin: 8pt 0 4pt 0;
              color: #1f4e79;
            }
            p {
              margin: 6pt 0;
              text-align: justify;
            }
            ul, ol {
              margin: 6pt 0;
              padding-left: 20pt;
            }
            li {
              margin: 3pt 0;
            }
            blockquote {
              margin: 12pt 20pt;
              padding: 8pt 12pt;
              border-left: 3pt solid #cccccc;
              background-color: #f9f9f9;
              font-style: italic;
            }
            table {
              border-collapse: collapse;
              width: 100%;
              margin: 12pt 0;
            }
            th, td {
              border: 1pt solid #000000;
              padding: 4pt 8pt;
              text-align: left;
              vertical-align: top;
            }
            th {
              background-color: #f2f2f2;
              font-weight: bold;
            }
            pre, code {
              font-family: 'Courier New', monospace;
              font-size: 10pt;
            }
            pre {
              background-color: #f5f5f5;
              padding: 8pt;
              margin: 12pt 0;
              border: 1pt solid #cccccc;
            }
            code {
              background-color: #f0f0f0;
              padding: 2pt 4pt;
            }
            hr {
              border: none;
              border-top: 1pt solid #cccccc;
              margin: 12pt 0;
            }
            a {
              color: #0563c1;
              text-decoration: underline;
            }
            strong, b {
              font-weight: bold;
            }
            em, i {
              font-style: italic;
            }
            u {
              text-decoration: underline;
            }
            s, strike {
              text-decoration: line-through;
            }
          </style>
        </head>
        <body>
          ${content}
        </body>
      </html>
    `;

    // Create blob with proper MIME type for Word
    const blob = new Blob(["\ufeff", wordContent], {
      type: "application/msword",
    });

    // Create download link
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${documentTitle}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

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
    <div className="w-full max-w-5xl mx-auto bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold text-gray-900">
                Rich Text Editor
              </h2>
              <div className="flex items-center gap-2">
                <MenuButton onClick={handleSave} title="Save Document (Ctrl+S)">
                  <Save size={16} />
                </MenuButton>
                <MenuButton onClick={handleSaveAs} title="Save As New Document">
                  <FolderOpen size={16} />
                </MenuButton>
                <div className="relative group">
                  <MenuButton title="Export Options">
                    <Download size={16} />
                  </MenuButton>
                  <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <button
                      onClick={handleExportPDF}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2 border-b border-gray-100"
                    >
                      <FileDown size={14} />
                      Export as PDF
                    </button>
                    <button
                      onClick={handleExportDOCX}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                    >
                      <FileText size={14} />
                      Export as Docx
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Full-featured editor with enhanced font controls and typography •
              Document: {documentTitle}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
              {editor.storage.characterCount.characters()}/
              {editor.extensionManager.extensions.find(
                (ext) => ext.name === "characterCount"
              )?.options.limit || "∞"}{" "}
              chars
            </span>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
              {editor.storage.characterCount.words()} words
            </span>
          </div>
        </div>
      </div>

      {/* Enhanced Toolbar */}
      <div className="sticky top-0 z-10 border-b border-gray-200 bg-white/95 backdrop-blur-sm shadow-sm">
        <div className="px-6 py-4 space-y-3">
          {/* First Row - Core Editing Tools */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* History Group */}
              <div className="flex items-center gap-1 px-2 py-1 bg-gray-50 rounded-lg">
                <MenuButton
                  onClick={() => editor.chain().focus().undo().run()}
                  disabled={!editor.can().chain().focus().undo().run()}
                  title="Undo (Cmd+Z)"
                  className="p-2 hover:bg-white rounded transition-colors"
                >
                  <Undo size={16} />
                </MenuButton>

                <MenuButton
                  onClick={() => editor.chain().focus().redo().run()}
                  disabled={!editor.can().chain().focus().redo().run()}
                  title="Redo (Cmd+Shift+Z)"
                  className="p-2 hover:bg-white rounded transition-colors"
                >
                  <Redo size={16} />
                </MenuButton>
              </div>

              {/* Font Controls Group */}
              <div className="flex items-center gap-3">
                <FontDropdown
                  value={editorState.fontFamily}
                  onChange={handleFontFamilyChange}
                  options={fontFamilies.filter((font) => !font.disabled)}
                  placeholder="Select Font Family"
                  icon={<Type size={16} />}
                  className="min-w-[180px] h-10"
                />

                <FontDropdown
                  value={editorState.fontSize}
                  onChange={handleFontSizeChange}
                  options={fontSizes}
                  placeholder="Size"
                  //   icon={<Palette size={16} />}
                  className="w-[120px] h-10"
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
                placeholder="Heading"
                icon={<Hash size={16} />}
                className="min-w-[140px] h-10"
              />

              {/* Text Formatting Group */}
              <div className="flex items-center gap-1 px-2 py-1 bg-gray-50 rounded-lg">
                <MenuButton
                  onClick={() => editor.chain().focus().toggleBold().run()}
                  isActive={editorState.bold}
                  title="Bold (Cmd+B)"
                  className={`p-2 rounded transition-colors ${
                    editorState.bold
                      ? "bg-blue-100 text-blue-600"
                      : "hover:bg-white"
                  }`}
                >
                  <Bold size={16} />
                </MenuButton>

                <MenuButton
                  onClick={() => editor.chain().focus().toggleItalic().run()}
                  isActive={editorState.italic}
                  title="Italic (Cmd+I)"
                  className={`p-2 rounded transition-colors ${
                    editorState.italic
                      ? "bg-blue-100 text-blue-600"
                      : "hover:bg-white"
                  }`}
                >
                  <Italic size={16} />
                </MenuButton>

                <MenuButton
                  onClick={() => editor.chain().focus().toggleUnderline().run()}
                  isActive={editorState.underline}
                  title="Underline (Cmd+U)"
                  className={`p-2 rounded transition-colors ${
                    editorState.underline
                      ? "bg-blue-100 text-blue-600"
                      : "hover:bg-white"
                  }`}
                >
                  <UnderlineIcon size={16} />
                </MenuButton>

                <MenuButton
                  onClick={() => editor.chain().focus().toggleStrike().run()}
                  isActive={editorState.strike}
                  title="Strikethrough"
                  className={`p-2 rounded transition-colors ${
                    editorState.strike
                      ? "bg-blue-100 text-blue-600"
                      : "hover:bg-white"
                  }`}
                >
                  <Strikethrough size={16} />
                </MenuButton>

                <MenuButton
                  onClick={() => editor.chain().focus().toggleCode().run()}
                  isActive={editorState.code}
                  title="Inline Code"
                  className={`p-2 rounded transition-colors ${
                    editorState.code
                      ? "bg-blue-100 text-blue-600"
                      : "hover:bg-white"
                  }`}
                >
                  <Code size={16} />
                </MenuButton>
              </div>
            </div>

            {/* Settings - Right aligned */}
            <MenuButton
              title="Editor Settings"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Settings size={18} />
            </MenuButton>
          </div>

          {/* Second Row - Structure & Media Tools */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Lists Group */}
              <div className="flex items-center gap-1 px-2 py-1 bg-gray-50 rounded-lg">
                <MenuButton
                  onClick={() =>
                    editor.chain().focus().toggleBulletList().run()
                  }
                  isActive={editorState.bulletList}
                  title="Bullet List"
                  className={`p-2 rounded transition-colors ${
                    editorState.bulletList
                      ? "bg-blue-100 text-blue-600"
                      : "hover:bg-white"
                  }`}
                >
                  <List size={16} />
                </MenuButton>

                <MenuButton
                  onClick={() =>
                    editor.chain().focus().toggleOrderedList().run()
                  }
                  isActive={editorState.orderedList}
                  title="Numbered List"
                  className={`p-2 rounded transition-colors ${
                    editorState.orderedList
                      ? "bg-blue-100 text-blue-600"
                      : "hover:bg-white"
                  }`}
                >
                  <ListOrdered size={16} />
                </MenuButton>
              </div>

              {/* Blocks Group */}
              <div className="flex items-center gap-1 px-2 py-1 bg-gray-50 rounded-lg">
                <MenuButton
                  onClick={() =>
                    editor.chain().focus().toggleBlockquote().run()
                  }
                  isActive={editorState.blockquote}
                  title="Blockquote"
                  className={`p-2 rounded transition-colors ${
                    editorState.blockquote
                      ? "bg-blue-100 text-blue-600"
                      : "hover:bg-white"
                  }`}
                >
                  <Quote size={16} />
                </MenuButton>

                <MenuButton
                  onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                  isActive={editorState.codeBlock}
                  title="Code Block"
                  className={`p-2 rounded transition-colors ${
                    editorState.codeBlock
                      ? "bg-blue-100 text-blue-600"
                      : "hover:bg-white"
                  }`}
                >
                  <Hash size={16} />
                </MenuButton>
              </div>

              {/* Alignment Group */}
              <div className="flex items-center gap-1 px-2 py-1 bg-gray-50 rounded-lg">
                <MenuButton
                  onClick={() =>
                    editor.chain().focus().setTextAlign("left").run()
                  }
                  isActive={editorState.textAlignLeft}
                  title="Align Left"
                  className={`p-2 rounded transition-colors ${
                    editorState.textAlignLeft
                      ? "bg-blue-100 text-blue-600"
                      : "hover:bg-white"
                  }`}
                >
                  <AlignLeft size={16} />
                </MenuButton>

                <MenuButton
                  onClick={() =>
                    editor.chain().focus().setTextAlign("center").run()
                  }
                  isActive={editorState.textAlignCenter}
                  title="Align Center"
                  className={`p-2 rounded transition-colors ${
                    editorState.textAlignCenter
                      ? "bg-blue-100 text-blue-600"
                      : "hover:bg-white"
                  }`}
                >
                  <AlignCenter size={16} />
                </MenuButton>

                <MenuButton
                  onClick={() =>
                    editor.chain().focus().setTextAlign("right").run()
                  }
                  isActive={editorState.textAlignRight}
                  title="Align Right"
                  className={`p-2 rounded transition-colors ${
                    editorState.textAlignRight
                      ? "bg-blue-100 text-blue-600"
                      : "hover:bg-white"
                  }`}
                >
                  <AlignRight size={16} />
                </MenuButton>
              </div>

              {/* Media Group */}
              <div className="flex items-center gap-1 px-2 py-1 bg-gray-50 rounded-lg">
                <MenuButton
                  onClick={setLink}
                  isActive={editorState.link}
                  title="Add Link (Cmd+K)"
                  className={`p-2 rounded transition-colors ${
                    editorState.link
                      ? "bg-blue-100 text-blue-600"
                      : "hover:bg-white"
                  }`}
                >
                  <LinkIcon size={16} />
                </MenuButton>

                <MenuButton
                  onClick={addImage}
                  title="Add Image"
                  className="p-2 rounded transition-colors hover:bg-white"
                >
                  <ImageIcon size={16} />
                </MenuButton>

                {/* Table Button with Dropdown */}
                <div className="relative" ref={tableMenuRef}>
                  <MenuButton
                    onClick={() => setShowTableMenu(!showTableMenu)}
                    isActive={editorState.table || showTableMenu}
                    title="Table Options"
                    className={`p-2 rounded transition-colors ${
                      editorState.table || showTableMenu
                        ? "bg-blue-100 text-blue-600"
                        : "hover:bg-white"
                    }`}
                  >
                    <TableIcon size={16} />
                  </MenuButton>

                  {showTableMenu && (
                    <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-lg z-50">
                      <div className="p-4 border-b border-gray-100 text-sm text-gray-600 font-medium">
                        Table Options
                      </div>

                      {!editorState.table ? (
                        // Not in table - show insert form
                        <div className="p-4 space-y-4 max-h-[400px] overflow-y-auto">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Rows
                              </label>
                              <input
                                type="number"
                                min="1"
                                max="20"
                                value={tableRows}
                                onChange={(e) =>
                                  setTableRows(parseInt(e.target.value) || 1)
                                }
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Columns
                              </label>
                              <input
                                type="number"
                                min="1"
                                max="10"
                                value={tableCols}
                                onChange={(e) =>
                                  setTableCols(parseInt(e.target.value) || 1)
                                }
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                          </div>

                          <div className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              id="withHeader"
                              checked={tableWithHeader}
                              onChange={(e) =>
                                setTableWithHeader(e.target.checked)
                              }
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label
                              htmlFor="withHeader"
                              className="text-sm text-gray-700"
                            >
                              Include header row
                            </label>
                          </div>

                          <div className="bg-gray-50 p-3 rounded-lg">
                            <div className="text-sm text-gray-600 mb-2">
                              Preview:
                            </div>
                            <div
                              className="grid gap-1"
                              style={{
                                gridTemplateColumns: `repeat(${tableCols}, 1fr)`,
                                maxWidth: "140px",
                              }}
                            >
                              {Array.from(
                                { length: tableRows * tableCols },
                                (_, index) => {
                                  const row = Math.floor(index / tableCols);
                                  const isHeader = tableWithHeader && row === 0;
                                  return (
                                    <div
                                      key={index}
                                      className={`h-5 border border-gray-300 text-xs flex items-center justify-center rounded ${
                                        isHeader
                                          ? "bg-gray-200 font-medium"
                                          : "bg-white"
                                      }`}
                                    >
                                      {isHeader ? "H" : ""}
                                    </div>
                                  );
                                }
                              )}
                            </div>
                            <div className="text-xs text-gray-500 mt-2">
                              {tableRows} × {tableCols}
                              {tableWithHeader ? " (with header)" : ""}
                            </div>
                          </div>

                          <button
                            onClick={insertTable}
                            className="w-full bg-blue-600 text-white text-sm py-2.5 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                          >
                            Insert Table
                          </button>
                        </div>
                      ) : (
                        // In table - show table management options

                        <>
                          <div className="p-3 border-b border-gray-100">
                            <div className="text-sm text-blue-600 font-bold mb-3">
                              Column Actions
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <button
                                onClick={addColumnBefore}
                                className="text-sm px-4 py-2 bg-green-400 hover:bg-green-600 text-black hover:text-green-100 rounded-lg text-left transition-colors"
                              >
                                Add Before
                              </button>
                              <button
                                onClick={addColumnAfter}
                                className="text-sm px-4 py-2 bg-green-400 hover:bg-green-600 text-black hover:text-green-100 rounded-lg text-left transition-colors"
                              >
                                Add After
                              </button>
                              <button
                                onClick={deleteColumn}
                                className="text-sm px-4 py-2 bg-red-600 text-red-100 hover:text-white rounded-lg text-left col-span-2 transition-all"
                              >
                                Delete Column
                              </button>
                            </div>
                          </div>

                          <div className="p-3 border-b border-gray-100">
                            <div className="text-sm text-blue-600 font-bold mb-3">
                              Row Actions
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <button
                                onClick={addRowBefore}
                                className="text-sm px-4 py-2 bg-green-400 hover:bg-green-600 text-black hover:text-green-100 rounded-lg text-left transition-colors"
                              >
                                Add Above
                              </button>
                              <button
                                onClick={addRowAfter}
                                className="text-sm px-4 py-2 bg-green-400 hover:bg-green-600 text-black hover:text-green-100 rounded-lg text-left transition-colors"
                              >
                                Add Below
                              </button>
                              <button
                                onClick={deleteRow}
                                className="text-sm px-4 py-2 bg-red-600 text-red-100 hover:text-white rounded-lg text-left col-span-2 transition-all"
                              >
                                Delete Row
                              </button>
                            </div>
                          </div>

                          <div className="p-3 border-b border-gray-100">
                            <div className="text-sm text-blue-600 font-bold mb-3">
                              Bulk Actions
                            </div>
                            <div className="space-y-2">
                              <button
                                onClick={() => {
                                  const numCols = parseInt(
                                    prompt("Number of columns to add:") || "1"
                                  );
                                  for (let i = 0; i < numCols; i++) {
                                    editor
                                      .chain()
                                      .focus()
                                      .addColumnAfter()
                                      .run();
                                  }
                                  setShowTableMenu(false);
                                }}
                                className="w-full text-sm px-4 py-2 bg-green-400 hover:bg-green-600 text-black hover:text-green-100 rounded-lg text-left transition-colors"
                              >
                                Add Multiple Columns
                              </button>
                              <button
                                onClick={() => {
                                  const numRows = parseInt(
                                    prompt("Number of rows to add:") || "1"
                                  );
                                  for (let i = 0; i < numRows; i++) {
                                    editor.chain().focus().addRowAfter().run();
                                  }
                                  setShowTableMenu(false);
                                }}
                                className="w-full text-sm px-4 py-2 bg-green-400 hover:bg-green-600 text-black hover:text-green-100 rounded-lg text-left transition-colors"
                              >
                                Add Multiple Rows
                              </button>
                            </div>
                          </div>

                          <div className="p-3">
                            <button
                              onClick={deleteTable}
                              className="w-full text-sm px-4 py-2.5 bg-red-600 text-red-100 hover:text-white rounded-lg text-left flex items-center gap-2 transition-all"
                            >
                              <Trash2 size={16} />
                              Delete Entire Table
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Utilities - Right aligned */}
            <div className="flex items-center gap-1 px-2 py-1 bg-gray-50 rounded-lg">
              <MenuButton
                onClick={() => editor.chain().focus().unsetAllMarks().run()}
                title="Clear Formatting"
                className="p-2 rounded transition-colors hover:bg-white"
              >
                <Type size={16} />
              </MenuButton>

              <MenuButton
                onClick={() => editor.chain().focus().setHorizontalRule().run()}
                title="Horizontal Rule"
                className="p-2 rounded transition-colors hover:bg-white"
              >
                <Minus size={16} />
              </MenuButton>
            </div>
          </div>
        </div>
      </div>

      {/* Editor Content */}
      <div className="relative bg-white">
        <div className="h-[500px] overflow-y-auto mb-[20px]">
          <EditorContent editor={editor} className="tiptap-editor-content" />

          {/* Slash Command Menu */}
          {showSlashMenu && slashRange && (
            <div
              className="fixed z-50"
              style={{
                left: slashMenuPosition.x,
                top: Math.max(10, slashMenuPosition.y - 290), // Keep 10px from top edge
                bottom: slashMenuPosition.y - 200 < 10 ? "auto" : undefined,
              }}
            >
              <SlashMenu
                editor={editor}
                range={slashRange}
                query={slashQuery}
                onSelect={() => setShowSlashMenu(false)}
              />
            </div>
          )}
        </div>
      </div>

      {/* Save As Modal */}
      {showSaveAsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-90vw">
            <h3 className="text-lg font-semibold mb-4">Save Document As</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Document Title
              </label>
              <input
                type="text"
                placeholder="Enter document title"
                value={saveAsTitle}
                onChange={(e) => setSaveAsTitle(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    confirmSaveAs();
                  } else if (e.key === "Escape") {
                    setShowSaveAsModal(false);
                  }
                }}
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowSaveAsModal(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={confirmSaveAs}
                disabled={!saveAsTitle.trim()}
                className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-md"
              >
                Save As
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Font Size Modal */}
      {showCustomFontSizeInput && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-90vw">
            <h3 className="text-lg font-semibold mb-4">Custom Font Size</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter font size (e.g., 16px, 1.2em, 150%)
              </label>
              <input
                type="text"
                placeholder="16px"
                value={customFontSize}
                onChange={(e) => setCustomFontSize(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleCustomFontSize();
                  } else if (e.key === "Escape") {
                    setShowCustomFontSizeInput(false);
                  }
                }}
              />
              <p className="text-xs text-gray-500 mt-1">
                Supported units: px, em, rem, pt, %. Numbers without units will
                be treated as px.
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowCustomFontSizeInput(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleCustomFontSize}
                disabled={!customFontSize.trim()}
                className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-md"
              >
                Apply Size
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Link Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-90vw">
            <h3 className="text-lg font-semibold mb-4">Add Link</h3>
            <input
              type="url"
              placeholder="Enter URL"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSetLink();
                } else if (e.key === "Escape") {
                  setShowLinkModal(false);
                }
              }}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowLinkModal(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleSetLink}
                className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md"
              >
                {linkUrl ? "Update Link" : "Remove Link"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Modal */}
      {showImageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-90vw">
            <h3 className="text-lg font-semibold mb-4">Add Image</h3>
            <input
              type="url"
              placeholder="Enter image URL"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleAddImage();
                } else if (e.key === "Escape") {
                  setShowImageModal(false);
                }
              }}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowImageModal(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleAddImage}
                disabled={!imageUrl}
                className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-md"
              >
                Add Image
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer with stats */}
      <div className="border-t border-gray-200 bg-gray-50 px-6 py-3">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-4">
            {/* <span>✨ Enhanced Tiptap Editor</span> */}
            <span>
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            </span>
            <span>{editor.storage.characterCount.characters()} characters</span>
            <span>
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            </span>
            <span>{editor.storage.characterCount.words()} words</span>
          </div>
          {/* <div className="flex items-center gap-2">
            <span>Enhanced Typography Controls • Live Font Previews • Custom Sizes</span>
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          </div> */}
        </div>
      </div>

      {/* Custom Tiptap Styles */}
      <style jsx global>{`
        .tiptap-editor-content .ProseMirror {
          outline: none;
          min-height: 100%;
          padding: 2rem;
        }

        .tiptap-editor-content .ProseMirror:focus {
          outline: none;
        }

        .tiptap-editor-content h1 {
          font-size: 2rem;
          font-weight: 700;
          margin: 1.5rem 0 1rem 0;
          line-height: 1.2;
          color: #1f2937;
        }

        .tiptap-editor-content h2 {
          font-size: 1.5rem;
          font-weight: 600;
          margin: 1.25rem 0 0.75rem 0;
          line-height: 1.3;
          color: #374151;
        }

        .tiptap-editor-content h3 {
          font-size: 1.25rem;
          font-weight: 600;
          margin: 1rem 0 0.5rem 0;
          line-height: 1.4;
          color: #374151;
        }

        .tiptap-editor-content p {
          margin: 1rem 0;
          line-height: 1.6;
          color: #374151;
        }

        .tiptap-editor-content ul,
        .tiptap-editor-content ol {
          margin: 1rem 0;
          padding-left: 2rem;
          list-style-position: outside;
        }

        .tiptap-editor-content li {
          margin: 0.5rem 0;
          line-height: 1.6;
          display: list-item;
          list-style-type: inherit;
        }

        .tiptap-editor-content ul li {
          list-style-type: disc;
        }

        .tiptap-editor-content ol li {
          list-style-type: decimal;
        }

        .tiptap-editor-content blockquote {
          margin: 1.5rem 0;
          padding: 1rem 1.5rem;
          border-left: 4px solid #3b82f6;
          background: #f8fafc;
          font-style: italic;
          color: #475569;
        }

        .tiptap-editor-content pre {
          background: #1f2937;
          color: #f9fafb;
          font-family: "JetBrains Mono", "Courier New", monospace;
          padding: 1rem;
          border-radius: 0.5rem;
          margin: 1.5rem 0;
          overflow-x: auto;
        }

        .tiptap-editor-content code {
          background: #f1f5f9;
          color: #dc2626;
          padding: 0.25rem 0.375rem;
          border-radius: 0.25rem;
          font-family: "JetBrains Mono", "Courier New", monospace;
          font-size: 0.875rem;
        }

        .tiptap-editor-content pre code {
          background: transparent;
          color: inherit;
          padding: 0;
        }

        .tiptap-editor-content a {
          color: #3b82f6;
          text-decoration: underline;
          text-underline-offset: 2px;
        }

        .tiptap-editor-content a:hover {
          color: #1d4ed8;
        }

        .tiptap-editor-content table {
          border-collapse: collapse;
          width: 100%;
          margin: 1.5rem 0;
          border: 1px solid #d1d5db;
          table-layout: fixed;
        }

        .tiptap-editor-content th,
        .tiptap-editor-content td {
          border: 1px solid #d1d5db;
          padding: 0.75rem;
          text-align: left;
          vertical-align: top;
          position: relative;
        }

        .tiptap-editor-content th {
          background: #f9fafb;
          font-weight: 600;
        }

        .tiptap-editor-content .selectedCell {
          background: #dbeafe;
        }

        .tiptap-editor-content .column-resize-handle {
          position: absolute;
          right: -2px;
          top: 0;
          bottom: 0;
          width: 4px;
          background-color: #3b82f6;
          cursor: col-resize;
        }

        .tiptap-editor-content hr {
          border: none;
          border-top: 2px solid #e5e7eb;
          margin: 2rem 0;
        }

        .tiptap-editor-content img {
          max-width: 100%;
          height: auto;
          border-radius: 0.5rem;
          margin: 1rem 0;
        }

        .tiptap-editor-content .ProseMirror-selectednode {
          outline: 2px solid #3b82f6;
          outline-offset: 2px;
        }
      `}</style>
    </div>
  );
};

export default TiptapEditor;
