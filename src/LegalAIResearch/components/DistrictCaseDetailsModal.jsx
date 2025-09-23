import React, { useState } from "react";
import { X, ExternalLink, Download, Star } from "lucide-react";
import jsPDF from "jspdf";

// Status badge component
const StatusBadge = ({ status }) => {
  let bgColor = "bg-gray-100";
  let textColor = "text-gray-800";

  if (status) {
    const statusLower = status.toLowerCase();
    if (statusLower.includes("dispos")) {
      bgColor = "bg-green-100";
      textColor = "text-green-800";
    } else if (statusLower.includes("pending")) {
      bgColor = "bg-yellow-100";
      textColor = "text-yellow-800";
    } else if (
      statusLower.includes("evidence") ||
      statusLower.includes("fresh")
    ) {
      bgColor = "bg-blue-100";
      textColor = "text-blue-800";
    }
  }

  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium ${bgColor} ${textColor}`}
    >
      {status || "Unknown"}
    </span>
  );
};

const DistrictCaseDetailsModal = ({
  caseDetails,
  isLoading,
  error,
  onClose,
  handleFollowCase,
  isCaseFollowed,
  followLoading,
  isOwner,
}) => {
  console.log("Modal caseDetails:", caseDetails);
  const [activeTab, setActiveTab] = useState("overview");

  // Helper function to format dates
  const formatDate = (dateString) => {
    if (!dateString || dateString === "1970-01-01T00:00:00.000Z") return "N/A";
    try {
      let parsedDate;
      // Handle "dd-mm-yyyy" format (e.g., "21-05-2025")
      if (/^\d{2}-\d{2}-\d{4}$/.test(dateString)) {
        const [day, month, year] = dateString.split("-");
        parsedDate = new Date(`${year}-${month}-${day}`);
      }
      // Handle "ddst/nd/rd/th Month yyyy" format (e.g., "21st May 2025")
      else if (/^\d{1,2}(st|nd|rd|th)\s+[A-Za-z]+\s+\d{4}$/.test(dateString)) {
        const [dayWithSuffix, month, year] = dateString.split(/[\s-]+/);
        const day = dayWithSuffix.replace(/(st|nd|rd|th)/, "");
        const monthIndex = new Date(`${month} 1, ${year}`).getMonth();
        parsedDate = new Date(
          `${year}-${String(monthIndex + 1).padStart(2, "0")}-${day.padStart(
            2,
            "0"
          )}`
        );
      }
      // Handle "dd-Month-yyyy" format (e.g., "21-May-2025")
      else if (/^\d{2}-[A-Za-z]+-\d{4}$/.test(dateString)) {
        const [day, month, year] = dateString.split("-");
        const monthIndex = new Date(`${month} 1, ${year}`).getMonth();
        parsedDate = new Date(
          `${year}-${String(monthIndex + 1).padStart(2, "0")}-${day}`
        );
      }
      // Fallback to general parsing
      else {
        parsedDate = new Date(dateString);
      }

      if (isNaN(parsedDate.getTime())) throw new Error("Invalid date");
      return parsedDate.toLocaleDateString("en-US", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch (error) {
      console.warn(`Invalid date format: ${dateString}`, error);
      return "N/A";
    }
  };

  // Function to get available tabs based on data
  const getAvailableTabs = () => {
    if (!caseDetails) return ["overview"];
    const tabs = ["overview", "parties"];
    if (
      caseDetails?.acts?.under_acts?.length > 0 ||
      caseDetails?.acts?.under_sections?.length > 0
    )
      tabs.push("acts");
    if (caseDetails?.case_history?.length > 0) tabs.push("history");
    return tabs;
  };

  // Download PDF function
  // const handleDownloadPDF = () => {
  //   try {
  //     console.log(
  //       "Starting PDF generation with caseDetails:",
  //       JSON.stringify(caseDetails, null, 2)
  //     );
  //     if (!caseDetails || typeof caseDetails !== "object") {
  //       console.error("Invalid or missing caseDetails");
  //       alert("No valid case details available to generate PDF.");
  //       return;
  //     }

  //     const doc = new jsPDF();
  //     let yOffset = 20;
  //     const pageHeight = 260;
  //     const maxWidth = 180;
  //     const marginBottom = 20;

  //     const addNewPageIfNeeded = () => {
  //       if (yOffset + marginBottom > pageHeight) {
  //         doc.addPage();
  //         yOffset = 20;
  //       }
  //     };

  //     const addWrappedText = (text, x, y, fontSize) => {
  //       doc.setFontSize(fontSize);
  //       const lines = doc.splitTextToSize(text, maxWidth);
  //       doc.text(lines, x, y);
  //       return y + lines.length * (fontSize / 2);
  //     };

  //     // Title
  //     yOffset = addWrappedText("District Court Case Details", 14, yOffset, 16);
  //     yOffset += 10;
  //     addNewPageIfNeeded();

  //     // Case Header
  //     const caseTitle = caseDetails?.case_details?.cnr_number || "N/A";
  //     yOffset = addWrappedText(caseTitle, 14, yOffset, 14);
  //     yOffset += 2;

  //     const caseInfo = [
  //       `CNR: ${caseDetails?.case_details?.cnr_number || "N/A"}`,
  //       `Filed: ${formatDate(caseDetails?.case_details?.filing_date)}`,
  //       `Status: ${caseDetails?.case_status?.case_status || "N/A"}`,
  //     ].join(" | ");
  //     yOffset = addWrappedText(caseInfo, 14, yOffset, 10);
  //     yOffset += 5;
  //     addNewPageIfNeeded();

  //     // Overview Tab: Filing Information
  //     doc.setFontSize(12);
  //     doc.text("Filing Information", 14, yOffset);
  //     yOffset += 8;
  //     doc.setFontSize(10);
  //     const filingInfo = [
  //       {
  //         label: "Case Type",
  //         value: caseDetails?.case_details?.case_type || "N/A",
  //       },
  //       {
  //         label: "Filing Number",
  //         value: caseDetails?.case_details?.filing_number || "N/A",
  //       },
  //       {
  //         label: "Filing Date",
  //         value: formatDate(caseDetails?.case_details?.filing_date),
  //       },
  //       {
  //         label: "Registration Number",
  //         value: caseDetails?.case_details?.registration_number || "N/A",
  //       },
  //       {
  //         label: "Registration Date",
  //         value: formatDate(caseDetails?.case_details?.registration_date),
  //       },
  //     ];
  //     filingInfo.forEach((item) => {
  //       yOffset = addWrappedText(
  //         `${item.label}: ${item.value}`,
  //         14,
  //         yOffset,
  //         10
  //       );
  //       addNewPageIfNeeded();
  //     });
  //     yOffset += 5;
  //     addNewPageIfNeeded();

  //     // Overview Tab: Status Information
  //     doc.setFontSize(12);
  //     doc.text("Status Information", 14, yOffset);
  //     yOffset += 8;
  //     doc.setFontSize(10);
  //     const statusInfo = [
  //       {
  //         label: "Case Stage",
  //         value: caseDetails?.case_status?.stage_of_case || "N/A",
  //       },
  //       {
  //         label: "First Hearing Date",
  //         value: formatDate(caseDetails?.case_status?.first_hearing_date),
  //       },
  //       {
  //         label: "Next Hearing Date",
  //         value: formatDate(caseDetails?.case_status?.next_hearing_date),
  //       },
  //       {
  //         label: "Court and Judge",
  //         value: caseDetails?.case_status?.court_number_and_judge || "N/A",
  //       },
  //     ].filter((item) => item.value && item.value !== "N/A");
  //     statusInfo.forEach((item) => {
  //       yOffset = addWrappedText(
  //         `${item.label}: ${item.value}`,
  //         14,
  //         yOffset,
  //         10
  //       );
  //       addNewPageIfNeeded();
  //     });
  //     yOffset += 5;
  //     addNewPageIfNeeded();

  //     // Parties Tab
  //     doc.setFontSize(12);
  //     doc.text("Parties", 14, yOffset);
  //     yOffset += 8;
  //     doc.setFontSize(10);
  //     const petitioners =
  //       caseDetails?.petitioner_and_advocate?.map((p) => p.name) || [];
  //     const respondents =
  //       caseDetails?.respondent_and_advocate?.map((r) => r.name) || [];
  //     yOffset = addWrappedText(
  //       `Petitioners: ${
  //         petitioners.length > 0 ? petitioners.join(", ") : "N/A"
  //       }`,
  //       14,
  //       yOffset,
  //       10
  //     );
  //     addNewPageIfNeeded();
  //     yOffset = addWrappedText(
  //       `Respondents: ${
  //         respondents.length > 0 ? respondents.join(", ") : "N/A"
  //       }`,
  //       14,
  //       yOffset,
  //       10
  //     );
  //     addNewPageIfNeeded();
  //     const petitionerAdvocates =
  //       caseDetails?.petitioner_and_advocate?.map((p) => p.advocate) || [];
  //     const respondentAdvocates =
  //       caseDetails?.respondent_and_advocate?.map((r) => r.advocate) || [];
  //     yOffset = addWrappedText(
  //       `Petitioner Advocates: ${
  //         petitionerAdvocates.length > 0
  //           ? petitionerAdvocates.join(", ")
  //           : "N/A"
  //       }`,
  //       14,
  //       yOffset,
  //       10
  //     );
  //     addNewPageIfNeeded();
  //     yOffset = addWrappedText(
  //       `Respondent Advocates: ${
  //         respondentAdvocates.length > 0
  //           ? respondentAdvocates.join(", ")
  //           : "N/A"
  //       }`,
  //       14,
  //       yOffset,
  //       10
  //     );
  //     yOffset += 5;
  //     addNewPageIfNeeded();

  //     // Acts Tab
  //     if (
  //       caseDetails?.acts?.under_acts?.length > 0 ||
  //       caseDetails?.acts?.under_sections?.length > 0
  //     ) {
  //       doc.setFontSize(12);
  //       doc.text("Acts and Sections", 14, yOffset);
  //       yOffset += 8;
  //       doc.setFontSize(10);
  //       yOffset = addWrappedText(
  //         `Acts: ${caseDetails.acts.under_acts.join(", ") || "N/A"}`,
  //         14,
  //         yOffset,
  //         10
  //       );
  //       addNewPageIfNeeded();
  //       yOffset = addWrappedText(
  //         `Sections: ${caseDetails.acts.under_sections.join(", ") || "N/A"}`,
  //         14,
  //         yOffset,
  //         10
  //       );
  //       yOffset += 5;
  //       addNewPageIfNeeded();
  //     }

  //     // History Tab
  //     if (caseDetails?.case_history?.length > 0) {
  //       doc.setFontSize(12);
  //       doc.text("Case History", 14, yOffset);
  //       yOffset += 8;
  //       doc.setFontSize(10);
  //       caseDetails.case_history.forEach((item) => {
  //         const historyText = [
  //           `Business Date: ${formatDate(item.business_on_date)}`,
  //           `Hearing Date: ${formatDate(item.hearing_date)}`,
  //           `Purpose: ${item.purpose_of_hearing || "N/A"}`,
  //           `Judge: ${item.judge || "N/A"}`,
  //         ].join(" | ");
  //         yOffset = addWrappedText(historyText, 14, yOffset, 10);
  //         addNewPageIfNeeded();
  //       });
  //       yOffset += 5;
  //       addNewPageIfNeeded();
  //     }

  //     const fileName = caseDetails?.case_details?.cnr_number
  //       ? `${caseDetails.case_details.cnr_number}.pdf`
  //       : "district_court_case.pdf";
  //     doc.save(fileName);
  //     console.log("PDF generated successfully");
  //   } catch (error) {
  //     console.error("Error generating PDF:", error.message, error.stack);
  //     alert("Failed to generate PDF. Please check the console for details.");
  //   }
  // };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b p-4 sticky top-0 bg-white z-10">
          <h3 className="text-lg font-semibold">Case Details</h3>
          <div className="flex items-center space-x-2">
            {/* <button
              onClick={handleDownloadPDF}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center space-x-2"
              disabled={!caseDetails}
            >
              <Download size={18} />
              <span>Download PDF</span>
            </button> */}
            {isOwner && (
              <button
                onClick={() => handleFollowCase(caseDetails, "modal")}
                className={`px-4 py-2 rounded-md text-sm transition-colors flex items-center space-x-2 ${
                  followLoading
                    ? "bg-gray-400 cursor-not-allowed"
                    : isCaseFollowed(caseDetails?.case_details?.cnr_number)
                    ? "bg-red-600 text-white hover:bg-red-700"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
                disabled={followLoading}
              >
                {followLoading ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Loading...
                  </span>
                ) : isCaseFollowed(caseDetails?.case_details?.cnr_number) ? (
                  <>
                    <span>Unfollow</span>
                    <X size={16} />
                  </>
                ) : (
                  <>
                    <span>Follow</span>
                    <Star size={16} />
                  </>
                )}
              </button>
            )}
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
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
            <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-700">
              {error}
            </div>
          ) : caseDetails ? (
            <div>
              <div className="mb-6">
                <h2 className="text-xl font-bold mb-2">
                  {caseDetails?.case_details?.cnr_number || "N/A"}
                </h2>
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="text-black text-sm font-medium">
                    CNR: {caseDetails?.case_details?.cnr_number || "N/A"}
                  </span>
                  <span className="text-black text-sm mx-2 font-medium">|</span>
                  <span className="text-black text-sm font-medium">
                    Filed: {formatDate(caseDetails?.case_details?.filing_date)}
                  </span>
                  <span className="text-black text-sm mx-2 font-medium">|</span>
                  <StatusBadge
                    status={caseDetails?.case_status?.case_status || "PENDING"}
                  />
                </div>
              </div>

              <div className="border-b mb-4">
                <div className="flex overflow-x-auto">
                  {getAvailableTabs().map((tab) => (
                    <button
                      key={tab}
                      className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${
                        activeTab === tab
                          ? "text-blue-600 border-b-2 border-blue-600"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                      onClick={() => setActiveTab(tab)}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                {activeTab === "overview" && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        {
                          label: "Case Type",
                          value: caseDetails?.case_details?.case_type || "N/A",
                        },
                        {
                          label: "Filing Number",
                          value:
                            caseDetails?.case_details?.filing_number || "N/A",
                        },
                        {
                          label: "Filing Date",
                          value: formatDate(
                            caseDetails?.case_details?.filing_date
                          ),
                        },
                        {
                          label: "Registration Number",
                          value:
                            caseDetails?.case_details?.registration_number ||
                            "N/A",
                        },
                        {
                          label: "Registration Date",
                          value: formatDate(
                            caseDetails?.case_details?.registration_date
                          ),
                        },
                      ].map((item, index) => (
                        <div key={index}>
                          <h3 className="text-sm font-medium text-gray-500 mb-1">
                            {item.label}
                          </h3>
                          <p className="text-sm">{item.value}</p>
                        </div>
                      ))}
                    </div>

                    <div>
                      <h3 className="font-medium mb-2">Status Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-md">
                        {[
                          {
                            label: "Case Stage",
                            value:
                              caseDetails?.case_status?.stage_of_case || "N/A",
                          },
                          {
                            label: "First Hearing Date",
                            value: formatDate(
                              caseDetails?.case_status?.first_hearing_date
                            ),
                          },
                          {
                            label: "Next Hearing Date",
                            value: formatDate(
                              caseDetails?.case_status?.next_hearing_date
                            ),
                          },
                          {
                            label: "Court and Judge",
                            value:
                              caseDetails?.case_status
                                ?.court_number_and_judge || "N/A",
                          },
                        ].map(
                          (item, index) =>
                            item.value && (
                              <div key={index}>
                                <p className="text-sm text-gray-500">
                                  {item.label}
                                </p>
                                <p className="text-sm">{item.value}</p>
                              </div>
                            )
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "parties" && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-medium mb-2">Petitioners</h3>
                      <ul className="bg-gray-50 p-4 rounded-md space-y-2">
                        {caseDetails?.petitioner_and_advocate?.length > 0 ? (
                          caseDetails.petitioner_and_advocate.map(
                            (petitioner, index) => (
                              <li key={index} className="text-sm">
                                {petitioner.name}{" "}
                                {petitioner.advocate &&
                                  `(Adv: ${petitioner.advocate})`}
                              </li>
                            )
                          )
                        ) : (
                          <li className="text-sm text-gray-500">
                            No petitioner information available
                          </li>
                        )}
                      </ul>
                    </div>

                    <div>
                      <h3 className="font-medium mb-2">Respondents</h3>
                      <ul className="bg-gray-50 p-4 rounded-md space-y-2">
                        {caseDetails?.respondent_and_advocate?.length > 0 ? (
                          caseDetails.respondent_and_advocate.map(
                            (respondent, index) => (
                              <li key={index} className="text-sm">
                                {respondent.name}{" "}
                                {respondent.advocate &&
                                  `(Adv: ${respondent.advocate})`}
                              </li>
                            )
                          )
                        ) : (
                          <li className="text-sm text-gray-500">
                            No respondent information available
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>
                )}

                {activeTab === "acts" && (
                  <div>
                    <h3 className="font-medium mb-4">Acts and Sections</h3>
                    <div className="bg-gray-50 p-4 rounded-md">
                      {caseDetails?.acts ? (
                        <div className="space-y-3">
                          <div className="border-b pb-3">
                            <p className="text-sm text-gray-500">Acts</p>
                            <p className="text-sm font-medium">
                              {caseDetails.acts.under_acts.join(", ") || "N/A"}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Sections</p>
                            <p className="text-sm font-medium">
                              {caseDetails.acts.under_sections.join(", ") ||
                                "N/A"}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">
                          No acts and sections information available
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === "history" && (
                  <div>
                    <h3 className="font-medium mb-4">Case History</h3>
                    {caseDetails?.case_history?.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="min-w-full border-collapse">
                          <thead>
                            <tr className="bg-gray-100">
                              <th className="border border-gray-300 p-2 text-left text-xs font-medium text-gray-500">
                                Business Date
                              </th>
                              <th className="border border-gray-300 p-2 text-left text-xs font-medium text-gray-500">
                                Hearing Date
                              </th>
                              <th className="border border-gray-300 p-2 text-left text-xs font-medium text-gray-500">
                                Purpose
                              </th>
                              <th className="border border-gray-300 p-2 text-left text-xs font-medium text-gray-500">
                                Judge
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {caseDetails.case_history.map((item, index) => (
                              <tr key={index} className="hover:bg-gray-50">
                                <td className="border border-gray-300 p-2 text-sm">
                                  {formatDate(item.business_on_date)}
                                </td>
                                <td className="border border-gray-300 p-2 text-sm">
                                  {formatDate(item.hearing_date)}
                                </td>
                                <td className="border border-gray-300 p-2 text-sm">
                                  {item.purpose_of_hearing || "N/A"}
                                </td>
                                <td className="border border-gray-300 p-2 text-sm">
                                  {item.judge || "N/A"}
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

export default DistrictCaseDetailsModal;
