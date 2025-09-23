import React, { useState } from "react";
import { X, AlertTriangle, Star, Calendar, Building, User, FileText, Scale, Download, ExternalLink } from "lucide-react";
import jsPDF from 'jspdf';

// StatusBadge component
const StatusBadge = ({ status }) => {
  let bgColor = 'bg-gray-100';
  let textColor = 'text-gray-800';
  
  if (status) {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('dispos') || statusLower === 'disposed') {
      bgColor = 'bg-green-100';
      textColor = 'text-green-800';
    } else if (statusLower.includes('pending')) {
      bgColor = 'bg-yellow-100';
      textColor = 'text-yellow-800';
    } else if (statusLower.includes('direction') || statusLower.includes('fresh')) {
      bgColor = 'bg-blue-100';
      textColor = 'text-blue-800';
    }
  }
  
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
      {status || 'Unknown'}
    </span>
  );
};

const CatCaseDetailsModal = ({
  caseDetails,
  isLoading,
  error,
  onClose,
  onRetry,
  handleFollowCase,
  isCaseFollowed,
  followLoading,
  isOwner, // Added to control follow button visibility
}) => {
  const [activeTab, setActiveTab] = useState('overview');

  // Default caseDetails to prevent null/undefined errors
  const defaultDetails = {
    cnr: "N/A",
    title: "N/A",
    filing: {
      number: "N/A",
      type: "N/A",
      date: "N/A",
    },
    status: {
      stage: "N/A",
      natureOfDisposal: "N/A",
      dateOfDisposal: "N/A",
    },
    petitioner: {
      names: ["N/A"],
      address: "N/A",
      advocates: ["N/A"],
    },
    respondents: {
      names: ["N/A"],
      address: "N/A",
      advocates: ["N/A"],
    },
    caseProceedings: [],
    orders: [],
    finalOrders: [],
    documentFiling: [],
  };

  const displayDetails = caseDetails || defaultDetails;

  const formatDate = (dateString) => {
    if (!dateString || dateString.includes("1970-01-01")) return "Not Available";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Not Available";
      return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch (err) {
      return "Not Available";
    }
  };

  // Extract diary number from CNR or title for follow functionality
  const getDiaryNumber = () => {
    if (displayDetails.cnr && displayDetails.cnr !== "N/A") {
      const match = displayDetails.cnr.match(/(\d+)(\d{4})$/);
      if (match) {
        return `${match[1]}/${match[2]}`;
      }
    }
    return displayDetails.cnr || "N/A";
  };

  // Download PDF function
  const handleDownloadPDF = () => {
    try {
      console.log('Starting CAT PDF generation with caseDetails:', JSON.stringify(displayDetails, null, 2));

      const doc = new jsPDF();
      let yOffset = 20;
      const pageHeight = 260;
      const maxWidth = 180;
      const marginBottom = 20;

      const addNewPageIfNeeded = () => {
        if (yOffset + marginBottom > pageHeight) {
          console.log(`Adding new page at yOffset: ${yOffset}, pageHeight: ${pageHeight}`);
          doc.addPage();
          yOffset = 20;
        }
      };

      const addWrappedText = (text, x, y, fontSize) => {
        doc.setFontSize(fontSize);
        const lines = doc.splitTextToSize(text, maxWidth);
        console.log(`Adding text: "${text}", lines: ${lines.length}, height contribution: ${lines.length * (fontSize / 2)}mm, new yOffset: ${y + (lines.length * (fontSize / 2))}`);
        doc.text(lines, x, y);
        const lineHeight = fontSize / 2;
        return y + (lines.length * lineHeight);
      };

      // Title
      yOffset = addWrappedText("Central Administrative Tribunal (CAT) Case Details", 14, yOffset, 16);
      yOffset += 10;
      addNewPageIfNeeded();

      // Case Header
      const caseTitle = displayDetails.title || 'N/A';
      yOffset = addWrappedText(caseTitle, 14, yOffset, 14);
      yOffset += 2;

      const caseInfo = [
        `CNR: ${displayDetails.cnr || 'N/A'}`,
        `Filing: ${displayDetails.filing?.date ? formatDate(displayDetails.filing.date) : 'N/A'}`,
        `Status: ${displayDetails.status?.stage || 'N/A'}`,
      ].join(' | ');
      yOffset = addWrappedText(caseInfo, 14, yOffset, 10);
      yOffset += 5;
      addNewPageIfNeeded();

      // Basic Information
      doc.setFontSize(12);
      doc.text("Basic Information", 14, yOffset);
      yOffset += 8;
      doc.setFontSize(10);
      const basicInfo = [
        { label: 'CNR', value: displayDetails.cnr || 'N/A' },
        { label: 'Case Title', value: displayDetails.title || 'N/A' },
        { label: 'Filing Number', value: displayDetails.filing?.number || 'N/A' },
        { label: 'Filing Type', value: displayDetails.filing?.type || 'N/A' },
      ];
      basicInfo.forEach((item) => {
        yOffset = addWrappedText(`${item.label}: ${item.value}`, 14, yOffset, 10);
        addNewPageIfNeeded();
      });
      yOffset += 5;

      // Filing & Status Information
      doc.setFontSize(12);
      doc.text("Filing & Status Information", 14, yOffset);
      yOffset += 8;
      doc.setFontSize(10);
      const statusInfo = [
        { label: 'Filing Date', value: formatDate(displayDetails.filing?.date) },
        { label: 'Case Stage', value: displayDetails.status?.stage || 'N/A' },
        { label: 'Nature of Disposal', value: displayDetails.status?.natureOfDisposal || 'N/A' },
        { label: 'Date of Disposal', value: formatDate(displayDetails.status?.dateOfDisposal) },
      ];
      statusInfo.forEach((item) => {
        yOffset = addWrappedText(`${item.label}: ${item.value}`, 14, yOffset, 10);
        addNewPageIfNeeded();
      });
      yOffset += 5;

      // Petitioner Information
      if (displayDetails.petitioner) {
        doc.setFontSize(12);
        doc.text("Petitioner Information", 14, yOffset);
        yOffset += 8;
        doc.setFontSize(10);
        yOffset = addWrappedText(`Name: ${displayDetails.petitioner.names?.join(', ').replace(/,\s*$/, '') || 'N/A'}`, 14, yOffset, 10);
        addNewPageIfNeeded();
        yOffset = addWrappedText(`Address: ${displayDetails.petitioner.address || 'N/A'}`, 14, yOffset, 10);
        addNewPageIfNeeded();
        yOffset = addWrappedText(`Advocates: ${displayDetails.petitioner.advocates?.length > 0 ? displayDetails.petitioner.advocates.join(', ') : 'N/A'}`, 14, yOffset, 10);
        addNewPageIfNeeded();
        yOffset += 5;
      }

      // Respondent Information
      if (displayDetails.respondents) {
        doc.setFontSize(12);
        doc.text("Respondent Information", 14, yOffset);
        yOffset += 8;
        doc.setFontSize(10);
        yOffset = addWrappedText(`Name: ${displayDetails.respondents.names?.join(', ').replace(/,\s*$/, '') || 'N/A'}`, 14, yOffset, 10);
        addNewPageIfNeeded();
        yOffset = addWrappedText(`Address: ${displayDetails.respondents.address || 'N/A'}`, 14, yOffset, 10);
        addNewPageIfNeeded();
        yOffset = addWrappedText(`Advocates: ${displayDetails.respondents.advocates?.length > 0 ? displayDetails.respondents.advocates.join(', ').replace(/^,\s*/, '') : 'N/A'}`, 14, yOffset, 10);
        addNewPageIfNeeded();
        yOffset += 5;
      }

      // Case Proceedings
      if (displayDetails.caseProceedings?.length > 0) {
        doc.setFontSize(12);
        doc.text("Case Proceedings", 14, yOffset);
        yOffset += 8;
        doc.setFontSize(10);
        displayDetails.caseProceedings.forEach((proceeding) => {
          const proceedingText = `Date: ${formatDate(proceeding.hearingDate)} | Court: ${proceeding.courtNumber || 'N/A'} | Purpose: ${proceeding.purpose || 'N/A'} | Next: ${formatDate(proceeding.nextDate)} | Status: ${proceeding.status === 'D' ? 'Disposed' : 'Pending'}`;
          yOffset = addWrappedText(proceedingText, 14, yOffset, 10);
          addNewPageIfNeeded();
        });
        yOffset += 5;
      }

      // Orders
      if (displayDetails.orders?.length > 0) {
        doc.setFontSize(12);
        doc.text("Orders", 14, yOffset);
        yOffset += 8;
        doc.setFontSize(10);
        displayDetails.orders.forEach((order, index) => {
          const orderText = `Order ${index + 1} - Date: ${formatDate(order.date)}`;
          yOffset = addWrappedText(orderText, 14, yOffset, 10);
          if (order.url) {
            doc.setTextColor(0, 0, 255);
            const linkText = 'View Order';
            const textWidth = doc.getTextWidth(linkText);
            const linkX = 14;
            const linkY = yOffset;
            yOffset = addWrappedText(linkText, linkX, linkY, 10);
            doc.link(linkX, linkY - 2, textWidth, 6, { url: order.url });
            doc.setTextColor(0, 0, 0);
          }
          addNewPageIfNeeded();
        });
        yOffset += 5;
      }

      // Final Orders
      if (displayDetails.finalOrders?.length > 0) {
        doc.setFontSize(12);
        doc.text("Final Orders", 14, yOffset);
        yOffset += 8;
        doc.setFontSize(10);
        displayDetails.finalOrders.forEach((order, index) => {
          const orderText = `Final Order ${index + 1} - Date: ${formatDate(order.date)}`;
          yOffset = addWrappedText(orderText, 14, yOffset, 10);
          if (order.url) {
            doc.setTextColor(0, 0, 255);
            const linkText = 'Download PDF';
            const textWidth = doc.getTextWidth(linkText);
            const linkX = 14;
            const linkY = yOffset;
            yOffset = addWrappedText(linkText, linkX, linkY, 10);
            doc.link(linkX, linkY - 2, textWidth, 6, { url: order.url });
            doc.setTextColor(0, 0, 0);
          }
          addNewPageIfNeeded();
        });
      }

      // Document Filing
      if (displayDetails.documentFiling?.length > 0) {
        doc.setFontSize(12);
        doc.text("Document Filing", 14, yOffset);
        yOffset += 8;
        doc.setFontSize(10);
        displayDetails.documentFiling.forEach((doc, index) => {
          const docText = `Document ${index + 1} - Description: ${doc.description || 'N/A'} | Filed: ${formatDate(doc.date)}`;
          yOffset = addWrappedText(docText, 14, yOffset, 10);
          if (doc.url) {
            doc.setTextColor(0, 0, 255);
            const linkText = 'View Document';
            const textWidth = doc.getTextWidth(linkText);
            const linkX = 14;
            const linkY = yOffset;
            yOffset = addWrappedText(linkText, linkX, linkY, 10);
            doc.link(linkX, linkY - 2, textWidth, 6, { url: doc.url });
            doc.setTextColor(0, 0, 0);
          }
          addNewPageIfNeeded();
        });
      }

      // Save the PDF
      const fileName = displayDetails.cnr && typeof displayDetails.cnr === 'string' ? `${displayDetails.cnr}.pdf` : 'cat_case.pdf';
      console.log('Saving PDF as:', fileName, 'final yOffset:', yOffset);
      doc.save(fileName);
      console.log('PDF generated successfully');
    } catch (error) {
      console.error('Error generating PDF:', error.message, error.stack);
      alert('Failed to generate PDF. Please check the console for details.');
    }
  };

  // Determine which tabs to show based on available data
  const getAvailableTabs = () => {
    const tabs = ['overview', 'parties'];
    
    if (displayDetails.caseProceedings?.length > 0) tabs.push('proceedings');
    if (displayDetails.orders?.length > 0) tabs.push('orders');
    if (displayDetails.finalOrders?.length > 0) tabs.push('finalOrders');
    if (displayDetails.documentFiling?.length > 0) tabs.push('documents');
    
    return tabs;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center border-b p-6 sticky top-0 bg-white z-10">
          <div className="flex items-center">
            <Scale size={24} className="text-blue-600 mr-3" />
            <div>
              <h2 className="text-xl font-bold text-gray-800">CAT Case Details</h2>
              {displayDetails.cnr && (
                <p className="text-sm text-gray-600">CNR: {displayDetails.cnr}</p>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleDownloadPDF}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center space-x-2"
              disabled={!displayDetails}
            >
              <Download size={18} />
              <span>Download PDF</span>
            </button>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-lg text-gray-600">Loading case details...</span>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 mr-3 flex-shrink-0 text-red-600 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-red-800">Error Loading Case Details</h3>
                  <p className="text-sm text-red-600 mt-1">{error}</p>
                  <button
                    onClick={onRetry}
                    className="mt-3 bg-red-100 text-red-800 px-3 py-1 rounded text-sm hover:bg-red-200 transition-colors"
                  >
                    Retry
                  </button>
                </div>
              </div>
            </div>
          )}

          {!isLoading && (
            <div>
              {/* Case Header */}
              <div className="mb-6">
                <h2 className="text-xl font-bold mb-2">
                  {displayDetails.title || `${displayDetails.filing?.number || 'N/A'} - ${displayDetails.petitioner?.names?.[0] || 'N/A'} vs. ${displayDetails.respondents?.names?.[0] || 'N/A'}`}
                </h2>
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="text-black text-sm font-medium">CNR: {displayDetails.cnr}</span>
                  <span className="text-black text-sm mx-2 font-medium">|</span>
                  <span className="text-black text-sm font-medium">Filed: {formatDate(displayDetails.filing?.date)}</span>
                  <span className="text-black text-sm mx-2 font-medium">|</span>
                  <StatusBadge status={displayDetails.status?.stage || 'PENDING'} />
                </div>

                {/* Follow Button */}
                {/* {isOwner && (
                  <div className="mt-4">
                    <button
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                        isCaseFollowed(getDiaryNumber())
                          ? "text-yellow-700 bg-yellow-100 hover:bg-yellow-200"
                          : "text-gray-700 bg-gray-100 hover:bg-gray-200"
                      }`}
                      onClick={() =>
                        handleFollowCase({
                          diaryNumber: getDiaryNumber(),
                          caseNumber: displayDetails.filing?.number || "N/A",
                          applicantName: displayDetails.petitioner?.names?.[0] || "N/A",
                          defendantName: displayDetails.respondents?.names?.[0] || "N/A",
                          cnr: displayDetails.cnr,
                        })
                      }
                      disabled={followLoading}
                    >
                      {followLoading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                      ) : (
                        <>
                          <Star
                            size={16}
                            className={
                              isCaseFollowed(getDiaryNumber())
                                ? "text-yellow-600 fill-yellow-500"
                                : ""
                            }
                          />
                          <span>
                            {isCaseFollowed(getDiaryNumber()) ? "Following" : "Follow Case"}
                          </span>
                        </>
                      )}
                    </button>
                  </div>
                )} */}
              </div>

              {/* Tabs */}
              <div className="border-b mb-4">
                <div className="flex overflow-x-auto">
                  {getAvailableTabs().map((tab) => (
                    <button
                      key={tab}
                      className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${
                        activeTab === tab
                          ? 'text-blue-600 border-b-2 border-blue-600'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                      onClick={() => setActiveTab(tab)}
                    >
                      {tab === 'proceedings' ? 'Proceedings' : 
                       tab === 'finalOrders' ? 'Final Orders' :
                       tab === 'documents' ? 'Documents' :
                       tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab Content */}
              <div className="mb-4">
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center mb-3">
                        <FileText size={20} className="text-blue-600 mr-2" />
                        <h3 className="text-lg font-semibold text-gray-800">Basic Information</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {[
                          { label: 'CNR', value: displayDetails.cnr, icon: <FileText size={16} /> },
                          { label: 'Case Title', value: displayDetails.title, icon: <Scale size={16} /> },
                          { label: 'Filing Number', value: displayDetails.filing?.number, icon: <FileText size={16} /> },
                          { label: 'Filing Type', value: displayDetails.filing?.type, icon: <FileText size={16} /> },
                        ].map((item, index) => (
                          <div key={index} className="bg-gray-50 p-3 rounded-lg">
                            <div className="flex items-center mb-1">
                              {item.icon}
                              <span className="text-sm font-medium text-gray-600 ml-2">{item.label}:</span>
                            </div>
                            <span className="text-sm text-gray-900 font-medium">
                              {item.value || "Not Available"}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center mb-3">
                        <Calendar size={20} className="text-blue-600 mr-2" />
                        <h3 className="text-lg font-semibold text-gray-800">Filing & Status Information</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {[
                          { label: 'Filing Date', value: formatDate(displayDetails.filing?.date), icon: <Calendar size={16} /> },
                          { label: 'Case Stage', value: displayDetails.status?.stage, icon: <Scale size={16} /> },
                          { label: 'Nature of Disposal', value: displayDetails.status?.natureOfDisposal, icon: <Scale size={16} /> },
                          { label: 'Date of Disposal', value: formatDate(displayDetails.status?.dateOfDisposal), icon: <Calendar size={16} /> },
                        ].map((item, index) => item.value && item.value !== 'Not Available' && (
                          <div key={index} className="bg-gray-50 p-3 rounded-lg">
                            <div className="flex items-center mb-1">
                              {item.icon}
                              <span className="text-sm font-medium text-gray-600 ml-2">{item.label}:</span>
                            </div>
                            <span className="text-sm text-gray-900 font-medium">
                              {item.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'parties' && (
                  <div className="space-y-6">
                    {displayDetails.petitioner && (
                      <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center mb-3">
                          <User size={20} className="text-blue-600 mr-2" />
                          <h3 className="text-lg font-semibold text-gray-800">Petitioner Information</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {[
                            { label: 'Petitioner Name', value: displayDetails.petitioner.names?.join(', ').replace(/,\s*$/, ''), icon: <User size={16} /> },
                            { label: 'Petitioner Address', value: displayDetails.petitioner.address, icon: <Building size={16} /> },
                            { label: 'Petitioner Advocates', value: displayDetails.petitioner.advocates?.length > 0 ? displayDetails.petitioner.advocates.join(', ') : 'Not Available', icon: <User size={16} /> },
                          ].map((item, index) => (
                            <div key={index} className="bg-gray-50 p-3 rounded-lg">
                              <div className="flex items-center mb-1">
                                {item.icon}
                                <span className="text-sm font-medium text-gray-600 ml-2">{item.label}:</span>
                              </div>
                              <span className="text-sm text-gray-900 font-medium">
                                {item.value || "Not Available"}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {displayDetails.respondents && (
                      <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center mb-3">
                          <User size={20} className="text-blue-600 mr-2" />
                          <h3 className="text-lg font-semibold text-gray-800">Respondent Information</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {[
                            { label: 'Respondent Name', value: displayDetails.respondents.names?.join(', ').replace(/,\s*$/, ''), icon: <User size={16} /> },
                            { label: 'Respondent Address', value: displayDetails.respondents.address, icon: <Building size={16} /> },
                            { label: 'Respondent Advocates', value: displayDetails.respondents.advocates?.length > 0 ? displayDetails.respondents.advocates.join(', ').replace(/^,\s*/, '') : 'Not Available', icon: <User size={16} /> },
                          ].map((item, index) => (
                            <div key={index} className="bg-gray-50 p-3 rounded-lg">
                              <div className="flex items-center mb-1">
                                {item.icon}
                                <span className="text-sm font-medium text-gray-600 ml-2">{item.label}:</span>
                              </div>
                              <span className="text-sm text-gray-900 font-medium">
                                {item.value || "Not Available"}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'proceedings' && (
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <Calendar size={20} className="text-blue-600 mr-2" />
                      <h3 className="text-lg font-semibold text-gray-800">Case Proceedings</h3>
                    </div>
                    {displayDetails.caseProceedings?.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Hearing Date</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Court No.</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Purpose</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Next Date</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {displayDetails.caseProceedings.map((proceeding, index) => (
                              <tr key={index} className="hover:bg-gray-50">
                                <td className="px-4 py-2 text-sm text-gray-900">
                                  {formatDate(proceeding.hearingDate)}
                                </td>
                                <td className="px-4 py-2 text-sm text-gray-900">
                                  {proceeding.courtNumber || "N/A"}
                                </td>
                                <td className="px-4 py-2 text-sm text-gray-900">
                                  {proceeding.purpose || "N/A"}
                                </td>
                                <td className="px-4 py-2 text-sm text-gray-900">
                                  {formatDate(proceeding.nextDate)}
                                </td>
                                <td className="px-4 py-2 text-sm">
                                  <StatusBadge status={proceeding.status === 'D' ? 'Disposed' : 'Pending'} />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 text-yellow-700">
                        No case proceedings available.
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'orders' && (
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <Scale size={20} className="text-blue-600 mr-2" />
                      <h3 className="text-lg font-semibold text-gray-800">Orders</h3>
                    </div>
                    {displayDetails.orders?.length > 0 ? (
                      <div className="space-y-3">
                        {displayDetails.orders.map((order, index) => (
                          <div key={index} className="bg-gray-50 p-3 rounded-lg border-l-4 border-blue-500">
                            <div className="flex justify-between items-center">
                              <div>
                                <span className="text-sm font-medium text-gray-900">
                                  Order #{index + 1}
                                </span>
                                <p className="text-xs text-gray-500 mt-1">
                                  Date: {formatDate(order.date)}
                                </p>
                              </div>
                              {order.url && (
                                <a
                                  href={order.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center space-x-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200 transition-colors text-sm"
                                >
                                  <ExternalLink size={14} />
                                  <span>View</span>
                                </a>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 text-yellow-700">
                        No orders available for this case.
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'finalOrders' && (
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <Download size={20} className="text-blue-600 mr-2" />
                      <h3 className="text-lg font-semibold text-gray-800">Final Orders</h3>
                    </div>
                    {displayDetails.finalOrders?.length > 0 ? (
                      <div className="space-y-3">
                        {displayDetails.finalOrders.map((order, index) => (
                          <div key={index} className="bg-green-50 p-3 rounded-lg border-l-4 border-green-500">
                            <div className="flex justify-between items-center">
                              <div>
                                <span className="text-sm font-medium text-gray-900">
                                  Final Order #{index + 1}
                                </span>
                                <p className="text-xs text-gray-500 mt-1">
                                  Date: {formatDate(order.date)}
                                </p>
                              </div>
                              {order.url && (
                                <a
                                  href={order.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center space-x-1 px-3 py-1 bg-green-100 text-green-800 rounded-md hover:bg-green-200 transition-colors text-sm"
                                >
                                  <Download size={14} />
                                  <span>Download PDF</span>
                                </a>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 text-yellow-700">
                        No final orders available for this case.
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'documents' && (
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <FileText size={20} className="text-blue-600 mr-2" />
                      <h3 className="text-lg font-semibold text-gray-800">Document Filing</h3>
                    </div>
                    {displayDetails.documentFiling?.length > 0 ? (
                      <div className="space-y-3">
                        {displayDetails.documentFiling.map((doc, index) => (
                          <div key={index} className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-sm text-gray-900">{doc.description || `Document ${index + 1}`}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              Filed: {formatDate(doc.date)}
                            </p>
                            {doc.url && (
                              <a
                                href={doc.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center space-x-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200 transition-colors text-sm mt-2"
                              >
                                <ExternalLink size={14} />
                                <span>View Document</span>
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 text-yellow-700">
                        No documents available for this case.
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t p-6 flex justify-end bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default CatCaseDetailsModal;