// import React, { useState, useEffect, useCallback } from "react";
// import { Search, Star, ShoppingCart, X } from "lucide-react";
// import NcltCaseDetailsModal from "./NcltCaseDetailsModal";
// import { useParams } from "react-router-dom";
// import api from "@/utils/api";
// import { ncltBenches } from "../utils/ncltBenches";

// // Custom debounce function to avoid lodash dependency
// const debounce = (func, wait) => {
//   let timeout;
//   return (...args) => {
//     clearTimeout(timeout);
//     timeout = setTimeout(() => func(...args), wait);
//   };
// };

// const NcltPartySearchPage = () => {
//   const { workspaceId } = useParams();
//   const user = JSON.parse(localStorage.getItem("user") || "{}");
//   const role = user?.role || "Member";
//   const isOwner = role === "Owner";
//   const [benchId, setBenchId] = useState("");
//   const [partyType, setPartyType] = useState("");
//   const [stage, setStage] = useState("PENDING");
//   const [year, setYear] = useState("");
//   const [name, setName] = useState("");
//   const [originalSearchResults, setOriginalSearchResults] = useState(null);
//   const [searchResults, setSearchResults] = useState(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [tableSearchQuery, setTableSearchQuery] = useState("");
//   const [showCaseDetails, setShowCaseDetails] = useState(false);
//   const [selectedFilingNumber, setSelectedFilingNumber] = useState(null);
//   const [caseDetails, setCaseDetails] = useState(null);
//   const [detailsLoading, setDetailsLoading] = useState(false);
//   const [detailsError, setDetailsError] = useState(null);
//   const [followedCases, setFollowedCases] = useState([]);
//   const [showCart, setShowCart] = useState(false);
//   const [followLoading, setFollowLoading] = useState(null);
//   const [toast, setToast] = useState(null);

//   const currentYear = new Date().getFullYear();
//   const yearOptions = [];
//   for (let y = currentYear; y >= 1947; y--) {
//     yearOptions.push(y);
//   }

//   const partyTypeOptions = [
//     { value: "PETITIONER", label: "Petitioner" },
//     { value: "RESPONDENT", label: "Respondent" },
//     { value: "APPLICANT", label: "Applicant" },
//     { value: "APPELLANT", label: "Appellant" },
//     { value: "DEFENDANT", label: "Defendant" },
//   ];

//   const stageOptions = [
//     { value: "PENDING", label: "Pending" },
//     { value: "DISPOSED", label: "Disposed" },
//     { value: "BOTH", label: "Both" },
//   ];

//   const formatDate = (dateString) => {
//     if (!dateString || dateString.includes("1970-01-01"))
//       return "Not Available";
//     const date = new Date(dateString);
//     return date.toLocaleDateString("en-IN", {
//       day: "2-digit",
//       month: "short",
//       year: "numeric",
//     });
//   };

//   const showToast = useCallback((message) => {
//     setToast(message);
//     setTimeout(() => setToast(null), 3000);
//   }, []);

//   const fetchFollowedCases = useCallback(async () => {
//     try {
//       const { data } = await api.get(`/get-followed-cases-by-court`, {
//         params: {
//           court: "National Company Law Tribunal (NCLT)",
//           workspaceId,
//         },
//       });
//       if (data.success) {
//         setFollowedCases(data.cases || []);
//       } else {
//         console.error(
//           "Failed to fetch followed cases:",
//           data.error || "Unknown error"
//         );
//         setFollowedCases([]);
//         showToast("Failed to fetch followed cases");
//       }
//     } catch (err) {
//       console.error("Error fetching followed cases:", err.message);
//       setFollowedCases([]);
//       showToast("Error fetching followed cases");
//     }
//   }, [workspaceId, showToast]);

//   useEffect(() => {
//     fetchFollowedCases();
//   }, [fetchFollowedCases]);

//   useEffect(() => {
//     if (showCart || showCaseDetails) {
//       fetchFollowedCases();
//     }
//   }, [showCart, showCaseDetails, fetchFollowedCases]);

//   const handleFollowCase = async (caseData, rowIndex) => {
//     if (!isOwner) return;
//     setFollowLoading(rowIndex);
//     const filingNumber = caseData.filingNumber || caseData.caseId;
//     const isFollowed = followedCases.some(
//       (c) => c.filing_number === filingNumber
//     );

//     // Optimistic update
//     if (!isFollowed) {
//       setFollowedCases((prevCases) => [
//         ...prevCases,
//         {
//           filing_number: filingNumber,
//           court: "National Company Law Tribunal (NCLT)",
//           case_data: {
//             filingNumber: filingNumber || "N/A",
//             caseType: caseData.caseType || "N/A",
//             caseNumber: caseData.caseNumber || "N/A",
//             caseTitle: caseData.title || "N/A",
//             bench: caseData.bench || "N/A",
//             courtNumber: caseData.courtNumber || "N/A",
//             filedOn: formatDate(caseData.filedOn),
//             nextDate: formatDate(caseData.nextDate),
//             status: caseData.status || "N/A",
//           },
//           workspace_id: workspaceId,
//           bench_id: benchId || null,
//           followed_at: new Date().toISOString(),
//         },
//       ]);
//     } else {
//       setFollowedCases((prevCases) =>
//         prevCases.filter((c) => c.filing_number !== filingNumber)
//       );
//     }

//     try {
//       if (isFollowed) {
//         const { data } = await api.delete("/unfollow-case", {
//           data: {
//             caseId: filingNumber,
//             court: "National Company Law Tribunal (NCLT)",
//             benchId: benchId || undefined,
//           },
//         });
//         if (!data.success) {
//           throw new Error(data.error || "Failed to unfollow case");
//         }
//         showToast(`Case ${filingNumber} unfollowed successfully`);
//       } else {
//         const caseToSave = {
//           filingNumber: filingNumber || "N/A",
//           caseType: caseData.caseType || "N/A",
//           caseNumber: caseData.caseNumber || "N/A",
//           caseTitle: caseData.title || "N/A",
//           bench: caseData.bench || "N/A",
//           courtNumber: caseData.courtNumber || "N/A",
//           filedOn: formatDate(caseData.filedOn),
//           nextDate: formatDate(caseData.nextDate),
//           status: caseData.status || "N/A",
//         };
//         const { data } = await api.post("/follow-case", {
//           caseData: caseToSave,
//           court: "National Company Law Tribunal (NCLT)",
//           workspace_id: workspaceId,
//           benchId: benchId || undefined,
//         });
//         if (!data.success) {
//           throw new Error(data.error || "Failed to follow case");
//         }
//         showToast(`Case ${filingNumber} followed successfully`);
//       }
//       await fetchFollowedCases();
//     } catch (err) {
//       // Revert optimistic update
//       if (!isFollowed) {
//         setFollowedCases((prevCases) =>
//           prevCases.filter((c) => c.filing_number !== filingNumber)
//         );
//       } else {
//         setFollowedCases((prevCases) => [
//           ...prevCases,
//           {
//             filing_number: filingNumber,
//             court: "National Company Law Tribunal (NCLT)",
//             case_data: {
//               filingNumber: filingNumber || "N/A",
//               caseType: caseData.caseType || "N/A",
//               caseNumber: caseData.caseNumber || "N/A",
//               caseTitle: caseData.title || "N/A",
//               bench: caseData.bench || "N/A",
//               courtNumber: caseData.courtNumber || "N/A",
//               filedOn: formatDate(caseData.filedOn),
//               nextDate: formatDate(caseData.nextDate),
//               status: caseData.status || "N/A",
//             },
//             workspace_id: workspaceId,
//             bench_id: benchId || null,
//             followed_at: new Date().toISOString(),
//           },
//         ]);
//       }
//       showToast(`Error: ${err.message}`);
//     } finally {
//       setFollowLoading(null);
//     }
//   };

//   const handleUnfollowCase = async (filingNumber) => {
//     if (!isOwner) return;
//     const caseToRemove = followedCases.find(
//       (c) => c.filing_number === filingNumber
//     );

//     // Optimistic update
//     setFollowedCases((prevCases) =>
//       prevCases.filter((c) => c.filing_number !== filingNumber)
//     );

//     try {
//       const { data } = await api.delete("/unfollow-case", {
//         data: {
//           caseId: filingNumber,
//           court: "National Company Law Tribunal (NCLT)",
//           benchId: benchId || undefined,
//         },
//       });
//       if (!data.success) {
//         throw new Error(data.error || "Failed to unfollow case");
//       }
//       showToast(`Case ${filingNumber} unfollowed successfully`);
//       await fetchFollowedCases();
//     } catch (err) {
//       // Revert optimistic update
//       setFollowedCases((prevCases) => [...prevCases, caseToRemove]);
//       showToast(`Error: ${err.message}`);
//       console.error("Unfollow error:", err);
//     }
//   };

//   const handleSearch = async (e) => {
//     e.preventDefault();
//     if (!benchId || !name) {
//       setError("Please enter bench ID and party name");
//       return;
//     }

//     setIsLoading(true);
//     setError(null);
//     setTableSearchQuery("");
//     setSearchResults(null);
//     setOriginalSearchResults(null);

//     try {
//       const requestBody = {
//         benchId,
//         partyType: partyType || "PETITIONER",
//         stage: stage || "PENDING",
//         year,
//         name,
//       };

//       const { data } = await api.post(
//         `${import.meta.env.VITE_RESEARCH_API}legal-infrahive/national-company-law-tribunal/search/party/`,
//         requestBody,
//         {
//           headers: {
//             Authorization: import.meta.env.VITE_RESEARCH_AUTHORIZATION_KEY,
//           },
//         }
//       );

//       // Check for API errors first
//       if (data.success === false) {
//         throw new Error(data.error || "No cases found");
//       }

//       // Define resultsArray after getting the response
//       const resultsArray = Array.isArray(data) ? data : data.data || [];

//       // Now use resultsArray for the research credit API call
//       await api.post(
//         "/research-credit",
//         {
//           userId: JSON.parse(localStorage.getItem("user")).id,
//           usage: resultsArray?.length === 0 ? 1 : resultsArray?.length,
//         },
//         {
//           headers: {
//             Authorization: `Bearer ${localStorage.getItem("token")}`,
//           },
//         }
//       );

//       setOriginalSearchResults(resultsArray);
//       setSearchResults(resultsArray);
//     } catch (err) {
//       setError(err.message);
//       console.error("Search error:", err);
//       setSearchResults([]);
//       setOriginalSearchResults([]);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleRetrySearch = () => {
//     handleSearch(new Event("submit"));
//   };

//   const handleViewDetails = async (filingNumber) => {
//     setDetailsLoading(true);
//     setDetailsError(null);
//     setSelectedFilingNumber(filingNumber);

//     try {
//       const { data } = await api.post(
//         `${import.meta.env.VITE_RESEARCH_API}legal-infrahive/national-company-law-tribunal/filing-number/`,
//         { filingNumber },
//         {
//           headers: {
//             Authorization: import.meta.env.VITE_RESEARCH_AUTHORIZATION_KEY,
//           },
//         }
//       );

//       await api.post(
//         "/research-credit",
//         {
//           userId: JSON.parse(localStorage.getItem("user")).id,
//           usage: data?.length === 0 ? 1 : data?.length,
//         },
//         {
//           headers: {
//             Authorization: `Bearer ${localStorage.getItem("token")}`,
//           },
//         }
//       );

//       if (data.success === false) {
//         throw new Error(data.error || "Case details not found");
//       }
//       setCaseDetails(data);
//       setShowCaseDetails(true);
//     } catch (err) {
//       setDetailsError(err.message);
//       console.error("Details fetch error:", err);
//     } finally {
//       setDetailsLoading(false);
//     }
//   };

//   const handleRetryDetails = () => {
//     if (selectedFilingNumber) {
//       handleViewDetails(selectedFilingNumber);
//     }
//   };

//   // Debounced function for filtering search results
//   const debouncedFilterResults = useCallback(
//     debounce((query) => {
//       if (!query.trim() || !Array.isArray(originalSearchResults)) {
//         setSearchResults(originalSearchResults || []);
//         return;
//       }
//       const filtered = originalSearchResults.filter(
//         (result) =>
//           (result.filingNumber &&
//             result.filingNumber.toLowerCase().includes(query)) ||
//           (result.caseType && result.caseType.toLowerCase().includes(query)) ||
//           (result.caseNumber &&
//             result.caseNumber.toLowerCase().includes(query)) ||
//           (result.title && result.title.toLowerCase().includes(query)) ||
//           (result.bench && result.bench.toLowerCase().includes(query)) ||
//           (result.courtNumber && result.courtNumber.toString().includes(query)) ||
//           (result.status && result.status.toLowerCase().includes(query))
//       );
//       setSearchResults(filtered);
//     }, 300),
//     [originalSearchResults]
//   );

//   const handleTableSearch = (e) => {
//     const query = e.target.value.toLowerCase();
//     setTableSearchQuery(query); // Update input immediately
//     debouncedFilterResults(query); // Debounce the filtering
//   };

//   const handleClearTableSearch = () => {
//     setTableSearchQuery("");
//     debouncedFilterResults.cancel(); // Cancel any pending debounce
//     setSearchResults(originalSearchResults || []);
//   };

//   const closeDetailsModal = () => {
//     setShowCaseDetails(false);
//     setCaseDetails(null);
//     setSelectedFilingNumber(null);
//     setDetailsError(null);
//   };

//   const Cart = ({ followedCases, onUnfollow, onClose, fetchFollowedCases }) => {
//     const user = JSON.parse(localStorage.getItem("user") || "{}");
//     const role = user?.role || "Member";
//     const isOwner = role === "Owner";
//     const [searchQuery, setSearchQuery] = useState("");
//     const [sortConfig, setSortConfig] = useState({
//       key: "followed_at",
//       direction: "desc",
//     });

//     useEffect(() => {
//       fetchFollowedCases();
//     }, [fetchFollowedCases]);

//     const filteredCases = React.useMemo(() => {
//       return followedCases.filter((caseData) => {
//         const caseJson = caseData.case_data || {};
//         const searchIn = [
//           caseJson.filingNumber,
//           caseJson.caseNumber,
//           caseJson.caseTitle,
//           caseJson.partyName,
//           caseJson.status,
//           new Date(caseData.followed_at).toLocaleDateString(),
//         ]
//           .filter(Boolean)
//           .join(" ")
//           .toLowerCase();
//         return searchIn.includes(searchQuery.toLowerCase());
//       });
//     }, [followedCases, searchQuery]);

//     const sortedCases = React.useMemo(() => {
//       return [...filteredCases].sort((a, b) => {
//         let aValue, bValue;
//         if (sortConfig.key === "followed_at") {
//           aValue = new Date(a.followed_at);
//           bValue = new Date(b.followed_at);
//         } else {
//           aValue = a.case_data?.[sortConfig.key] || "";
//           bValue = b.case_data?.[sortConfig.key] || "";
//         }
//         if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
//         if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
//         return 0;
//       });
//     }, [filteredCases, sortConfig]);

//     const requestSort = (key) => {
//       let direction = "asc";
//       if (sortConfig.key === key && sortConfig.direction === "asc")
//         direction = "desc";
//       setSortConfig({ key, direction });
//     };

//     const getSortIndicator = (key) => {
//       if (sortConfig.key === key)
//         return sortConfig.direction === "asc" ? "↑" : "↓";
//       return "";
//     };

//     return (
//       <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//         <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-screen overflow-y-auto">
//           <div className="flex justify-between items-center border-b p-4 sticky top-0 bg-white z-10">
//             <div className="flex items-center">
//               <h3 className="text-lg font-semibold mr-2">Followed Cases</h3>
//               <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
//                 {followedCases.length}
//               </span>
//             </div>
//             <button
//               onClick={onClose}
//               className="text-gray-500 hover:text-gray-700"
//             >
//               <X size={20} />
//             </button>
//           </div>
//           <div className="p-4 border-b flex items-center justify-between gap-4">
//             <div className="relative">
//               <input
//                 type="text"
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//                 placeholder="Search followed cases..."
//                 className="w-64 border border-gray-300 rounded-md pl-10 p-2 focus:outline-none focus:ring-1 focus:ring-blue-600"
//               />
//               <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                 <Search size={16} className="text-gray-500" />
//               </div>
//             </div>
//           </div>
//           <div className="p-4">
//             {followedCases.length === 0 ? (
//               <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 text-yellow-700 text-center">
//                 No followed cases yet.
//               </div>
//             ) : sortedCases.length === 0 ? (
//               <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 text-yellow-700">
//                 No cases match your search.
//               </div>
//             ) : (
//               <div className="overflow-x-auto">
//                 <table className="min-w-full border-collapse">
//                   <thead>
//                     <tr className="bg-gray-100">
//                       <th
//                         onClick={() => requestSort("filingNumber")}
//                         className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200"
//                       >
//                         Filing Number {getSortIndicator("filingNumber")}
//                       </th>
//                       <th
//                         onClick={() => requestSort("caseNumber")}
//                         className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200"
//                       >
//                         Case Number {getSortIndicator("caseNumber")}
//                       </th>
//                       <th
//                         onClick={() => requestSort("caseTitle")}
//                         className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200"
//                       >
//                         Title {getSortIndicator("caseTitle")}
//                       </th>
//                       <th
//                         onClick={() => requestSort("partyName")}
//                         className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200"
//                       >
//                         Party Name {getSortIndicator("partyName")}
//                       </th>
//                       <th
//                         onClick={() => requestSort("status")}
//                         className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200"
//                       >
//                         Status {getSortIndicator("status")}
//                       </th>
//                       <th
//                         onClick={() => requestSort("followed_at")}
//                         className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200"
//                       >
//                         Followed On {getSortIndicator("followed_at")}
//                       </th>
//                       {isOwner && (
//                         <th
//                           className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
//                           data-testid="unfollow-column-header"
//                         >
//                           Unfollow
//                         </th>
//                       )}
//                     </tr>
//                   </thead>
//                   <tbody className="divide-y divide-gray-200">
//                     {sortedCases.map((caseData, index) => (
//                       <tr
//                         key={`${caseData.filing_number}-${index}`}
//                         className="hover:bg-gray-50"
//                       >
//                         <td className="px-6 py-4 text-sm">
//                           {caseData.filing_number || "N/A"}
//                         </td>
//                         <td className="px-6 py-4 text-sm">
//                           {caseData.case_data.caseNumber || "N/A"}
//                         </td>
//                         <td className="px-6 py-4 text-sm max-w-[200px] truncate">
//                           {caseData.case_data.caseTitle || "N/A"}
//                         </td>
//                         <td className="px-6 py-4 text-sm">
//                           {caseData.case_data.partyName || "N/A"}
//                         </td>
//                         <td className="px-6 py-4 text-sm">
//                           {caseData.case_data.status || "N/A"}
//                         </td>
//                         <td className="px-6 py-4 text-sm">
//                           {new Date(caseData.followed_at).toLocaleDateString()}
//                         </td>
//                         {isOwner && (
//                           <td className="px-6 py-4 text-sm">
//                             <button
//                               onClick={() => onUnfollow(caseData.filing_number)}
//                               className="bg-red-100 text-red-700 hover:bg-red-200 px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1"
//                               data-testid={`unfollow-button-${caseData.filing_number}`}
//                             >
//                               <span>Unfollow</span>
//                               <X size={12} />
//                             </button>
//                           </td>
//                         )}
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             )}
//           </div>
//           <div className="border-t p-4 flex justify-end">
//             <button
//               onClick={onClose}
//               className="bg-gray-100 text-gray-600 hover:bg-gray-200 px-4 py-2 rounded-md transition-colors"
//             >
//               Close
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   };

//   return (
//     <div className="space-y-4">
//       {/* Search Form Card */}
//       <div className="bg-white rounded-md shadow-sm w-[40vw]">
//         <div className="p-4 border-b border-gray-200">
//           <h2 className="text-lg font-semibold text-gray-800">
//             Search NCLT Cases by Party Name
//           </h2>
//           <p className="mt-1 text-xs text-gray-600">
//             Search cases in the National Company Law Tribunal by party name
//           </p>
//         </div>
//         <div className="p-4">
//           <form onSubmit={handleSearch} className="space-y-3">
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//               <div>
//   <label
//     htmlFor="benchId"
//     className="block text-xs font-medium text-gray-700 mb-1"
//   >
//     Bench *
//   </label>
//   <select
//     id="benchId"
//     value={benchId}
//     onChange={(e) => setBenchId(e.target.value)}
//     className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
//     required
//   >
//     <option value="">Select bench</option>
//     {ncltBenches.map((bench) => (
//       <option key={bench.id} value={bench.id}>
//         {bench.name}
//       </option>
//     ))}
//   </select>
//   <div className="text-xs text-gray-500 mt-1">
//     Example: National Company Law Tribunal, Principal Bench
//   </div>
// </div>
//               <div>
//                 <label
//                   htmlFor="name"
//                   className="block text-xs font-medium text-gray-700 mb-1"
//                 >
//                   Party Name *
//                 </label>
//                 <input
//                   id="name"
//                   type="text"
//                   value={name}
//                   onChange={(e) => setName(e.target.value)}
//                   className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
//                   placeholder="Enter party name"
//                   required
//                 />
//                 <div className="text-xs text-gray-500 mt-1">
//                   Example: Manish
//                 </div>
//               </div>
//               <div>
//                 <label
//                   htmlFor="partyType"
//                   className="block text-xs font-medium text-gray-700 mb-1"
//                 >
//                   Party Type
//                 </label>
//                 <select
//                   id="partyType"
//                   value={partyType}
//                   onChange={(e) => setPartyType(e.target.value)}
//                   className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
//                 >
//                   <option value="">Select party type</option>
//                   {partyTypeOptions.map((option) => (
//                     <option key={option.value} value={option.value}>
//                       {option.label}
//                     </option>
//                   ))}
//                 </select>
//                 <div className="text-xs text-gray-500 mt-1">
//                   Example: PETITIONER
//                 </div>
//               </div>
//               <div>
//                 <label
//                   htmlFor="stage"
//                   className="block text-xs font-medium text-gray-700 mb-1"
//                 >
//                   Case Stage
//                 </label>
//                 <select
//                   id="stage"
//                   value={stage}
//                   onChange={(e) => setStage(e.target.value)}
//                   className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
//                 >
//                   {stageOptions.map((option) => (
//                     <option key={option.value} value={option.value}>
//                       {option.label}
//                     </option>
//                   ))}
//                 </select>
//                 <div className="text-xs text-gray-500 mt-1">
//                   Example: PENDING
//                 </div>
//               </div>
//               <div>
//                 <label
//                   htmlFor="year"
//                   className="block text-xs font-medium text-gray-700 mb-1"
//                 >
//                   Year
//                 </label>
//                 <select
//                   id="year"
//                   value={year}
//                   onChange={(e) => setYear(e.target.value)}
//                   className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
//                 >
//                   <option value="">Select year</option>
//                   {yearOptions.map((y) => (
//                     <option key={y} value={y}>
//                       {y}
//                     </option>
//                   ))}
//                 </select>
//                 <div className="text-xs text-gray-500 mt-1">Example: 2024</div>
//               </div>
//             </div>
//             <div className="flex justify-end space-x-3">
//               <button
//                 type="button"
//                 onClick={() => {
//                   setBenchId("");
//                   setPartyType("");
//                   setStage("PENDING");
//                   setYear("");
//                   setName("");
//                   setSearchResults(null);
//                   setOriginalSearchResults(null);
//                   setTableSearchQuery("");
//                   debouncedFilterResults.cancel(); // Cancel any pending debounce
//                   setError(null);
//                 }}
//                 className="px-3 py-1 text-sm border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
//               >
//                 Clear
//               </button>
//               <button
//                 type="submit"
//                 className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-150"
//                 disabled={isLoading}
//               >
//                 {isLoading ? (
//                   <span className="flex items-center">
//                     <svg
//                       className="animate-spin -ml-1 mr-2 h-3 w-3 text-white"
//                       xmlns="http://www.w3.org/2000/svg"
//                       fill="none"
//                       viewBox="0 0 24 24"
//                     >
//                       <circle
//                         className="opacity-25"
//                         cx="12"
//                         cy="12"
//                         r="10"
//                         stroke="currentColor"
//                         strokeWidth="4"
//                       ></circle>
//                       <path
//                         className="opacity-75"
//                         fill="currentColor"
//                         d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
//                       ></path>
//                     </svg>
//                     Searching...
//                   </span>
//                 ) : (
//                   "Search"
//                 )}
//               </button>
//             </div>
//           </form>
//         </div>
//         {error && (
//           <div className="p-3 mx-4 mb-4 bg-red-50 border border-red-200 rounded-md">
//             <div className="flex items-start">
//               <svg
//                 className="h-4 w-4 mr-2 flex-shrink-0 text-red-600"
//                 fill="none"
//                 stroke="currentColor"
//                 viewBox="0 0 24 24"
//                 xmlns="http://www.w3.org/2000/svg"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth="2"
//                   d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
//                 />
//               </svg>
//               <div className="flex-1">
//                 <p className="text-xs text-red-600 font-medium">{error}</p>
//                 {error.includes("403") && (
//                   <p className="mt-1 text-xs text-red-500">
//                     This could be due to an expired session or authentication issue.
//                   </p>
//                 )}
//                 <div className="mt-2">
//                   <button
//                     onClick={handleRetrySearch}
//                     className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs hover:bg-red-200 transition-colors"
//                   >
//                     Retry Request
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Search Results Card */}
//       {searchResults && (
//         <div className="bg-white rounded-md shadow-sm">
//           <div className="p-4 border-b border-gray-200 flex justify-between items-center">
//             <div className="flex items-center gap-4">
//               <div>
//                 <h3 className="text-md font-medium text-gray-800">
//                   Search Results
//                 </h3>
//                 <p className="mt-1 text-xs text-gray-600">
//                   Found {Array.isArray(searchResults) ? searchResults.length : 0} cases
//                 </p>
//               </div>
//               {/* <button
//                 onClick={() => setShowCart(true)}
//                 className="flex items-center px-2 py-1 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition duration-150"
//               >
//                 <ShoppingCart className="w-4 h-4 mr-1" />
//                 View Followed Cases
//               </button> */}
//             </div>
//             <div className="relative w-64">
//               <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
//                 <Search className="w-4 h-4 text-gray-500" />
//               </div>
//               <input
//                 type="text"
//                 className="block w-full p-2 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
//                 placeholder="Search in results..."
//                 value={tableSearchQuery}
//                 onChange={handleTableSearch}
//               />
//             </div>
//           </div>
//           <div className="p-4">
//             {!searchResults || searchResults.length === 0 ? (
//               <div className="p-3 bg-gray-50 rounded-md border border-gray-200">
//                 <table className="min-w-full">
//                   <tbody>
//                     <tr>
//                       <td
//                         colSpan={isOwner ? 11 : 10}
//                         className="text-sm text-gray-600 text-center py-4"
//                       >
//                         {!originalSearchResults || originalSearchResults.length === 0
//                           ? "No records found matching your search criteria."
//                           : "No records match your filter criteria."}
//                       </td>
//                     </tr>
//                   </tbody>
//                 </table>
//               </div>
//             ) : (
//               <div className="overflow-x-auto rounded-lg shadow">
//                 <table className="w-auto divide-y divide-gray-200 shadow-md shadow-slate-600 text-sm">
//                   <thead className="bg-gray-100">
//                     <tr>
//                       <th
//                         scope="col"
//                         className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
//                       >
//                         Filing No.
//                       </th>
//                       <th
//                         scope="col"
//                         className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
//                       >
//                         Case Type
//                       </th>
//                       <th
//                         scope="col"
//                         className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
//                       >
//                         Case No.
//                       </th>
//                       <th
//                         scope="col"
//                         className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
//                       >
//                         Title
//                       </th>
//                       <th
//                         scope="col"
//                         className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
//                       >
//                         Bench
//                       </th>
//                       <th
//                         scope="col"
//                         className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
//                       >
//                         Court
//                       </th>
//                       <th
//                         scope="col"
//                         className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
//                       >
//                         Filed On
//                       </th>
//                       <th
//                         scope="col"
//                         className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
//                       >
//                         Next Date
//                       </th>
//                       <th
//                         scope="col"
//                         className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
//                       >
//                         Status
//                       </th>
//                       {isOwner && (
//                         <th
//                           scope="col"
//                           className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
//                           data-testid="follow-column-header"
//                         >
//                           Follow
//                         </th>
//                       )}
//                       <th
//                         scope="col"
//                         className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
//                       >
//                         Actions
//                       </th>
//                     </tr>
//                   </thead>
//                   <tbody className="bg-white divide-y divide-gray-200">
//                     {Array.isArray(searchResults) &&
//                       searchResults.map((result, index) => (
//                         <tr
//                           key={`${result.filingNumber}-${index}`}
//                           className={`${
//                             index % 2 === 0 ? "bg-white" : "bg-gray-50"
//                           } hover:bg-blue-50 transition-colors duration-150`}
//                         >
//                           <td className="px-3 py-2 text-xs text-gray-900">
//                             {result.filingNumber || "N/A"}
//                           </td>
//                           <td className="px-3 py-2 text-xs text-gray-900">
//                             {result.caseType || "N/A"}
//                           </td>
//                           <td className="px-3 py-2 text-xs text-gray-900 font-medium">
//                             {result.caseNumber || "N/A"}
//                           </td>
//                           <td
//                             className="px-3 py-2 text-xs text-gray-900 max-w-[200px] truncate"
//                             title={result.title}
//                           >
//                             {result.title || "N/A"}
//                           </td>
//                           <td className="px-3 py-2 text-xs text-gray-900">
//                             {result.bench || "N/A"}
//                           </td>
//                           <td className="px-3 py-2 text-xs text-gray-900">
//                             {result.courtNumber || "N/A"}
//                           </td>
//                           <td className="px-3 py-2 text-xs text-gray-900">
//                             {formatDate(result.filedOn)}
//                           </td>
//                           <td className="px-3 py-2 text-xs text-gray-900">
//                             {formatDate(result.nextDate)}
//                           </td>
//                           <td className="px-3 py-2 text-xs">
//                             <span
//                               className={`px-2 py-1 inline-flex text-xs leading-4 font-semibold rounded-full ${
//                                 result.status === "Pending"
//                                   ? "bg-yellow-100 text-yellow-800"
//                                   : result.status === "Disposed"
//                                   ? "bg-green-100 text-green-800"
//                                   : "bg-gray-100 text-gray-800"
//                               }`}
//                             >
//                               {result.status || "N/A"}
//                             </span>
//                           </td>
//                           {isOwner && (
//                             <td className="px-3 py-2 text-xs text-gray-900">
//                               <button
//                                 className={`flex items-center justify-center space-x-1 px-2 py-1 text-xs font-medium rounded-md transition-colors ${
//                                   followedCases.some(
//                                     (c) => c.filing_number === result.filingNumber
//                                   )
//                                     ? "text-yellow-700 bg-yellow-100 hover:bg-yellow-200"
//                                     : "text-gray-700 bg-gray-100 hover:bg-gray-200"
//                                 }`}
//                                 onClick={() =>
//                                   followedCases.some(
//                                     (c) => c.filing_number === result.filingNumber
//                                   )
//                                     ? handleUnfollowCase(result.filingNumber)
//                                     : handleFollowCase(result, index)
//                                 }
//                                 disabled={followLoading === index}
//                                 data-testid={`follow-button-${result.filingNumber}`}
//                               >
//                                 {followLoading === index ? (
//                                   <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
//                                 ) : (
//                                   <>
//                                     <Star
//                                       size={14}
//                                       className={
//                                         followedCases.some(
//                                           (c) =>
//                                             c.filing_number === result.filingNumber
//                                         )
//                                           ? "text-yellow-600 fill-yellow-500"
//                                           : ""
//                                       }
//                                     />
//                                     <span>
//                                       {followedCases.some(
//                                         (c) =>
//                                           c.filing_number === result.filingNumber
//                                       )
//                                         ? "Following"
//                                         : "Follow"}
//                                     </span>
//                                   </>
//                                 )}
//                               </button>
//                             </td>
//                           )}
//                           <td className="px-3 py-2 text-xs">
//                             <button
//                               onClick={() =>
//                                 handleViewDetails(result.filingNumber)
//                               }
//                               disabled={
//                                 detailsLoading &&
//                                 selectedFilingNumber === result.filingNumber
//                               }
//                               className="flex items-center px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-150"
//                             >
//                               {detailsLoading &&
//                               selectedFilingNumber === result.filingNumber ? (
//                                 "Loading..."
//                               ) : (
//                                 <>
//                                   <svg
//                                     xmlns="http://www.w3.org/2000/svg"
//                                     className="h-3 w-3 mr-1"
//                                     fill="none"
//                                     viewBox="0 0 24 24"
//                                     stroke="currentColor"
//                                   >
//                                     <path
//                                       strokeLinecap="round"
//                                       strokeLinejoin="round"
//                                       strokeWidth={2}
//                                       d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
//                                     />
//                                   </svg>
//                                   Details
//                                 </>
//                               )}
//                             </button>
//                           </td>
//                         </tr>
//                       ))}
//                   </tbody>
//                 </table>
//               </div>
//             )}
//             {/* {tableSearchQuery && searchResults.length !== originalSearchResults?.length && (
//               <div className="mt-4 flex justify-center">
//                 <button
//                   onClick={handleClearTableSearch}
//                   className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
//                 >
//                   <svg
//                     className="w-4 h-4 mr-1"
//                     fill="none"
//                     stroke="currentColor"
//                     viewBox="0 0 24 24"
//                     xmlns="http://www.w3.org/2000/svg"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={2}
//                       d="M6 18L18 6M6 6l12 12"
//                     />
//                   </svg>
//                   Clear search filter
//                 </button>
//               </div>
//             )} */}
//           </div>
//         </div>
//       )}

//       {/* Case Details Modal */}
//       {showCaseDetails && (
//         <NcltCaseDetailsModal
//           caseDetails={caseDetails}
//           isLoading={detailsLoading}
//           error={detailsError}
//           onClose={closeDetailsModal}
//           onRetry={handleRetryDetails}
//           handleFollowCase={(caseData) => {
//             const mockCaseItem = {
//               filingNumber: caseData.filingNumber || caseData.caseId,
//               caseType: caseData.caseType || "N/A",
//               caseNumber: caseData.caseNumber || "N/A",
//               title: caseData.title || "N/A",
//               bench: caseData.bench || "N/A",
//               courtNumber: caseData.courtNumber || "N/A",
//               filedOn: caseData.filedOn,
//               nextDate: caseData.nextDate,
//               status: caseData.status || "N/A",
//             };
//             handleFollowCase(mockCaseItem, "modal");
//           }}
//           isCaseFollowed={(filingNumber) =>
//             followedCases.some((c) => c.filing_number === filingNumber)
//           }
//           followLoading={followLoading === "modal"}
//           isOwner={isOwner}
//         />
//       )}

//       {/* Cart Modal */}
//       {showCart && (
//         <Cart
//           followedCases={followedCases}
//           onUnfollow={handleUnfollowCase}
//           onClose={() => setShowCart(false)}
//           fetchFollowedCases={fetchFollowedCases}
//         />
//       )}

//       {/* Toast Notification */}
//       {toast && (
//         <div className="fixed bottom-4 right-4 bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg transition-opacity duration-300 flex items-center space-x-2 z-50">
//           <Star size={16} className="text-yellow-300" />
//           <p>{toast}</p>
//         </div>
//       )}
//     </div>
//   );
// };

// export default NcltPartySearchPage;

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Search, Star, ShoppingCart, X } from "lucide-react";
import NcltCaseDetailsModal from "./NcltCaseDetailsModal";
import { useParams } from "react-router-dom";
import api from "@/utils/api";
import { ncltBenches } from "../utils/ncltBenches";
import { jwtDecode } from "jwt-decode";

// Custom debounce function to avoid lodash dependency
const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

const NcltPartySearchPage = () => {
  const { workspaceId } = useParams();
  const token = localStorage.getItem("token");
  const { sub, role, email } = jwtDecode(token);
  const isOwner = role === "Owner";
  const [benchId, setBenchId] = useState("");
  const [partyType, setPartyType] = useState("");
  const [stage, setStage] = useState("PENDING");
  const [year, setYear] = useState("");
  const [yearSearch, setYearSearch] = useState("");
  const [showYearDropdown, setShowYearDropdown] = useState(false);
  const yearInputRef = useRef(null);
  const [name, setName] = useState("");
  const [originalSearchResults, setOriginalSearchResults] = useState(null);
  const [searchResults, setSearchResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tableSearchQuery, setTableSearchQuery] = useState("");
  const [showCaseDetails, setShowCaseDetails] = useState(false);
  const [selectedFilingNumber, setSelectedFilingNumber] = useState(null);
  const [caseDetails, setCaseDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState(null);
  const [followedCases, setFollowedCases] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [followLoading, setFollowLoading] = useState(null);
  const [toast, setToast] = useState(null);

  const currentYear = new Date().getFullYear();
  const yearOptions = [];
  for (let y = currentYear; y >= 1947; y--) {
    yearOptions.push(y.toString());
  }

  const partyTypeOptions = [
    { value: "PETITIONER", label: "Petitioner" },
    { value: "RESPONDENT", label: "Respondent" },
    { value: "APPLICANT", label: "Applicant" },
    { value: "APPELLANT", label: "Appellant" },
    { value: "DEFENDANT", label: "Defendant" },
  ];

  const stageOptions = [
    { value: "PENDING", label: "Pending" },
    { value: "DISPOSED", label: "Disposed" },
    { value: "BOTH", label: "Both" },
  ];

  const formatDate = (dateString) => {
    if (!dateString || dateString.includes("1970-01-01"))
      return "Not Available";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const showToast = useCallback((message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  }, []);

  const fetchFollowedCases = useCallback(async () => {
    try {
      const { data } = await api.get(`/get-followed-cases-by-court`, {
        params: {
          court: "National Company Law Tribunal (NCLT)",
          workspaceId,
        },
      });
      if (data.success) {
        setFollowedCases(data.cases || []);
      } else {
        console.error(
          "Failed to fetch followed cases:",
          data.error || "Unknown error"
        );
        setFollowedCases([]);
        showToast("Failed to fetch followed cases");
      }
    } catch (err) {
      console.error("Error fetching followed cases:", err.message);
      setFollowedCases([]);
      showToast("Error fetching followed cases");
    }
  }, [workspaceId, showToast]);

  useEffect(() => {
    fetchFollowedCases();
  }, [fetchFollowedCases]);

  useEffect(() => {
    if (showCart || showCaseDetails) {
      fetchFollowedCases();
    }
  }, [showCart, showCaseDetails, fetchFollowedCases]);

  // Handle click outside to close year dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        yearInputRef.current &&
        !yearInputRef.current.contains(event.target)
      ) {
        setShowYearDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredYears = yearOptions.filter((y) =>
    y.includes(yearSearch.toLowerCase())
  );

  const handleYearSelect = (selectedYear) => {
    setYear(selectedYear);
    setYearSearch(selectedYear);
    setShowYearDropdown(false);
  };

  const handleFollowCase = async (caseData, rowIndex) => {
    if (!isOwner) return;
    setFollowLoading(rowIndex);
    const filingNumber = caseData.filingNumber || caseData.caseId;
    const isFollowed = followedCases.some(
      (c) => c.filing_number === filingNumber
    );

    // Optimistic update
    if (!isFollowed) {
      setFollowedCases((prevCases) => [
        ...prevCases,
        {
          filing_number: filingNumber,
          court: "National Company Law Tribunal (NCLT)",
          case_data: {
            filingNumber: filingNumber || "N/A",
            caseType: caseData.caseType || "N/A",
            caseNumber: caseData.caseNumber || "N/A",
            caseTitle: caseData.title || "N/A",
            bench: caseData.bench || "N/A",
            courtNumber: caseData.courtNumber || "N/A",
            filedOn: formatDate(caseData.filedOn),
            nextDate: formatDate(caseData.nextDate),
            status: caseData.status || "N/A",
          },
          workspace_id: workspaceId,
          bench_id: benchId || null,
          followed_at: new Date().toISOString(),
        },
      ]);
    } else {
      setFollowedCases((prevCases) =>
        prevCases.filter((c) => c.filing_number !== filingNumber)
      );
    }

    try {
      if (isFollowed) {
        const { data } = await api.delete("/unfollow-case", {
          data: {
            caseId: filingNumber,
            court: "National Company Law Tribunal (NCLT)",
            benchId: benchId || undefined,
          },
        });
        if (!data.success) {
          throw new Error(data.error || "Failed to unfollow case");
        }
        showToast(`Case ${filingNumber} unfollowed successfully`);
      } else {
        const caseToSave = {
          filingNumber: filingNumber || "N/A",
          caseType: caseData.caseType || "N/A",
          caseNumber: caseData.caseNumber || "N/A",
          caseTitle: caseData.title || "N/A",
          bench: caseData.bench || "N/A",
          courtNumber: caseData.courtNumber || "N/A",
          filedOn: formatDate(caseData.filedOn),
          nextDate: formatDate(caseData.nextDate),
          status: caseData.status || "N/A",
        };
        const { data } = await api.post("/follow-case", {
          caseData: caseToSave,
          court: "National Company Law Tribunal (NCLT)",
          workspace_id: workspaceId,
          benchId: benchId || undefined,
        });
        if (!data.success) {
          throw new Error(data.error || "Failed to follow case");
        }
        showToast(`Case ${filingNumber} followed successfully`);
      }
      await fetchFollowedCases();
    } catch (err) {
      // Revert optimistic update
      if (!isFollowed) {
        setFollowedCases((prevCases) =>
          prevCases.filter((c) => c.filing_number !== filingNumber)
        );
      } else {
        setFollowedCases((prevCases) => [
          ...prevCases,
          {
            filing_number: filingNumber,
            court: "National Company Law Tribunal (NCLT)",
            case_data: {
              filingNumber: filingNumber || "N/A",
              caseType: caseData.caseType || "N/A",
              caseNumber: caseData.caseNumber || "N/A",
              caseTitle: caseData.title || "N/A",
              bench: caseData.bench || "N/A",
              courtNumber: caseData.courtNumber || "N/A",
              filedOn: formatDate(caseData.filedOn),
              nextDate: formatDate(caseData.nextDate),
              status: caseData.status || "N/A",
            },
            workspace_id: workspaceId,
            bench_id: benchId || null,
            followed_at: new Date().toISOString(),
          },
        ]);
      }
      showToast(`Error: ${err.message}`);
    } finally {
      setFollowLoading(null);
    }
  };

  const handleUnfollowCase = async (filingNumber) => {
    if (!isOwner) return;
    const caseToRemove = followedCases.find(
      (c) => c.filing_number === filingNumber
    );

    // Optimistic update
    setFollowedCases((prevCases) =>
      prevCases.filter((c) => c.filing_number !== filingNumber)
    );

    try {
      const { data } = await api.delete("/unfollow-case", {
        data: {
          caseId: filingNumber,
          court: "National Company Law Tribunal (NCLT)",
          benchId: benchId || undefined,
        },
      });
      if (!data.success) {
        throw new Error(data.error || "Failed to unfollow case");
      }
      showToast(`Case ${filingNumber} unfollowed successfully`);
      await fetchFollowedCases();
    } catch (err) {
      // Revert optimistic update
      setFollowedCases((prevCases) => [...prevCases, caseToRemove]);
      showToast(`Error: ${err.message}`);
      console.error("Unfollow error:", err);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!benchId || !name) {
      setError("Please enter bench ID and party name");
      return;
    }

    setIsLoading(true);
    setError(null);
    setTableSearchQuery("");
    setSearchResults(null);
    setOriginalSearchResults(null);
    const token = localStorage.getItem("token");
    const { sub, role, email } = jwtDecode(token);

    try {
      const requestBody = {
        benchId,
        partyType: partyType || "PETITIONER",
        stage: stage || "PENDING",
        year,
        name,
      };

      const { data } = await api.post(
        `${
          import.meta.env.VITE_RESEARCH_API
        }legal-infrahive/national-company-law-tribunal/search/party/`,
        requestBody,
        {
          headers: {
            Authorization: import.meta.env.VITE_RESEARCH_AUTHORIZATION_KEY,
          },
        }
      );

      // Check for API errors first
      if (data.success === false) {
        throw new Error(data.error || "No cases found");
      }

      // Define resultsArray after getting the response
      const resultsArray = Array.isArray(data) ? data : data.data || [];

      // Now use resultsArray for the research credit API call
      await api.post(
        "/research-credit",
        {
          userId: sub,
          usage: resultsArray?.length === 0 ? 1 : resultsArray?.length,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setOriginalSearchResults(resultsArray);
      setSearchResults(resultsArray);
    } catch (err) {
      setError(err.message);
      console.error("Search error:", err);
      setSearchResults([]);
      setOriginalSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetrySearch = () => {
    handleSearch(new Event("submit"));
  };

  const handleViewDetails = async (filingNumber) => {
    setDetailsLoading(true);
    setDetailsError(null);
    setSelectedFilingNumber(filingNumber);
    const token = localStorage.getItem("token");
    const { sub, role, email } = jwtDecode(token);

    try {
      const { data } = await api.post(
        `${
          import.meta.env.VITE_RESEARCH_API
        }legal-infrahive/national-company-law-tribunal/filing-number/`,
        { filingNumber },
        {
          headers: {
            Authorization: import.meta.env.VITE_RESEARCH_AUTHORIZATION_KEY,
          },
        }
      );

      await api.post(
        "/research-credit",
        {
          userId: sub,
          usage: data?.length === 0 ? 1 : data?.length,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (data.success === false) {
        throw new Error(data.error || "Case details not found");
      }
      setCaseDetails(data);
      setShowCaseDetails(true);
    } catch (err) {
      setDetailsError(err.message);
      console.error("Details fetch error:", err);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleRetryDetails = () => {
    if (selectedFilingNumber) {
      handleViewDetails(selectedFilingNumber);
    }
  };

  // Debounced function for filtering search results
  const debouncedFilterResults = useCallback(
    debounce((query) => {
      if (!query.trim() || !Array.isArray(originalSearchResults)) {
        setSearchResults(originalSearchResults || []);
        return;
      }
      const filtered = originalSearchResults.filter(
        (result) =>
          (result.filingNumber &&
            result.filingNumber.toLowerCase().includes(query)) ||
          (result.caseType && result.caseType.toLowerCase().includes(query)) ||
          (result.caseNumber &&
            result.caseNumber.toLowerCase().includes(query)) ||
          (result.title && result.title.toLowerCase().includes(query)) ||
          (result.bench && result.bench.toLowerCase().includes(query)) ||
          (result.courtNumber &&
            result.courtNumber.toString().includes(query)) ||
          (result.status && result.status.toLowerCase().includes(query))
      );
      setSearchResults(filtered);
    }, 300),
    [originalSearchResults]
  );

  const handleTableSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setTableSearchQuery(query); // Update input immediately
    debouncedFilterResults(query); // Debounce the filtering
  };

  const handleClearTableSearch = () => {
    setTableSearchQuery("");
    debouncedFilterResults.cancel(); // Cancel any pending debounce
    setSearchResults(originalSearchResults || []);
  };

  const closeDetailsModal = () => {
    setShowCaseDetails(false);
    setCaseDetails(null);
    setSelectedFilingNumber(null);
    setDetailsError(null);
  };

  const Cart = ({ followedCases, onUnfollow, onClose, fetchFollowedCases }) => {
    const token = localStorage.getItem("token");
    const { sub, role, email } = jwtDecode(token);
    const isOwner = role === "Owner";
    const [searchQuery, setSearchQuery] = useState("");
    const [sortConfig, setSortConfig] = useState({
      key: "followed_at",
      direction: "desc",
    });

    useEffect(() => {
      fetchFollowedCases();
    }, [fetchFollowedCases]);

    const filteredCases = React.useMemo(() => {
      return followedCases.filter((caseData) => {
        const caseJson = caseData.case_data || {};
        const searchIn = [
          caseJson.filingNumber,
          caseJson.caseNumber,
          caseJson.caseTitle,
          caseJson.partyName,
          caseJson.status,
          new Date(caseData.followed_at).toLocaleDateString(),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return searchIn.includes(searchQuery.toLowerCase());
      });
    }, [followedCases, searchQuery]);

    const sortedCases = React.useMemo(() => {
      return [...filteredCases].sort((a, b) => {
        let aValue, bValue;
        if (sortConfig.key === "followed_at") {
          aValue = new Date(a.followed_at);
          bValue = new Date(b.followed_at);
        } else {
          aValue = a.case_data?.[sortConfig.key] || "";
          bValue = b.case_data?.[sortConfig.key] || "";
        }
        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }, [filteredCases, sortConfig]);

    const requestSort = (key) => {
      let direction = "asc";
      if (sortConfig.key === key && sortConfig.direction === "asc")
        direction = "desc";
      setSortConfig({ key, direction });
    };

    const getSortIndicator = (key) => {
      if (sortConfig.key === key)
        return sortConfig.direction === "asc" ? "↑" : "↓";
      return "";
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-screen overflow-y-auto">
          <div className="flex justify-between items-center border-b p-4 sticky top-0 bg-white z-10">
            <div className="flex items-center">
              <h3 className="text-lg font-semibold mr-2">Followed Cases</h3>
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                {followedCases.length}
              </span>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>
          </div>
          <div className="p-4 border-b flex items-center justify-between gap-4">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search followed cases..."
                className="w-64 border border-gray-300 rounded-md pl-10 p-2 focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={16} className="text-gray-500" />
              </div>
            </div>
          </div>
          <div className="p-4">
            {followedCases.length === 0 ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 text-yellow-700 text-center">
                No followed cases yet.
              </div>
            ) : sortedCases.length === 0 ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 text-yellow-700">
                No cases match your search.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th
                        onClick={() => requestSort("filingNumber")}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200"
                      >
                        Filing Number {getSortIndicator("filingNumber")}
                      </th>
                      <th
                        onClick={() => requestSort("caseNumber")}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200"
                      >
                        Case Number {getSortIndicator("caseNumber")}
                      </th>
                      <th
                        onClick={() => requestSort("caseTitle")}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200"
                      >
                        Title {getSortIndicator("caseTitle")}
                      </th>
                      <th
                        onClick={() => requestSort("partyName")}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200"
                      >
                        Party Name {getSortIndicator("partyName")}
                      </th>
                      <th
                        onClick={() => requestSort("status")}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200"
                      >
                        Status {getSortIndicator("status")}
                      </th>
                      <th
                        onClick={() => requestSort("followed_at")}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200"
                      >
                        Followed On {getSortIndicator("followed_at")}
                      </th>
                      {isOwner && (
                        <th
                          className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
                          data-testid="unfollow-column-header"
                        >
                          Unfollow
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {sortedCases.map((caseData, index) => (
                      <tr
                        key={`${caseData.filing_number}-${index}`}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-6 py-4 text-sm">
                          {caseData.filing_number || "N/A"}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {caseData.case_data.caseNumber || "N/A"}
                        </td>
                        <td className="px-6 py-4 text-sm max-w-[200px] truncate">
                          {caseData.case_data.caseTitle || "N/A"}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {caseData.case_data.partyName || "N/A"}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {caseData.case_data.status || "N/A"}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {new Date(caseData.followed_at).toLocaleDateString()}
                        </td>
                        {isOwner && (
                          <td className="px-6 py-4 text-sm">
                            <button
                              onClick={() => onUnfollow(caseData.filing_number)}
                              className="bg-red-100 text-red-700 hover:bg-red-200 px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1"
                              data-testid={`unfollow-button-${caseData.filing_number}`}
                            >
                              <span>Unfollow</span>
                              <X size={12} />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
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

  return (
    <div className="space-y-4">
      {/* Search Form Card */}
      <div className="bg-white rounded-md shadow-sm w-[40vw]">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">
            Search NCLT Cases by Party Name
          </h2>
          <p className="mt-1 text-xs text-gray-600">
            Search cases in the National Company Law Tribunal by party name
          </p>
        </div>
        <div className="p-4">
          <form onSubmit={handleSearch} className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="benchId"
                  className="block text-xs font-medium text-gray-700 mb-1"
                >
                  Bench *
                </label>
                <select
                  id="benchId"
                  value={benchId}
                  onChange={(e) => setBenchId(e.target.value)}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select bench</option>
                  {ncltBenches.map((bench) => (
                    <option key={bench.id} value={bench.id}>
                      {bench.name}
                    </option>
                  ))}
                </select>
                <div className="text-xs text-gray-500 mt-1">
                  Example: National Company Law Tribunal, Principal Bench
                </div>
              </div>
              <div>
                <label
                  htmlFor="name"
                  className="block text-xs font-medium text-gray-700 mb-1"
                >
                  Party Name *
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter party name"
                  required
                />
                <div className="text-xs text-gray-500 mt-1">
                  Example: Manish
                </div>
              </div>
              <div>
                <label
                  htmlFor="partyType"
                  className="block text-xs font-medium text-gray-700 mb-1"
                >
                  Party Type
                </label>
                <select
                  id="partyType"
                  value={partyType}
                  onChange={(e) => setPartyType(e.target.value)}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select party type</option>
                  {partyTypeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <div className="text-xs text-gray-500 mt-1">
                  Example: PETITIONER
                </div>
              </div>
              <div>
                <label
                  htmlFor="stage"
                  className="block text-xs font-medium text-gray-700 mb-1"
                >
                  Case Stage
                </label>
                <select
                  id="stage"
                  value={stage}
                  onChange={(e) => setStage(e.target.value)}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  {stageOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <div className="text-xs text-gray-500 mt-1">
                  Example: PENDING
                </div>
              </div>
              <div ref={yearInputRef}>
                <label
                  htmlFor="year-input"
                  className="block text-xs font-medium text-gray-700 mb-1"
                >
                  Year
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="year-input"
                    value={yearSearch}
                    onChange={(e) => {
                      setYearSearch(e.target.value);
                      setShowYearDropdown(true);
                    }}
                    onFocus={() => setShowYearDropdown(true)}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md shadow-sm pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Select year"
                    aria-label="Search years"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search size={16} className="text-gray-500" />
                  </div>
                  {showYearDropdown && (
                    <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-60 overflow-y-auto shadow-lg">
                      {filteredYears.length > 0 ? (
                        filteredYears.map((y) => (
                          <li
                            key={y}
                            className="px-4 py-2 text-sm hover:bg-blue-100 cursor-pointer"
                            onClick={() => handleYearSelect(y)}
                          >
                            {y}
                          </li>
                        ))
                      ) : (
                        <li className="px-4 py-2 text-sm text-gray-500">
                          No years found
                        </li>
                      )}
                    </ul>
                  )}
                </div>
                <div className="text-xs text-gray-500 mt-1">Example: 2024</div>
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setBenchId("");
                  setPartyType("");
                  setStage("PENDING");
                  setYear("");
                  setYearSearch("");
                  setName("");
                  setSearchResults(null);
                  setOriginalSearchResults(null);
                  setTableSearchQuery("");
                  debouncedFilterResults.cancel();
                  setError(null);
                }}
                className="px-3 py-1 text-sm border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Clear
              </button>
              <button
                type="submit"
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-150"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-3 w-3 text-white"
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
                    Searching...
                  </span>
                ) : (
                  "Search"
                )}
              </button>
            </div>
          </form>
        </div>
        {error && (
          <div className="p-3 mx-4 mb-4 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-start">
              <svg
                className="h-4 w-4 mr-2 flex-shrink-0 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <div className="flex-1">
                <p className="text-xs text-red-600 font-medium">{error}</p>
                {error.includes("403") && (
                  <p className="mt-1 text-xs text-red-500">
                    This could be due to an expired session or authentication
                    issue.
                  </p>
                )}
                <div className="mt-2">
                  <button
                    onClick={handleRetrySearch}
                    className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs hover:bg-red-200 transition-colors"
                  >
                    Retry Request
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Search Results Card */}
      {searchResults && (
        <div className="bg-white rounded-md shadow-sm">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div>
                <h3 className="text-md font-medium text-gray-800">
                  Search Results
                </h3>
                <p className="mt-1 text-xs text-gray-600">
                  Found{" "}
                  {Array.isArray(searchResults) ? searchResults.length : 0}{" "}
                  cases
                </p>
              </div>
            </div>
            <div className="relative w-64">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="w-4 h-4 text-gray-500" />
              </div>
              <input
                type="text"
                className="block w-full p-2 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Search in results..."
                value={tableSearchQuery}
                onChange={handleTableSearch}
              />
            </div>
          </div>
          <div className="p-4">
            {!searchResults || searchResults.length === 0 ? (
              <div className="p-3 bg-gray-50 rounded-md border border-gray-200">
                <table className="min-w-full">
                  <tbody>
                    <tr>
                      <td
                        colSpan={isOwner ? 11 : 10}
                        className="text-sm text-gray-600 text-center py-4"
                      >
                        {!originalSearchResults ||
                        originalSearchResults.length === 0
                          ? "No records found matching your search criteria."
                          : "No records match your filter criteria."}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg shadow">
                <table className="w-auto divide-y divide-gray-200 shadow-md shadow-slate-600 text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th
                        scope="col"
                        className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Filing No.
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Case Type
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Case No.
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Title
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Bench
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Court
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Filed On
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Next Date
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Status
                      </th>
                      {isOwner && (
                        <th
                          scope="col"
                          className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          data-testid="follow-column-header"
                        >
                          Follow
                        </th>
                      )}
                      <th
                        scope="col"
                        className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {Array.isArray(searchResults) &&
                      searchResults.map((result, index) => (
                        <tr
                          key={`${result.filingNumber}-${index}`}
                          className={`${
                            index % 2 === 0 ? "bg-white" : "bg-gray-50"
                          } hover:bg-blue-50 transition-colors duration-150`}
                        >
                          <td className="px-3 py-2 text-xs text-gray-900">
                            {result.filingNumber || "N/A"}
                          </td>
                          <td className="px-3 py-2 text-xs text-gray-900">
                            {result.caseType || "N/A"}
                          </td>
                          <td className="px-3 py-2 text-xs text-gray-900 font-medium">
                            {result.caseNumber || "N/A"}
                          </td>
                          <td
                            className="px-3 py-2 text-xs text-gray-900 max-w-[200px] truncate"
                            title={result.title}
                          >
                            {result.title || "N/A"}
                          </td>
                          <td className="px-3 py-2 text-xs text-gray-900">
                            {result.bench || "N/A"}
                          </td>
                          <td className="px-3 py-2 text-xs text-gray-900">
                            {result.courtNumber || "N/A"}
                          </td>
                          <td className="px-3 py-2 text-xs text-gray-900">
                            {formatDate(result.filedOn)}
                          </td>
                          <td className="px-3 py-2 text-xs text-gray-900">
                            {formatDate(result.nextDate)}
                          </td>
                          <td className="px-3 py-2 text-xs">
                            <span
                              className={`px-2 py-1 inline-flex text-xs leading-4 font-semibold rounded-full ${
                                result.status === "Pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : result.status === "Disposed"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {result.status || "N/A"}
                            </span>
                          </td>
                          {isOwner && (
                            <td className="px-3 py-2 text-xs text-gray-900">
                              <button
                                className={`flex items-center justify-center space-x-1 px-2 py-1 text-xs font-medium rounded-md transition-colors ${
                                  followedCases.some(
                                    (c) =>
                                      c.filing_number === result.filingNumber
                                  )
                                    ? "text-yellow-700 bg-yellow-100 hover:bg-yellow-200"
                                    : "text-gray-700 bg-gray-100 hover:bg-gray-200"
                                }`}
                                onClick={() =>
                                  followedCases.some(
                                    (c) =>
                                      c.filing_number === result.filingNumber
                                  )
                                    ? handleUnfollowCase(result.filingNumber)
                                    : handleFollowCase(result, index)
                                }
                                disabled={followLoading === index}
                                data-testid={`follow-button-${result.filingNumber}`}
                              >
                                {followLoading === index ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                                ) : (
                                  <>
                                    <Star
                                      size={14}
                                      className={
                                        followedCases.some(
                                          (c) =>
                                            c.filing_number ===
                                            result.filingNumber
                                        )
                                          ? "text-yellow-600 fill-yellow-500"
                                          : ""
                                      }
                                    />
                                    <span>
                                      {followedCases.some(
                                        (c) =>
                                          c.filing_number ===
                                          result.filingNumber
                                      )
                                        ? "Following"
                                        : "Follow"}
                                    </span>
                                  </>
                                )}
                              </button>
                            </td>
                          )}
                          <td className="px-3 py-2 text-xs">
                            <button
                              onClick={() =>
                                handleViewDetails(result.filingNumber)
                              }
                              disabled={
                                detailsLoading &&
                                selectedFilingNumber === result.filingNumber
                              }
                              className="flex items-center px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-150"
                            >
                              {detailsLoading &&
                              selectedFilingNumber === result.filingNumber ? (
                                "Loading..."
                              ) : (
                                <>
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-3 w-3 mr-1"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                  </svg>
                                  Details
                                </>
                              )}
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Case Details Modal */}
      {showCaseDetails && (
        <NcltCaseDetailsModal
          caseDetails={caseDetails}
          isLoading={detailsLoading}
          error={detailsError}
          onClose={closeDetailsModal}
          onRetry={handleRetryDetails}
          handleFollowCase={(caseData) => {
            const mockCaseItem = {
              filingNumber: caseData.filingNumber || caseData.caseId,
              caseType: caseData.caseType || "N/A",
              caseNumber: caseData.caseNumber || "N/A",
              title: caseData.title || "N/A",
              bench: caseData.bench || "N/A",
              courtNumber: caseData.courtNumber || "N/A",
              filedOn: caseData.filedOn,
              nextDate: caseData.nextDate,
              status: caseData.status || "N/A",
            };
            handleFollowCase(mockCaseItem, "modal");
          }}
          isCaseFollowed={(filingNumber) =>
            followedCases.some((c) => c.filing_number === filingNumber)
          }
          followLoading={followLoading === "modal"}
          isOwner={isOwner}
        />
      )}

      {/* Cart Modal */}
      {showCart && (
        <Cart
          followedCases={followedCases}
          onUnfollow={handleUnfollowCase}
          onClose={() => setShowCart(false)}
          fetchFollowedCases={fetchFollowedCases}
        />
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-4 right-4 bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg transition-opacity duration-300 flex items-center space-x-2 z-50">
          <Star size={16} className="text-yellow-300" />
          <p>{toast}</p>
        </div>
      )}
    </div>
  );
};

export default NcltPartySearchPage;
