import React, { useState, useEffect, useCallback, useMemo } from "react";
import { AlertTriangle, Star, X, Search } from "lucide-react";
import DistrictCaseDetailsModal from "./DistrictCaseDetailsModal";
import { useParams } from "react-router-dom";
import api from "@/utils/api";

// Custom debounce function
const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

const AdvocateNumberSearchPage = ({ court }) => {
  const { workspaceId } = useParams();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const role = user?.role || "Member";
  const isOwner = role === "Owner";
  const [advocateState, setAdvocateState] = useState("");
  const [advocateNumber, setAdvocateNumber] = useState("");
  const [advocateYear, setAdvocateYear] = useState("");
  const [stage, setStage] = useState("");
  const [complexId, setComplexId] = useState("");
  const [originalSearchResults, setOriginalSearchResults] = useState(null);
  const [searchResults, setSearchResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tableSearchQuery, setTableSearchQuery] = useState("");
  const [showCaseDetails, setShowCaseDetails] = useState(false);
  const [selectedCnr, setSelectedCnr] = useState(null);
  const [caseDetails, setCaseDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState(null);
  const [followedCases, setFollowedCases] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [followLoading, setFollowLoading] = useState(null);
  const [toast, setToast] = useState(null);

  const courtName = court.charAt(0).toUpperCase() + court.slice(1) + " Court";

  const currentYear = new Date().getFullYear();
  const yearOptions = [];
  for (let y = currentYear; y >= 1950; y--) {
    yearOptions.push(y);
  }

  const stateOptions = [
    { value: "AN", label: "Andaman and Nicobar Islands" },
    { value: "AP", label: "Andhra Pradesh" },
    { value: "AR", label: "Arunachal Pradesh" },
    { value: "AS", label: "Assam" },
    { value: "BR", label: "Bihar" },
    { value: "CG", label: "Chhattisgarh" },
    { value: "CH", label: "Chandigarh" },
    { value: "DL", label: "Delhi" },
    { value: "DN", label: "Dadra and Nagar Haveli" },
    { value: "GA", label: "Goa" },
    { value: "GJ", label: "Gujarat" },
    { value: "HP", label: "Himachal Pradesh" },
    { value: "HR", label: "Haryana" },
    { value: "JH", label: "Jharkhand" },
    { value: "JK", label: "Jammu and Kashmir" },
    { value: "KA", label: "Karnataka" },
    { value: "KL", label: "Kerala" },
    { value: "LD", label: "Lakshadweep" },
    { value: "MH", label: "Maharashtra" },
    { value: "ML", label: "Meghalaya" },
    { value: "MN", label: "Manipur" },
    { value: "MP", label: "Madhya Pradesh" },
    { value: "MZ", label: "Mizoram" },
    { value: "NL", label: "Nagaland" },
    { value: "OR", label: "Odisha" },
    { value: "PB", label: "Punjab" },
    { value: "PY", label: "Puducherry" },
    { value: "RJ", label: "Rajasthan" },
    { value: "SK", label: "Sikkim" },
    { value: "TN", label: "Tamil Nadu" },
    { value: "TR", label: "Tripura" },
    { value: "TS", label: "Telangana" },
    { value: "UK", label: "Uttarakhand" },
    { value: "UP", label: "Uttar Pradesh" },
    { value: "WB", label: "West Bengal" },
    { value: "D", label: "Delhi (Old Code)" },
  ];

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

  const isCaseFollowed = useCallback(
    (cnr) => {
      return followedCases.some((followedCase) => followedCase.cnr === cnr);
    },
    [followedCases]
  );

  const handleFollowCase = async (caseData, courtNameFromResponse, source) => {
    if (!isOwner) return;
    setFollowLoading(source);
    const cnr = caseData.cnr;

    // Optimistic update
    const isFollowed = isCaseFollowed(cnr);
    if (!isFollowed) {
      setFollowedCases((prevCases) => [
        ...prevCases,
        {
          cnr,
          case_data: {
            cnr: caseData.cnr || "N/A",
            caseNumber: caseData.caseNumber || "N/A",
            title: caseData.title || "N/A",
            type: caseData.type || "N/A",
            decisionDate: caseData.dateOfDecision || null,
            name: courtNameFromResponse || courtName,
            advocateName: caseData.advocateName || courtNameFromResponse || "N/A",
            filing: caseData.filing || null,
            advocateReg: `${advocateState}/${advocateNumber}/${advocateYear}` || "N/A",
          },
          court: courtName,
          workspace_id: workspaceId,
          followed_at: new Date().toISOString(),
        },
      ]);
    } else {
      setFollowedCases((prevCases) =>
        prevCases.filter((followedCase) => followedCase.cnr !== cnr)
      );
    }

    try {
      if (isFollowed) {
        const response = await api.delete("/unfollow-case", {
          data: { caseId: cnr },
        });
        const data = response.data;
        if (!data.success) {
          throw new Error(data.error || "Failed to unfollow case");
        }
        showToast(`Case ${cnr} unfollowed successfully`);
      } else {
        const payload = {
          caseData: {
            cnr: caseData.cnr || "N/A",
            caseNumber: caseData.caseNumber || "N/A",
            title: caseData.title || "N/A",
            type: caseData.type || "N/A",
            decisionDate: caseData.dateOfDecision || null,
            name: courtNameFromResponse || courtName,
            advocateName: caseData.advocateName || courtNameFromResponse || "N/A",
            filing: caseData.filing || null,
            advocateReg: `${advocateState}/${advocateNumber}/${advocateYear}` || "N/A",
          },
          court: courtName,
          workspace_id: workspaceId,
        };
        const response = await api.post("/follow-case", payload);
        const data = response.data;
        if (!data.success) {
          throw new Error(data.error || "Failed to follow case");
        }
        showToast(`Case ${cnr} followed successfully`);
      }
      await fetchFollowedCases();
    } catch (err) {
      // Revert optimistic update
      if (!isFollowed) {
        setFollowedCases((prevCases) =>
          prevCases.filter((followedCase) => followedCase.cnr !== cnr)
        );
      } else {
        setFollowedCases((prevCases) => [
          ...prevCases,
          {
            cnr,
            case_data: {
              cnr: caseData.cnr || "N/A",
              caseNumber: caseData.caseNumber || "N/A",
              title: caseData.title || "N/A",
              type: caseData.type || "N/A",
              decisionDate: caseData.dateOfDecision || null,
              name: courtNameFromResponse || courtName,
              advocateName: caseData.advocateName || courtNameFromResponse || "N/A",
              filing: caseData.filing || null,
              advocateReg: `${advocateState}/${advocateNumber}/${advocateYear}` || "N/A",
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

  const handleUnfollowCase = async (cnr) => {
    if (!isOwner) return;
    // Optimistic update
    const caseToUnfollow = followedCases.find((followedCase) => followedCase.cnr === cnr);
    setFollowedCases((prevCases) =>
      prevCases.filter((followedCase) => followedCase.cnr !== cnr)
    );

    try {
      const response = await api.delete("/unfollow-case", {
        data: { caseId: cnr },
      });
      const data = response.data;
      if (!data.success) {
        throw new Error(data.error || "Failed to unfollow case");
      }
      await fetchFollowedCases();
      showToast(`Case ${cnr} unfollowed successfully`);
    } catch (err) {
      // Revert optimistic update
      setFollowedCases((prevCases) => [
        ...prevCases,
        caseToUnfollow || {
          cnr,
          case_data: { cnr },
          court: courtName,
          workspace_id: workspaceId,
          followed_at: new Date().toISOString(),
        },
      ]);
      showToast(`Error: ${err.message}`);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();

    if (!advocateState || !advocateNumber || !advocateYear) {
      setError("Please fill in all required advocate registration details");
      return;
    }

    setIsLoading(true);
    setError(null);
    setTableSearchQuery("");
    setSearchResults(null);
    setOriginalSearchResults(null);

    try {
      const { data } = await api.post(
        `${import.meta.env.VITE_RESEARCH_API}/legal-infrahive/district-court/search/advocate-number/`,
        {
          advocate: {
            state: advocateState,
            number: advocateNumber,
            year: advocateYear,
          },
          stage: stage || "BOTH",
          complexId,
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
      setSearchResults(resultsArray);
    } catch (err) {
      setError(err.message || "An error occurred during search");
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

  // Debounced function for filtering search results
  const debouncedFilterResults = useCallback(
    debounce((query) => {
      if (!query.trim() || !Array.isArray(originalSearchResults)) {
        setSearchResults(originalSearchResults || []);
        return;
      }
      const filtered = originalSearchResults.filter(
        (caseItem) =>
          (caseItem.cnr && caseItem.cnr.toLowerCase().includes(query)) ||
          (caseItem.title && caseItem.title.toLowerCase().includes(query)) ||
          (caseItem.caseNumber &&
            caseItem.caseNumber.toLowerCase().includes(query)) ||
          (caseItem.type && caseItem.type.toLowerCase().includes(query)) ||
          (caseItem.name && caseItem.name.toLowerCase().includes(query)) ||
          (caseItem.advocateName &&
            caseItem.advocateName.toLowerCase().includes(query)) ||
          (caseItem.filing &&
            `${caseItem.filing.number}/${caseItem.filing.year}`
              .toLowerCase()
              .includes(query)) ||
          (caseItem.advocateReg &&
            caseItem.advocateReg.toLowerCase().includes(query))
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

  const handleViewDetails = async (cnr) => {
    setDetailsLoading(true);
    setDetailsError(null);
    setSelectedCnr(cnr);

    try {
      const { data } = await api.post(
        `${import.meta.env.VITE_RESEARCH_API}legal-infrahive/district-court/case/`,
        { cnr },
        {
          headers: {
            Authorization: import.meta.env.VITE_RESEARCH_AUTHORIZATION_KEY,
          },
        }
      );

      if (data?.error) throw new Error(data.error);

      setCaseDetails(data);
      setShowCaseDetails(true);
    } catch (err) {
      setDetailsError(err.message || "Failed to fetch case details");
      console.error("Details fetch error:", err);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleRetryDetails = () => {
    if (selectedCnr) {
      handleViewDetails(selectedCnr);
    }
  };

  const handleClear = () => {
    setAdvocateState("");
    setAdvocateNumber("");
    setAdvocateYear("");
    setStage("");
    setComplexId("");
    setSearchResults(null);
    setOriginalSearchResults(null);
    setTableSearchQuery("");
    debouncedFilterResults.cancel();
    setError(null);
  };

  const closeDetailsModal = () => {
    setShowCaseDetails(false);
    setCaseDetails(null);
    setSelectedCnr(null);
    setDetailsError(null);
  };

  const formatDate = (dateString) => {
    if (!dateString || dateString.includes("1970-01-01"))
      return "Not Available";
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
          caseJson.title,
          caseJson.caseNumber,
          caseJson.cnr,
          caseJson.advocateName,
          caseJson.advocateReg,
          caseJson.type,
          caseJson.decisionDate
            ? new Date(caseJson.decisionDate).toLocaleDateString()
            : "",
          caseJson.filing
            ? `${caseJson.filing.number}/${caseJson.filing.year}`
            : "",
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
        } else if (sortConfig.key === "filing") {
          aValue =
            a.case_data?.filing?.number && a.case_data?.filing?.year
              ? `${a.case_data.filing.number}/${a.case_data.filing.year}`
              : "";
          bValue =
            b.case_data?.filing?.number && b.case_data?.filing?.year
              ? `${b.case_data.filing.number}/${b.case_data.filing.year}`
              : "";
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
                        onClick={() => requestSort("title")}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200"
                      >
                        Case Title {getSortIndicator("title")}
                      </th>
                      <th
                        onClick={() => requestSort("caseNumber")}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200"
                      >
                        Case Number {getSortIndicator("caseNumber")}
                      </th>
                      <th
                        onClick={() => requestSort("cnr")}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200"
                      >
                        CNR {getSortIndicator("cnr")}
                      </th>
                      <th
                        onClick={() => requestSort("advocateName")}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200"
                      >
                        Advocate Name {getSortIndicator("advocateName")}
                      </th>
                      <th
                        onClick={() => requestSort("advocateReg")}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200"
                      >
                        Advocate Reg {getSortIndicator("advocateReg")}
                      </th>
                      <th
                        onClick={() => requestSort("type")}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200"
                      >
                        Type {getSortIndicator("type")}
                      </th>
                      <th
                        onClick={() => requestSort("filing")}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200"
                      >
                        Filing No/Year {getSortIndicator("filing")}
                      </th>
                      <th
                        onClick={() => requestSort("decisionDate")}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200"
                      >
                        Decision Date {getSortIndicator("decisionDate")}
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
                      <tr key={caseData.cnr || index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm">
                          {caseData.case_data?.title || "N/A"}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {caseData.case_data?.caseNumber || "N/A"}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {caseData.cnr || "N/A"}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {caseData.case_data?.advocateName || "N/A"}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {caseData.case_data?.advocateReg || "N/A"}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {caseData.case_data?.type || "N/A"}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {caseData.case_data?.filing?.number &&
                          caseData.case_data?.filing?.year
                            ? `${caseData.case_data.filing.number}/${caseData.case_data.filing.year}`
                            : "N/A"}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {caseData.case_data?.decisionDate &&
                          caseData.case_data.decisionDate !==
                            "1970-01-01T00:00:00.000Z"
                            ? new Date(
                                caseData.case_data.decisionDate
                              ).toLocaleDateString()
                            : "N/A"}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {new Date(caseData.followed_at).toLocaleDateString()}
                        </td>
                        {isOwner && (
                          <td className="px-6 py-4 text-sm">
                            <button
                              onClick={() => onUnfollow(caseData.cnr)}
                              className="bg-red-100 text-red-700 hover:bg-red-200 px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1"
                              data-testid={`unfollow-button-${caseData.cnr}`}
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
            Search {courtName} by Advocate Registration
          </h2>
          <p className="mt-1 text-xs text-gray-600">
            Enter the advocate registration details to find relevant cases
          </p>
        </div>
        <div className="p-4">
          <form onSubmit={handleSearch} className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="advocateState"
                  className="block text-xs font-medium text-gray-700 mb-1"
                >
                  Advocate State *
                </label>
                <select
                  id="advocateState"
                  value={advocateState}
                  onChange={(e) => setAdvocateState(e.target.value)}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                  aria-required="true"
                  aria-label="Advocate State"
                >
                  <option value="">Select state</option>
                  {stateOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label} ({option.value})
                    </option>
                  ))}
                </select>
                <div className="text-xs text-gray-500 mt-1">Example: D</div>
              </div>
              <div>
                <label
                  htmlFor="advocateNumber"
                  className="block text-xs font-medium text-gray-700 mb-1"
                >
                  Registration Number *
                </label>
                <input
                  id="advocateNumber"
                  type="text"
                  value={advocateNumber}
                  onChange={(e) => setAdvocateNumber(e.target.value)}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter registration number"
                  required
                  aria-required="true"
                  aria-label="Registration Number"
                />
                <div className="text-xs text-gray-500 mt-1">Example: 1709</div>
              </div>
              <div>
                <label
                  htmlFor="advocateYear"
                  className="block text-xs font-medium text-gray-700 mb-1"
                >
                  Registration Year *
                </label>
                <select
                  id="advocateYear"
                  value={advocateYear}
                  onChange={(e) => setAdvocateYear(e.target.value)}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                  aria-required="true"
                  aria-label="Registration Year"
                >
                  <option value="">Select year</option>
                  {yearOptions.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
                <div className="text-xs text-gray-500 mt-1">Example: 2014</div>
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
                  aria-label="Case Stage"
                >
                  <option value="">Select case stage</option>
                  <option value="BOTH">BOTH</option>
                  <option value="PENDING">PENDING</option>
                  <option value="DISPOSED">DISPOSED</option>
                </select>
                <div className="text-xs text-gray-500 mt-1">Example: BOTH</div>
              </div>
              <div>
                <label
                  htmlFor="complexId"
                  className="block text-xs font-medium text-gray-700 mb-1"
                >
                  Complex ID
                </label>
                <input
                  id="complexId"
                  type="text"
                  value={complexId}
                  onChange={(e) => setComplexId(e.target.value)}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter complex ID"
                  aria-label="Complex ID"
                />
                <div className="text-xs text-gray-500 mt-1">
                  Example: 5f5f010a
                </div>
              </div>
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
                    This could be due to an expired session or authentication issue.
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
              <h3 className="text-md font-medium text-gray-800">Search Results</h3>
              <p className="text-xs text-gray-600">
                Found {Array.isArray(searchResults) ? searchResults.length : 0} cases
              </p>
            </div>
            <div className="relative w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="w-4 h-4 text-gray-500" />
              </div>
              <input
                type="text"
                className="block w-full p-2 pl-10 pr-8 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Filter cases by CNR, title, case number, etc."
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
                        {!originalSearchResults || originalSearchResults.length === 0
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
                        Court
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        CNR
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Case Title
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
                        Filing No/Year
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
                        Advocate Name
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Advocate Reg
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Decision Date
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
                  {/* <tbody className="bg-white divide-y divide-gray-200">
                    {searchResults.map((caseItem, index) => (
                      <tr
                        key={caseItem.id}
                        className={`${
                          index % 2 === 0 ? "bg-white" : "bg-gray-50"
                        } hover:bg-blue-50 transition-colors duration-150`}
                      >
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {caseItem.name || courtName}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {caseItem.cnr || "N/A"}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {caseItem.title || "N/A"}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {caseItem.caseNumber || "N/A"}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {caseItem.filing?.number && caseItem.filing?.year
                            ? `${caseItem.filing.number}/${caseItem.filing.year}`
                            : "N/A"}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold text-blue-800">
                            {caseItem.type || "N/A"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                          {caseItem.advocateName || "N/A"}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {caseItem.advocateReg || "N/A"}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {formatDate(caseItem.decisionDate)}
                        </td>
                        {isOwner && (
                          <td className="px-4 py-3 text-sm text-gray-900">
                            <button
                              className={`flex items-center justify-center space-x-1 px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                                isCaseFollowed(caseItem.cnr)
                                  ? "text-yellow-700 bg-yellow-100 hover:bg-yellow-200"
                                  : "text-gray-700 bg-gray-100 hover:bg-gray-200"
                              }`}
                              onClick={() =>
                                handleFollowCase(caseItem, caseItem.name, index)
                              }
                              disabled={followLoading === index}
                              data-testid={`follow-button-${caseItem.cnr}`}
                            >
                              {followLoading === index ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                              ) : (
                                <>
                                  <Star
                                    size={14}
                                    className={
                                      isCaseFollowed(caseItem.cnr)
                                        ? "text-yellow-600 fill-yellow-500"
                                        : ""
                                    }
                                  />
                                  <span>
                                    {isCaseFollowed(caseItem.cnr)
                                      ? "Following"
                                      : "Follow"}
                                  </span>
                                </>
                              )}
                            </button>
                          </td>
                        )}
                        <td className="px-4 py-3 text-sm text-gray-900">
                          <button
                            onClick={() => handleViewDetails(caseItem.cnr)}
                            disabled={
                              detailsLoading && selectedCnr === caseItem.cnr
                            }
                            className="flex items-center px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-150"
                          >
                            {detailsLoading && selectedCnr === caseItem.cnr ? (
                              <span className="flex items-center space-x-1">
                                <svg
                                  className="animate-spin h-3 w-3 mr-1"
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
                  </tbody> */}
                    
                    <tbody className="bg-white divide-y divide-gray-200">
  {searchResults.flatMap((result, resultIndex) =>
    result.cases.map((caseItem, index) => (
      <tr
        key={`${result.name}-${caseItem.cnr}-${index}`} // Unique key using court name, cnr, and index
        className={`${
          (resultIndex * result.cases.length + index) % 2 === 0
            ? "bg-white"
            : "bg-gray-50"
        } hover:bg-blue-50 transition-colors duration-150`}
      >
        <td className="px-4 py-3 text-sm text-gray-900">
          {result.name || courtName}
        </td>
        <td className="px-4 py-3 text-sm text-gray-900">
          {caseItem.cnr || "N/A"}
        </td>
        <td className="px-4 py-3 text-sm text-gray-900">
          {caseItem.title || "N/A"}
        </td>
        <td className="px-4 py-3 text-sm text-gray-900">
          {caseItem.caseNumber || "N/A"}
        </td>
        <td className="px-4 py-3 text-sm text-gray-900">
          {caseItem.filing?.number && caseItem.filing?.year
            ? `${caseItem.filing.number}/${caseItem.filing.year}`
            : "N/A"}
        </td>
        <td className="px-4 py-3 text-sm">
          <span className="px-2 inline-flex text-xs leading-5 font-semibold text-blue-800">
            {caseItem.type || "N/A"}
          </span>
        </td>
        <td className="px-4 py-3 text-sm text-gray-900 font-medium">
          {caseItem.advocateName || result.advocateName || "N/A"}
        </td>
        <td className="px-4 py-3 text-sm text-gray-900">
          {`${advocateState}/${advocateNumber}/${advocateYear}` || "N/A"}
        </td>
        <td className="px-4 py-3 text-sm text-gray-900">
          {formatDate(caseItem.dateOfDecision)}
        </td>
        {isOwner && (
          <td className="px-4 py-3 text-sm text-gray-900">
            <button
              className={`flex items-center justify-center space-x-1 px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                isCaseFollowed(caseItem.cnr)
                  ? "text-yellow-700 bg-yellow-100 hover:bg-yellow-200"
                  : "text-gray-700 bg-gray-100 hover:bg-gray-200"
              }`}
              onClick={() =>
                handleFollowCase(caseItem, result.name, resultIndex * result.cases.length + index)
              }
              disabled={followLoading === (resultIndex * result.cases.length + index)}
              data-testid={`follow-button-${caseItem.cnr}`}
            >
              {followLoading === (resultIndex * result.cases.length + index) ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
              ) : (
                <>
                  <Star
                    size={14}
                    className={
                      isCaseFollowed(caseItem.cnr)
                        ? "text-yellow-600 fill-yellow-500"
                        : ""
                    }
                  />
                  <span>
                    {isCaseFollowed(caseItem.cnr) ? "Following" : "Follow"}
                  </span>
                </>
              )}
            </button>
          </td>
        )}
        <td className="px-4 py-3 text-sm text-gray-900">
          <button
            onClick={() => handleViewDetails(caseItem.cnr)}
            disabled={detailsLoading && selectedCnr === caseItem.cnr}
            className="flex items-center px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-150"
          >
            {detailsLoading && selectedCnr === caseItem.cnr ? (
              <span className="flex items-center space-x-1">
                <svg
                  className="animate-spin h-3 w-3 mr-1"
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
    ))
  )}
</tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Case Details Modal */}
      {showCaseDetails && (
        <DistrictCaseDetailsModal
          caseDetails={caseDetails}
          isLoading={detailsLoading}
          error={detailsError}
          onClose={closeDetailsModal}
          onRetry={handleRetryDetails}
          handleFollowCase={(caseData) =>
            handleFollowCase(caseData, caseData.name, "modal")
          }
          isCaseFollowed={isCaseFollowed}
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

export default AdvocateNumberSearchPage;