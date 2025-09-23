

import React, { useState } from 'react';
import { X, ExternalLink, Download } from 'lucide-react';
import jsPDF from 'jspdf';

// Status badge component
const StatusBadge = ({ status }) => {
  let bgColor = 'bg-gray-100';
  let textColor = 'text-gray-800';
  
  if (status) {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('dispos')) {
      bgColor = 'bg-green-100';
      textColor = 'text-green-800';
    } else if (statusLower.includes('pending')) {
      bgColor = 'bg-yellow-100';
      textColor = 'text-yellow-800';
    } else if (statusLower.includes('evidence') || statusLower.includes('fresh')) {
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

const NcltCaseDetailsModal = ({ caseDetails, isLoading, error, onClose }) => {
  const [activeTab, setActiveTab] = useState('overview');
  
  // Helper function to format dates
  const formatDate = (dateString) => {
    if (!dateString || dateString === '1970-01-01T00:00:00.000Z') return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Download PDF function for NCLT cases
  const handleDownloadPDF = () => {
    try {
      console.log('Starting NCLT PDF generation with caseDetails:', JSON.stringify(caseDetails, null, 2));

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
      yOffset = addWrappedText("NCLT Case Details", 14, yOffset, 16);
      yOffset += 10;
      addNewPageIfNeeded();

      // Case Header
      console.log('Adding case header, yOffset:', yOffset);
      const caseTitle = `${caseDetails.registration?.number || caseDetails.filing?.number || 'NCLT Case'}`;
      yOffset = addWrappedText(caseTitle, 14, yOffset, 14);
      yOffset += 2;

      console.log('Adding case info, yOffset:', yOffset);
      const caseInfo = [
        `Filing No: ${caseDetails.filing?.number || 'N/A'}`,
        `Filed: ${formatDate(caseDetails.filing?.date)}`,
        `Status: ${caseDetails.status?.stage || 'PENDING'}`,
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
        { label: 'Filing Number', value: caseDetails.filing?.number || 'N/A' },
        { label: 'Case Type', value: caseDetails.filing?.caseType || 'N/A' },
        { label: 'Bench', value: caseDetails.filing?.bench || 'N/A' },
        { label: 'Filing Date', value: formatDate(caseDetails.filing?.date) },
      ];
      filingInfo.forEach((item) => {
        yOffset = addWrappedText(`${item.label}: ${item.value}`, 14, yOffset, 10);
        addNewPageIfNeeded();
      });
      yOffset += 5;
      addNewPageIfNeeded();

      // Registration Information
      console.log('Adding registration information, yOffset:', yOffset);
      doc.setFontSize(12);
      doc.text("Registration Information", 14, yOffset);
      yOffset += 8;
      doc.setFontSize(10);
      const registrationInfo = [
        { label: 'Registration Number', value: caseDetails.registration?.number || 'N/A' },
        { label: 'Registration Date', value: formatDate(caseDetails.registration?.date) },
        { label: 'Filing Method', value: caseDetails.registration?.method || 'N/A' },
      ];
      registrationInfo.forEach((item) => {
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
        { label: 'Stage', value: caseDetails.status?.stage || 'N/A' },
        { label: 'Defects Issued On', value: formatDate(caseDetails.status?.defectsIssuedOn) },
        { label: 'Refiled On', value: formatDate(caseDetails.status?.refiledOn) },
        { label: 'Next Date', value: formatDate(caseDetails.status?.nextDate) },
        { label: 'Court Number', value: caseDetails.status?.courtNumber || 'N/A' },
        { 
          label: 'Defect Free', 
          value: caseDetails.status?.defectFree !== undefined ? 
            (caseDetails.status.defectFree ? 'Yes' : 'No') : 'N/A' 
        },
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
      
      // Petitioners
      if (caseDetails.parties?.petitioners?.length > 0) {
        yOffset = addWrappedText("Petitioners:", 14, yOffset, 11);
        addNewPageIfNeeded();
        caseDetails.parties.petitioners.forEach((petitioner, index) => {
          const petitionerText = `${index + 1}. Name: ${petitioner.name || 'N/A'} | Advocate: ${petitioner.advocate === 'NA' ? 'N/A' : petitioner.advocate || 'N/A'} | Email: ${petitioner.email || 'N/A'} | Phone: ${petitioner.phone || 'N/A'}`;
          yOffset = addWrappedText(petitionerText, 14, yOffset, 10);
          addNewPageIfNeeded();
        });
        yOffset += 3;
      }
      
      // Respondents
      if (caseDetails.parties?.respondents?.length > 0) {
        yOffset = addWrappedText("Respondents:", 14, yOffset, 11);
        addNewPageIfNeeded();
        caseDetails.parties.respondents.forEach((respondent, index) => {
          const respondentText = `${index + 1}. Name: ${respondent.name || 'N/A'} | Advocate: ${respondent.advocate === 'NA' ? 'N/A' : respondent.advocate || 'N/A'} | Email: ${respondent.email || 'N/A'} | Phone: ${respondent.phone || 'N/A'}`;
          yOffset = addWrappedText(respondentText, 14, yOffset, 10);
          addNewPageIfNeeded();
        });
        yOffset += 3;
      }
      yOffset += 5;
      addNewPageIfNeeded();

      // Applications
      if (caseDetails.applications && caseDetails.applications.length > 0) {
        console.log('Adding applications, yOffset:', yOffset);
        doc.setFontSize(12);
        doc.text("Applications", 14, yOffset);
        yOffset += 8;
        doc.setFontSize(10);
        
        caseDetails.applications.forEach((app, index) => {
          const appText = `${index + 1}. Filing Number: ${app.filingNumber || 'N/A'} | Case Type: ${app.caseType || 'N/A'} | Title: ${app.title || 'N/A'} | Filing Date: ${formatDate(app.filingDate)} | Registration Date: ${formatDate(app.registrationDate)} | Case Number: ${app.caseNumber || 'N/A'} | Next Date: ${formatDate(app.nextDate)} | Status: ${app.status || 'N/A'} | Bench: ${app.bench || 'N/A'} | Court Number: ${app.courtNumber || 'N/A'}`;
          yOffset = addWrappedText(appText, 14, yOffset, 10);
          addNewPageIfNeeded();
        });
        yOffset += 5;
      }
      addNewPageIfNeeded();

      // History
      if (caseDetails.history && caseDetails.history.length > 0) {
        console.log('Adding history, yOffset:', yOffset);
        doc.setFontSize(12);
        doc.text("Case History", 14, yOffset);
        yOffset += 8;
        doc.setFontSize(10);
        
        caseDetails.history.forEach((item, index) => {
          const historyText = `${index + 1}. Bench: ${item.bench || 'N/A'} | Listing Date: ${formatDate(item.listingDate)} | Next Date: ${formatDate(item.nextDate)} | Purpose: ${item.purpose || 'N/A'} | Action: ${item.action || 'N/A'} | Next Purpose: ${item.nextPurpose || 'N/A'} | Status: ${item.status || 'N/A'}`;
          yOffset = addWrappedText(historyText, 14, yOffset, 10);
          addNewPageIfNeeded();
          
          if (item.url) {
            doc.setTextColor(0, 0, 255); // Blue color for link
            const linkText = `Order URL: ${item.url}`;
            yOffset = addWrappedText(linkText, 14, yOffset, 10);
            doc.setTextColor(0, 0, 0); // Reset to black
            addNewPageIfNeeded();
          }
        });
        yOffset += 5;
      }

      // Save the PDF
      const fileName = caseDetails.filing?.number && typeof caseDetails.filing.number === 'string' 
        ? `${caseDetails.filing.number.replace(/[\/\\:*?"<>|]/g, '_')}.pdf` 
        : 'nclt_case.pdf';
      console.log('Saving PDF as:', fileName, 'final yOffset:', yOffset);
      doc.save(fileName);
      console.log('PDF generated successfully');
    } catch (error) {
      console.error('Error generating PDF:', error.message, error.stack);
      alert('Failed to generate PDF. Please check the console for details.');
    }
  };

  // Function to get available tabs based on data
  const getAvailableTabs = () => {
    if (!caseDetails) return ['overview'];
    
    const tabs = ['overview', 'parties'];
    
    if (caseDetails.applications && caseDetails.applications.length > 0) tabs.push('applications');
    if (caseDetails.history && caseDetails.history.length > 0) tabs.push('history');
    
    return tabs;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b p-4 sticky top-0 bg-white z-10">
          <h3 className="text-lg font-semibold">NCLT Case Details</h3>
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
              <div className="mb-6">
                <h2 className="text-xl font-bold mb-2">
                  {caseDetails.registration?.number || caseDetails.filing?.number || 'NCLT Case'}
                </h2>
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="text-black text-sm font-medium">Filing No: {caseDetails.filing?.number || 'N/A'}</span>
                  <span className="text-black text-sm mx-2 font-medium">|</span>
                  <span className="text-black text-sm font-medium">
                    Filed: {formatDate(caseDetails.filing?.date)}
                  </span>
                  <span className="text-black text-sm mx-2 font-medium">|</span>
                  <StatusBadge status={caseDetails.status?.stage || 'PENDING'} />
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
                    {/* Filing Information */}
                    <div>
                      <h3 className="font-medium mb-2">Filing Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-md">
                        {[
                          { label: 'Filing Number', value: caseDetails.filing?.number || 'N/A' },
                          { label: 'Case Type', value: caseDetails.filing?.caseType || 'N/A' },
                          { label: 'Bench', value: caseDetails.filing?.bench || 'N/A' },
                          { label: 'Filing Date', value: formatDate(caseDetails.filing?.date) }
                        ].map((item, index) => (
                          <div key={index}>
                            <p className="text-sm text-gray-500">{item.label}</p>
                            <p className="text-sm">{item.value}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Registration Information */}
                    <div>
                      <h3 className="font-medium mb-2">Registration Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-md">
                        {[
                          { label: 'Registration Number', value: caseDetails.registration?.number || 'N/A' },
                          { label: 'Registration Date', value: formatDate(caseDetails.registration?.date) },
                          { label: 'Filing Method', value: caseDetails.registration?.method || 'N/A' }
                        ].map((item, index) => (
                          <div key={index}>
                            <p className="text-sm text-gray-500">{item.label}</p>
                            <p className="text-sm">{item.value}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Status Information */}
                    <div>
                      <h3 className="font-medium mb-2">Status Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-md">
                        {[
                          { label: 'Defects Issued On', value: formatDate(caseDetails.status?.defectsIssuedOn) },
                          { label: 'Refiled On', value: formatDate(caseDetails.status?.refiledOn) },
                          { label: 'Next Date', value: formatDate(caseDetails.status?.nextDate) },
                          { label: 'Stage', value: caseDetails.status?.stage },
                          { label: 'Court Number', value: caseDetails.status?.courtNumber || 'N/A' },
                          { 
                            label: 'Defect Free', 
                            value: caseDetails.status?.defectFree !== undefined ? 
                              (caseDetails.status.defectFree ? 'Yes' : 'No') : 'N/A' 
                          }
                        ].map((item, index) => item.value && item.value !== 'N/A' && (
                          <div key={index}>
                            <p className="text-sm text-gray-500">{item.label}</p>
                            {item.label === 'Stage' ? (
                              <StatusBadge status={item.value} />
                            ) : item.label === 'Defect Free' ? (
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                item.value === 'Yes' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {item.value}
                              </span>
                            ) : (
                              <p className="text-sm">{item.value}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                
                {activeTab === 'parties' && (
                  <div className="space-y-6">
                    {/* Petitioners */}
                    <div>
                      <h3 className="font-medium mb-2">Petitioners</h3>
                      {caseDetails.parties?.petitioners?.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="min-w-full border-collapse">
                            <thead>
                              <tr className="bg-gray-100">
                                <th className="border border-gray-300 p-2 text-left text-xs font-medium text-gray-500">Name</th>
                                <th className="border border-gray-300 p-2 text-left text-xs font-medium text-gray-500">Advocate</th>
                                <th className="border border-gray-300 p-2 text-left text-xs font-medium text-gray-500">Email</th>
                                <th className="border border-gray-300 p-2 text-left text-xs font-medium text-gray-500">Phone</th>
                              </tr>
                            </thead>
                            <tbody>
                              {caseDetails.parties.petitioners.map((petitioner, index) => (
                                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                  <td className="border border-gray-300 p-2 text-sm">{petitioner.name || 'N/A'}</td>
                                  <td className="border border-gray-300 p-2 text-sm">
                                    {petitioner.advocate === 'NA' ? 'N/A' : petitioner.advocate || 'N/A'}
                                  </td>
                                  <td className="border border-gray-300 p-2 text-sm">{petitioner.email || 'N/A'}</td>
                                  <td className="border border-gray-300 p-2 text-sm">{petitioner.phone || 'N/A'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 text-yellow-700">
                          No petitioner information available
                        </div>
                      )}
                    </div>
                    
                    {/* Respondents */}
                    <div>
                      <h3 className="font-medium mb-2">Respondents</h3>
                      {caseDetails.parties?.respondents?.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="min-w-full border-collapse">
                            <thead>
                              <tr className="bg-gray-100">
                                <th className="border border-gray-300 p-2 text-left text-xs font-medium text-gray-500">Name</th>
                                <th className="border border-gray-300 p-2 text-left text-xs font-medium text-gray-500">Advocate</th>
                                <th className="border border-gray-300 p-2 text-left text-xs font-medium text-gray-500">Email</th>
                                <th className="border border-gray-300 p-2 text-left text-xs font-medium text-gray-500">Phone</th>
                              </tr>
                            </thead>
                            <tbody>
                              {caseDetails.parties.respondents.map((respondent, index) => (
                                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                  <td className="border border-gray-300 p-2 text-sm">{respondent.name || 'N/A'}</td>
                                  <td className="border border-gray-300 p-2 text-sm">
                                    {respondent.advocate === 'NA' ? 'N/A' : respondent.advocate || 'N/A'}
                                  </td>
                                  <td className="border border-gray-300 p-2 text-sm">{respondent.email || 'N/A'}</td>
                                  <td className="border border-gray-300 p-2 text-sm">{respondent.phone || 'N/A'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 text-yellow-700">
                          No respondent information available
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {activeTab === 'applications' && (
                  <div>
                    <h3 className="font-medium mb-4">Applications</h3>
                    {caseDetails.applications?.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="min-w-full border-collapse">
                          <thead>
                            <tr className="bg-gray-100">
                              <th className="border border-gray-300 p-2 text-left text-xs font-medium text-gray-500">Filing Number</th>
                              <th className="border border-gray-300 p-2 text-left text-xs font-medium text-gray-500">Case Type</th>
                              <th className="border border-gray-300 p-2 text-left text-xs font-medium text-gray-500">Title</th>
                              <th className="border border-gray-300 p-2 text-left text-xs font-medium text-gray-500">Filing Date</th>
                              <th className="border border-gray-300 p-2 text-left text-xs font-medium text-gray-500">Registration Date</th>
                              <th className="border border-gray-300 p-2 text-left text-xs font-medium text-gray-500">Case Number</th>
                              <th className="border border-gray-300 p-2 text-left text-xs font-medium text-gray-500">Next Date</th>
                              <th className="border border-gray-300 p-2 text-left text-xs font-medium text-gray-500">Status</th>
                              <th className="border border-gray-300 p-2 text-left text-xs font-medium text-gray-500">Bench</th>
                              <th className="border border-gray-300 p-2 text-left text-xs font-medium text-gray-500">Court Number</th>
                            </tr>
                          </thead>
                          <tbody>
                            {caseDetails.applications.map((app, index) => (
                              <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                <td className="border border-gray-300 p-2 text-sm">{app.filingNumber || 'N/A'}</td>
                                <td className="border border-gray-300 p-2 text-sm">{app.caseType || 'N/A'}</td>
                                <td className="border border-gray-300 p-2 text-sm max-w-[200px] truncate" title={app.title}>{app.title || 'N/A'}</td>
                                <td className="border border-gray-300 p-2 text-sm">{formatDate(app.filingDate)}</td>
                                <td className="border border-gray-300 p-2 text-sm">{formatDate(app.registrationDate)}</td>
                                <td className="border border-gray-300 p-2 text-sm">{app.caseNumber || 'N/A'}</td>
                                <td className="border border-gray-300 p-2 text-sm">{formatDate(app.nextDate)}</td>
                                <td className="border border-gray-300 p-2 text-sm">
                                  <StatusBadge status={app.status || 'N/A'} />
                                </td>
                                <td className="border border-gray-300 p-2 text-sm">{app.bench || 'N/A'}</td>
                                <td className="border border-gray-300 p-2 text-sm">{app.courtNumber || 'N/A'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 text-yellow-700">
                        No applications available for this case.
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
                              <th className="border border-gray-300 p-2 text-left text-xs font-medium text-gray-500">Bench</th>
                              <th className="border border-gray-300 p-2 text-left text-xs font-medium text-gray-500">Listing Date</th>
                              <th className="border border-gray-300 p-2 text-left text-xs font-medium text-gray-500">Next Date</th>
                              <th className="border border-gray-300 p-2 text-left text-xs font-medium text-gray-500">Purpose</th>
                              <th className="border border-gray-300 p-2 text-left text-xs font-medium text-gray-500">Action</th>
                              <th className="border border-gray-300 p-2 text-left text-xs font-medium text-gray-500">Next Purpose</th>
                              <th className="border border-gray-300 p-2 text-left text-xs font-medium text-gray-500">Status</th>
                              <th className="border border-gray-300 p-2 text-left text-xs font-medium text-gray-500">Order</th>
                            </tr>
                          </thead>
                          <tbody>
                            {caseDetails.history.map((item, index) => (
                              <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                <td className="border border-gray-300 p-2 text-sm">{item.bench || 'N/A'}</td>
                                <td className="border border-gray-300 p-2 text-sm">{formatDate(item.listingDate)}</td>
                                <td className="border border-gray-300 p-2 text-sm">{formatDate(item.nextDate)}</td>
                                <td className="border border-gray-300 p-2 text-sm">{item.purpose || 'N/A'}</td>
                                <td className="border border-gray-300 p-2 text-sm">{item.action || 'N/A'}</td>
                                <td className="border border-gray-300 p-2 text-sm">{item.nextPurpose || 'N/A'}</td>
                                <td className="border border-gray-300 p-2 text-sm">
                                  <StatusBadge status={item.status || 'N/A'} />
                                </td>
                                <td className="border border-gray-300 p-2 text-sm">
                                  {item.url ? (
                                    <a
                                      href={item.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-600 hover:text-blue-800 flex items-center"
                                    >
                                      <span>View</span>
                                      <ExternalLink size={14} className="ml-1" />
                                    </a>
                                  ) : (
                                    'N/A'
                                  )}
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

export default NcltCaseDetailsModal;