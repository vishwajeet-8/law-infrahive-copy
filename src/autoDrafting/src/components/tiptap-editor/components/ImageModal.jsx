// components/ImageModal.jsx - Modal for Image Upload
import React, { useState, useRef } from 'react';
import { Upload, Link as LinkIcon, X, Image as ImageIcon } from 'lucide-react';

const ImageModal = ({ isOpen, onClose, onInsert }) => {
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' or 'url'
  const [imageUrl, setImageUrl] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const fileInputRef = useRef(null);

  const handleFileSelect = (file) => {
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
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

  const handleInsert = () => {
    if (activeTab === 'url' && imageUrl.trim()) {
      onInsert(imageUrl.trim());
    } else if (activeTab === 'upload' && previewUrl) {
      onInsert(previewUrl);
    }
    handleClose();
  };

  const handleClose = () => {
    setImageUrl('');
    setSelectedFile(null);
    setPreviewUrl('');
    setActiveTab('upload');
    onClose();
  };

  const canInsert = (activeTab === 'url' && imageUrl.trim()) || 
                   (activeTab === 'upload' && previewUrl);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
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
            onClick={() => setActiveTab('upload')}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'upload'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Upload size={16} className="inline mr-2" />
            Upload File
          </button>
          <button
            onClick={() => setActiveTab('url')}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'url'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <LinkIcon size={16} className="inline mr-2" />
            From URL
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'upload' ? (
            <div className="space-y-4">
              {/* Drop Zone */}
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  dragActive
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
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
                      className="max-w-full max-h-32 mx-auto rounded"
                    />
                    <p className="text-sm text-gray-600">
                      {selectedFile?.name}
                    </p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFile(null);
                        setPreviewUrl('');
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
                    className="max-w-full max-h-32 rounded"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'block';
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

// Updated SlashCommandMenu.jsx - Enhanced Image Command
const EnhancedSlashCommandMenu = ({ editor, range, query, onSelect, setShowImageModal }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const menuRef = useRef(null);

  const commands = [
    {
      title: 'Heading 1',
      description: 'Large heading',
      icon: <Heading1 size={16} />,
      command: () => editor.chain().focus().deleteRange(range).setHeading({ level: 1 }).run(),
      keywords: ['h1', 'heading', 'title', 'large'],
    },
    {
      title: 'Heading 2',
      description: 'Medium heading',
      icon: <Heading2 size={16} />,
      command: () => editor.chain().focus().deleteRange(range).setHeading({ level: 2 }).run(),
      keywords: ['h2', 'heading', 'subtitle', 'medium'],
    },
    {
      title: 'Heading 3',
      description: 'Small heading',
      icon: <Heading3 size={16} />,
      command: () => editor.chain().focus().deleteRange(range).setHeading({ level: 3 }).run(),
      keywords: ['h3', 'heading', 'small'],
    },
    {
      title: 'Paragraph',
      description: 'Normal text',
      icon: <FileText size={16} />,
      command: () => editor.chain().focus().deleteRange(range).setParagraph().run(),
      keywords: ['p', 'paragraph', 'text'],
    },
    {
      title: 'Bullet List',
      description: 'Unordered list',
      icon: <List size={16} />,
      command: () => editor.chain().focus().deleteRange(range).toggleBulletList().run(),
      keywords: ['ul', 'list', 'bullet', 'unordered'],
    },
    {
      title: 'Numbered List',
      description: 'Ordered list',
      icon: <ListOrdered size={16} />,
      command: () => editor.chain().focus().deleteRange(range).toggleOrderedList().run(),
      keywords: ['ol', 'list', 'numbered', 'ordered'],
    },
    {
      title: 'Quote',
      description: 'Block quote',
      icon: <Quote size={16} />,
      command: () => editor.chain().focus().deleteRange(range).toggleBlockquote().run(),
      keywords: ['quote', 'blockquote', 'citation'],
    },
    {
      title: 'Code Block',
      description: 'Code snippet',
      icon: <Code size={16} />,
      command: () => editor.chain().focus().deleteRange(range).toggleCodeBlock().run(),
      keywords: ['code', 'codeblock', 'snippet', 'pre'],
    },
    {
      title: 'Table',
      description: 'Insert table',
      icon: <TableIcon size={16} />,
      command: () => editor.chain().focus().deleteRange(range).insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(),
      keywords: ['table', 'grid', 'data'],
    },
    {
      title: 'Horizontal Line',
      description: 'Divider',
      icon: <Minus size={16} />,
      command: () => editor.chain().focus().deleteRange(range).setHorizontalRule().run(),
      keywords: ['hr', 'line', 'divider', 'separator'],
    },
    {
      title: 'Image',
      description: 'Upload or insert image',
      icon: <ImageIcon size={16} />,
      command: () => {
        editor.chain().focus().deleteRange(range).run();
        setShowImageModal(true);
      },
      keywords: ['image', 'img', 'picture', 'photo', 'upload'],
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
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        setSelectedIndex((prevIndex) =>
          prevIndex > 0 ? prevIndex - 1 : filteredCommands.length - 1
        );
      } else if (event.key === 'ArrowDown') {
        event.preventDefault();
        setSelectedIndex((prevIndex) =>
          prevIndex < filteredCommands.length - 1 ? prevIndex + 1 : 0
        );
      } else if (event.key === 'Enter') {
        event.preventDefault();
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].command();
          onSelect();
        }
      } else if (event.key === 'Escape') {
        event.preventDefault();
        onSelect();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
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
    <div 
      ref={menuRef}
      className="bg-white border border-gray-200 rounded-lg shadow-lg w-72 max-h-64 overflow-y-auto"
    >
      {filteredCommands.map((command, index) => (
        <button
          key={command.title}
          onClick={() => {
            command.command();
            onSelect();
          }}
          className={`w-full text-left p-3 hover:bg-gray-50 flex items-center gap-3 transition-colors border-none ${
            index === selectedIndex ? 'bg-blue-50 border-r-2 border-blue-500' : ''
          }`}
        >
          <div className="text-gray-400 flex-shrink-0">{command.icon}</div>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm text-gray-900">{command.title}</div>
            <div className="text-xs text-gray-500 truncate">{command.description}</div>
          </div>
        </button>
      ))}
    </div>
  );
};

export { ImageModal, EnhancedSlashCommandMenu };