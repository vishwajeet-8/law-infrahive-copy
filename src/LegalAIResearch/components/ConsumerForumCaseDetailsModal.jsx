

import React from 'react';
import { X, FileText, Flag, User, Clock, Briefcase, Download } from 'lucide-react';
import jsPDF from 'jspdf';

const ConsumerForumCaseDetailsModal = ({ caseDetails, isLoading, error, onClose }) => {
  
  // Helper function to format dates
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "N/A";
      return date.toLocaleDateString("en-US", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch (error) {
      return "N/A";
    }
  };

  const safeRender = (data) => {
    if (data === null || data === undefined) return "N/A";
    if (typeof data === "object") return JSON.stringify(data);
    return data;
  };

  // Download PDF function for Consumer Forum cases
  const handleDownloadPDF = () => {
    try {
      console.log('Starting Consumer Forum PDF generation with caseDetails:', JSON.stringify(caseDetails, null, 2));

      if (!caseDetails || typeof caseDetails !== 'object') {
        console.error('Invalid or missing caseDetails');
        alert('No valid case details available to generate PDF.');
        return;
      }

      const doc = new jsPDF();
      let yOffset = 20;
      const pageHeight = 260; // Reduced to force earlier page breaks
      const maxWidth = 180; // Maximum width in mm for text wrapping
      const marginBottom = 20; // Minimum margin at bottom

      // Add a new page if yOffset exceeds page height
      const addNewPageIfNeeded = () => {
        if (yOffset + marginBottom > pageHeight) {
          console.log(`Adding new page at yOffset: ${yOffset}, pageHeight: ${pageHeight}`);
          doc.addPage();
          yOffset = 20; // Reset yOffset for new page
        }
      };

      // Utility function to add wrapped text with precise height
      const addWrappedText = (text, x, y, fontSize) => {
        doc.setFontSize(fontSize);
        const lines = doc.splitTextToSize(text, maxWidth);
        console.log(`Adding text: "${text}", lines: ${lines.length}, height contribution: ${lines.length * (fontSize / 2)}mm, new yOffset: ${y + (lines.length * (fontSize / 2))}`);
        doc.text(lines, x, y);
        const lineHeight = fontSize / 2; // Adjusted for conservative height
        return y + (lines.length * lineHeight);
      };

      // Title
      console.log('Adding title, yOffset:', yOffset);
      yOffset = addWrappedText("Consumer Forum Case Details", 14, yOffset, 16);
      yOffset += 10;
      addNewPageIfNeeded();

      // Case Header
      console.log('Adding case header, yOffset:', yOffset);
      const caseTitle = `${caseDetails.caseNumber || 'N/A'} - ${caseDetails.complainant || 'N/A'} vs. ${caseDetails.respondent || 'N/A'}`;
      yOffset = addWrappedText(caseTitle, 14, yOffset, 14);
      yOffset += 2;

      console.log('Adding case info, yOffset:', yOffset);
      const caseInfo = [
        `Commission: ${caseDetails.commission || 'N/A'}`,
        `Filed: ${formatDate(caseDetails.filingDate)}`,
        `Status: ${caseDetails.status || 'REGISTERED'}`,
      ].join(' | ');
      yOffset = addWrappedText(caseInfo, 14, yOffset, 10);
      yOffset += 5;
      addNewPageIfNeeded();

      // Filing Information
      console.log('Adding filing information, yOffset:', yOffset);
      doc.setFontSize(12);
      doc.text("Filing Information", 14, yOffset);
      yOffset += 8;
      doc.setFontSize(10);
      const filingInfo = [
        { label: 'Case Number', value: caseDetails.caseNumber || 'N/A' },
        { label: 'Filing Date', value: formatDate(caseDetails.filingDate) },
        { label: 'Filing Number', value: caseDetails.filingNumber || 'N/A' },
        { label: 'Commission', value: caseDetails.commission || 'N/A' },
      ];
      filingInfo.forEach((item) => {
        yOffset = addWrappedText(`${item.label}: ${item.value}`, 14, yOffset, 10);
        addNewPageIfNeeded();
      });
      yOffset += 5;
      addNewPageIfNeeded();

      // Status Information
      console.log('Adding status information, yOffset:', yOffset);
      doc.setFontSize(12);
      doc.text("Status Information", 14, yOffset);
      yOffset += 8;
      doc.setFontSize(10);
      const statusInfo = [
        { label: 'Status', value: caseDetails.status || 'N/A' },
        { label: 'Purpose', value: caseDetails.purpose || 'N/A' },
        { label: 'Next Hearing', value: formatDate(caseDetails.nextHearing) },
      ].filter((item) => item.value && item.value !== 'N/A');
      statusInfo.forEach((item) => {
        yOffset = addWrappedText(`${item.label}: ${item.value}`, 14, yOffset, 10);
        addNewPageIfNeeded();
      });
      yOffset += 5;
      addNewPageIfNeeded();

      // Parties Information
      console.log('Adding parties information, yOffset:', yOffset);
      doc.setFontSize(12);
      doc.text("Parties", 14, yOffset);
      yOffset += 8;
      doc.setFontSize(10);
      
      // Complainants
      const complainants = caseDetails.parties?.complainant || [caseDetails.complainant];
      if (complainants && complainants.length > 0) {
        yOffset = addWrappedText(`Complainants: ${complainants.filter(Boolean).join(', ')}`, 14, yOffset, 10);
        addNewPageIfNeeded();
      }
      
      // Respondents
      const respondents = caseDetails.parties?.respondent || [caseDetails.respondent];
      if (respondents && respondents.length > 0) {
        yOffset = addWrappedText(`Respondents: ${respondents.filter(Boolean).join(', ')}`, 14, yOffset, 10);
        addNewPageIfNeeded();
      }
      yOffset += 5;
      addNewPageIfNeeded();

      // Case History
      if (caseDetails.history && caseDetails.history.length > 0) {
        console.log('Adding history information, yOffset:', yOffset);
        doc.setFontSize(12);
        doc.text("Case History", 14, yOffset);
        yOffset += 8;
        doc.setFontSize(10);
        
        caseDetails.history.forEach((event, index) => {
          const eventText = `Date: ${formatDate(event.date)} | Stage: ${event.stage || 'N/A'}`;
          yOffset = addWrappedText(eventText, 14, yOffset, 10);
          addNewPageIfNeeded();
          
          if (event.nextDate) {
            yOffset = addWrappedText(`Next Date: ${formatDate(event.nextDate)}`, 14, yOffset, 10);
            addNewPageIfNeeded();
          }
          
          if (event.proceeding) {
            const proceedingText = `Proceeding: ${typeof event.proceeding === 'object' ? JSON.stringify(event.proceeding) : event.proceeding}`;
            yOffset = addWrappedText(proceedingText, 14, yOffset, 10);
            addNewPageIfNeeded();
          }
          
          if (event.dailyOrder) {
            yOffset = addWrappedText('Daily Order: Yes', 14, yOffset, 10);
            addNewPageIfNeeded();
          }
          
          yOffset += 3; // Space between events
          addNewPageIfNeeded();
        });
        yOffset += 5;
      }
      addNewPageIfNeeded();

      // Applications
      if (caseDetails.applications && caseDetails.applications.length > 0) {
        console.log('Adding applications, yOffset:', yOffset);
        doc.setFontSize(12);
        doc.text("Applications", 14, yOffset);
        yOffset += 8;
        doc.setFontSize(10);
        
        caseDetails.applications.forEach((app) => {
          const appText = `Type: ${safeRender(app.type)} | Filed On: ${formatDate(app.filedOn)} | Status: ${safeRender(app.status)}`;
          yOffset = addWrappedText(appText, 14, yOffset, 10);
          addNewPageIfNeeded();
        });
        yOffset += 5;
      }
      addNewPageIfNeeded();

      // Lower Court Cases
      if (caseDetails.lowerCourtCases && caseDetails.lowerCourtCases.length > 0) {
        console.log('Adding lower court cases, yOffset:', yOffset);
        doc.setFontSize(12);
        doc.text("Lower Court Cases", 14, yOffset);
        yOffset += 8;
        doc.setFontSize(10);
        
        caseDetails.lowerCourtCases.forEach((lowerCase) => {
          const lowerCaseText = `Case Number: ${lowerCase.caseNumber || 'N/A'} | Court: ${safeRender(lowerCase.court)}`;
          yOffset = addWrappedText(lowerCaseText, 14, yOffset, 10);
          addNewPageIfNeeded();
        });
        yOffset += 5;
      }

      // Save the PDF
      const fileName = caseDetails.caseNumber && typeof caseDetails.caseNumber === 'string' 
        ? `${caseDetails.caseNumber.replace(/[\/\\:*?"<>|]/g, '_')}.pdf` 
        : 'consumer_forum_case.pdf';
      console.log('Saving PDF as:', fileName, 'final yOffset:', yOffset);
      doc.save(fileName);
      console.log('PDF generated successfully');
    } catch (error) {
      console.error('Error generating PDF:', error.message, error.stack);
      alert('Failed to generate PDF. Please check the console for details.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b p-4 sticky top-0 bg-white z-10">
          <h3 className="text-lg font-semibold">Consumer Forum Case Details</h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleDownloadPDF}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center space-x-2"
              disabled={!caseDetails}
            >
              <Download size={18} />
              <span>Download PDF</span>
            </button>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X size={20} />
            </button>
          </div>
        </div>
        
        <div className="p-4">
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-700">{error}</div>
          ) : caseDetails ? (
            <div>
              {/* Case Header */}
              <div className="mb-6">
                <h2 className="text-xl font-bold mb-2">
                  {caseDetails.caseNumber || "N/A"}
                </h2>
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="text-black text-sm font-medium">
                    Commission: {caseDetails.commission || "N/A"}
                  </span>
                  <span className="text-black text-sm mx-2 font-medium">|</span>
                  <span className="text-black text-sm font-medium">
                    Filed: {formatDate(caseDetails.filing?.date)}
                  </span>
                  <span className="text-black text-sm mx-2 font-medium">|</span>
                  {caseDetails.status && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {caseDetails.status.stage || "UNKNOWN"}
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Filing Information */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                    <FileText size={16} className="mr-2" />
                    Filing Information
                  </h4>
                  <div className="space-y-2 bg-gray-50 p-4 rounded-md">
                    <div className="flex">
                      <span className="text-gray-500 w-32">Filing Number:</span>
                      <span>{caseDetails.filing?.number || "N/A"}</span>
                    </div>
                    <div className="flex">
                      <span className="text-gray-500 w-32">Filing Date:</span>
                      <span>{formatDate(caseDetails.filing?.date)}</span>
                    </div>
                  </div>
                </div>

                {/* Status Information */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                    <Flag size={16} className="mr-2" />
                    Current Status
                  </h4>
                  <div className="space-y-2 bg-gray-50 p-4 rounded-md">
                    <div className="flex">
                      <span className="text-gray-500 w-32">Stage:</span>
                      <span>{caseDetails.status?.stage || "N/A"}</span>
                    </div>
                    <div className="flex">
                      <span className="text-gray-500 w-32">Purpose:</span>
                      <span>{caseDetails.status?.purpose || "N/A"}</span>
                    </div>
                    <div className="flex">
                      <span className="text-gray-500 w-32">Next Hearing:</span>
                      <span>{formatDate(caseDetails.status?.nextHearing)}</span>
                    </div>
                  </div>
                </div>

                {/* Parties Information */}
                <div className="md:col-span-2">
                  <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                    <User size={16} className="mr-2" />
                    Parties
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="text-xs uppercase text-gray-500 mb-2">
                        Complainant(s)
                      </h5>
                      <div className="bg-gray-50 p-4 rounded-md">
                        {caseDetails.parties?.complainant?.length ? (
                          <ul className="list-disc list-inside space-y-1">
                            {caseDetails.parties.complainant.map(
                              (complainant, index) => (
                                <li key={index} className="text-gray-800">
                                  {safeRender(complainant)}
                                </li>
                              )
                            )}
                          </ul>
                        ) : (
                          <p className="text-gray-500 text-sm">
                            No complainant information available
                          </p>
                        )}
                      </div>
                    </div>
                    <div>
                      <h5 className="text-xs uppercase text-gray-500 mb-2">
                        Respondent(s)
                      </h5>
                      <div className="bg-gray-50 p-4 rounded-md">
                        {caseDetails.parties?.respondent?.length ? (
                          <ul className="list-disc list-inside space-y-1">
                            {caseDetails.parties.respondent.map(
                              (respondent, index) => (
                                <li key={index} className="text-gray-800">
                                  {safeRender(respondent)}
                                </li>
                              )
                            )}
                          </ul>
                        ) : (
                          <p className="text-gray-500 text-sm">
                            No respondent information available
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Case History */}
                {caseDetails.history && caseDetails.history.length > 0 && (
                  <div className="md:col-span-2 mt-2">
                    <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                      <Clock size={16} className="mr-2" />
                      Case History
                    </h4>
                    <div className="space-y-4">
                      {caseDetails.history.map((event, index) => (
                        <div
                          key={index}
                          className="border border-gray-200 rounded-md p-3"
                        >
                          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-2">
                            <div className="flex flex-col">
                              <div className="flex items-center">
                                <span className="text-gray-700 font-medium">
                                  {formatDate(event.date)}
                                </span>
                                {event.dailyOrder && (
                                  <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">
                                    Daily Order
                                  </span>
                                )}
                              </div>
                              <span className="text-sm text-gray-500 mt-1">
                                ID: {event.id || "N/A"}
                              </span>
                            </div>
                            <div className="text-sm text-gray-500 mt-1 md:mt-0">
                              Stage: {event.stage || "N/A"}
                            </div>
                          </div>
                          {event.proceeding && (
                            <div className="mt-2 bg-gray-50 p-3 rounded text-gray-700 text-sm whitespace-pre-line">
                              {typeof event.proceeding === "object"
                                ? JSON.stringify(event.proceeding)
                                : event.proceeding}
                            </div>
                          )}
                          {event.nextDate && (
                            <div className="mt-2 text-sm">
                              <span className="text-gray-500">Next Date:</span>{" "}
                              <span className="text-gray-700">
                                {formatDate(event.nextDate)}
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Applications */}
                {caseDetails.applications &&
                  caseDetails.applications.length > 0 && (
                    <div className="md:col-span-2 mt-2">
                      <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                        <Briefcase size={16} className="mr-2" />
                        Applications
                      </h4>
                      <div className="overflow-x-auto">
                        <table className="min-w-full border-collapse">
                          <thead>
                            <tr className="bg-gray-100">
                              <th className="border border-gray-300 p-2 text-left text-xs font-medium text-gray-500 uppercase">
                                Type
                              </th>
                              <th className="border border-gray-300 p-2 text-left text-xs font-medium text-gray-500 uppercase">
                                Filed On
                              </th>
                              <th className="border border-gray-300 p-2 text-left text-xs font-medium text-gray-500 uppercase">
                                Status
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {caseDetails.applications.map((app, index) => (
                              <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                <td className="border border-gray-300 p-2 text-sm">
                                  {safeRender(app.type)}
                                </td>
                                <td className="border border-gray-300 p-2 text-sm">
                                  {formatDate(app.filedOn)}
                                </td>
                                <td className="border border-gray-300 p-2 text-sm">
                                  {safeRender(app.status)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                {/* Lower Court Cases */}
                {caseDetails.lowerCourtCases &&
                  caseDetails.lowerCourtCases.length > 0 && (
                    <div className="md:col-span-2 mt-2">
                      <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                        <Briefcase size={16} className="mr-2" />
                        Lower Court Cases
                      </h4>
                      <div className="space-y-2">
                        {caseDetails.lowerCourtCases.map((lowerCase, index) => (
                          <div
                            key={index}
                            className="p-3 border border-gray-200 rounded-md bg-gray-50"
                          >
                            <p className="font-medium">
                              {lowerCase.caseNumber || "N/A"}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                              {safeRender(lowerCase.court)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Court Information */}
                <div className="md:col-span-2">
                  <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                    <Briefcase size={16} className="mr-2" />
                    Court Information
                  </h4>
                  <div className="space-y-2 bg-gray-50 p-4 rounded-md">
                    <div className="flex">
                      <span className="text-gray-500 w-32">Court:</span>
                      <span>Consumer Forum</span>
                    </div>
                    <div className="flex">
                      <span className="text-gray-500 w-32">Commission:</span>
                      <span>{caseDetails.commission || "N/A"}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-gray-50 rounded-md border border-gray-200">
              <p className="text-gray-600">No case details available.</p>
            </div>
          )}
        </div>
        
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

export default ConsumerForumCaseDetailsModal;