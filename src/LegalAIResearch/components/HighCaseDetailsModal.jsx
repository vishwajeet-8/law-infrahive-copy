

import React, { useState } from 'react';
import { X, ExternalLink, Download } from 'lucide-react';
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

const HighCaseDetailsModal = ({ caseDetails, isLoadingDetails, detailsError, closeDetailsPopup }) => {
  const [activeTab, setActiveTab] = useState('overview');

  // Helper function to format dates
  const formatDate = (dateString) => {
    if (!dateString || dateString === '1970-01-01T00:00:00.000Z') return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch (error) {
      console.warn(`Invalid date format: ${dateString}`, error);
      return 'N/A';
    }
  };

  // Download PDF function to include all tabs with text wrapping and aggressive page breaks
  const handleDownloadPDF = () => {
    try {
      console.log('Starting PDF generation with caseDetails:', JSON.stringify(caseDetails, null, 2));

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
      yOffset = addWrappedText("High Court Case Details", 14, yOffset, 16);
      yOffset += 10;
      addNewPageIfNeeded();

      // Case Header
      console.log('Adding case header, yOffset:', yOffset);
      const caseTitle = `${caseDetails.filing?.number || 'N/A'} - ${caseDetails.parties?.petitioners?.[0] || 'N/A'} vs. ${caseDetails.parties?.respondents?.[0] || 'N/A'}`;
      yOffset = addWrappedText(caseTitle, 14, yOffset, 14);
      yOffset += 2;

      console.log('Adding case info, yOffset:', yOffset);
      const caseInfo = [
        `CNR: ${caseDetails.cnr || 'N/A'}`,
        `Filed: ${formatDate(caseDetails.filing?.date)}`,
        `Status: ${caseDetails.status?.caseStage || 'PENDING'}`,
      ].join(' | ');
      yOffset = addWrappedText(caseInfo, 14, yOffset, 10);
      yOffset += 5;
      addNewPageIfNeeded();

      // Overview Tab: Filing Information
      console.log('Adding filing information, yOffset:', yOffset);
      doc.setFontSize(12);
      doc.text("Filing Information", 14, yOffset);
      yOffset += 8;
      doc.setFontSize(10);
      const filingInfo = [
        { label: 'Filing Number', value: caseDetails.filing?.number || 'N/A' },
        { label: 'Filing Date', value: formatDate(caseDetails.filing?.date) },
        { label: 'Registration Number', value: caseDetails.registration?.number || 'N/A' },
        { label: 'Registration Date', value: formatDate(caseDetails.registration?.date) },
      ];
      filingInfo.forEach((item) => {
        yOffset = addWrappedText(`${item.label}: ${item.value}`, 14, yOffset, 10);
        addNewPageIfNeeded();
      });
      yOffset += 5;
      addNewPageIfNeeded();

      // Overview Tab: Category Information
      if (caseDetails.categoryDetails && (caseDetails.categoryDetails.category || caseDetails.categoryDetails.subCategory || caseDetails.categoryDetails.subSubCategory)) {
        console.log('Adding category information, yOffset:', yOffset);
        doc.setFontSize(12);
        doc.text("Category Information", 14, yOffset);
        yOffset += 8;
        doc.setFontSize(10);
        const categoryInfo = [
          { label: 'Category', value: caseDetails.categoryDetails?.category || 'N/A' },
          { label: 'Sub Category', value: caseDetails.categoryDetails?.subCategory || 'N/A' },
          { label: 'Sub-Sub Category', value: caseDetails.categoryDetails?.subSubCategory || 'N/A' },
        ].filter((item) => item.value && item.value !== 'N/A');
        categoryInfo.forEach((item) => {
          yOffset = addWrappedText(`${item.label}: ${item.value}`, 14, yOffset, 10);
          addNewPageIfNeeded();
        });
        yOffset += 5;
      }
      addNewPageIfNeeded();

      // Overview Tab: Status Information
      console.log('Adding status information, yOffset:', yOffset);
      doc.setFontSize(12);
      doc.text("Status Information", 14, yOffset);
      yOffset += 8;
      doc.setFontSize(10);
      const statusInfo = [
        { label: 'Case Stage', value: caseDetails.status?.caseStage || 'N/A' },
        { label: 'First Hearing Date', value: formatDate(caseDetails.status?.firstHearingDate) },
        { label: 'Next Hearing Date', value: formatDate(caseDetails.status?.nextHearingDate) },
        { label: 'Decision Date', value: formatDate(caseDetails.status?.decisionDate) },
        { label: 'Nature of Disposal', value: caseDetails.status?.natureOfDisposal || 'N/A' },
        { label: 'Court and Judge', value: caseDetails.status?.courtNumberAndJudge || 'N/A' },
      ].filter((item) => item.value && item.value !== 'N/A');
      statusInfo.forEach((item) => {
        yOffset = addWrappedText(`${item.label}: ${item.value}`, 14, yOffset, 10);
        addNewPageIfNeeded();
      });
      yOffset += 5;
      addNewPageIfNeeded();

      // Parties Tab
      console.log('Adding parties information, yOffset:', yOffset);
      doc.setFontSize(12);
      doc.text("Parties", 14, yOffset);
      yOffset += 8;
      doc.setFontSize(10);
      const petitioners = caseDetails.parties?.petitioners || [];
      const respondents = caseDetails.parties?.respondents || [];
      yOffset = addWrappedText(`Petitioners: ${petitioners.length > 0 ? petitioners.join(', ') : 'N/A'}`, 14, yOffset, 10);
      addNewPageIfNeeded();
      yOffset = addWrappedText(`Respondents: ${respondents.length > 0 ? respondents.join(', ') : 'N/A'}`, 14, yOffset, 10);
      addNewPageIfNeeded();
      const petitionerAdvocates = caseDetails.parties?.petitionerAdvocates || [];
      const respondentAdvocates = caseDetails.parties?.respondentAdvocates || [];
      yOffset = addWrappedText(`Petitioner Advocates: ${petitionerAdvocates.length > 0 ? petitionerAdvocates.join(', ') : 'N/A'}`, 14, yOffset, 10);
      addNewPageIfNeeded();
      yOffset = addWrappedText(`Respondent Advocates: ${respondentAdvocates.length > 0 ? respondentAdvocates.join(', ') : 'N/A'}`, 14, yOffset, 10);
      yOffset += 5;
      addNewPageIfNeeded();

      // Acts Tab
      if (caseDetails.acts?.length > 0) {
        console.log('Adding acts information, yOffset:', yOffset);
        doc.setFontSize(12);
        doc.text("Acts", 14, yOffset);
        yOffset += 8;
        doc.setFontSize(10);
        caseDetails.acts.forEach((actItem) => {
          yOffset = addWrappedText(`${actItem.act || 'N/A'} - Section: ${actItem.section || 'N/A'}`, 14, yOffset, 10);
          addNewPageIfNeeded();
        });
        yOffset += 5;
      }
      addNewPageIfNeeded();

      // SubMatters Tab
      if (caseDetails.subMatters?.length > 0) {
        console.log('Adding sub matters information, yOffset:', yOffset);
        doc.setFontSize(12);
        doc.text("Sub Matters", 14, yOffset);
        yOffset += 8;
        doc.setFontSize(10);
        caseDetails.subMatters.forEach((matter) => {
          yOffset = addWrappedText(matter || 'N/A', 14, yOffset, 10);
          addNewPageIfNeeded();
        });
        yOffset += 5;
      }
      addNewPageIfNeeded();

      // History Tab
      if (caseDetails.history?.length > 0) {
        console.log('Adding history information, yOffset:', yOffset);
        doc.setFontSize(12);
        doc.text("Case History", 14, yOffset);
        yOffset += 8;
        doc.setFontSize(10);
        caseDetails.history.forEach((item) => {
          yOffset = addWrappedText(`Business Date: ${formatDate(item.businessDate)} | Next Date: ${formatDate(item.nextDate)} | Purpose: ${item.purpose || 'N/A'} | Judge: ${item.judge || 'N/A'} | Cause List: ${item.causeList || 'N/A'}`, 14, yOffset, 10);
          addNewPageIfNeeded();
        });
        yOffset += 5;
      }
      addNewPageIfNeeded();

      // IA Tab
      if (caseDetails.iaDetails?.length > 0) {
        console.log('Adding IA details, yOffset:', yOffset);
        doc.setFontSize(12);
        doc.text("IA Details", 14, yOffset);
        yOffset += 8;
        doc.setFontSize(10);
        caseDetails.iaDetails.forEach((ia) => {
          yOffset = addWrappedText(`IA Number: ${ia.iaNumber || 'N/A'} | Party: ${ia.party || 'N/A'} | Filing Date: ${formatDate(ia.dateOfFiling)} | Next Date: ${formatDate(ia.nextDate)} | Status: ${ia.status || 'N/A'}`, 14, yOffset, 10);
          addNewPageIfNeeded();
        });
        yOffset += 5;
      }
      addNewPageIfNeeded();

      // Documents Tab
      if (caseDetails.documentDetails?.length > 0) {
        console.log('Adding document details, yOffset:', yOffset);
        doc.setFontSize(12);
        doc.text("Document Details", 14, yOffset);
        yOffset += 8;
        doc.setFontSize(10);
        caseDetails.documentDetails.forEach((doc) => {
          yOffset = addWrappedText(`Doc. Number: ${doc.documentNumber || 'N/A'} | Name: ${doc.documentName || 'N/A'} | Receiving Date: ${formatDate(doc.receivingDate)} | Filed By: ${doc.filedBy || 'N/A'} | Advocate: ${doc.advocateName || 'N/A'}`, 14, yOffset, 10);
          addNewPageIfNeeded();
        });
        yOffset += 5;
      }
      addNewPageIfNeeded();

      // Objections Tab
      if (caseDetails.objections?.length > 0) {
        console.log('Adding objections, yOffset:', yOffset);
        doc.setFontSize(12);
        doc.text("Objections", 14, yOffset);
        yOffset += 8;
        doc.setFontSize(10);
        caseDetails.objections.forEach((objection) => {
          yOffset = addWrappedText(objection || 'N/A', 14, yOffset, 10);
          addNewPageIfNeeded();
        });
        yOffset += 5;
      }
      addNewPageIfNeeded();

      // Orders Tab
      if (caseDetails.orders?.length > 0) {
        console.log('Adding orders, yOffset:', yOffset);
        doc.setFontSize(12);
        doc.text("Orders", 14, yOffset);
        yOffset += 8;
        doc.setFontSize(10);
        caseDetails.orders.forEach((order) => {
          const orderText = `Order ${order.number || 'N/A'} - Date: ${formatDate(order.date)}`;
          yOffset = addWrappedText(orderText, 14, yOffset, 10);
          if (order.orderURL) {
            doc.setTextColor(0, 0, 255); // Blue color for link
            const linkText = 'View Order';
            const textWidth = doc.getTextWidth(linkText);
            const linkX = 14; // Same x-coordinate as text
            const linkY = yOffset; // Position for link text
            yOffset = addWrappedText(linkText, linkX, linkY, 10);
            // Add clickable link annotation
            doc.link(linkX, linkY - 2, textWidth, 6, { url: order.orderURL });
            doc.setTextColor(0, 0, 0); // Reset to black
          }
          addNewPageIfNeeded();
        });
      }

      // Save the PDF
      const fileName = caseDetails.cnr && typeof caseDetails.cnr === 'string' ? `${caseDetails.cnr}.pdf` : 'high_court_case.pdf';
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
    
    if (caseDetails?.acts?.length > 0) tabs.push('acts');
    if (caseDetails?.subMatters?.length > 0) tabs.push('subMatters');
    if (caseDetails?.history?.length > 0) tabs.push('history');
    if (caseDetails?.iaDetails?.length > 0) tabs.push('ia');
    if (caseDetails?.documentDetails?.length > 0) tabs.push('documents');
    if (caseDetails?.objections?.length > 0) tabs.push('objections');
    if (caseDetails?.orders?.length > 0) tabs.push('orders');
    
    return tabs;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b p-4 sticky top-0 bg-white z-10">
          <h3 className="text-lg font-semibold">Case Details</h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleDownloadPDF}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center space-x-2"
              disabled={!caseDetails}
            >
              <Download size={18} />
              <span>Download PDF</span>
            </button>
            <button
              onClick={closeDetailsPopup}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>
          </div>
        </div>
        <div className="p-4">
          {isLoadingDetails ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
            </div>
          ) : detailsError ? (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-700">{detailsError}</div>
          ) : caseDetails ? (
            <div>
              <div className="mb-6">
                <h2 className="text-xl font-bold mb-2">
                  {`${caseDetails.filing?.number || ''} - ${caseDetails.parties?.petitioners?.[0] || ''} vs. ${caseDetails.parties?.respondents?.[0] || ''}`}
                </h2>
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="text-black text-sm font-medium">CNR: {caseDetails.cnr}</span>
                  <span className="text-black text-sm mx-2 font-medium">|</span>
                  <span className="text-black text-sm font-medium">Filed: {formatDate(caseDetails.filing?.date)}</span>
                  <span className="text-black text-sm mx-2 font-medium">|</span>
                  <StatusBadge status={caseDetails.status?.caseStage || 'PENDING'} />
                </div>
              </div>
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
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <div className="mb-4">
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { label: 'Filing Number', value: caseDetails.filing?.number || 'N/A' },
                        { label: 'Filing Date', value: formatDate(caseDetails.filing?.date) },
                        { label: 'Registration Number', value: caseDetails.registration?.number || 'N/A' },
                        { label: 'Registration Date', value: formatDate(caseDetails.registration?.date) },
                      ].map((item, index) => (
                        <div key={index}>
                          <h3 className="text-sm font-medium text-gray-500 mb-1">{item.label}</h3>
                          <p className="text-sm">{item.value}</p>
                        </div>
                      ))}
                    </div>
                    {(caseDetails.categoryDetails?.category || caseDetails.categoryDetails?.subCategory || caseDetails.categoryDetails?.subSubCategory) && (
                      <div>
                        <h3 className="font-medium mb-2">Category Information</h3>
                        <div className="grid grid-cols-1 gap-4 bg-gray-50 p-4 rounded-md">
                          {[
                            { label: 'Category', value: caseDetails.categoryDetails?.category || 'N/A' },
                            { label: 'Sub Category', value: caseDetails.categoryDetails?.subCategory },
                            { label: 'Sub-Sub Category', value: caseDetails.categoryDetails?.subSubCategory },
                          ].map((item, index) => item.value && (
                            <div key={index}>
                              <p className="text-sm text-gray-500">{item.label}</p>
                              <p className="text-sm">{item.value}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    <div>
                      <h3 className="font-medium mb-2">Status Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-md">
                        {[
                          { label: 'Case Stage', value: caseDetails.status?.caseStage || 'N/A' },
                          { label: 'First Hearing Date', value: formatDate(caseDetails.status?.firstHearingDate) },
                          { label: 'Next Hearing Date', value: formatDate(caseDetails.status?.nextHearingDate) },
                          { label: 'Decision Date', value: formatDate(caseDetails.status?.decisionDate) },
                          { label: 'Nature of Disposal', value: caseDetails.status?.natureOfDisposal },
                          { label: 'Court and Judge', value: caseDetails.status?.courtNumberAndJudge || 'N/A' },
                        ].map((item, index) => item.value && (
                          <div key={index}>
                            <p className="text-sm text-gray-500">{item.label}</p>
                            <p className="text-sm">{item.value}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                {activeTab === 'parties' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-medium mb-2">Petitioners</h3>
                      <ul className="bg-gray-50 p-4 rounded-md space-y-2">
                        {caseDetails.parties?.petitioners?.length > 0 ? 
                          caseDetails.parties.petitioners.map((petitioner, index) => (
                            <li key={index} className="text-sm">
                              {petitioner}
                            </li>
                          )) 
                          : <li className="text-sm text-gray-500">No petitioner information available</li>
                        }
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-medium mb-2">Respondents</h3>
                      <ul className="bg-gray-50 p-4 rounded-md space-y-2">
                        {caseDetails.parties?.respondents?.length > 0 ? 
                          caseDetails.parties.respondents.map((respondent, index) => (
                            <li key={index} className="text-sm">
                              {respondent}
                            </li>
                          ))
                          : <li className="text-sm text-gray-500">No respondent information available</li>
                        }
                      </ul>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="font-medium mb-2">Petitioner Advocates</h3>
                        {caseDetails.parties?.petitionerAdvocates?.length > 0 ? (
                          <ul className="bg-gray-50 p-4 rounded-md space-y-2">
                            {caseDetails.parties.petitionerAdvocates.map((advocate, index) => (
                              <li key={index} className="text-sm">
                                {advocate}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="bg-gray-50 p-4 rounded-md text-sm text-gray-500">
                            No advocate information available
                          </p>
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium mb-2">Respondent Advocates</h3>
                        {caseDetails.parties?.respondentAdvocates?.length > 0 ? (
                          <ul className="bg-gray-50 p-4 rounded-md space-y-2">
                            {caseDetails.parties.respondentAdvocates.map((advocate, index) => (
                              <li key={index} className="text-sm">
                                {advocate}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="bg-gray-50 p-4 rounded-md text-sm text-gray-500">
                            No advocate information available
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                {activeTab === 'acts' && (
                  <div>
                    <h3 className="font-medium mb-4">Acts</h3>
                    {caseDetails.acts?.length > 0 ? (
                      <div className="bg-gray-50 p-4 rounded-md">
                        <ul className="space-y-4">
                          {caseDetails.acts.map((actItem, index) => (
                            <li key={index} className="border-b pb-3 last:border-b-0 last:pb-0">
                              <div className="text-sm font-medium">{actItem.act}</div>
                              {actItem.section && <div className="text-sm text-gray-600">Section: {actItem.section}</div>}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 text-yellow-700">
                        No acts listed for this case.
                      </div>
                    )}
                  </div>
                )}
                {activeTab === 'subMatters' && (
                  <div>
                    <h3 className="font-medium mb-4">Sub Matters</h3>
                    {caseDetails.subMatters?.length > 0 ? (
                      <div className="bg-gray-50 p-4 rounded-md">
                        <ul className="space-y-2">
                          {caseDetails.subMatters.map((matter, index) => (
                            <li key={index} className="text-sm">
                              {matter}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 text-yellow-700">
                        No sub matters available for this case.
                      </div>
                    )}
                  </div>
                )}
                {activeTab === 'history' && (
                  <div>
                    <h3 className="font-medium mb-4">Case History</h3>
                    {caseDetails.history?.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="min-w-full border-collapse">
                          <thead>
                            <tr className="bg-gray-100">
                              <th className="border border-gray-300 p-2 text-left text-xs font-medium text-gray-500">
                                Business Date
                              </th>
                              <th className="border border-gray-300 p-2 text-left text-xs font-medium text-gray-500">
                                Next Date
                              </th>
                              <th className="border border-gray-300 p-2 text-left text-xs font-medium text-gray-500">
                                Purpose
                              </th>
                              <th className="border border-gray-300 p-2 text-left text-xs font-medium text-gray-500">
                                Judge
                              </th>
                              <th className="border border-gray-300 p-2 text-left text-xs font-medium text-gray-500">
                                Cause List
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {caseDetails.history.map((item, index) => (
                              <tr key={index} className="hover:bg-gray-50">
                                <td className="border border-gray-300 p-2 text-sm">
                                  {formatDate(item.businessDate)}
                                </td>
                                <td className="border border-gray-300 p-2 text-sm">
                                  {formatDate(item.nextDate)}
                                </td>
                                <td className="border border-gray-300 p-2 text-sm">
                                  {item.purpose || 'N/A'}
                                </td>
                                <td className="border border-gray-300 p-2 text-sm">
                                  {item.judge || 'N/A'}
                                </td>
                                <td className="border border-gray-300 p-2 text-sm">
                                  {item.causeList || 'N/A'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 text-yellow-700">
                        No history records available for this case.
                      </div>
                    )}
                  </div>
                )}
                {activeTab === 'ia' && (
                  <div>
                    <h3 className="font-medium mb-4">IA Details</h3>
                    {caseDetails.iaDetails?.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="min-w-full border-collapse">
                          <thead>
                            <tr className="bg-gray-100">
                              <th className="border border-gray-300 p-2 text-left text-xs font-medium text-gray-500">
                                IA Number
                              </th>
                              <th className="border border-gray-300 p-2 text-left text-xs font-medium text-gray-500">
                                Party
                              </th>
                              <th className="border border-gray-300 p-2 text-left text-xs font-medium text-gray-500">
                                Filing Date
                              </th>
                              <th className="border border-gray-300 p-2 text-left text-xs font-medium text-gray-500">
                                Next Date
                              </th>
                              <th className="border border-gray-300 p-2 text-left text-xs font-medium text-gray-500">
                                Status
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {caseDetails.iaDetails.map((ia, index) => (
                              <tr key={index} className="hover:bg-gray-50">
                                <td className="border border-gray-300 p-2 text-sm">{ia.iaNumber}</td>
                                <td className="border border-gray-300 p-2 text-sm">{ia.party}</td>
                                <td className="border border-gray-300 p-2 text-sm">
                                  {formatDate(ia.dateOfFiling)}
                                </td>
                                <td className="border border-gray-300 p-2 text-sm">
                                  {formatDate(ia.nextDate)}
                                </td>
                                <td className="border border-gray-300 p-2 text-sm">
                                  <StatusBadge status={ia.status} />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 text-yellow-700">
                        No IA details available for this case.
                      </div>
                    )}
                  </div>
                )}
                {activeTab === 'documents' && (
                  <div>
                    <h3 className="font-medium mb-4">Document Details</h3>
                    {caseDetails.documentDetails?.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="min-w-full border-collapse">
                          <thead>
                            <tr className="bg-gray-100">
                              <th className="border border-gray-300 p-2 text-left text-xs font-medium text-gray-500">
                                Doc. Number
                              </th>
                              <th className="border border-gray-300 p-2 text-left text-xs font-medium text-gray-500">
                                Document Name
                              </th>
                              <th className="border border-gray-300 p-2 text-left text-xs font-medium text-gray-500">
                                Receiving Date
                              </th>
                              <th className="border border-gray-300 p-2 text-left text-xs font-medium text-gray-500">
                                Filed By
                              </th>
                              <th className="border border-gray-300 p-2 text-left text-xs font-medium text-gray-500">
                                Advocate Name
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {caseDetails.documentDetails.map((doc, index) => (
                              <tr key={index} className="hover:bg-gray-50">
                                <td className="border border-gray-300 p-2 text-sm">
                                  {doc.documentNumber}
                                </td>
                                <td className="border border-gray-300 p-2 text-sm">
                                  {doc.documentName}
                                </td>
                                <td className="border border-gray-300 p-2 text-sm">
                                  {formatDate(doc.receivingDate)}
                                </td>
                                <td className="border border-gray-300 p-2 text-sm">
                                  {doc.filedBy || 'N/A'}
                                </td>
                                <td className="border border-gray-300 p-2 text-sm">
                                  {doc.advocateName || 'N/A'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 text-yellow-700">
                        No document details available for this case.
                      </div>
                    )}
                  </div>
                )}
                {activeTab === 'objections' && (
                  <div>
                    <h3 className="font-medium mb-4">Objections</h3>
                    {caseDetails.objections?.length > 0 ? (
                      <div className="space-y-4">
                        {caseDetails.objections.map((objection, index) => (
                          <div key={index} className="bg-gray-50 p-4 rounded-md">
                            <p className="text-sm">{objection}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 text-yellow-700">
                        No objections listed for this case.
                      </div>
                    )}
                  </div>
                )}
                {activeTab === 'orders' && (
                  <div>
                    <h3 className="font-medium mb-4">Orders</h3>
                    {caseDetails.orders?.length > 0 ? (
                      <div className="space-y-3">
                        {caseDetails.orders.map((order, index) => (
                          <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                            <div className="flex items-center space-x-4">
                              <span className="text-sm font-medium">Order {order.number}</span>
                              <span className="text-sm text-gray-500">{formatDate(order.date)}</span>
                            </div>
                            {order.orderURL && (
                              <a
                                href={order.orderURL}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm"
                              >
                                <span>View Order</span>
                                <ExternalLink size={14} />
                              </a>
                            )}
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
              </div>
            </div>
          ) : null}
        </div>
        <div className="border-t p-4 flex justify-end">
          <button
            onClick={closeDetailsPopup}
            className="bg-gray-100 text-gray-600 hover:bg-gray-200 px-4 py-2 rounded-md transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default HighCaseDetailsModal;