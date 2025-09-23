// import React, { useState, useEffect, useCallback, useMemo } from "react";
// import { AlertTriangle, Search, Star, X } from "lucide-react";
// import { useParams } from "react-router-dom";
// import api from "@/utils/api";
// import CatCaseDetailsModal from "./CatCaseDetailsModal";
// import { catBenches } from "../utils/catBenches";

// // Custom debounce function
// const debounce = (func, wait) => {
//   let timeout;
//   return (...args) => {
//     clearTimeout(timeout);
//     timeout = setTimeout(() => func(...args), wait);
//   };
// };

// const CatPartySearchPage = ({ court }) => {
//   const { workspaceId } = useParams();
//   const user = JSON.parse(localStorage.getItem("user") || "{}");
//   const role = user?.role || "Member";
//   const isOwner = role === "Owner";
//   const [name, setName] = useState("");
//   const [type, setType] = useState("");
//   const [benchId, setBenchId] = useState("");
//   const [originalSearchResults, setOriginalSearchResults] = useState(null);
//   const [searchResults, setSearchResults] = useState(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [tableSearchQuery, setTableSearchQuery] = useState("");
//   const [followedCases, setFollowedCases] = useState([]);
//   const [showCart, setShowCart] = useState(false);
//   const [followLoading, setFollowLoading] = useState(null);
//   const [toast, setToast] = useState(null);
//   const [showCaseDetails, setShowCaseDetails] = useState(false);
//   const [selectedCase, setSelectedCase] = useState(null);
//   const [caseDetails, setCaseDetails] = useState(null);
//   const [detailsLoading, setDetailsLoading] = useState(false);
//   const [detailsError, setDetailsError] = useState(null);

//   const courtName = "Central Administrative Tribunal (CAT)";

//   const showToast = useCallback((message) => {
//     setToast(message);
//     setTimeout(() => setToast(null), 3000);
//   }, []);

//   const fetchFollowedCases = useCallback(async () => {
//     try {
//       const response = await api.get(`/get-followed-cases-by-court`, {
//         params: { court: courtName, workspaceId },
//       });
//       const data = response.data;
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
//   }, [workspaceId, courtName, showToast]);

//   useEffect(() => {
//     fetchFollowedCases();
//   }, [fetchFollowedCases]);

//   useEffect(() => {
//     if (showCart || showCaseDetails) {
//       fetchFollowedCases();
//     }
//   }, [showCart, showCaseDetails, fetchFollowedCases]);

//   const createCaseIdentifier = useCallback((diaryNumber, caseYear, benchId) => {
//     return `${diaryNumber}-${caseYear}-${benchId}`;
//   }, []);

//   const extractDiaryInfo = useCallback((diaryNumber) => {
//     if (diaryNumber && diaryNumber.includes("/")) {
//       const parts = diaryNumber.split("/");
//       return {
//         diaryNum: parts[0].trim(),
//         year: parts[1].trim(),
//       };
//     }
//     return {
//       diaryNum: diaryNumber,
//       year: null,
//     };
//   }, []);

//   const isCaseFollowed = useCallback(
//     (diaryNumber, caseYear, benchIdToCheck) => {
//       return followedCases.some((followedCase) => {
//         const followedDiary = followedCase.diary_number;
//         const followedYear = followedCase.case_year;
//         const followedBench = followedCase.bench_id;
//         const { diaryNum, year } = extractDiaryInfo(diaryNumber);
//         const finalYear = caseYear || year;
//         return (
//           followedDiary === diaryNum &&
//           followedYear === finalYear &&
//           followedBench === benchIdToCheck
//         );
//       });
//     },
//     [followedCases, extractDiaryInfo]
//   );

//   const handleFollowCase = async (caseData, source) => {
//     if (!isOwner) return;
//     setFollowLoading(source);
//     const { diaryNum, year } = extractDiaryInfo(caseData.diaryNumber);
//     const finalYear = caseData.caseYear || year;
//     const finalBenchId = caseData.benchId || benchId;
//     const caseIdentifier = createCaseIdentifier(
//       diaryNum,
//       finalYear,
//       finalBenchId
//     );
//     const isFollowed = isCaseFollowed(
//       caseData.diaryNumber,
//       finalYear,
//       finalBenchId
//     );

//     // Optimistic update
//     if (!isFollowed) {
//       setFollowedCases((prevCases) => [
//         ...prevCases,
//         {
//           diary_number: diaryNum,
//           case_year: finalYear,
//           bench_id: finalBenchId,
//           case_data: {
//             diaryNumber: caseData.diaryNumber || "N/A",
//             caseNumber: caseData.caseNumber || "N/A",
//             applicantName: caseData.applicantName || "N/A",
//             defendantName: caseData.defendantName || "N/A",
//             partyName: name || "N/A",
//             type: type || "N/A",
//             benchId: finalBenchId || "N/A",
//           },
//           court: courtName,
//           workspace_id: workspaceId,
//           followed_at: new Date().toISOString(),
//         },
//       ]);
//     } else {
//       setFollowedCases((prevCases) =>
//         prevCases.filter((followedCase) => {
//           const followedIdentifier = createCaseIdentifier(
//             followedCase.diary_number,
//             followedCase.case_year,
//             followedCase.bench_id
//           );
//           return followedIdentifier !== caseIdentifier;
//         })
//       );
//     }

//     try {
//       if (isFollowed) {
//         const response = await api.delete("/unfollow-case", {
//           data: {
//             caseId: `${diaryNum}/${finalYear}`,
//             court: courtName,
//             benchId: finalBenchId,
//           },
//         });
//         const data = response.data;
//         if (!data.success) {
//           throw new Error(data.error || "Failed to unfollow case");
//         }
//         showToast(`Case ${diaryNum}/${finalYear} unfollowed successfully`);
//       } else {
//         const payload = {
//           caseData: {
//             diaryNumber: caseData.diaryNumber || "N/A",
//             caseNumber: caseData.caseNumber || "N/A",
//             applicantName: caseData.applicantName || "N/A",
//             defendantName: caseData.defendantName || "N/A",
//             partyName: name || "N/A",
//             type: type || "N/A",
//             benchId: finalBenchId || "N/A",
//           },
//           court: courtName,
//           workspace_id: workspaceId,
//           diaryNumber: diaryNum,
//           caseYear: finalYear,
//           benchId: finalBenchId,
//         };
//         const response = await api.post("/follow-case", payload);
//         const data = response.data;
//         if (!data.success) {
//           throw new Error(data.error || "Failed to follow case");
//         }
//         showToast(`Case ${diaryNum}/${finalYear} followed successfully`);
//       }
//       await fetchFollowedCases();
//     } catch (err) {
//       // Revert optimistic update
//       if (!isFollowed) {
//         setFollowedCases((prevCases) =>
//           prevCases.filter((followedCase) => {
//             const followedIdentifier = createCaseIdentifier(
//               followedCase.diary_number,
//               followedCase.case_year,
//               followedCase.bench_id
//             );
//             return followedIdentifier !== caseIdentifier;
//           })
//         );
//       } else {
//         setFollowedCases((prevCases) => [
//           ...prevCases,
//           {
//             diary_number: diaryNum,
//             case_year: finalYear,
//             bench_id: finalBenchId,
//             case_data: {
//               diaryNumber: caseData.diaryNumber || "N/A",
//               caseNumber: caseData.caseNumber || "N/A",
//               applicantName: caseData.applicantName || "N/A",
//               defendantName: caseData.defendantName || "N/A",
//               partyName: name || "N/A",
//               type: type || "N/A",
//               benchId: finalBenchId || "N/A",
//             },
//             court: courtName,
//             workspace_id: workspaceId,
//             followed_at: new Date().toISOString(),
//           },
//         ]);
//       }
//       showToast(`Error: ${err.message}`);
//     } finally {
//       setFollowLoading(null);
//     }
//   };

//   const handleUnfollowCase = async (followedCase) => {
//     if (!isOwner) return;
//     const caseIdentifier = createCaseIdentifier(
//       followedCase.diary_number,
//       followedCase.case_year,
//       followedCase.bench_id
//     );

//     // Optimistic update
//     setFollowedCases((prevCases) =>
//       prevCases.filter((caseData) => {
//         const identifier = createCaseIdentifier(
//           caseData.diary_number,
//           caseData.case_year,
//           caseData.bench_id
//         );
//         return identifier !== caseIdentifier;
//       })
//     );

//     try {
//       const response = await api.delete("/unfollow-case", {
//         data: {
//           caseId: `${followedCase.diary_number}/${followedCase.case_year}`,
//           court: courtName,
//           benchId: followedCase.bench_id,
//         },
//       });
//       const data = response.data;
//       if (!data.success) {
//         throw new Error(data.error || "Failed to unfollow case");
//       }
//       await fetchFollowedCases();
//       showToast(
//         `Case ${followedCase.diary_number}/${followedCase.case_year} unfollowed successfully`
//       );
//     } catch (err) {
//       // Revert optimistic update
//       setFollowedCases((prevCases) => [...prevCases, followedCase]);
//       showToast(`Error: ${err.message}`);
//     }
//   };

//   const handleViewDetails = async (caseItem) => {
//     setDetailsLoading(true);
//     setDetailsError(null);
//     setSelectedCase(caseItem);
//     const { diaryNum, year } = extractDiaryInfo(caseItem.diaryNumber);
//     const finalYear = caseItem.caseYear || year;
//     const finalBenchId = caseItem.benchId || benchId;

//     try {
//       const { data } = await api.post(
//         `${
//           import.meta.env.VITE_RESEARCH_API
//         }legal-infrahive/central-administrative-tribunal/diary-number/`,
//         {
//           benchId: finalBenchId,
//           diaryNumber: diaryNum,
//           caseYear: finalYear,
//         },
//         {
//           headers: {
//             Authorization: import.meta.env.VITE_RESEARCH_AUTHORIZATION_KEY,
//           },
//         }
//       );

//       if (data?.error) throw new Error(data.error);

//       setCaseDetails(data);
//       setShowCaseDetails(true);
//     } catch (err) {
//       console.error("Details fetch error:", err);
//       setDetailsError(err.message || "Failed to fetch case details");
//     } finally {
//       setDetailsLoading(false);
//     }
//   };

//   const handleRetryDetails = () => {
//     if (selectedCase) {
//       handleViewDetails(selectedCase);
//     }
//   };

//   const closeDetailsModal = () => {
//     setShowCaseDetails(false);
//     setCaseDetails(null);
//     setSelectedCase(null);
//     setDetailsError(null);
//   };

//   const handleSearch = async (e) => {
//     e.preventDefault();
//     if (!name) {
//       setError("Please enter a party name");
//       return;
//     }

//     setIsLoading(true);
//     setError(null);
//     setTableSearchQuery("");
//     setSearchResults(null);
//     setOriginalSearchResults(null);

//     try {
//       const { data } = await api.post(
//         `${
//           import.meta.env.VITE_RESEARCH_API
//         }legal-infrahive/central-administrative-tribunal/search-party/`,
//         {
//           name,
//           type,
//           benchId,
//         },
//         {
//           headers: {
//             Authorization: import.meta.env.VITE_RESEARCH_AUTHORIZATION_KEY,
//           },
//         }
//       );

//       if (data?.error) throw new Error(data.error);

//       const resultsArray = Array.isArray(data)
//         ? data.map((item, index) => ({
//             "#": item["#"] || `${index + 1}`,
//             diaryNumber: item.diaryNumber || "N/A",
//             caseNumber: item.caseNumber || "N/A",
//             applicantName: item.applicantName || "N/A",
//             defendantName: item.defendantName || "N/A",
//             partyName: name || "N/A",
//             type: type || "N/A",
//             benchId: benchId || "N/A",
//           }))
//         : [];

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
//       const message =
//         err.response?.status === 403
//           ? "Access denied. Your session may have expired or you lack permission."
//           : err.response?.data?.error || err.message;
//       setError(message);
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

//   // Debounced function for filtering search results
//   const debouncedFilterResults = useCallback(
//     debounce((query) => {
//       if (!query.trim() || !Array.isArray(originalSearchResults)) {
//         setSearchResults(originalSearchResults || []);
//         return;
//       }
//       const filtered = originalSearchResults.filter(
//         (caseItem) =>
//           (caseItem.diaryNumber &&
//             caseItem.diaryNumber.toLowerCase().includes(query)) ||
//           (caseItem.caseNumber &&
//             caseItem.caseNumber.toLowerCase().includes(query)) ||
//           (caseItem.applicantName &&
//             caseItem.applicantName.toLowerCase().includes(query)) ||
//           (caseItem.defendantName &&
//             caseItem.defendantName.toLowerCase().includes(query)) ||
//           (caseItem.partyName &&
//             caseItem.partyName.toLowerCase().includes(query)) ||
//           (caseItem.type && caseItem.type.toLowerCase().includes(query)) ||
//           (caseItem.benchId && caseItem.benchId.toLowerCase().includes(query))
//       );
//       setSearchResults(filtered);
//     }, 300),
//     [originalSearchResults]
//   );

//   const handleTableSearch = (e) => {
//     const query = e.target.value.toLowerCase();
//     setTableSearchQuery(query);
//     debouncedFilterResults(query);
//   };

//   const handleClearTableSearch = () => {
//     setTableSearchQuery("");
//     debouncedFilterResults.cancel();
//     setSearchResults(originalSearchResults || []);
//   };

//   const handleClear = () => {
//     setName("");
//     setType("");
//     setBenchId("");
//     setSearchResults(null);
//     setOriginalSearchResults(null);
//     setTableSearchQuery("");
//     debouncedFilterResults.cancel();
//     setError(null);
//   };

//   const Cart = ({ followedCases, onUnfollow, onClose, fetchFollowedCases }) => {
//     const [searchQuery, setSearchQuery] = useState("");
//     const [sortConfig, setSortConfig] = useState({
//       key: "followed_at",
//       direction: "desc",
//     });
//     const user = JSON.parse(localStorage.getItem("user") || "{}");
//     const role = user?.role || "Member";
//     const isOwner = role === "Owner";

//     useEffect(() => {
//       fetchFollowedCases();
//     }, [fetchFollowedCases]);

//     const filteredCases = useMemo(() => {
//       return followedCases.filter((caseData) => {
//         const caseJson = caseData.case_data || {};
//         const searchIn = [
//           caseJson.diaryNumber,
//           caseJson.caseNumber,
//           caseJson.applicantName,
//           caseJson.defendantName,
//           caseJson.partyName,
//           caseJson.type,
//           caseJson.benchId,
//           new Date(caseData.followed_at).toLocaleDateString(),
//         ]
//           .filter(Boolean)
//           .join(" ")
//           .toLowerCase();
//         return searchIn.includes(searchQuery.toLowerCase());
//       });
//     }, [followedCases, searchQuery]);

//     const sortedCases = useMemo(() => {
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
//                 className="w-64 border border-gray-300 rounded-md pl-10 pr-8 p-2 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
//                 aria-label="Search followed cases"
//               />
//               <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                 <Search size={16} className="text-gray-500" />
//               </div>
//               {searchQuery && (
//                 <button
//                   onClick={() => setSearchQuery("")}
//                   className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
//                   aria-label="Clear search"
//                 >
//                   <X size={16} />
//                 </button>
//               )}
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
//                         onClick={() => requestSort("diaryNumber")}
//                         className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200"
//                       >
//                         Diary Number {getSortIndicator("diaryNumber")}
//                       </th>
//                       <th
//                         onClick={() => requestSort("caseNumber")}
//                         className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200"
//                       >
//                         Case Number {getSortIndicator("caseNumber")}
//                       </th>
//                       <th
//                         onClick={() => requestSort("applicantName")}
//                         className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200"
//                       >
//                         Applicant Name {getSortIndicator("applicantName")}
//                       </th>
//                       <th
//                         onClick={() => requestSort("defendantName")}
//                         className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200"
//                       >
//                         Defendant Name {getSortIndicator("defendantName")}
//                       </th>
//                       <th
//                         onClick={() => requestSort("partyName")}
//                         className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200"
//                       >
//                         Party Name {getSortIndicator("partyName")}
//                       </th>
//                       <th
//                         onClick={() => requestSort("type")}
//                         className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200"
//                       >
//                         Type {getSortIndicator("type")}
//                       </th>
//                       <th
//                         onClick={() => requestSort("benchId")}
//                         className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200"
//                       >
//                         Bench ID {getSortIndicator("benchId")}
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
//                     {sortedCases.map((caseData, index) => {
//                       const caseIdentifier = createCaseIdentifier(
//                         caseData.diary_number,
//                         caseData.case_year,
//                         caseData.bench_id
//                       );
//                       return (
//                         <tr
//                           key={`${caseData.diary_number}-${caseData.case_year}-${caseData.bench_id}-${index}`}
//                           className="hover:bg-gray-50"
//                         >
//                           <td className="px-6 py-4 text-sm">
//                             {caseData.case_data?.diaryNumber ||
//                               `${caseData.diary_number}/${caseData.case_year}` ||
//                               "N/A"}
//                           </td>
//                           <td className="px-6 py-4 text-sm">
//                             {caseData.case_data?.caseNumber || "N/A"}
//                           </td>
//                           <td className="px-6 py-4 text-sm">
//                             {caseData.case_data?.applicantName || "N/A"}
//                           </td>
//                           <td className="px-6 py-4 text-sm">
//                             {caseData.case_data?.defendantName || "N/A"}
//                           </td>
//                           <td className="px-6 py-4 text-sm">
//                             {caseData.case_data?.partyName || "N/A"}
//                           </td>
//                           <td className="px-6 py-4 text-sm">
//                             {caseData.case_data?.type || "N/A"}
//                           </td>
//                           <td className="px-6 py-4 text-sm">
//                             {caseData.case_data?.benchId ||
//                               caseData.bench_id ||
//                               "N/A"}
//                           </td>
//                           <td className="px-6 py-4 text-sm">
//                             {new Date(
//                               caseData.followed_at
//                             ).toLocaleDateString()}
//                           </td>
//                           {isOwner && (
//                             <td className="px-6 py-4 text-sm">
//                               <button
//                                 onClick={() => onUnfollow(caseData)}
//                                 className="bg-red-100 text-red-700 hover:bg-red-200 px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1"
//                                 data-testid={`unfollow-button-${caseIdentifier}`}
//                               >
//                                 <span>Unfollow</span>
//                                 <X size={12} />
//                               </button>
//                             </td>
//                           )}
//                         </tr>
//                       );
//                     })}
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
//             Search {courtName} by Party Name
//           </h2>
//           <p className="mt-1 text-xs text-gray-600">
//             Enter the party name and other details to find relevant cases
//           </p>
//         </div>
//         <div className="p-4">
//           <form onSubmit={handleSearch} className="space-y-3">
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
//                   aria-required="true"
//                   aria-label="Party Name"
//                 />
//                 <p className="text-xs text-gray-500 mt-1">Example: Rakesh</p>
//               </div>
//               <div>
//                 <label
//                   htmlFor="type"
//                   className="block text-xs font-medium text-gray-700 mb-1"
//                 >
//                   Case Type
//                 </label>
//                 <select
//                   id="type"
//                   value={type}
//                   onChange={(e) => setType(e.target.value)}
//                   className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
//                   aria-label="Case Type"
//                 >
//                   <option value="">Select case type</option>
//                   <option value="BOTH">BOTH</option>
//                   <option value="PENDING">PENDING</option>
//                   <option value="DISPOSED">DISPOSED</option>
//                 </select>
//                 <p className="text-xs text-gray-500 mt-1">Example: BOTH</p>
//               </div>
//               <div>
//   <label
//     htmlFor="benchId"
//     className="block text-xs font-medium text-gray-700 mb-1"
//   >
//     Bench
//   </label>
//   <select
//     id="benchId"
//     value={benchId}
//     onChange={(e) => setBenchId(e.target.value)}
//     className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
//     aria-label="Bench"
//   >
//     <option value="">Select bench</option>
//     {catBenches.map((bench) => (
//       <option key={bench.id} value={bench.id}>
//         {bench.name}
//       </option>
//     ))}
//   </select>
//   <p className="text-xs text-gray-500 mt-1">Example: DELHI</p>
// </div>
//             </div>
//             <div className="flex justify-end space-x-3">
//               <button
//                 type="button"
//                 onClick={handleClear}
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
//               <AlertTriangle className="h-4 w-4 mr-2 flex-shrink-0 text-red-600" />
//               <div className="flex-1">
//                 <p className="text-xs text-red-600 font-medium">{error}</p>
//                 {error.includes("403") && (
//                   <p className="mt-1 text-xs text-red-500">
//                     This could be due to an expired session or authentication
//                     issue.
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
//               <h3 className="text-md font-medium text-gray-800">
//                 Search Results
//               </h3>
//               <p className="text-xs text-gray-600">
//                 Found {Array.isArray(searchResults) ? searchResults.length : 0}{" "}
//                 cases
//               </p>
//             </div>
//             <div className="relative w-64">
//               <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                 <Search className="w-4 h-4 text-gray-500" />
//               </div>
//               <input
//                 type="text"
//                 className="block w-full p-2 pl-10 pr-8 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 transition-colors"
//                 placeholder="Filter cases by diary number, case number, etc."
//                 value={tableSearchQuery}
//                 onChange={handleTableSearch}
//                 aria-label="Filter search results"
//               />
//               {/* {tableSearchQuery && (
//                 <button
//                   onClick={handleClearTableSearch}
//                   className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
//                   aria-label="Clear search filter"
//                 >
//                   <X size={16} />
//                 </button>
//               )} */}
//             </div>
//           </div>
//           <div className="p-4">
//             {!searchResults || searchResults.length === 0 ? (
//               <div className="p-3 bg-gray-50 rounded-md border border-gray-200">
//                 <table className="min-w-full">
//                   <tbody>
//                     <tr>
//                       <td
//                         colSpan={isOwner ? 10 : 9}
//                         className="text-sm text-gray-600 text-center py-4"
//                       >
//                         {!originalSearchResults ||
//                         originalSearchResults.length === 0
//                           ? "No records found matching your search criteria."
//                           : "No records match your filter criteria."}
//                       </td>
//                     </tr>
//                   </tbody>
//                 </table>
//               </div>
//             ) : (
//               <div className="overflow-x-auto rounded-lg shadow">
//                 <table className="min-w-full divide-y divide-gray-200 shadow-md shadow-slate-600">
//                   <thead className="bg-gray-100">
//                     <tr>
//                       <th
//                         scope="col"
//                         className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
//                       >
//                         #
//                       </th>
//                       <th
//                         scope="col"
//                         className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
//                       >
//                         Diary Number
//                       </th>
//                       <th
//                         scope="col"
//                         className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
//                       >
//                         Case Number
//                       </th>
//                       <th
//                         scope="col"
//                         className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
//                       >
//                         Applicant Name
//                       </th>
//                       <th
//                         scope="col"
//                         className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
//                       >
//                         Defendant Name
//                       </th>
//                       <th
//                         scope="col"
//                         className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
//                       >
//                         Party Name
//                       </th>
//                       <th
//                         scope="col"
//                         className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
//                       >
//                         Type
//                       </th>
//                       <th
//                         scope="col"
//                         className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
//                       >
//                         Bench ID
//                       </th>
//                       {isOwner && (
//                         <th
//                           scope="col"
//                           className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
//                           data-testid="follow-column-header"
//                         >
//                           Follow
//                         </th>
//                       )}
//                       <th
//                         scope="col"
//                         className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
//                       >
//                         Actions
//                       </th>
//                     </tr>
//                   </thead>
//                   <tbody className="bg-white divide-y divide-gray-200">
//                     {searchResults.map((caseItem, index) => {
//                       const { diaryNum, year } = extractDiaryInfo(
//                         caseItem.diaryNumber
//                       );
//                       const finalYear = caseItem.caseYear || year;
//                       const finalBenchId = caseItem.benchId || benchId;
//                       const isFollowed = isCaseFollowed(
//                         caseItem.diaryNumber,
//                         finalYear,
//                         finalBenchId
//                       );
//                       const caseIdentifier = createCaseIdentifier(
//                         diaryNum,
//                         finalYear,
//                         finalBenchId
//                       );

//                       return (
//                         <tr
//                           key={`${caseItem.diaryNumber}-${index}`}
//                           className={`${
//                             index % 2 === 0 ? "bg-white" : "bg-gray-50"
//                           } hover:bg-blue-50 transition-colors duration-150`}
//                         >
//                           <td className="px-4 py-3 text-sm text-gray-900">
//                             {caseItem["#"]}
//                           </td>
//                           <td className="px-4 py-3 text-sm text-gray-900">
//                             {caseItem.diaryNumber}
//                           </td>
//                           <td className="px-4 py-3 text-sm text-gray-900">
//                             {caseItem.caseNumber}
//                           </td>
//                           <td className="px-4 py-3 text-sm text-gray-900">
//                             {caseItem.applicantName}
//                           </td>
//                           <td className="px-4 py-3 text-sm text-gray-900">
//                             {caseItem.defendantName}
//                           </td>
//                           <td className="px-4 py-3 text-sm text-gray-900">
//                             {caseItem.partyName}
//                           </td>
//                           <td className="px-4 py-3 text-sm text-gray-900">
//                             {caseItem.type}
//                           </td>
//                           <td className="px-4 py-3 text-sm text-gray-900">
//                             {caseItem.benchId}
//                           </td>
//                           {isOwner && (
//                             <td className="px-4 py-3 text-sm text-gray-900">
//                               <button
//                                 className={`flex items-center justify-center space-x-1 px-3 py-1 text-xs font-medium rounded-md transition-colors ${
//                                   isFollowed
//                                     ? "text-yellow-700 bg-yellow-100 hover:bg-yellow-200"
//                                     : "text-gray-700 bg-gray-100 hover:bg-gray-200"
//                                 }`}
//                                 onClick={() =>
//                                   handleFollowCase(caseItem, index)
//                                 }
//                                 disabled={followLoading === index}
//                                 data-testid={`follow-button-${caseIdentifier}`}
//                               >
//                                 {followLoading === index ? (
//                                   <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
//                                 ) : (
//                                   <>
//                                     <Star
//                                       size={14}
//                                       className={
//                                         isFollowed
//                                           ? "text-yellow-600 fill-yellow-500"
//                                           : ""
//                                       }
//                                     />
//                                     <span>
//                                       {isFollowed ? "Following" : "Follow"}
//                                     </span>
//                                   </>
//                                 )}
//                               </button>
//                             </td>
//                           )}
//                           <td className="px-4 py-3 text-sm text-gray-900">
//                             <button
//                               onClick={() => handleViewDetails(caseItem)}
//                               className="px-4 w-24 py-1 bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-sm transition-colors"
//                               disabled={
//                                 detailsLoading &&
//                                 selectedCase?.diaryNumber ===
//                                   caseItem.diaryNumber
//                               }
//                             >
//                               {detailsLoading &&
//                               selectedCase?.diaryNumber === caseItem.diaryNumber
//                                 ? "Loading..."
//                                 : "Details"}
//                             </button>
//                           </td>
//                         </tr>
//                       );
//                     })}
//                   </tbody>
//                 </table>
//               </div>
//             )}
//           </div>
//         </div>
//       )}

//       {/* Case Details Modal */}
//       {showCaseDetails && (
//         <CatCaseDetailsModal
//           caseDetails={caseDetails}
//           isLoading={detailsLoading}
//           error={detailsError}
//           onClose={closeDetailsModal}
//           onRetry={handleRetryDetails}
//           handleFollowCase={(caseData) => {
//             const { diaryNum, year } = extractDiaryInfo(caseData.diaryNumber);
//             const finalYear = caseData.caseYear || year;
//             const finalBenchId = caseData.benchId || benchId;
//             const mockCaseItem = {
//               diaryNumber: caseData.diaryNumber,
//               caseNumber: caseData.caseNumber,
//               applicantName: caseData.applicantName,
//               defendantName: caseData.defendantName,
//               partyName: name || "N/A",
//               type: type || "N/A",
//               benchId: finalBenchId,
//               caseYear: finalYear,
//             };
//             handleFollowCase(mockCaseItem, "modal");
//           }}
//           isCaseFollowed={(diaryNumber) => {
//             const { diaryNum, year } = extractDiaryInfo(diaryNumber);
//             const finalYear = caseDetails?.caseYear || year;
//             const finalBenchId = caseDetails?.benchId || benchId;
//             return isCaseFollowed(diaryNumber, finalYear, finalBenchId);
//           }}
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

// export default CatPartySearchPage;



import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { AlertTriangle, Search, Star, X } from "lucide-react";
import { useParams } from "react-router-dom";
import api from "@/utils/api";
import CatCaseDetailsModal from "./CatCaseDetailsModal";
import { catBenches } from "../utils/catBenches";

// Custom debounce function
const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Custom SearchableSelect component for benches dropdown
const SearchableSelect = ({ options, value, onChange, placeholder, label, id }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef(null);

  // Filter options based on search query
  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return options;
    return options.filter((option) =>
      option.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [options, searchQuery]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle selection
  const handleSelect = (optionValue) => {
    onChange({ target: { value: optionValue } });
    setIsOpen(false);
    setSearchQuery("");
  };

  // Get selected option name
  const selectedOption = options.find((option) => option.id === value);

  return (
    <div className="relative" ref={dropdownRef}>
      <label
        htmlFor={id}
        className="block text-xs font-medium text-gray-700 mb-1"
      >
        {label}
      </label>
      <div
        className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 cursor-pointer bg-white"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={value ? "text-gray-900" : "text-gray-500"}>
          {selectedOption ? selectedOption.name : placeholder}
        </span>
      </div>
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
          <div className="p-2 border-b border-gray-200">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search benches..."
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 pl-8"
                aria-label="Search benches"
              />
              <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                <Search size={16} className="text-gray-500" />
              </div>
            </div>
          </div>
          {filteredOptions.length === 0 ? (
            <div className="p-2 text-sm text-gray-500">No benches found</div>
          ) : (
            filteredOptions.map((option) => (
              <div
                key={option.id}
                className="px-3 py-2 text-sm text-gray-900 hover:bg-blue-50 cursor-pointer"
                onClick={() => handleSelect(option.id)}
              >
                {option.name}
              </div>
            ))
          )}
        </div>
      )}
      <p className="text-xs text-gray-500 mt-1">Example: DELHI</p>
    </div>
  );
};

const CatPartySearchPage = ({ court }) => {
  const { workspaceId } = useParams();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const role = user?.role || "Member";
  const isOwner = role === "Owner";
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [benchId, setBenchId] = useState("");
  const [originalSearchResults, setOriginalSearchResults] = useState(null);
  const [searchResults, setSearchResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tableSearchQuery, setTableSearchQuery] = useState("");
  const [followedCases, setFollowedCases] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [followLoading, setFollowLoading] = useState(null);
  const [toast, setToast] = useState(null);
  const [showCaseDetails, setShowCaseDetails] = useState(false);
  const [selectedCase, setSelectedCase] = useState(null);
  const [caseDetails, setCaseDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState(null);

  const courtName = "Central Administrative Tribunal (CAT)";

  const showToast = useCallback((message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  }, []);

  const fetchFollowedCases = useCallback(async () => {
    try {
      const response = await api.get(`/get-followed-cases-by-court`, {
        params: { court: courtName, workspaceId },
      });
      const data = response.data;
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
  }, [workspaceId, courtName, showToast]);

  useEffect(() => {
    fetchFollowedCases();
  }, [fetchFollowedCases]);

  useEffect(() => {
    if (showCart || showCaseDetails) {
      fetchFollowedCases();
    }
  }, [showCart, showCaseDetails, fetchFollowedCases]);

  const createCaseIdentifier = useCallback((diaryNumber, caseYear, benchId) => {
    return `${diaryNumber}-${caseYear}-${benchId}`;
  }, []);

  const extractDiaryInfo = useCallback((diaryNumber) => {
    if (diaryNumber && diaryNumber.includes("/")) {
      const parts = diaryNumber.split("/");
      return {
        diaryNum: parts[0].trim(),
        year: parts[1].trim(),
      };
    }
    return {
      diaryNum: diaryNumber,
      year: null,
    };
  }, []);

  const isCaseFollowed = useCallback(
    (diaryNumber, caseYear, benchIdToCheck) => {
      return followedCases.some((followedCase) => {
        const followedDiary = followedCase.diary_number;
        const followedYear = followedCase.case_year;
        const followedBench = followedCase.bench_id;
        const { diaryNum, year } = extractDiaryInfo(diaryNumber);
        const finalYear = caseYear || year;
        return (
          followedDiary === diaryNum &&
          followedYear === finalYear &&
          followedBench === benchIdToCheck
        );
      });
    },
    [followedCases, extractDiaryInfo]
  );

  const handleFollowCase = async (caseData, source) => {
    if (!isOwner) return;
    setFollowLoading(source);
    const { diaryNum, year } = extractDiaryInfo(caseData.diaryNumber);
    const finalYear = caseData.caseYear || year;
    const finalBenchId = caseData.benchId || benchId;
    const caseIdentifier = createCaseIdentifier(
      diaryNum,
      finalYear,
      finalBenchId
    );
    const isFollowed = isCaseFollowed(
      caseData.diaryNumber,
      finalYear,
      finalBenchId
    );

    // Optimistic update
    if (!isFollowed) {
      setFollowedCases((prevCases) => [
        ...prevCases,
        {
          diary_number: diaryNum,
          case_year: finalYear,
          bench_id: finalBenchId,
          case_data: {
            diaryNumber: caseData.diaryNumber || "N/A",
            caseNumber: caseData.caseNumber || "N/A",
            applicantName: caseData.applicantName || "N/A",
            defendantName: caseData.defendantName || "N/A",
            partyName: name || "N/A",
            type: type || "N/A",
            benchId: finalBenchId || "N/A",
          },
          court: courtName,
          workspace_id: workspaceId,
          followed_at: new Date().toISOString(),
        },
      ]);
    } else {
      setFollowedCases((prevCases) =>
        prevCases.filter((followedCase) => {
          const followedIdentifier = createCaseIdentifier(
            followedCase.diary_number,
            followedCase.case_year,
            followedCase.bench_id
          );
          return followedIdentifier !== caseIdentifier;
        })
      );
    }

    try {
      if (isFollowed) {
        const response = await api.delete("/unfollow-case", {
          data: {
            caseId: `${diaryNum}/${finalYear}`,
            court: courtName,
            benchId: finalBenchId,
          },
        });
        const data = response.data;
        if (!data.success) {
          throw new Error(data.error || "Failed to unfollow case");
        }
        showToast(`Case ${diaryNum}/${finalYear} unfollowed successfully`);
      } else {
        const payload = {
          caseData: {
            diaryNumber: caseData.diaryNumber || "N/A",
            caseNumber: caseData.caseNumber || "N/A",
            applicantName: caseData.applicantName || "N/A",
            defendantName: caseData.defendantName || "N/A",
            partyName: name || "N/A",
            type: type || "N/A",
            benchId: finalBenchId || "N/A",
          },
          court: courtName,
          workspace_id: workspaceId,
          diaryNumber: diaryNum,
          caseYear: finalYear,
          benchId: finalBenchId,
        };
        const response = await api.post("/follow-case", payload);
        const data = response.data;
        if (!data.success) {
          throw new Error(data.error || "Failed to follow case");
        }
        showToast(`Case ${diaryNum}/${finalYear} followed successfully`);
      }
      await fetchFollowedCases();
    } catch (err) {
      // Revert optimistic update
      if (!isFollowed) {
        setFollowedCases((prevCases) =>
          prevCases.filter((followedCase) => {
            const followedIdentifier = createCaseIdentifier(
              followedCase.diary_number,
              followedCase.case_year,
              followedCase.bench_id
            );
            return followedIdentifier !== caseIdentifier;
          })
        );
      } else {
        setFollowedCases((prevCases) => [
          ...prevCases,
          {
            diary_number: diaryNum,
            case_year: finalYear,
            bench_id: finalBenchId,
            case_data: {
              diaryNumber: caseData.diaryNumber || "N/A",
              caseNumber: caseData.caseNumber || "N/A",
              applicantName: caseData.applicantName || "N/A",
              defendantName: caseData.defendantName || "N/A",
              partyName: name || "N/A",
              type: type || "N/A",
              benchId: finalBenchId || "N/A",
            },
            court: courtName,
            workspace_id: workspaceId,
            followed_at: new Date().toISOString(),
          },
        ]);
      }
      showToast(`Error: ${err.message}`);
    } finally {
      setFollowLoading(null);
    }
  };

  const handleUnfollowCase = async (followedCase) => {
    if (!isOwner) return;
    const caseIdentifier = createCaseIdentifier(
      followedCase.diary_number,
      followedCase.case_year,
      followedCase.bench_id
    );

    // Optimistic update
    setFollowedCases((prevCases) =>
      prevCases.filter((caseData) => {
        const identifier = createCaseIdentifier(
          caseData.diary_number,
          caseData.case_year,
          caseData.bench_id
        );
        return identifier !== caseIdentifier;
      })
    );

    try {
      const response = await api.delete("/unfollow-case", {
        data: {
          caseId: `${followedCase.diary_number}/${followedCase.case_year}`,
          court: courtName,
          benchId: followedCase.bench_id,
        },
      });
      const data = response.data;
      if (!data.success) {
        throw new Error(data.error || "Failed to unfollow case");
      }
      await fetchFollowedCases();
      showToast(
        `Case ${followedCase.diary_number}/${followedCase.case_year} unfollowed successfully`
      );
    } catch (err) {
      // Revert optimistic update
      setFollowedCases((prevCases) => [...prevCases, followedCase]);
      showToast(`Error: ${err.message}`);
    }
  };

  const handleViewDetails = async (caseItem) => {
    setDetailsLoading(true);
    setDetailsError(null);
    setSelectedCase(caseItem);
    const { diaryNum, year } = extractDiaryInfo(caseItem.diaryNumber);
    const finalYear = caseItem.caseYear || year;
    const finalBenchId = caseItem.benchId || benchId;

    try {
      const { data } = await api.post(
        `${import.meta.env.VITE_RESEARCH_API}legal-infrahive/central-administrative-tribunal/diary-number/`,
        {
          benchId: finalBenchId,
          diaryNumber: diaryNum,
          caseYear: finalYear,
        },
        {
          headers: {
            Authorization: import.meta.env.VITE_RESEARCH_AUTHORIZATION_KEY,
          },
        }
      );

      const resultsArray = Array.isArray(data) ? data : [];
      await api.post(
        "/research-credit",
        {
          userId: JSON.parse(localStorage.getItem("user")).id,
          usage: resultsArray?.length === 0 ? 1 : resultsArray?.length,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      // Check for specific error response
      if (data?.error === "Failed to retrieve data: 500") {
        setCaseDetails({
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
        });
        setDetailsError("Failed to retrieve case details");
        setShowCaseDetails(true);
      } else if (data?.error) {
        throw new Error(data.error);
      } else {
        setCaseDetails(data);
        setShowCaseDetails(true);
      }
    } catch (err) {
      console.error("Details fetch error:", err);
      setDetailsError(err.message || "Failed to fetch case details");
      setCaseDetails({
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
      });
      setShowCaseDetails(true);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleRetryDetails = () => {
    if (selectedCase) {
      handleViewDetails(selectedCase);
    }
  };

  const closeDetailsModal = () => {
    setShowCaseDetails(false);
    setCaseDetails(null);
    setSelectedCase(null);
    setDetailsError(null);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!name) {
      setError("Please enter a party name");
      return;
    }

    setIsLoading(true);
    setError(null);
    setTableSearchQuery("");
    setSearchResults(null);
    setOriginalSearchResults(null);

    try {
      const { data } = await api.post(
        `${
          import.meta.env.VITE_RESEARCH_API
        }legal-infrahive/central-administrative-tribunal/search-party/`,
        {
          name,
          type,
          benchId,
        },
        {
          headers: {
            Authorization: import.meta.env.VITE_RESEARCH_AUTHORIZATION_KEY,
          },
        }
      );

      if (data?.error) throw new Error(data.error);

      const resultsArray = Array.isArray(data)
        ? data.map((item, index) => ({
            "#": item["#"] || `${index + 1}`,
            diaryNumber: item.diaryNumber || "N/A",
            caseNumber: item.caseNumber || "N/A",
            applicantName: item.applicantName || "N/A",
            defendantName: item.defendantName || "N/A",
            partyName: name || "N/A",
            type: type || "N/A",
            benchId: benchId || "N/A",
          }))
        : [];

      await api.post(
        "/research-credit",
        {
          userId: JSON.parse(localStorage.getItem("user")).id,
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
      const message =
        err.response?.status === 403
          ? "Access denied. Your session may have expired or you lack permission."
          : err.response?.data?.error || err.message;
      setError(message);
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

  const debouncedFilterResults = useCallback(
    debounce((query) => {
      if (!query.trim() || !Array.isArray(originalSearchResults)) {
        setSearchResults(originalSearchResults || []);
        return;
      }
      const filtered = originalSearchResults.filter(
        (caseItem) =>
          (caseItem.diaryNumber &&
            caseItem.diaryNumber.toLowerCase().includes(query)) ||
          (caseItem.caseNumber &&
            caseItem.caseNumber.toLowerCase().includes(query)) ||
          (caseItem.applicantName &&
            caseItem.applicantName.toLowerCase().includes(query)) ||
          (caseItem.defendantName &&
            caseItem.defendantName.toLowerCase().includes(query)) ||
          (caseItem.partyName &&
            caseItem.partyName.toLowerCase().includes(query)) ||
          (caseItem.type && caseItem.type.toLowerCase().includes(query)) ||
          (caseItem.benchId && caseItem.benchId.toLowerCase().includes(query))
      );
      setSearchResults(filtered);
    }, 300),
    [originalSearchResults]
  );

  const handleTableSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setTableSearchQuery(query);
    debouncedFilterResults(query);
  };

  const handleClearTableSearch = () => {
    setTableSearchQuery("");
    debouncedFilterResults.cancel();
    setSearchResults(originalSearchResults || []);
  };

  const handleClear = () => {
    setName("");
    setType("");
    setBenchId("");
    setSearchResults(null);
    setOriginalSearchResults(null);
    setTableSearchQuery("");
    debouncedFilterResults.cancel();
    setError(null);
  };

  const Cart = ({ followedCases, onUnfollow, onClose, fetchFollowedCases }) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [sortConfig, setSortConfig] = useState({
      key: "followed_at",
      direction: "desc",
    });
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const role = user?.role || "Member";
    const isOwner = role === "Owner";

    useEffect(() => {
      fetchFollowedCases();
    }, [fetchFollowedCases]);

    const filteredCases = useMemo(() => {
      return followedCases.filter((caseData) => {
        const caseJson = caseData.case_data || {};
        const searchIn = [
          caseJson.diaryNumber,
          caseJson.caseNumber,
          caseJson.applicantName,
          caseJson.defendantName,
          caseJson.partyName,
          caseJson.type,
          caseJson.benchId,
          new Date(caseData.followed_at).toLocaleDateString(),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return searchIn.includes(searchQuery.toLowerCase());
      });
    }, [followedCases, searchQuery]);

    const sortedCases = useMemo(() => {
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
                className="w-64 border border-gray-300 rounded-md pl-10 pr-8 p-2 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                aria-label="Search followed cases"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={16} className="text-gray-500" />
              </div>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                  aria-label="Clear search"
                >
                  <X size={16} />
                </button>
              )}
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
                        onClick={() => requestSort("diaryNumber")}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200"
                      >
                        Diary Number {getSortIndicator("diaryNumber")}
                      </th>
                      <th
                        onClick={() => requestSort("caseNumber")}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200"
                      >
                        Case Number {getSortIndicator("caseNumber")}
                      </th>
                      <th
                        onClick={() => requestSort("applicantName")}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200"
                      >
                        Applicant Name {getSortIndicator("applicantName")}
                      </th>
                      <th
                        onClick={() => requestSort("defendantName")}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200"
                      >
                        Defendant Name {getSortIndicator("defendantName")}
                      </th>
                      <th
                        onClick={() => requestSort("partyName")}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200"
                      >
                        Party Name {getSortIndicator("partyName")}
                      </th>
                      <th
                        onClick={() => requestSort("type")}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200"
                      >
                        Type {getSortIndicator("type")}
                      </th>
                      <th
                        onClick={() => requestSort("benchId")}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200"
                      >
                        Bench ID {getSortIndicator("benchId")}
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
                    {sortedCases.map((caseData, index) => {
                      const caseIdentifier = createCaseIdentifier(
                        caseData.diary_number,
                        caseData.case_year,
                        caseData.bench_id
                      );
                      return (
                        <tr
                          key={`${caseData.diary_number}-${caseData.case_year}-${caseData.bench_id}-${index}`}
                          className="hover:bg-gray-50"
                        >
                          <td className="px-6 py-4 text-sm">
                            {caseData.case_data?.diaryNumber ||
                              `${caseData.diary_number}/${caseData.case_year}` ||
                              "N/A"}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            {caseData.case_data?.caseNumber || "N/A"}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            {caseData.case_data?.applicantName || "N/A"}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            {caseData.case_data?.defendantName || "N/A"}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            {caseData.case_data?.partyName || "N/A"}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            {caseData.case_data?.type || "N/A"}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            {caseData.case_data?.benchId ||
                              caseData.bench_id ||
                              "N/A"}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            {new Date(
                              caseData.followed_at
                            ).toLocaleDateString()}
                          </td>
                          {isOwner && (
                            <td className="px-6 py-4 text-sm">
                              <button
                                onClick={() => onUnfollow(caseData)}
                                className="bg-red-100 text-red-700 hover:bg-red-200 px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1"
                                data-testid={`unfollow-button-${caseIdentifier}`}
                              >
                                <span>Unfollow</span>
                                <X size={12} />
                              </button>
                            </td>
                          )}
                        </tr>
                      );
                    })}
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
            Search {courtName} by Party Name
          </h2>
          <p className="mt-1 text-xs text-gray-600">
            Enter the party name and other details to find relevant cases
          </p>
        </div>
        <div className="p-4">
          <form onSubmit={handleSearch} className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                  aria-required="true"
                  aria-label="Party Name"
                />
                <p className="text-xs text-gray-500 mt-1">Example: Rakesh</p>
              </div>
              <div>
                <label
                  htmlFor="type"
                  className="block text-xs font-medium text-gray-700 mb-1"
                >
                  Case Type
                </label>
                <select
                  id="type"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  aria-label="Case Type"
                >
                  <option value="">Select case type</option>
                  <option value="BOTH">BOTH</option>
                  <option value="PENDING">PENDING</option>
                  <option value="DISPOSED">DISPOSED</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">Example: BOTH</p>
              </div>
              <SearchableSelect
                options={catBenches}
                value={benchId}
                onChange={(e) => setBenchId(e.target.value)}
                placeholder="Select bench"
                label="Bench"
                id="benchId"
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleClear}
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
              <AlertTriangle className="h-4 w-4 mr-2 flex-shrink-0 text-red-600" />
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
              <h3 className="text-md font-medium text-gray-800">
                Search Results
              </h3>
              <p className="text-xs text-gray-600">
                Found {Array.isArray(searchResults) ? searchResults.length : 0}{" "}
                cases
              </p>
            </div>
            <div className="relative w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="w-4 h-4 text-gray-500" />
              </div>
              <input
                type="text"
                className="block w-full p-2 pl-10 pr-8 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Filter cases by diary number, case number, etc."
                value={tableSearchQuery}
                onChange={handleTableSearch}
                aria-label="Filter search results"
              />
              {/* {tableSearchQuery && (
                <button
                  onClick={handleClearTableSearch}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                  aria-label="Clear search filter"
                >
                  <X size={16} />
                </button>
              )} */}
            </div>
          </div>
          <div className="p-4">
            {!searchResults || searchResults.length === 0 ? (
              <div className="p-3 bg-gray-50 rounded-md border border-gray-200">
                <table className="min-w-full">
                  <tbody>
                    <tr>
                      <td
                        colSpan={isOwner ? 10 : 9}
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
                <table className="min-w-full divide-y divide-gray-200 shadow-md shadow-slate-600">
                  <thead className="bg-gray-100">
                    <tr>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        #
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Diary Number
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Case Number
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Applicant Name
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Defendant Name
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Party Name
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Type
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Bench ID
                      </th>
                      {isOwner && (
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          data-testid="follow-column-header"
                        >
                          Follow
                        </th>
                      )}
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {searchResults.map((caseItem, index) => {
                      const { diaryNum, year } = extractDiaryInfo(
                        caseItem.diaryNumber
                      );
                      const finalYear = caseItem.caseYear || year;
                      const finalBenchId = caseItem.benchId || benchId;
                      const isFollowed = isCaseFollowed(
                        caseItem.diaryNumber,
                        finalYear,
                        finalBenchId
                      );
                      const caseIdentifier = createCaseIdentifier(
                        diaryNum,
                        finalYear,
                        finalBenchId
                      );

                      return (
                        <tr
                          key={`${caseItem.diaryNumber}-${index}`}
                          className={`${
                            index % 2 === 0 ? "bg-white" : "bg-gray-50"
                          } hover:bg-blue-50 transition-colors duration-150`}
                        >
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {caseItem["#"]}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {caseItem.diaryNumber}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {caseItem.caseNumber}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {caseItem.applicantName}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {caseItem.defendantName}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {caseItem.partyName}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {caseItem.type}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {caseItem.benchId}
                          </td>
                          {isOwner && (
                            <td className="px-4 py-3 text-sm text-gray-900">
                              <button
                                className={`flex items-center justify-center space-x-1 px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                                  isFollowed
                                    ? "text-yellow-700 bg-yellow-100 hover:bg-yellow-200"
                                    : "text-gray-700 bg-gray-100 hover:bg-gray-200"
                                }`}
                                onClick={() =>
                                  handleFollowCase(caseItem, index)
                                }
                                disabled={followLoading === index}
                                data-testid={`follow-button-${caseIdentifier}`}
                              >
                                {followLoading === index ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                                ) : (
                                  <>
                                    <Star
                                      size={14}
                                      className={
                                        isFollowed
                                          ? "text-yellow-600 fill-yellow-500"
                                          : ""
                                      }
                                    />
                                    <span>
                                      {isFollowed ? "Following" : "Follow"}
                                    </span>
                                  </>
                                )}
                              </button>
                            </td>
                          )}
                          <td className="px-4 py-3 text-sm text-gray-900">
                            <button
                              onClick={() => handleViewDetails(caseItem)}
                              className="px-4 w-24 py-1 bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-sm transition-colors flex items-center justify-center"
                              disabled={
                                detailsLoading &&
                                selectedCase?.diaryNumber ===
                                  caseItem.diaryNumber
                              }
                            >
                              {detailsLoading &&
                              selectedCase?.diaryNumber === caseItem.diaryNumber ? (
                                <span className="flex items-center">
                                  <svg
                                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-800"
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
                                  Loading
                                </span>
                              ) : (
                                "Details"
                              )}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Case Details Modal */}
      {showCaseDetails && (
        <CatCaseDetailsModal
          caseDetails={caseDetails}
          isLoading={detailsLoading}
          error={detailsError}
          onClose={closeDetailsModal}
          onRetry={handleRetryDetails}
          handleFollowCase={(caseData) => {
            const { diaryNum, year } = extractDiaryInfo(caseData.diaryNumber);
            const finalYear = caseData.caseYear || year;
            const finalBenchId = caseData.benchId || benchId;
            const mockCaseItem = {
              diaryNumber: caseData.diaryNumber,
              caseNumber: caseData.caseNumber,
              applicantName: caseData.applicantName,
              defendantName: caseData.defendantName,
              partyName: name || "N/A",
              type: type || "N/A",
              benchId: finalBenchId,
              caseYear: finalYear,
            };
            handleFollowCase(mockCaseItem, "modal");
          }}
          isCaseFollowed={(diaryNumber) => {
            const { diaryNum, year } = extractDiaryInfo(diaryNumber);
            const finalYear = caseDetails?.caseYear || year;
            const finalBenchId = caseDetails?.benchId || benchId;
            return isCaseFollowed(diaryNumber, finalYear, finalBenchId);
          }}
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

export default CatPartySearchPage;