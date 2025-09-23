import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableHeader from '@tiptap/extension-table-header';
import TableCell from '@tiptap/extension-table-cell';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import FontFamily from '@tiptap/extension-font-family';
import TextStyle from '@tiptap/extension-text-style';
import EditorHeader from './components/EditorHeader';
import EditorToolbar from './components/EditorToolbar';
import { 
  FileText,
  Upload,
  Edit3,
  Check,
  ChevronDown,
  Download,
  Save,
  Plus,
  Trash2
} from 'lucide-react';

// Import your existing TipTap Editor Component
// import TiptapEditor from './path/to/your/TiptapEditor'; // Uncomment and update path

// Your Enhanced TipTap Editor Component
const TiptapEditor = ({ 
  onContentUpdate, 
  onImportRef,
  initialVariables = []
}) => {
  const [editorState, setEditorState] = useState({});
  const [documentTitle, setDocumentTitle] = useState('Untitled Document');
  const [editorContent, setEditorContent] = useState(''); 
  const [contentUpdateTrigger, setContentUpdateTrigger] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const editorRef = useRef(null);

  // Modal states
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showSaveAsModal, setShowSaveAsModal] = useState(false);
  const [showCustomFontSizeInput, setShowCustomFontSizeInput] = useState(false);
  
  // Form states
  const [linkUrl, setLinkUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [saveAsTitle, setSaveAsTitle] = useState('');
  const [customFontSize, setCustomFontSize] = useState('');
  
  // Slash menu states
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [slashMenuPosition, setSlashMenuPosition] = useState({ x: 0, y: 0 });
  const [slashQuery, setSlashQuery] = useState('');
  const [slashRange, setSlashRange] = useState(null);
  
  // Table states
  const [showTableMenu, setShowTableMenu] = useState(false);
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);
  const [tableWithHeader, setTableWithHeader] = useState(true);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: { keepMarks: true, keepAttributes: false },
        orderedList: { keepMarks: true, keepAttributes: false },
      }),
      Underline,
      TextStyle,
      FontFamily,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
        alignments: ['left', 'center', 'right', 'justify'],
        defaultAlignment: 'left',
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        defaultProtocol: 'https',
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
          if (node.type.name === 'heading') {
            return `Heading ${node.attrs.level}`;
          }
          return 'Start typing or press "/" for commands...';
        },
      }),
      CharacterCount.configure({ limit: 1000000000000 }),
    ],
    content: editorContent,
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none tiptap-editor-content',
      },
    },
    onUpdate: ({ editor }) => {
      updateEditorState();
      const currentHtml = editor.getHTML();
      const charCount = currentHtml.length;
      console.log('Editor updated, current content:', currentHtml.substring(0, 500), '...', 'Character count:', charCount);
      setEditorContent(currentHtml);
      
      // Sync with parent component for variables
      if (onContentUpdate) {
        onContentUpdate(currentHtml);
      }
      
      if (isLoading && currentHtml !== '<p></p>') {
        setIsLoading(false);
      }
      if (charCount >= 10000000000) {
        console.warn('Approaching character limit, content may be truncated');
      }
    },
    onCreate: ({ editor }) => {
      editorRef.current = editor;
      console.log('Editor created, initial content:', editor.getHTML());
    },
  });

  const updateEditorState = useCallback(() => {
    if (!editor) return;
    
    setEditorState({
      bold: editor.isActive('bold'),
      italic: editor.isActive('italic'),
      underline: editor.isActive('underline'),
      strike: editor.isActive('strike'),
      code: editor.isActive('code'),
      codeBlock: editor.isActive('codeBlock'),
      bulletList: editor.isActive('bulletList'),
      orderedList: editor.isActive('orderedList'),
      blockquote: editor.isActive('blockquote'),
      link: editor.isActive('link'),
      table: editor.isActive('table'),
      textAlignLeft: editor.isActive({ textAlign: 'left' }),
      textAlignCenter: editor.isActive({ textAlign: 'center' }),
      textAlignRight: editor.isActive({ textAlign: 'right' }),
      heading1: editor.isActive('heading', { level: 1 }),
      heading2: editor.isActive('heading', { level: 2 }),
      heading3: editor.isActive('heading', { level: 3 }),
      heading4: editor.isActive('heading', { level: 4 }),
      heading5: editor.isActive('heading', { level: 5 }),
      heading6: editor.isActive('heading', { level: 6 }),
      fontSize: editor.getAttributes('textStyle').fontSize || '',
      fontFamily: editor.getAttributes('textStyle').fontFamily || 'inherit',
    });
  }, [editor]);

  const updateEditorContent = useCallback((htmlContent) => {
    if (!editor) return;
    if (!htmlContent || htmlContent.trim() === '') {
      console.warn('No valid HTML content to update');
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    const charCount = htmlContent.length;
    console.log('Updating content with HTML:', htmlContent.substring(0, 500), '...', 'Total length:', charCount);
    try {
      setEditorContent(htmlContent);
      setTimeout(() => {
        editor.commands.setContent(htmlContent, false);
        setContentUpdateTrigger(prev => prev + 1);
        updateEditorState();
        const currentHtml = editor.getHTML();
        console.log('Updated content HTML:', currentHtml.substring(0, 500), '...', 'Length:', currentHtml.length);
        setIsLoading(false);
      }, 0);
    } catch (error) {
      console.error('Failed to set content:', error);
      setIsLoading(false);
    }
  }, [editor, updateEditorState]);

  // Expose import function to parent
  useEffect(() => {
    if (onImportRef) {
      onImportRef.current = updateEditorContent;
    }
  }, [onImportRef, updateEditorContent]);

  const handleImportWord = useCallback(({ html, fileName }) => {
    if (!editor) return;
    if (!html || html.trim() === '') {
      console.error('No HTML received from import:', html);
      alert('Failed to import: No content extracted from .docx');
      setIsLoading(false);
      return;
    }
    setDocumentTitle(fileName);
    updateEditorContent(html);
  }, [editor, updateEditorContent]);

  const handleSave = useCallback(() => {
    if (!editor) return;
    
    const content = editor.getJSON();
    const docData = {
      title: documentTitle,
      content: content,
      lastModified: new Date().toISOString(),
    };
    
    const savedDocs = JSON.parse(localStorage.getItem('tiptap-documents') || '[]');
    const existingIndex = savedDocs.findIndex(doc => doc.title === documentTitle);
    
    if (existingIndex >= 0) {
      savedDocs[existingIndex] = docData;
    } else {
      savedDocs.push(docData);
    }
    
    localStorage.setItem('tiptap-documents', JSON.stringify(savedDocs));
    alert(`Document "${documentTitle}" saved successfully!`);
  }, [editor, documentTitle]);

  const handleSaveAs = useCallback(() => {
    setSaveAsTitle(documentTitle);
    setShowSaveAsModal(true);
  }, [documentTitle]);

  const handleExportPDF = useCallback(() => {
    if (!editor) return;
    
    const content = editor.getHTML();
    
    const printWindow = window.open('', '_blank');
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
    
    const blob = new Blob(['\ufeff', wordContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${documentTitle}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [editor, documentTitle]);

  useEffect(() => {
    if (!editor) return;
    const handleSelectionUpdate = ({ editor }) => {
      const { selection } = editor.state;
      const { from } = selection;
      const textBefore = editor.state.doc.textBetween(Math.max(0, from - 10), from, '\0');
      const slashIndex = textBefore.lastIndexOf('/');
      
      if (slashIndex !== -1) {
        const query = textBefore.slice(slashIndex + 1);
        if (!query.includes(' ') && query.length <= 20) {
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

    editor.on('selectionUpdate', handleSelectionUpdate);
    editor.on('transaction', updateEditorState);
    editor.on('update', updateEditorState);
    editor.on('focus', updateEditorState);

    updateEditorState();

    return () => {
      editor.off('selectionUpdate', handleSelectionUpdate);
      editor.off('transaction', updateEditorState);
      editor.off('update', updateEditorState);
      editor.off('focus', updateEditorState);
    };
  }, [editor, updateEditorState]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleSave]);

  if (!editor) {
    return (
      <div className="w-full bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-600">Loading Enhanced Tiptap Editor...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden h-full">
      {/* Your Original EditorHeader Component */}
      <EditorHeader 
        documentTitle={documentTitle}
        editor={editor}
        onSave={handleSave}
        onSaveAs={handleSaveAs}
        onExportPDF={handleExportPDF}
        onExportDOCX={handleExportDOCX}
        onImportWord={handleImportWord}
        onImportPDF={handleImportWord} // Using handleImportWord for PDF as well
      />

      {/* Your Original EditorToolbar Component */}
      <EditorToolbar
        editor={editor}
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
      
      {/* Editor Content */}
      <div className="relative bg-white">
        <div className="min-h-[500px] max-h-[80vh] overflow-y-auto px-6 py-6">
          <EditorContent editor={editor} key={contentUpdateTrigger} />
        </div>
      </div>

      {/* Simplified Footer - Replace with your EditorFooter component */}
      <div className="border-t border-gray-200 px-4 py-2">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>Words: {editor.storage.characterCount?.words() || 0}</span>
          <span>Characters: {editor.storage.characterCount?.characters() || 0}</span>
        </div>
      </div>
    </div>
  );
};

// Variables and Document Import Panel Component
const VariablesPanel = ({ variables, onVariableChange, onImportDocument, availableDocuments }) => {
  const [selectedDocument, setSelectedDocument] = useState('');
  const [showDocumentMenu, setShowDocumentMenu] = useState(false);
  const [editingVariable, setEditingVariable] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleImportClick = async () => {
    if (!selectedDocument) return;
    
    setIsLoading(true);
    try {
      await onImportDocument(selectedDocument);
      setShowDocumentMenu(false);
    } catch (error) {
      console.error('Import failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVariableEdit = (variableId, newValue) => {
    onVariableChange(variableId, newValue);
  };

  const handleSaveVariable = (variableId) => {
    setEditingVariable(null);
  };

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col h-full">
      {/* Document Import Section */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Import Document</h3>
        
        <div className="space-y-3">
          <div className="relative">
            <button
              onClick={() => setShowDocumentMenu(!showDocumentMenu)}
              className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-left"
            >
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-gray-500" />
                <span className="text-sm truncate">
                  {selectedDocument || 'Select Document'}
                </span>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>
            
            {showDocumentMenu && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10 max-h-48 overflow-y-auto">
                {availableDocuments.map((doc) => (
                  <button
                    key={doc}
                    onClick={() => {
                      setSelectedDocument(doc);
                      setShowDocumentMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm border-b border-gray-100 last:border-b-0"
                  >
                    {doc}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <button 
            onClick={handleImportClick}
            disabled={!selectedDocument || isLoading}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isLoading ? (
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
        </div>
      </div>

      {/* Variables Section */}
      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Document Variables</h3>
            <button className="p-1 text-gray-400 hover:text-gray-600">
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            Edit variables to customize your document
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-3">
            {variables.map((variable) => (
              <div key={variable.id} className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">
                    {variable.displayName}
                  </label>
                  <div className="flex items-center space-x-1">
                    {editingVariable === variable.id ? (
                      <button
                        onClick={() => handleSaveVariable(variable.id)}
                        className="p-1 text-green-600 hover:text-green-700"
                        title="Save"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => setEditingVariable(variable.id)}
                        className="p-1 text-gray-400 hover:text-gray-600"
                        title="Edit"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    )}
                    <button className="p-1 text-red-400 hover:text-red-600" title="Delete">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                {editingVariable === variable.id ? (
                  <textarea
                    value={variable.value}
                    onChange={(e) => handleVariableEdit(variable.id, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows={2}
                    autoFocus
                  />
                ) : (
                  <div className="px-3 py-2 bg-white border border-gray-200 rounded-md text-sm min-h-[40px] flex items-center">
                    <span className="break-words">{variable.value}</span>
                  </div>
                )}
                
                <div className="mt-2 text-xs text-gray-500">
                  Variable: {variable.name}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 border-t border-gray-200">
          <button className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium flex items-center justify-center space-x-2">
            <Save className="w-4 h-4" />
            <span>Apply All Variables</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Integration Component
const EditorWithVariablesPage = () => {
  const [editorContent, setEditorContent] = useState('<p>Start typing your document here...</p>');
  const [variables, setVariables] = useState([
    { id: 1, name: 'variable_1', displayName: 'Company Name', value: '[Company Name]' },
    { id: 2, name: 'variable_2', displayName: 'Company Address', value: '[Company Address]' },
    { id: 3, name: 'variable_3', displayName: 'Company Registered Office', value: '[Company Registered Office]' },
    { id: 4, name: 'variable_4', displayName: 'Participant Name', value: '[Participant Name]' },
    { id: 5, name: 'variable_5', displayName: 'Territory', value: '[Territory]' },
    { id: 6, name: 'variable_6', displayName: 'Effective Date', value: '[Effective Date]' },
    { id: 7, name: 'variable_7', displayName: 'Term Duration', value: '[Term Duration]' },
    { id: 8, name: 'variable_8', displayName: 'Franchise Fee', value: '[Franchise Fee]' }
  ]);
  
  const [availableDocuments] = useState([
    'FranchiseAgreement.Format1.docx',
    'FranchiseAgreement.Format2.docx', 
    'FranchiseAgreement.Format3.docx',
    'Partnership Agreement.docx',
    'Service Agreement.docx'
  ]);

  const importContentRef = useRef(null);

  const handleContentChange = (newContent) => {
    setEditorContent(newContent);
  };

  const handleVariableChange = (variableId, newValue) => {
    setVariables(prev => 
      prev.map(variable => 
        variable.id === variableId 
          ? { ...variable, value: newValue }
          : variable
      )
    );

    // Apply variable changes to content
    let updatedContent = editorContent;
    variables.forEach(variable => {
      if (variable.id === variableId) {
        const regex = new RegExp(`\\[${variable.displayName}\\]`, 'g');
        updatedContent = updatedContent.replace(regex, newValue);
      }
    });
    
    if (updatedContent !== editorContent) {
      setEditorContent(updatedContent);
    }
  };

  const handleImportDocument = async (documentName) => {
    try {
      // Import from your API
      const response = await fetch('https://ephemeral-taiyaki-617870.netlify.app/mock-doc.docx');
      const arrayBuffer = await response.arrayBuffer();
      
      // Convert DOCX to HTML using mammoth
      const mammoth = await import('mammoth');
      const result = await mammoth.convertToHtml({ arrayBuffer });
      
      // Update editor content
      if (importContentRef.current) {
        importContentRef.current(result.value);
      }
      setEditorContent(result.value);
      
      console.log('Document imported successfully:', documentName);
    } catch (error) {
      console.error('Error importing document:', error);
      alert('Failed to import document. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Document Editor</h1>
            <p className="text-sm text-gray-600 mt-1">Create and edit documents with variables</p>
          </div>
          <div className="flex items-center space-x-3">
            <button className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
              <Download className="w-4 h-4 inline mr-2" />
              Export
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              <Save className="w-4 h-4 inline mr-2" />
              Save
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex h-screen">
        {/* Editor Section */}
        <div className="flex-1 p-6">
          <TiptapEditor 
            onContentUpdate={handleContentChange}
            onImportRef={importContentRef}
            initialVariables={variables}
          />
        </div>

        {/* Variables Panel */}
        <VariablesPanel
          variables={variables}
          onVariableChange={handleVariableChange}
          onImportDocument={handleImportDocument}
          availableDocuments={availableDocuments}
        />
      </div>
    </div>
  );
};

export default EditorWithVariablesPage;