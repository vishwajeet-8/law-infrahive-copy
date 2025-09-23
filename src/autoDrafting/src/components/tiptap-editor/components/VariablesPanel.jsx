import React, { useState } from 'react';
import { 
  FileText,
  Upload,
  Edit3,
  Check,
  ChevronDown,
  Plus,
  Trash2,
  RefreshCw,
  Save
} from 'lucide-react';

const VariablesPanel = ({ 
  variables, 
  onVariableChange, 
  onImportDocument, 
  onAddVariable,
  onDeleteVariable,
  onApplyVariables,
  onSaveDocument,
  availableDocuments,
  isLoading = false
}) => {
  const [selectedDocument, setSelectedDocument] = useState('');
  const [showDocumentMenu, setShowDocumentMenu] = useState(false);
  const [editingVariable, setEditingVariable] = useState(null);

  const handleImportClick = async () => {
    if (!selectedDocument) {
      alert('Please select a document first');
      return;
    }
    
    try {
      await onImportDocument(selectedDocument);
      setShowDocumentMenu(false);
    } catch (error) {
      console.error('Import failed:', error);
      alert('Failed to import document. Please try again.');
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
      <div className="flex-1 flex flex-col h-[400px]">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Document Variables</h3>
            <button 
              onClick={onAddVariable}
              className="p-1 text-blue-600 hover:text-blue-700"
              title="Add Variable"
            >
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
                    <button 
                      onClick={() => onDeleteVariable(variable.id)}
                      className="p-1 text-red-400 hover:text-red-600" 
                      title="Delete"
                    >
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
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSaveVariable(variable.id);
                      } else if (e.key === 'Escape') {
                        setEditingVariable(null);
                      }
                    }}
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

        <div className="p-4 border-t border-gray-200 space-y-2">
          <button 
            onClick={onApplyVariables}
            className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium flex items-center justify-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Apply All Variables</span>
          </button>
          <button 
            onClick={onSaveDocument}
            className="w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm font-medium flex items-center justify-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>Save Document</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default VariablesPanel;