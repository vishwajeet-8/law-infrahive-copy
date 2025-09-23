// components/TableControls.jsx - Enhanced Table Management Component with Auto New Line
import React from 'react';
import { Trash2 } from 'lucide-react';

const TableControls = ({
  editor,
  editorState,
  tableRows,
  setTableRows,
  tableCols,
  setTableCols,
  tableWithHeader,
  setTableWithHeader,
  onClose
}) => {
  const insertTable = () => {
    if (!editor) return;
    
    try {
      // Insert the table
      editor.chain()
        .focus()
        .insertTable({ 
          rows: tableRows, 
          cols: tableCols, 
          withHeaderRow: tableWithHeader 
        })
        .run();

      // Wait a moment for the table to be inserted, then add a new paragraph below it
      setTimeout(() => {
        try {
          const { selection, doc } = editor.state;
          const { $from } = selection;
          
          // Find the table node
          let tableNode = null;
          let tablePos = null;
          
          // Walk up the document structure to find the table
          for (let depth = $from.depth; depth >= 0; depth--) {
            const node = $from.node(depth);
            if (node.type.name === 'table') {
              tableNode = node;
              tablePos = $from.start(depth);
              break;
            }
          }
          
          if (tableNode && tablePos !== null) {
            // Calculate position after the table
            const afterTablePos = tablePos + tableNode.nodeSize;
            
            // Check if there's already content after the table
            const nextNode = doc.nodeAt(afterTablePos);
            
            // If there's no content after the table, or if the next node is not a paragraph,
            // insert a new paragraph
            if (!nextNode || nextNode.type.name !== 'paragraph') {
              editor.chain()
                .focus()
                .setTextSelection(afterTablePos)
                .insertContent('<p><br></p>')
                .run();
              
              console.log('Added new paragraph after table at position:', afterTablePos);
            }
          }
        } catch (error) {
          console.error('Error adding paragraph after table:', error);
          // Fallback: just try to insert a paragraph at current position
          try {
            editor.chain()
              .focus()
              .insertContent('<p><br></p>')
              .run();
          } catch (fallbackError) {
            console.error('Fallback paragraph insertion also failed:', fallbackError);
          }
        }
      }, 100); // Small delay to ensure table is fully inserted
      
      onClose();
      console.log('Table inserted successfully with auto new line');
    } catch (error) {
      console.error('Error inserting table:', error);
    }
  };

  const deleteTable = () => {
    if (!editor) return;
    editor.chain().focus().deleteTable().run();
    onClose();
  };

  const addColumnBefore = () => {
    if (!editor) return;
    editor.chain().focus().addColumnBefore().run();
    onClose();
  };

  const addColumnAfter = () => {
    if (!editor) return;
    editor.chain().focus().addColumnAfter().run();
    onClose();
  };

  const deleteColumn = () => {
    if (!editor) return;
    editor.chain().focus().deleteColumn().run();
    onClose();
  };

  const addRowBefore = () => {
    if (!editor) return;
    editor.chain().focus().addRowBefore().run();
    onClose();
  };

  const addRowAfter = () => {
    if (!editor) return;
    editor.chain().focus().addRowAfter().run();
    onClose();
  };

  const deleteRow = () => {
    if (!editor) return;
    editor.chain().focus().deleteRow().run();
    onClose();
  };

  const addMultipleColumns = () => {
    const numCols = parseInt(prompt('Number of columns to add:') || '1');
    if (numCols > 0) {
      for (let i = 0; i < numCols; i++) {
        editor.chain().focus().addColumnAfter().run();
      }
    }
    onClose();
  };

  const addMultipleRows = () => {
    const numRows = parseInt(prompt('Number of rows to add:') || '1');
    if (numRows > 0) {
      for (let i = 0; i < numRows; i++) {
        editor.chain().focus().addRowAfter().run();
      }
    }
    onClose();
  };

  return (
    <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-lg z-50">
      <div className="p-4 border-b border-gray-100 text-sm text-gray-600 font-medium">
        Table Options
      </div>
      
      {!editorState.table ? (
        // Not in table - show insert form
        <div className="p-4 space-y-4 h-90 overflow-auto">
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
                onChange={(e) => setTableRows(parseInt(e.target.value) || 1)}
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
                onChange={(e) => setTableCols(parseInt(e.target.value) || 1)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="withHeader"
              checked={tableWithHeader}
              onChange={(e) => setTableWithHeader(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="withHeader" className="text-sm text-gray-700">
              Include header row
            </label>
          </div>
          
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-sm text-gray-600 mb-2">Preview:</div>
            <div 
              className="grid gap-1" 
              style={{
                gridTemplateColumns: `repeat(${tableCols}, 1fr)`,
                maxWidth: '140px'
              }}
            >
              {Array.from({ length: tableRows * tableCols }, (_, index) => {
                const row = Math.floor(index / tableCols);
                const isHeader = tableWithHeader && row === 0;
                return (
                  <div
                    key={index}
                    className={`h-5 border border-gray-300 text-xs flex items-center justify-center rounded ${
                      isHeader ? 'bg-gray-200 font-medium' : 'bg-white'
                    }`}
                  >
                    {isHeader ? 'H' : ''}
                  </div>
                );
              })}
            </div>
            <div className="text-xs text-gray-500 mt-2">
              {tableRows} × {tableCols}{tableWithHeader ? ' (with header)' : ''}
            </div>
          </div>
          
          <button
            onClick={insertTable}
            className="w-full bg-blue-600 text-white text-sm py-2.5 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Insert Table + New Line
          </button>
        </div>
      ) : (
        // In table - show table management options
        <>
          <div className="p-3 border-b border-gray-100">
            <div className="text-sm text-blue-600 font-bold mb-3">Column Actions</div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={addColumnBefore}
                className="text-sm px-3 py-2 bg-green-100 hover:bg-green-200 text-green-800 rounded-lg transition-colors"
              >
                Add Before
              </button>
              <button
                onClick={addColumnAfter}
                className="text-sm px-3 py-2 bg-green-100 hover:bg-green-200 text-green-800 rounded-lg transition-colors"
              >
                Add After
              </button>
              <button
                onClick={deleteColumn}
                className="text-sm px-3 py-2 bg-red-100 hover:bg-red-200 text-red-800 rounded-lg col-span-2 transition-colors"
              >
                Delete Column
              </button>
            </div>
          </div>

          <div className="p-3 border-b border-gray-100">
            <div className="text-sm text-blue-600 font-bold mb-3">Row Actions</div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={addRowBefore}
                className="text-sm px-3 py-2 bg-green-100 hover:bg-green-200 text-green-800 rounded-lg transition-colors"
              >
                Add Above
              </button>
              <button
                onClick={addRowAfter}
                className="text-sm px-3 py-2 bg-green-100 hover:bg-green-200 text-green-800 rounded-lg transition-colors"
              >
                Add Below
              </button>
              <button
                onClick={deleteRow}
                className="text-sm px-3 py-2 bg-red-100 hover:bg-red-200 text-red-800 rounded-lg col-span-2 transition-colors"
              >
                Delete Row
              </button>
            </div>
          </div>

          <div className="p-3 border-b border-gray-100">
            <div className="text-sm text-blue-600 font-bold mb-3">Bulk Actions</div>
            <div className="space-y-2">
              <button
                onClick={addMultipleColumns}
                className="w-full text-sm px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-lg transition-colors"
              >
                Add Multiple Columns
              </button>
              <button
                onClick={addMultipleRows}
                className="w-full text-sm px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-lg transition-colors"
              >
                Add Multiple Rows
              </button>
            </div>
          </div>

          <div className="p-3">
            <button
              onClick={deleteTable}
              className="w-full text-sm px-4 py-2.5 bg-red-600 text-white hover:bg-red-700 rounded-lg flex items-center gap-2 justify-center transition-colors"
            >
              <Trash2 size={16} />
              Delete Entire Table
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default TableControls;