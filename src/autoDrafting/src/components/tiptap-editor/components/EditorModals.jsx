// components/EditorModals.jsx - All Modal Components
import React from 'react';

const EditorModals = ({
  // Save As Modal
  showSaveAsModal,
  setShowSaveAsModal,
  saveAsTitle,
  setSaveAsTitle,
  onConfirmSaveAs,
  
  // Custom Font Size Modal
  showCustomFontSizeInput,
  setShowCustomFontSizeInput,
  customFontSize,
  setCustomFontSize,
  onApplyCustomFontSize,
  
  // Link Modal
  showLinkModal,
  setShowLinkModal,
  linkUrl,
  setLinkUrl,
  onSetLink,
  
  // Image Modal
  showImageModal,
  setShowImageModal,
  imageUrl,
  setImageUrl,
  onAddImage
}) => {
  
  const handleSaveAs = () => {
    if (!saveAsTitle.trim()) return;
    onConfirmSaveAs(saveAsTitle.trim());
  };

  const handleCustomFontSize = () => {
    if (!customFontSize.trim()) return;
    
    let validSize = customFontSize.trim();
    
    // Add 'px' if no unit is specified and it's a number
    if (/^\d+$/.test(validSize)) {
      validSize += 'px';
    }
    
    // Validate if it's a proper CSS size value
    if (/^(\d+(\.\d+)?(px|em|rem|pt|%)|\d+)$/.test(validSize)) {
      onApplyCustomFontSize(validSize);
    } else {
      alert('Please enter a valid font size (e.g., 16px, 1.2em, 150%)');
      return;
    }
  };

  const handleSetLink = () => {
    onSetLink(linkUrl);
  };

  const handleAddImage = () => {
    if (!imageUrl.trim()) return;
    onAddImage(imageUrl.trim());
  };

  const ModalOverlay = ({ children, onClose }) => (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );

  const ModalHeader = ({ title }) => (
    <div className="px-6 py-4 border-b border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
    </div>
  );

  const ModalFooter = ({ onCancel, onConfirm, confirmText, confirmDisabled }) => (
    <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
      <button
        onClick={onCancel}
        className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
      >
        Cancel
      </button>
      <button
        onClick={onConfirm}
        disabled={confirmDisabled}
        className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors"
      >
        {confirmText}
      </button>
    </div>
  );

  return (
    <>
      {/* Save As Modal */}
      {showSaveAsModal && (
        <ModalOverlay onClose={() => setShowSaveAsModal(false)}>
          <ModalHeader title="Save Document As" />
          <div className="p-6">
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
                if (e.key === 'Enter') {
                  handleSaveAs();
                } else if (e.key === 'Escape') {
                  setShowSaveAsModal(false);
                }
              }}
            />
          </div>
          <ModalFooter
            onCancel={() => setShowSaveAsModal(false)}
            onConfirm={handleSaveAs}
            confirmText="Save As"
            confirmDisabled={!saveAsTitle.trim()}
          />
        </ModalOverlay>
      )}

      {/* Custom Font Size Modal */}
      {showCustomFontSizeInput && (
        <ModalOverlay onClose={() => setShowCustomFontSizeInput(false)}>
          <ModalHeader title="Custom Font Size" />
          <div className="p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enter font size
            </label>
            <input
              type="text"
              placeholder="e.g., 16px, 1.2em, 150%"
              value={customFontSize}
              onChange={(e) => setCustomFontSize(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleCustomFontSize();
                } else if (e.key === 'Escape') {
                  setShowCustomFontSizeInput(false);
                }
              }}
            />
            <p className="text-xs text-gray-500 mt-2">
              Supported units: px, em, rem, pt, %. Numbers without units will be treated as px.
            </p>
          </div>
          <ModalFooter
            onCancel={() => setShowCustomFontSizeInput(false)}
            onConfirm={handleCustomFontSize}
            confirmText="Apply Size"
            confirmDisabled={!customFontSize.trim()}
          />
        </ModalOverlay>
      )}

      {/* Link Modal */}
      {showLinkModal && (
        <ModalOverlay onClose={() => setShowLinkModal(false)}>
          <ModalHeader title="Add Link" />
          <div className="p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL
            </label>
            <input
              type="url"
              placeholder="https://example.com"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSetLink();
                } else if (e.key === 'Escape') {
                  setShowLinkModal(false);
                }
              }}
            />
          </div>
          <ModalFooter
            onCancel={() => setShowLinkModal(false)}
            onConfirm={handleSetLink}
            confirmText={linkUrl ? 'Update Link' : 'Remove Link'}
            confirmDisabled={false}
          />
        </ModalOverlay>
      )}

      {/* Image Modal */}
      {showImageModal && (
        <ModalOverlay onClose={() => setShowImageModal(false)}>
          <ModalHeader title="Add Image" />
          <div className="p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Image URL
            </label>
            <input
              type="url"
              placeholder="https://example.com/image.jpg"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleAddImage();
                } else if (e.key === 'Escape') {
                  setShowImageModal(false);
                }
              }}
            />
            <p className="text-xs text-gray-500 mt-2">
              Enter a valid image URL (jpg, png, gif, svg, webp)
            </p>
          </div>
          <ModalFooter
            onCancel={() => setShowImageModal(false)}
            onConfirm={handleAddImage}
            confirmText="Add Image"
            confirmDisabled={!imageUrl.trim()}
          />
        </ModalOverlay>
      )}
    </>
  );
};

export default EditorModals;


