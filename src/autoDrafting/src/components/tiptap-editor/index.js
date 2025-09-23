// index.js - Main Export File

// Main Editor Component
export { default as TiptapEditor } from './TiptapEditor';

// UI Components
export { default as EditorHeader } from './components/EditorHeader';
export { default as EditorToolbar } from './components/EditorToolbar';
export { default as EditorFooter } from './components/EditorFooter';
export { default as SlashCommandMenu } from './components/SlashCommandMenu';
export { default as FontDropdown } from './components/FontDropdown';
export { default as TableControls } from './components/TableControls';
export { default as EditorModals } from './components/EditorModals';

// Extensions
export { FontSize, SlashCommands } from './extensions/CustomExtensions';

// Default export for convenience
export { default } from './TiptapEditor';

/*
File Structure:
├── TiptapEditor.jsx (Main component)
├── extensions/
│   └── CustomExtensions.js (FontSize, SlashCommands)
├── components/
│   ├── EditorHeader.jsx
│   ├── EditorToolbar.jsx
│   ├── EditorFooter.jsx
│   ├── SlashCommandMenu.jsx
│   ├── FontDropdown.jsx
│   ├── TableControls.jsx
│   └── EditorModals.jsx
└── styles/
    └── EditorStyles.css

Usage Examples:

1. Import the complete editor:
   import TiptapEditor from './tiptap-editor';
   // or
   import { TiptapEditor } from './tiptap-editor';

2. Import individual components for custom implementations:
   import { 
     EditorToolbar, 
     SlashCommandMenu, 
     FontDropdown 
   } from './tiptap-editor';

3. Import extensions:
   import { FontSize, SlashCommands } from './tiptap-editor';

4. Mixed imports:
   import TiptapEditor, { 
     EditorHeader, 
     FontDropdown 
   } from './tiptap-editor';

Component Props:

TiptapEditor:
- No props required (self-contained)

EditorHeader:
- documentTitle: string
- editor: Editor instance
- onSave: function
- onSaveAs: function
- onExportPDF: function
- onExportDOCX: function

EditorToolbar:
- editor: Editor instance
- editorState: object
- updateEditorState: function
- showTableMenu: boolean
- setShowTableMenu: function
- tableRows: number
- setTableRows: function
- tableCols: number
- setTableCols: function
- tableWithHeader: boolean
- setTableWithHeader: function
- setShowLinkModal: function
- setShowImageModal: function
- setShowCustomFontSizeInput: function

FontDropdown:
- value: string
- onChange: function
- options: array
- placeholder: string
- icon: ReactNode
- className: string

SlashCommandMenu:
- editor: Editor instance
- range: object
- query: string
- onSelect: function

TableControls:
- editor: Editor instance
- editorState: object
- tableRows: number
- setTableRows: function
- tableCols: number
- setTableCols: function
- tableWithHeader: boolean
- setTableWithHeader: function
- onClose: function

EditorModals:
- Various modal state props and handlers

EditorFooter:
- editor: Editor instance
*/