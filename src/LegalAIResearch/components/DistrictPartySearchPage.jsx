import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import {
  AlertTriangle,
  Star,
  ShoppingCart,
  X,
  Search,
  ChevronDown,
} from "lucide-react";
import DistrictCaseDetailsModal from "./DistrictCaseDetailsModal";
import api from "@/utils/api";
import { useParams } from "react-router-dom";
import DOMPurify from "dompurify"; // For sanitizing HTML
import "./DistrictPartySearchPage.css"; // Import CSS for styling
import { jwtDecode } from "jwt-decode";

// Cart Component (unchanged)
const Cart = ({ followedCases, onUnfollow, onClose, fetchFollowedCases }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "followed_at",
    direction: "desc",
  });
  const token = localStorage.getItem("token");
  const { sub, role, email } = jwtDecode(token);
  const isOwner = role === "Owner";

  useEffect(() => {
    fetchFollowedCases();
  }, [fetchFollowedCases]);

  const filteredCases = followedCases.filter((caseData) => {
    const caseJson = caseData.case_data || {};
    const searchIn = [
      caseJson.title,
      caseJson.caseNumber,
      caseJson.cnr,
      caseJson.name,
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

  const sortedCases = [...filteredCases].sort((a, b) => {
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
                      onClick={() => requestSort("name")}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200"
                    >
                      Court Name {getSortIndicator("name")}
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
                    <tr
                      key={caseData.cnr || index}
                      className="hover:bg-gray-50"
                    >
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
                        {caseData.case_data?.name || "N/A"}
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

// New SearchableDropdown Component
const SearchableDropdown = ({
  id,
  label,
  placeholder,
  options,
  value,
  onChange,
  helperText,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(value || "");
  const dropdownRef = useRef(null);

  // Filter options based on search term
  const filteredOptions = useMemo(() => {
    if (!searchTerm) return options;
    return options.filter((option) =>
      option.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [options, searchTerm]);

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
  const handleSelect = (selectedValue) => {
    setSearchTerm(selectedValue);
    onChange({ target: { value: selectedValue } }); // Simulate event for parent
    setIsOpen(false);
  };

  // Sync searchTerm with value (in case value changes externally)
  useEffect(() => {
    setSearchTerm(value);
  }, [value]);

  return (
    <div ref={dropdownRef}>
      <label
        htmlFor={id}
        className="block text-xs font-medium text-gray-700 mb-1"
      >
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setIsOpen(true)}
          className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 pr-8"
          placeholder={placeholder}
        />
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <ChevronDown size={16} className="text-gray-500" />
        </div>
        {isOpen && (
          <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto mt-1">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <div
                  key={option}
                  className="px-3 py-2 text-sm cursor-pointer hover:bg-blue-100"
                  onClick={() => handleSelect(option)}
                >
                  {option}
                </div>
              ))
            ) : (
              <div className="px-3 py-2 text-sm text-gray-500">
                No matching districts
              </div>
            )}
          </div>
        )}
      </div>
      <div className="text-xs text-gray-500 mt-1">{helperText}</div>
    </div>
  );
};

const DistrictPartySearchPage = ({ court }) => {
  const { workspaceId } = useParams();
  const token = localStorage.getItem("token");
  const { sub, role, email } = jwtDecode(token);
  const isOwner = role === "Owner";
  const [name, setName] = useState("");
  const [stage, setStage] = useState("");
  const [year, setYear] = useState("");
  const [complexId, setComplexId] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [htmlContent, setHtmlContent] = useState(""); // State for raw HTML
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
  const [litigantName, setLitigantName] = useState(null);
  const [district, setDistrict] = useState("");
  const [estCode, setEstCode] = useState("");
  const [districts, setDistricts] = useState([]);
  const [estCodeOptions, setEstCodeOptions] = useState([]);
  const [estData, setEstData] = useState({});
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const [courtDetailData, setCourtDetailData] = useState({});

  const courtName = "District Court";

  const currentYear = new Date().getFullYear();
  const yearOptions = [];
  for (let y = currentYear; y >= 1900; y--) {
    yearOptions.push(y);
  }

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
        console.log("Fetched followed cases:", data.cases.length);
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
    if (showCart) {
      fetchFollowedCases();
    }
  }, [showCart, fetchFollowedCases]);

  useEffect(() => {
    if (showCaseDetails) {
      fetchFollowedCases();
    }
  }, [showCaseDetails, fetchFollowedCases]);

  const isCaseFollowed = (cnr) => {
    return followedCases.some((followedCase) => followedCase.cnr === cnr);
  };

  const handleFollowCase = async (caseData, source, courtNameFromResponse) => {
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
            decisionDate:
              caseData.dateOfDecision || caseData.decisionDate || null,
            name: courtNameFromResponse || caseData.name || "N/A",
            filing: caseData.filing || null,
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
            decisionDate:
              caseData.dateOfDecision || caseData.decisionDate || null,
            name: courtNameFromResponse || caseData.name || "N/A",
            filing: caseData.filing || null,
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
              decisionDate:
                caseData.dateOfDecision || caseData.decisionDate || null,
              name: courtNameFromResponse || caseData.name || "N/A",
              filing: caseData.filing || null,
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
        followedCases.find((followedCase) => followedCase.cnr === cnr) || {
          cnr,
          case_data: { cnr },
          court: courtName,
          followed_at: new Date().toISOString(),
        },
      ]);
      showToast(`Error: ${err.message}`);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setTableSearchQuery("");
    setSearchResults(null);
    setHtmlContent(""); // Reset HTML content
    const token = localStorage.getItem("token");
    const { sub, role, email } = jwtDecode(token);

    try {
      const response = await api.post(
        `${import.meta.env.VITE_RESEARCH_API}dcpn/party-name`,
        new URLSearchParams({
          district_name: district,
          litigant_name: litigantName,
          reg_year: year,
          case_status: stage,
          est_code: estCode,
        }),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      const data = response.data?.data?.data;
      // console.log(data);

      if (data?.error) throw new Error(data.error);

      // Store the raw HTML content
      setHtmlContent(data);

      // Flatten the results for searchResults (for existing functionality)
      const resultsArray = Array.isArray(data)
        ? data.flatMap((court) =>
            court?.cases?.map((caseItem) => ({
              cnr: caseItem.cnr,
              title: caseItem.title,
              caseNumber: caseItem.caseNumber,
              type: caseItem.type,
              decisionDate: caseItem.dateOfDecision || caseItem.decisionDate,
              name: court.name,
              filing: caseItem.filing || null,
            }))
          )
        : [];

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

      setSearchResults(resultsArray);
    } catch (err) {
      console.error("Search error:", err);
      setError(err.message || "An error occurred during search");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetrySearch = () => {
    handleSearch(new Event("submit"));
  };

  const handleViewDetails = async (cnr) => {
    console.log(cnr);
    setDetailsLoading(true);
    setDetailsError(null);
    setSelectedCnr(cnr);
    const token = localStorage.getItem("token");
    const { sub, role, email } = jwtDecode(token);
    try {
      const response = await api.post(
        `${import.meta.env.VITE_RESEARCH_API}dccd/case-details`,
        new URLSearchParams({
          cino: cnr,
          district_name: district,
        }),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      const data = response.data?.data;
      setCourtDetailData(data);
      console.log(data);

      if (data?.error) throw new Error(data.error);
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

      setCaseDetails(data);
      setShowCaseDetails(true);
    } catch (err) {
      console.error("Details fetch error:", err);
      setDetailsError(err.message || "Failed to fetch case details");
    } finally {
      setDetailsLoading(false);
    }
  };

  const closeDetailsModal = () => {
    setShowCaseDetails(false);
    setCaseDetails(null);
    setSelectedCnr(null);
    setDetailsError(null);
  };

  const filteredResultsMemo = useMemo(() => {
    if (!tableSearchQuery) return searchResults;

    const searchQueryLower = tableSearchQuery.toLowerCase();
    return (
      searchResults?.filter(
        (caseItem) =>
          (caseItem.cnr &&
            caseItem.cnr.toLowerCase().includes(searchQueryLower)) ||
          (caseItem.title &&
            caseItem.title.toLowerCase().includes(searchQueryLower)) ||
          (caseItem.caseNumber &&
            caseItem.caseNumber.toLowerCase().includes(searchQueryLower)) ||
          (caseItem.type &&
            caseItem.type.toLowerCase().includes(searchQueryLower)) ||
          (caseItem.name &&
            caseItem.name.toLowerCase().includes(searchQueryLower)) ||
          (caseItem.filing &&
            `${caseItem.filing.number}/${caseItem.filing.year}`
              .toLowerCase()
              .includes(searchQueryLower))
      ) || []
    );
  }, [searchResults, tableSearchQuery]);

  useEffect(() => {
    fetch("https://researchengineinh.infrahive.ai/cc/est-codes")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        return response.json();
      })
      .then((data) => {
        if (data.success) {
          setEstData(data.data);
          setDistricts(Object.keys(data.data));
        } else {
          throw new Error("API returned success: false");
        }
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (district && estData[district] && estData[district].est_codes) {
      const codes = Object.values(estData[district].est_codes);
      setEstCodeOptions(codes);
    } else {
      setEstCodeOptions([]);
    }
  }, [district, estData]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <>
      <div className="bg-white rounded-md shadow-sm">
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
              {/* Replaced District input with SearchableDropdown */}
              <SearchableDropdown
                id="districtId"
                label="District Name"
                placeholder="Enter or select District (e.g., srinagar)"
                options={districts}
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                helperText="Type to search districts like srinagar, poonch, etc."
              />

              <div>
                <label
                  htmlFor="name"
                  className="block text-xs font-medium text-gray-700 mb-1"
                >
                  Litigant name
                </label>
                <input
                  id="name"
                  type="text"
                  value={litigantName}
                  onChange={(e) => setLitigantName(e.target.value)}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter litigant name"
                  required
                />
                <div className="text-xs text-gray-500 mt-1">Example: Ashok</div>
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
                  <option value="">Select case stage</option>
                  <option value="P">P</option>
                  <option value="D">D</option>
                </select>
                <div className="text-xs text-gray-500 mt-1">
                  Example: P(Pending) or D(Disposed)
                </div>
              </div>

              <div>
                <label
                  htmlFor="year"
                  className="block text-xs font-medium text-gray-700 mb-1"
                >
                  Year
                </label>
                <select
                  id="year"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select year</option>
                  {yearOptions.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
                <div className="text-xs text-gray-500 mt-1">Example: 2024</div>
              </div>

              <div>
                <label
                  htmlFor="complexId"
                  className="block text-xs font-medium text-gray-700 mb-1"
                >
                  EST Code
                </label>
                <input
                  id="complexId"
                  type="text"
                  list="estCodeList"
                  value={estCode}
                  onChange={(e) => setEstCode(e.target.value)}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter EST Code"
                  disabled={!district}
                />
                <datalist id="estCodeList">
                  {estCodeOptions.map((code, index) => (
                    <option key={index} value={code} />
                  ))}
                </datalist>
                <div className="text-xs text-gray-500 mt-1">
                  Example: JKSG02,JKSG01,JKSG03 (Click to see options for
                  selected district)
                </div>
                {!district && (
                  <div className="text-xs text-red-500 mt-1">
                    Select a district first to see EST codes.
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end">
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
                      viewBox="0 24 24"
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

        {htmlContent && (
          <div
            className="case-table-container mx-4 mb-4 cursor-pointer relative"
            onClick={(e) => {
              const target = e.target;
              if (target.classList.contains("viewCnrDetails")) {
                const cnr = target.getAttribute("data-cno");
                handleViewDetails(cnr);
              }
            }}
          >
            <div
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(htmlContent),
              }}
            />
            {detailsLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50 z-10">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
                  <span className="text-white text-lg">Loading...</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {showCaseDetails && (
        <DistrictCaseDetailsModal
          caseDetails={courtDetailData}
          isLoading={detailsLoading}
          error={detailsError}
          onClose={closeDetailsModal}
          handleFollowCase={(caseData) =>
            handleFollowCase(
              caseData,
              "modal",
              caseData?.case_status?.courtNumberAndJudge ||
                caseData?.case_details?.cnr
            )
          }
          isCaseFollowed={isCaseFollowed}
          followLoading={followLoading === "modal"}
          isOwner={isOwner}
        />
      )}

      {showCart && (
        <Cart
          followedCases={followedCases}
          onUnfollow={handleUnfollowCase}
          onClose={() => setShowCart(false)}
          fetchFollowedCases={fetchFollowedCases}
        />
      )}

      {toast && (
        <div className="fixed bottom-4 right-4 bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg transition-opacity duration-300 flex items-center space-x-2 z-50">
          <Star size={16} className="text-yellow-300" />
          <p>{toast}</p>
        </div>
      )}
    </>
  );
};

export default DistrictPartySearchPage;
