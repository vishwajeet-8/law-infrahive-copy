// components/EditorFooter.jsx - Footer Component
import React from 'react';

const EditorFooter = ({ editor }) => {
  return (
    <div className="border-t border-gray-200 bg-gray-50 px-6 py-3">
      <div className="flex items-center justify-between text-sm text-gray-600">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Ready</span>
          </div>
          <span>{editor?.storage.characterCount.characters() || 0} characters</span>
          <span>{editor?.storage.characterCount.words() || 0} words</span>
        </div>
        <div className="text-xs text-gray-500">
          Enhanced Tiptap Editor • Modular Architecture
        </div>
      </div>
    </div>
  );
};

export default EditorFooter;