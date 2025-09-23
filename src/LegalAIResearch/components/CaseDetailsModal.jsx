import React, { useState } from "react";
import { X, ExternalLink, Download, Loader } from "lucide-react";
import jsPDF from "jspdf";

const CaseDetailsModal = ({ caseData, onClose }) => {
  const [activeTab, setActiveTab] = useState("case_details");
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Function to parse HTML content and convert to structured data
  const parseHtmlContent = (htmlString) => {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlString, "text/html");

      // Extract data from tables
      const tables = doc.querySelectorAll("table");
      const result = [];

      tables.forEach((table) => {
        const rows = table.querySelectorAll("tr");
        const tableData = [];

        rows.forEach((row) => {
          const cells = row.querySelectorAll("td, th");
          const rowData = [];

          cells.forEach((cell) => {
            // Extract text content and preserve links
            const links = cell.querySelectorAll("a");
            if (links.length > 0) {
              const linkData = [];
              links.forEach((link) => {
                linkData.push({
                  text: link.textContent.trim(),
                  href: link.href,
                  target: link.target,
                });
              });
              rowData.push({ type: "links", data: linkData });
            } else {
              rowData.push(cell.textContent.trim());
            }
          });

          if (rowData.length > 0) {
            tableData.push(rowData);
          }
        });

        if (tableData.length > 0) {
          result.push(tableData);
        }
      });

      // If no tables found, extract text content
      if (result.length === 0) {
        const textContent = doc.body.textContent.trim();
        if (textContent) {
          result.push([["Content"], [textContent]]);
        }
      }

      return result;
    } catch (error) {
      console.error("Error parsing HTML:", error);
      return [
        [["Error parsing content"], [htmlString.substring(0, 200) + "..."]],
      ];
    }
  };

  // Function to render cell content
  const renderCellContent = (cell, cellIndex) => {
    if (typeof cell === "object" && cell.type === "links") {
      return (
        <div key={cellIndex}>
          {cell.data.map((link, linkIndex) => (
            <a
              key={linkIndex}
              href={link.href}
              target={link.target || "_blank"}
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline flex items-center"
            >
              {link.text}
              <ExternalLink size={14} className="ml-1" />
            </a>
          ))}
        </div>
      );
    }
    return cell;
  };

  // Function to render tab content based on active tab
  const renderTabContent = () => {
    if (!caseData[activeTab]?.success) {
      return (
        <div className="p-6 text-center">
          <div className="text-gray-400 mb-2">No data available</div>
          <div className="text-sm text-gray-500">
            No {activeTab.replace(/_/g, " ")} information found for this case.
          </div>
        </div>
      );
    }

    const tabData = caseData[activeTab].data;

    // Handle JSON string data
    if (typeof tabData.data === "string" && tabData.data.startsWith("{")) {
      try {
        const jsonData = JSON.parse(tabData.data);
        return (
          <div className="p-4">
            <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto text-sm">
              {JSON.stringify(jsonData, null, 2)}
            </pre>
          </div>
        );
      } catch (e) {
        return (
          <div className="p-4">
            <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto text-sm">
              {tabData.data}
            </pre>
          </div>
        );
      }
    }

    // Parse HTML content
    const tablesData = parseHtmlContent(tabData.data);

    if (tablesData.length === 0) {
      return (
        <div className="p-6 text-center">
          <div className="text-gray-400 mb-2">No structured data available</div>
          <div className="text-sm text-gray-500">
            The {activeTab.replace(/_/g, " ")} data could not be parsed.
          </div>
        </div>
      );
    }

    return (
      <div className="p-4">
        {tablesData.map((table, tableIndex) => (
          <div
            key={tableIndex}
            className="mb-8 bg-white rounded-lg border border-gray-200 overflow-hidden"
          >
            <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
              <h3 className="font-medium text-gray-700">
                {activeTab.replace(/_/g, " ").toUpperCase()} - Table{" "}
                {tableIndex + 1}
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse">
                {table[0] && (
                  <thead>
                    <tr className="bg-gray-100">
                      {table[0].map((header, headerIndex) => (
                        <th
                          key={headerIndex}
                          className="border border-gray-300 p-2 text-left text-xs font-medium text-gray-700 uppercase"
                        >
                          {typeof header === "string" ? header : "Links"}
                        </th>
                      ))}
                    </tr>
                  </thead>
                )}
                <tbody>
                  {table.slice(table[0] ? 1 : 0).map((row, rowIndex) => (
                    <tr
                      key={rowIndex}
                      className={rowIndex % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      {row.map((cell, cellIndex) => (
                        <td
                          key={cellIndex}
                          className="border border-gray-200 p-2 text-sm"
                        >
                          {renderCellContent(cell, cellIndex)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Get all available tabs from the case data
  const availableTabs = Object.keys(caseData).filter(
    (key) => caseData[key]?.success
  );

  // Download PDF function
  // const handleDownloadPDF = async () => {
  //   setIsGeneratingPDF(true);
  //   try {
  //     const doc = new jsPDF();
  //     let yOffset = 20;
  //     const margin = 14;
  //     const maxWidth = 180;

  //     // Add title
  //     doc.setFontSize(16);
  //     doc.setTextColor(40, 40, 40);
  //     doc.text("Case Details Report", margin, yOffset);
  //     yOffset += 10;

  //     // Add timestamp
  //     doc.setFontSize(10);
  //     doc.setTextColor(100, 100, 100);
  //     doc.text(`Generated on: ${new Date().toLocaleString()}`, margin, yOffset);
  //     yOffset += 15;

  //     // Process each tab
  //     for (const tab of availableTabs) {
  //       if (!caseData[tab]?.success) continue;

  //       // Check if we need a new page
  //       if (yOffset > 250) {
  //         doc.addPage();
  //         yOffset = 20;
  //       }

  //       // Add tab heading
  //       doc.setFontSize(12);
  //       doc.setTextColor(40, 40, 40);
  //       doc.setFont(undefined, "bold");
  //       doc.text(tab.replace(/_/g, " ").toUpperCase(), margin, yOffset);
  //       yOffset += 8;

  //       const tabData = caseData[tab].data;

  //       if (typeof tabData.data === "string" && tabData.data.startsWith("<")) {
  //         const tablesData = parseHtmlContent(tabData.data);

  //         for (const table of tablesData) {
  //           for (const row of table) {
  //             if (yOffset > 270) {
  //               doc.addPage();
  //               yOffset = 20;
  //             }

  //             doc.setFontSize(9);
  //             doc.setFont(undefined, "normal");

  //             const rowText = row
  //               .map((cell) => {
  //                 if (typeof cell === "object" && cell.type === "links") {
  //                   return cell.data.map((link) => link.text).join(", ");
  //                 }
  //                 return cell;
  //               })
  //               .join(" | ");

  //             const lines = doc.splitTextToSize(rowText, maxWidth);

  //             for (const line of lines) {
  //               if (yOffset > 270) {
  //                 doc.addPage();
  //                 yOffset = 20;
  //               }
  //               doc.text(line, margin, yOffset);
  //               yOffset += 5;
  //             }

  //             yOffset += 2;
  //           }
  //           yOffset += 5;
  //         }
  //       } else {
  //         // For non-HTML content
  //         const content =
  //           typeof tabData.data === "string"
  //             ? tabData.data
  //             : JSON.stringify(tabData, null, 2);
  //         const lines = doc.splitTextToSize(content, maxWidth);

  //         doc.setFontSize(9);
  //         doc.setFont(undefined, "normal");

  //         for (const line of lines) {
  //           if (yOffset > 270) {
  //             doc.addPage();
  //             yOffset = 20;
  //           }
  //           doc.text(line, margin, yOffset);
  //           yOffset += 5;
  //         }
  //       }

  //       yOffset += 10;
  //     }

  //     // Save the PDF
  //     doc.save("case_details_report.pdf");
  //   } catch (error) {
  //     console.error("Error generating PDF:", error);
  //     alert("Failed to generate PDF. Please check the console for details.");
  //   } finally {
  //     setIsGeneratingPDF(false);
  //   }
  // };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="bg-white rounded-lg shadow-lg w-full max-w-6xl max-h-screen overflow-y-auto">
        {/* Modal Header */}
        <div className="flex justify-between items-center border-b p-4 sticky top-0 bg-white z-10">
          <h3 id="modal-title" className="text-lg font-semibold">
            Case Details
          </h3>
          <div className="flex items-center space-x-2">
            {/* <button
              onClick={handleDownloadPDF}
              disabled={isGeneratingPDF}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center space-x-2 disabled:bg-green-400 disabled:cursor-not-allowed"
            >
              {isGeneratingPDF ? (
                <>
                  <Loader size={18} className="animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Download size={18} />
                  <span>Download PDF</span>
                </>
              )}
            </button> */}
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="border-b">
          <div className="flex overflow-x-auto">
            {availableTabs.map((tab) => (
              <button
                key={tab}
                className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === tab
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab(tab)}
                aria-selected={activeTab === tab}
              >
                {tab.replace(/_/g, " ").toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="min-h-[400px]">{renderTabContent()}</div>

        {/* Modal Footer */}
        <div className="border-t p-4 flex justify-end">
          <button
            onClick={onClose}
            className="bg-gray-100 text-gray-600 hover:bg-gray-200 px-4 py-2 rounded-md transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default CaseDetailsModal;
