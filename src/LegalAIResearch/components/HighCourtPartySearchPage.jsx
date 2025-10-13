import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Search,
  X,
  ExternalLink,
  AlertTriangle,
  Star,
  ShoppingCart,
} from "lucide-react";
import api from "@/utils/api";
import { useParams } from "react-router-dom";
import { hcBench } from "../utils/hcBench";
import jsPDF from "jspdf";
import { jwtDecode } from "jwt-decode";

// Status Badge Component
const StatusBadge = ({ status }) => {
  const bgColor =
    status === "COMPLETED" || status === "DISPOSED"
      ? "bg-green-100 text-green-800"
      : "bg-yellow-100 text-yellow-800";
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${bgColor}`}>
      {status}
    </span>
  );
};

// Loading Spinner Component
const LoadingSpinner = () => (
  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
);

// Cart Component
const Cart = ({ followedCases, onUnfollow, onClose, fetchFollowedCases }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "followed_at",
    direction: "desc",
  });

  const filteredCases = followedCases.filter((caseData) => {
    const caseJson = caseData.case_data || {};
    const searchIn = [
      caseJson.title,
      caseJson.caseNumber,
      caseJson.cnr,
      caseJson.petitioner,
      caseJson.respondent,
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
    } else {
      aValue = a.case_data?.[sortConfig.key] || "";
      bValue = b.case_data?.[sortConfig.key] || "";
    }

    if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  useEffect(() => {
    if (fetchFollowedCases) {
      fetchFollowedCases();
    }
  }, [fetchFollowedCases]);

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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Court
                    </th>
                    <th
                      onClick={() => requestSort("followed_at")}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200"
                    >
                      Followed On {getSortIndicator("followed_at")}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Unfollow
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {sortedCases.map((caseData, index) => (
                    <tr key={caseData.id || index} className="hover:bg-gray-50">
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
                        {caseData.court || "N/A"}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {new Date(caseData.followed_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm"></td>
                      <td className="px-6 py-4 text-sm">
                        <button
                          onClick={() => onUnfollow(caseData.cnr)}
                          className="bg-red-100 text-red-700 hover:bg-red-200 px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1"
                        >
                          <span>Unfollow</span>
                          <X size={12} />
                        </button>
                      </td>
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

const HighCourtSearchPage = ({
  court,
  partyNameInput,
  setPartyNameInput,
  handlePartySearch,
}) => {
  const { workspaceId } = useParams();
  const token = localStorage.getItem("token");
  const { sub, role, email } = jwtDecode(token);
  const isOwner = role === "Owner"; // Explicit boolean for owner check
  const [stage, setStage] = useState("Both");
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [benchId, setBenchId] = useState("0ba5ccaf");
  const [benchSearch, setBenchSearch] = useState("");
  const [showBenchDropdown, setShowBenchDropdown] = useState(false);
  const benchInputRef = useRef(null);
  const [searchResults, setSearchResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showCaseDetails, setShowCaseDetails] = useState(false);
  const [caseDetails, setCaseDetails] = useState(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [loadingDetailId, setLoadingDetailId] = useState(null);
  const [detailsError, setDetailsError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [followedCases, setFollowedCases] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [followLoading, setFollowLoading] = useState(null);
  const [toast, setToast] = useState(null);

  const [courtCode, setCourtCode] = useState(null);
  const [stateCode, setStateCode] = useState(null);
  const [courtComplexCode, setCourtComplexCode] = useState(null);
  const [courts, setCourts] = useState([]);
  const [selectedCourt, setSelectedCourt] = useState("");
  const [courtSearch, setCourtSearch] = useState("");
  const [showCourtDropdown, setShowCourtDropdown] = useState(false);
  const courtInputRef = useRef(null);
  const [selectedBench, setSelectedBench] = useState("");
  const [benches, setBenches] = useState([]);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 30 }, (_, i) =>
    (currentYear - i).toString()
  );

  const showToast = useCallback((message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  }, []);

  const fetchFollowedCases = useCallback(async () => {
    try {
      const response = await api.get(`/get-followed-cases-by-court`, {
        params: { court: "High Court", workspaceId },
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
  }, [workspaceId, showToast]);

  useEffect(() => {
    fetchFollowedCases();
  }, [fetchFollowedCases]);

  // Handle click outside to close bench dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        benchInputRef.current &&
        !benchInputRef.current.contains(event.target)
      ) {
        setShowBenchDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle click outside to close court dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        courtInputRef.current &&
        !courtInputRef.current.contains(event.target)
      ) {
        setShowCourtDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredBenches = hcBench.filter((bench) =>
    bench.name.toLowerCase().includes(benchSearch.toLowerCase())
  );

  const filteredCourts = courts.filter((court) =>
    court.name.toLowerCase().includes(courtSearch.toLowerCase())
  );

  const handleBenchSelect = (bench) => {
    setBenchId(bench.id);
    setBenchSearch(bench.name);
    setShowBenchDropdown(false);
  };

  const handleCourtSelect = (court) => {
    setSelectedCourt(court.name);
    setCourtSearch(court.name);
    setShowCourtDropdown(false);
  };

  const filteredResults = searchResults
    ? searchResults.filter((result) =>
        Object.values(result).some((value) =>
          String(value).toLowerCase().includes(searchQuery.toLowerCase())
        )
      )
    : [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSearchResults(null);
    const token = localStorage.getItem("token");
    const { sub, role, email } = jwtDecode(token);

    try {
      const response = await api.post(
        `${import.meta.env.VITE_RESEARCH_API}hc/case-status`,
        new URLSearchParams({
          court_code: courtCode, // e.g. "1"
          state_code: stateCode, // e.g. "26"
          court_complex_code: courtComplexCode, // e.g. "1"
          petres_name: partyNameInput, // e.g. "Tanishk"
          rgyear: year, // e.g. "2025"
          f: stage, // e.g. "Both"
        }),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      console.log(response.data.data);

      const data = response.data.data;
      console.log(response);
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

      if (data.error) {
        throw new Error(data.error);
      }

      if (Array.isArray(data)) {
        setSearchResults(data);
      } else {
        throw new Error("Unexpected response format: Data is not an array");
      }
    } catch (err) {
      setError(err.message || "An error occurred during search");
      setSearchResults(null);
    } finally {
      setIsLoading(false);
    }
  };

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
  const handleViewDetails = async (result, rowIndex) => {
    setIsLoadingDetails(true);
    setLoadingDetailId(rowIndex);
    setDetailsError(null);
    setActiveTab("overview");
    console.log(result);
    const token = localStorage.getItem("token");
    const { sub, role, email } = jwtDecode(token);

    try {
      const nationalCourtCode = result.cino?.substring(0, 6);
      const response = await api.post(
        `${import.meta.env.VITE_RESEARCH_API}hc/case`,
        {}, // empty body
        {
          params: {
            case_no: result.case_no,
            state_cd: result.state_cd,
            dist_cd: result.court_code,
            court_code: result.court_code,
            national_court_code: nationalCourtCode,
            cino: result.cino,
          },
        }
      );

      const data = response.data;
      console.log(data);

      if (data.error) {
        throw new Error(data.error);
      }

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
      setDetailsError(err.message || "Failed to fetch case details");
      setShowCaseDetails(true);
    } finally {
      setIsLoadingDetails(false);
      setLoadingDetailId(null);
    }
  };

  const handleFollowCase = async (caseData, rowIndex) => {
    if (!isOwner) return; // Prevent action if not Owner
    setFollowLoading(rowIndex);
    const cnr = caseData.cnr;

    // Optimistic update
    const isFollowed = followedCases.some(
      (followedCase) => followedCase.cnr === cnr
    );
    if (!isFollowed) {
      setFollowedCases((prevCases) => [
        ...prevCases,
        {
          cnr,
          case_data: {
            cnr,
            caseNumber: caseData.caseNumber,
            title: caseData.title,
            type: caseData.type,
            decisionDate: caseData.decisionDate,
          },
          court: "High Court",
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
        // Unfollow the case
        const response = await api.delete("/unfollow-case", {
          data: { caseId: cnr },
        });
        const data = response.data;

        if (!data.success) {
          throw new Error(data.error || "Failed to unfollow case");
        }
        showToast("Case unfollowed successfully");
      } else {
        // Follow the case
        const payload = {
          caseData: {
            cnr,
            caseNumber: caseData.caseNumber,
            title: caseData.title,
            type: caseData.type,
            decisionDate: caseData.decisionDate,
          },
          court: "High Court",
          workspace_id: workspaceId,
        };

        const response = await api.post("/follow-case", payload);
        const data = response.data;

        if (!data.success) {
          throw new Error(data.error || "Failed to follow case");
        }
        showToast("Case followed successfully");
      }

      // Refresh followed cases to ensure consistency
      await fetchFollowedCases();
    } catch (err) {
      // Revert optimistic update on error
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
              cnr,
              caseNumber: caseData.caseNumber,
              title: caseData.title,
              type: caseData.type,
              decisionDate: caseData.decisionDate,
            },
            court: "High Court",
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
    if (!isOwner) return; // Prevent action if not Owner
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

      // Refresh followed cases
      await fetchFollowedCases();
      showToast("Case unfollowed successfully");
    } catch (err) {
      // Revert optimistic update on error
      setFollowedCases((prevCases) => [
        ...prevCases,
        followedCases.find((followedCase) => followedCase.cnr === cnr) || {
          cnr,
          case_data: { cnr },
          court: "High Court",
          followed_at: new Date().toISOString(),
        },
      ]);
      showToast(`Error: ${err.message}`);
    }
  };

  const isCaseFollowed = (cnr) => {
    return followedCases.some((followedCase) => followedCase.cnr === cnr);
  };

  // Fetch court and bench data from API
  const fetchCourtBenchName = async () => {
    try {
      const response = await api.get(
        `${import.meta.env.VITE_RESEARCH_API}hc/courts`
      );
      setCourts(response.data.courts || []);
      console.log("Court Data:", response.data);
    } catch (error) {
      console.error("Error fetching court data:", error);
    }
  };

  // Fetch court info (court_code and state_cd) when court and bench are selected
  const fetchCourtInfo = async () => {
    try {
      const response = await api.get(
        `${import.meta.env.VITE_RESEARCH_API}hc/court-info`,
        {
          params: {
            name: selectedCourt,
            bench: selectedBench,
          },
        }
      );
      const { court_code, state_cd } = response.data;
      setCourtCode(court_code || "");
      setStateCode(state_cd || "");
      setCourtComplexCode(court_code || "");
      console.log("Court Info:", response.data);
    } catch (error) {
      console.error("Error fetching court info:", error);
      setCourtCode("");
      setStateCode("");
      setCourtComplexCode("");
    }
  };

  // Run fetchCourtBenchName on component mount
  useEffect(() => {
    fetchCourtBenchName();
  }, []);

  // Update benches when selectedCourt changes
  useEffect(() => {
    if (selectedCourt) {
      const court = courts.find((c) => c.name === selectedCourt);
      setBenches(court ? court.benches : []);
      setSelectedBench(""); // Reset bench selection when court changes
      setCourtCode(""); // Reset court code
      setStateCode(""); // Reset state code
    } else {
      setBenches([]);
      setSelectedBench("");
      setCourtCode("");
      setStateCode("");
    }
  }, [selectedCourt, courts]);

  // Fetch court info when both court and bench are selected
  useEffect(() => {
    if (selectedCourt && selectedBench) {
      fetchCourtInfo();
    }
  }, [selectedCourt, selectedBench]);

  // const handleDownloadPDF = () => {
  //   if (!caseDetails) return;

  //   const doc = new jsPDF();
  //   let y = 10;
  //   const pageWidth = doc.internal.pageSize.getWidth();
  //   const margin = 10;
  //   const maxWidth = pageWidth - 2 * margin;

  //   // Helper function to add text with wrapping
  //   const addWrappedText = (text, x, y, options = {}) => {
  //     const { maxWidth: optMaxWidth, lineHeight = 7 } = options;
  //     const splitText = doc.splitTextToSize(text, optMaxWidth ?? maxWidth);
  //     splitText.forEach((line) => {
  //       doc.text(line, x, y);
  //       y += lineHeight;
  //     });
  //     return y;
  //   };

  //   // Check page overflow helper
  //   const checkPageOverflow = (currentY) => {
  //     const pageHeight = doc.internal.pageSize.getHeight();
  //     if (currentY > pageHeight - 20) {
  //       doc.addPage();
  //       return 10;
  //     }
  //     return Math.max(currentY, 10); // Prevent negative/zero y
  //   };

  //   doc.setFontSize(16);
  //   doc.text("Case Details", margin, y);
  //   y = checkPageOverflow(y + 15);

  //   doc.setFontSize(12);

  //   // Title - wrap it
  //   const title = `Title: ${
  //     caseDetails.case_details?.registration_number || "N/A"
  //   } - ${
  //     caseDetails.petitioner_and_advocate?.[0]?.split("    ")[0] || "Unknown"
  //   } vs. ${caseDetails.respondent_and_advocate?.[0] || "Unknown"}`;
  //   y = addWrappedText(title, margin, y);
  //   y = checkPageOverflow(y + 10);

  //   // CNR
  //   doc.text(
  //     `CNR: ${caseDetails.case_details?.cnr_number || "N/A"}`,
  //     margin,
  //     y
  //   );
  //   y = checkPageOverflow(y + 10);

  //   // Filed
  //   doc.text(
  //     `Filed: ${formatDate(caseDetails.case_details?.filing_date) || "N/A"}`,
  //     margin,
  //     y
  //   );
  //   y = checkPageOverflow(y + 10);

  //   // Status
  //   doc.text(
  //     `Status: ${caseDetails.case_status?.stage_of_case || "PENDING"}`,
  //     margin,
  //     y
  //   );
  //   y = checkPageOverflow(y + 10);

  //   // Overview
  //   doc.setFontSize(14);
  //   doc.text("Overview", margin, y);
  //   y = checkPageOverflow(y + 10);
  //   doc.setFontSize(12);

  //   // Filing Number
  //   doc.text(
  //     `Filing Number: ${caseDetails.case_details?.filing_number || "N/A"}`,
  //     margin,
  //     y
  //   );
  //   y = checkPageOverflow(y + 10);

  //   // Filing Date
  //   doc.text(
  //     `Filing Date: ${
  //       formatDate(caseDetails.case_details?.filing_date) || "N/A"
  //     }`,
  //     margin,
  //     y
  //   );
  //   y = checkPageOverflow(y + 10);

  //   // Registration Number
  //   doc.text(
  //     `Registration Number: ${
  //       caseDetails.case_details?.registration_number || "N/A"
  //     }`,
  //     margin,
  //     y
  //   );
  //   y = checkPageOverflow(y + 10);

  //   // Registration Date
  //   doc.text(
  //     `Registration Date: ${
  //       formatDate(caseDetails.case_details?.registration_date) || "N/A"
  //     }`,
  //     margin,
  //     y
  //   );
  //   y = checkPageOverflow(y + 10);

  //   // Parties
  //   doc.setFontSize(14);
  //   doc.text("Parties", margin, y);
  //   y = checkPageOverflow(y + 15);
  //   doc.setFontSize(12);

  //   // Petitioners
  //   doc.text("Petitioners:", margin, y);
  //   y = checkPageOverflow(y + 7);
  //   if (caseDetails.petitioner_and_advocate) {
  //     caseDetails.petitioner_and_advocate.forEach((petitioner) => {
  //       const petName = petitioner.split("    ")[0] || "N/A";
  //       y = addWrappedText(petName, margin + 5, y, { lineHeight: 7 });
  //       y = checkPageOverflow(y + 3);
  //     });
  //   }

  //   // Respondents
  //   doc.text("Respondents:", margin, y);
  //   y = checkPageOverflow(y + 7);
  //   if (caseDetails.respondent_and_advocate) {
  //     caseDetails.respondent_and_advocate.forEach((respondent) => {
  //       const resName = respondent.split("    ")[0] || "N/A";
  //       y = addWrappedText(resName, margin + 5, y, { lineHeight: 7 });
  //       y = checkPageOverflow(y + 3);
  //     });
  //   }

  //   // Petitioner Advocates
  //   doc.text("Petitioner Advocates:", margin, y);
  //   y = checkPageOverflow(y + 7);
  //   if (caseDetails.petitioner_and_advocate) {
  //     caseDetails.petitioner_and_advocate.forEach((petitioner) => {
  //       const adv = petitioner.split("    ")[1] || "N/A";
  //       y = addWrappedText(adv, margin + 5, y, { lineHeight: 7 });
  //       y = checkPageOverflow(y + 3);
  //     });
  //   }

  //   // Respondent Advocates
  //   doc.text("Respondent Advocates:", margin, y);
  //   y = checkPageOverflow(y + 7);
  //   if (caseDetails.respondent_and_advocate) {
  //     caseDetails.respondent_and_advocate.forEach((respondent) => {
  //       const adv = respondent.split("    ")[1] || "N/A";
  //       y = addWrappedText(adv, margin + 5, y, { lineHeight: 7 });
  //       y = checkPageOverflow(y + 3);
  //     });
  //   }

  //   // Add more sections (status, orders, ia) here if needed, using similar wrapping

  //   doc.save("case_details.pdf");
  // };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">
        High Court Cases by Party Name
      </h2>
      <div className="bg-white p-6 rounded-md border border-gray-200 max-w-xl">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="col-span-2">
              <label
                htmlFor="party-input"
                className="block text-sm font-medium mb-1 text-gray-700"
              >
                Party Name
              </label>
              <input
                type="text"
                id="party-input"
                value={partyNameInput}
                onChange={(e) => setPartyNameInput(e.target.value)}
                className="w-full border border-gray-200 rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-blue-600"
                placeholder="Enter party name"
                required
              />
              <div className="text-sm text-gray-500 mt-1">Example: Tanishk</div>
            </div>

            <div className="flex gap-5 w-96">
              <div className="w-1/2 relative" ref={courtInputRef}>
                <label
                  htmlFor="court-input"
                  className="block text-sm font-medium mb-1 text-gray-700"
                >
                  Court Name
                </label>
                <input
                  type="text"
                  id="court-input"
                  value={courtSearch}
                  onChange={(e) => {
                    setCourtSearch(e.target.value);
                    setShowCourtDropdown(true);
                  }}
                  onFocus={() => setShowCourtDropdown(true)}
                  className="w-full border border-gray-200 rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  placeholder="Search court..."
                  required
                />
                {showCourtDropdown && (
                  <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {filteredCourts.map((court) => (
                      <li
                        key={court.name}
                        onClick={() => handleCourtSelect(court)}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                      >
                        {court.name}
                      </li>
                    ))}
                    {filteredCourts.length === 0 && (
                      <li className="px-4 py-2 text-gray-500 text-sm">
                        No courts found
                      </li>
                    )}
                  </ul>
                )}
                <div className="text-sm text-gray-500 mt-1">
                  Example: Allahabad High Court
                </div>
              </div>

              <div className="w-1/2">
                <label
                  htmlFor="bench-select"
                  className="block text-sm font-medium mb-1 text-gray-700"
                >
                  Bench Name
                </label>
                <select
                  id="bench-select"
                  value={selectedBench}
                  onChange={(e) => setSelectedBench(e.target.value)}
                  className="w-full border border-gray-200 rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  disabled={!selectedCourt} // Disable until a court is selected
                  required
                >
                  <option value="" disabled>
                    Select a bench
                  </option>
                  {benches.map((bench) => (
                    <option key={bench} value={bench}>
                      {bench}
                    </option>
                  ))}
                </select>
                <div className="text-sm text-gray-500 mt-1">
                  Example: Allahabad High Court Lucknow Bench
                </div>
              </div>
            </div>

            <div className="col-span-2 w-64">
              <label
                htmlFor="stage-select"
                className="block text-sm font-medium mb-1 text-gray-700"
              >
                Stage
              </label>
              <select
                id="stage-select"
                value={stage}
                onChange={(e) => setStage(e.target.value)}
                className="w-full border border-gray-200 rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-blue-600"
              >
                <option value="BOTH">Both</option>
                <option value="PENDING">Pending</option>
                <option value="DISPOSED">Disposed</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="year-select"
                className="block text-sm font-medium mb-1 text-gray-700"
              >
                Year
              </label>
              <select
                id="year-select"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full border border-gray-200 rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-blue-600"
              >
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-start-2 md:flex md:justify-end items-end">
              <button
                type="submit"
                className="w-full md:w-auto bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner />
                    <span>Searching...</span>
                  </>
                ) : (
                  <>
                    <Search size={16} />
                    <span>Search</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {isLoading && (
        <div className="mt-6 flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )}

      {error && (
        <div className="mt-6 bg-red-50 border border-red-200 rounded-md p-4 text-red-700">
          {error}
        </div>
      )}

      {!isLoading && searchResults && (
        <div className="mt-6">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-4">
              <h3 className="text-lg font-medium">Search Results</h3>
            </div>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Data..."
                className="w-64 border border-black shadow-md rounded-md pl-10 p-2 focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={16} className="text-gray-900" />
              </div>
            </div>
          </div>

          {filteredResults.length === 0 ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 text-yellow-700">
              No results found for your search criteria.
            </div>
          ) : (
            <div className="w-full bg-white rounded-lg shadow-sm overflow-hidden border-4 border-white">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white bg-gray-300">
                    <th className="px-6 py-4 text-sm font-medium text-black text-left">
                      CNR
                    </th>
                    <th className="px-6 py-4 text-sm font-medium text-black text-left">
                      CASE NUMBER
                    </th>
                    <th className="px-6 py-4 text-sm font-medium text-black text-left">
                      TITLE
                    </th>
                    <th className="px-6 py-4 text-sm font-medium text-black text-left">
                      DECISION DATE
                    </th>
                    {isOwner && (
                      <th
                        className="px-6 py-4 text-sm font-medium text-black text-left"
                        data-testid="follow-column-header"
                      >
                        FOLLOW
                      </th>
                    )}
                    <th className="px-6 py-4 text-sm font-medium text-black text-left">
                      ACTIONS
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredResults.map((result, index) => (
                    <tr
                      key={index}
                      className="border-b hover:bg-gray-50 last:border-b-0"
                    >
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {result.cino}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">{`${
                        result.type_name || ""
                      } ${result.case_no || ""}`}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {result.res_name || "N/A"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {formatDate(result.date_of_decision)}
                      </td>
                      {isOwner && (
                        <td className="px-6 py-4">
                          <button
                            className={`flex items-center justify-center space-x-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors shadow-sm ${
                              isCaseFollowed(result.cino)
                                ? "text-yellow-700 bg-yellow-100 hover:bg-yellow-200"
                                : "text-gray-700 bg-gray-100 hover:bg-gray-200"
                            }`}
                            onClick={() => handleFollowCase(result, index)}
                            disabled={followLoading === index}
                            data-testid={`follow-button-${result.cino}`}
                          >
                            {followLoading === index ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                            ) : (
                              <>
                                <Star
                                  size={16}
                                  className={
                                    isCaseFollowed(result.cino)
                                      ? "text-yellow-600 fill-yellow-500"
                                      : ""
                                  }
                                />
                                <span>
                                  {isCaseFollowed(result.cino)
                                    ? "Following"
                                    : "Follow"}
                                </span>
                              </>
                            )}
                          </button>
                        </td>
                      )}
                      <td className="px-6 py-4">
                        <button
                          className="flex items-center justify-center w-32 h-10 space-x-2 px-5 py-2 text-sm text-blue-600 bg-blue-100 rounded-full hover:bg-blue-200 transition-colors"
                          onClick={() => handleViewDetails(result, index)}
                          disabled={loadingDetailId === index}
                        >
                          {loadingDetailId === index ? (
                            <div className="flex items-center space-x-2">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                              <span>Loading...</span>
                            </div>
                          ) : (
                            <span className="flex items-center space-x-1">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                                className="w-4 h-4"
                              >
                                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                <path
                                  fillRule="evenodd"
                                  d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              <span>Details</span>
                            </span>
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
      )}

      {showCaseDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b p-4 sticky top-0 bg-white z-10">
              <h3 className="text-lg font-semibold">Case Details</h3>
              <button
                onClick={() => setShowCaseDetails(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-4">
              {isLoadingDetails ? (
                <div className="flex justify-center items-center py-20">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
                </div>
              ) : detailsError ? (
                <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-700">
                  {detailsError}
                </div>
              ) : caseDetails ? (
                <div>
                  <div className="mb-6">
                    <div className="flex justify-between items-start">
                      <h2 className="text-xl font-bold mb-2">
                        {`${
                          caseDetails.case_details?.registration_number || "N/A"
                        } - ${
                          caseDetails.petitioner_and_advocate?.[0]?.split(
                            "    "
                          )[0] || "Unknown"
                        } vs. ${
                          caseDetails.respondent_and_advocate?.[0] || "Unknown"
                        }`}
                      </h2>
                      {isOwner && (
                        <button
                          className={`flex items-center space-x-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors shadow-sm ${
                            isCaseFollowed(caseDetails.case_details?.cnr_number)
                              ? "text-yellow-700 bg-yellow-100 hover:bg-yellow-200"
                              : "text-gray-700 bg-gray-100 hover:bg-gray-200"
                          }`}
                          onClick={() =>
                            handleFollowCase({
                              cnr: caseDetails.case_details?.cnr,
                              title: `${
                                caseDetails.petitioner_and_advocate?.[0]?.split(
                                  "    "
                                )[0] || "Unknown"
                              } vs. ${
                                caseDetails.respondent_and_advocate?.[0] ||
                                "Unknown"
                              }`,
                              caseNumber:
                                caseDetails.case_details?.registration_number,
                              type: caseDetails.case_status?.stage_of_case,
                              decisionDate: null, // No decision date in provided data
                            })
                          }
                          disabled={followLoading !== null}
                          data-testid="modal-follow-button"
                        >
                          <Star
                            size={16}
                            className={
                              isCaseFollowed(caseDetails.case_details?.cnr)
                                ? "text-yellow-600 fill-yellow-500"
                                : ""
                            }
                          />
                          <span>
                            {isCaseFollowed(caseDetails.case_details?.cnr)
                              ? "Following"
                              : "Follow"}
                          </span>
                        </button>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 items-center">
                      <span className="text-black text-sm font-medium">
                        CNR: {caseDetails.case_details?.cnr_number || "N/A"}
                      </span>
                      <span className="text-black text-sm mx-2 font-medium">
                        |
                      </span>
                      <span className="text-black text-sm font-medium">
                        Filed:{" "}
                        {formatDate(caseDetails.case_details?.filing_date) ||
                          "N/A"}
                      </span>
                      <span className="text-black text-sm mx-2 font-medium">
                        |
                      </span>
                      <StatusBadge
                        status={
                          caseDetails.case_status?.stage_of_case || "PENDING"
                        }
                      />
                    </div>
                  </div>
                  <div className="border-b mb-4">
                    <div className="flex overflow-x-auto">
                      {["overview", "parties", "status", "orders", "ia"].map(
                        (tab) => (
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
                        )
                      )}
                    </div>
                  </div>
                  <div className="mb-4">
                    {activeTab === "overview" && (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {[
                            {
                              label: "Filing Number",
                              value:
                                caseDetails.case_details?.filing_number ||
                                "N/A",
                            },
                            {
                              label: "Filing Date",
                              value:
                                formatDate(
                                  caseDetails.case_details?.filing_date
                                ) || "N/A",
                            },
                            {
                              label: "Registration Number",
                              value:
                                caseDetails.case_details?.registration_number ||
                                "N/A",
                            },
                            {
                              label: "Registration Date",
                              value:
                                formatDate(
                                  caseDetails.case_details?.registration_date
                                ) || "N/A",
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
                      </div>
                    )}
                    {activeTab === "parties" && (
                      <div className="space-y-6">
                        <div>
                          <h3 className="font-medium mb-2">Petitioners</h3>
                          <ul className="bg-gray-50 p-4 rounded-md space-y-2">
                            {caseDetails.petitioner_and_advocate?.map(
                              (petitioner, index) => (
                                <li key={index} className="text-sm">
                                  {petitioner.split("    ")[0] || "N/A"}
                                </li>
                              )
                            ) || <li className="text-sm">N/A</li>}
                          </ul>
                        </div>
                        <div>
                          <h3 className="font-medium mb-2">Respondents</h3>
                          <ul className="bg-gray-50 p-4 rounded-md space-y-2">
                            {caseDetails.respondent_and_advocate?.map(
                              (respondent, index) => (
                                <li key={index} className="text-sm">
                                  {respondent.split("    ")[0] || "N/A"}
                                </li>
                              )
                            ) || <li className="text-sm">N/A</li>}
                          </ul>
                        </div>
                        <div>
                          <h3 className="font-medium mb-2">
                            Petitioner Advocates
                          </h3>
                          <ul className="bg-gray-50 p-4 rounded-md space-y-2">
                            {caseDetails.petitioner_and_advocate?.map(
                              (petitioner, index) => (
                                <li key={index} className="text-sm">
                                  {petitioner.split("    ")[1] || "N/A"}
                                </li>
                              )
                            ) || <li className="text-sm">N/A</li>}
                          </ul>
                        </div>
                        <div>
                          <h3 className="font-medium mb-2">
                            Respondent Advocates
                          </h3>
                          <ul className="bg-gray-50 p-4 rounded-md space-y-2">
                            {caseDetails.respondent_and_advocate?.map(
                              (respondent, index) => (
                                <li key={index} className="text-sm">
                                  {respondent.split("    ")[1] || "N/A"}
                                </li>
                              )
                            ) || <li className="text-sm">N/A</li>}
                          </ul>
                        </div>
                      </div>
                    )}
                    {activeTab === "status" && (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {[
                            {
                              label: "Case Stage",
                              value:
                                caseDetails.case_status?.stage_of_case || "N/A",
                            },
                            {
                              label: "First Hearing Date",
                              value:
                                formatDate(
                                  caseDetails.case_status?.first_hearing_date
                                ) || "N/A",
                            },
                            {
                              label: "Next Hearing Date",
                              value:
                                formatDate(
                                  caseDetails.case_status?.next_hearing_date
                                ) || "N/A",
                            },
                            {
                              label: "Coram",
                              value: caseDetails.case_status?.coram || "N/A",
                            },
                            {
                              label: "Judicial Branch",
                              value:
                                caseDetails.case_status?.judicial_branch ||
                                "N/A",
                            },
                            {
                              label: "Not Before Me",
                              value:
                                caseDetails.case_status?.not_before_me || "N/A",
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
                      </div>
                    )}
                    {activeTab === "orders" && (
                      <div className="space-y-4">
                        <h3 className="font-medium mb-2">Orders</h3>
                        {caseDetails.orders && caseDetails.orders.length > 0 ? (
                          <div className="space-y-3">
                            {caseDetails.orders.map((order, index) => (
                              <div
                                key={index}
                                className="flex justify-between items-center p-3 bg-gray-50 rounded-md"
                              >
                                <span className="text-sm font-medium">{`Order #${
                                  order.order_number
                                } - ${formatDate(order.order_date)}`}</span>
                                <a
                                  href={order.order_details}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm"
                                >
                                  <span>View Order</span>
                                  <ExternalLink size={14} />
                                </a>
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
                    {activeTab === "ia" && (
                      <div className="space-y-6">
                        <h3 className="font-medium mb-2">
                          Interlocutory Applications (IA)
                        </h3>
                        {caseDetails.ia_details &&
                        caseDetails.ia_details.length > 0 ? (
                          <div className="overflow-x-auto">
                            <table className="min-w-full border-collapse bg-gray-50 rounded-md">
                              <thead>
                                <tr className="bg-gray-100">
                                  <th className="border border-gray-300 p-2 text-left text-xs font-medium text-black">
                                    IA Number
                                  </th>
                                  <th className="border border-gray-300 p-2 text-left text-xs font-medium text-black">
                                    Party
                                  </th>
                                  <th className="border border-gray-300 p-2 text-left text-xs font-medium text-black">
                                    Filing Date
                                  </th>
                                  <th className="border border-gray-300 p-2 text-left text-xs font-medium text-black">
                                    Next Date
                                  </th>
                                  <th className="border border-gray-300 p-2 text-left text-xs font-medium text-black">
                                    Status
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {caseDetails.ia_details.map((ia, index) => (
                                  <tr
                                    key={index}
                                    className="hover:bg-gray-100 even:bg-white odd:bg-gray-50"
                                  >
                                    <td className="border border-gray-300 p-2 text-sm">
                                      {ia.ia_number || "N/A"}
                                    </td>
                                    <td className="border border-gray-300 p-2 text-sm">
                                      {ia.party || "N/A"}
                                    </td>
                                    <td className="border border-gray-300 p-2 text-sm">
                                      {formatDate(ia.date_of_filing)}
                                    </td>
                                    <td className="border border-gray-300 p-2 text-sm">
                                      {formatDate(ia.next_date)}
                                    </td>
                                    <td className="border border-gray-300 p-2 text-sm">
                                      {ia.ia_status || "N/A"}
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
                  </div>
                </div>
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 text-yellow-700">
                  No case details available.
                </div>
              )}
            </div>
            <div className="border-t p-4 flex justify-end space-x-2">
              {/* <button
                onClick={handleDownloadPDF}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Download PDF
              </button> */}
              <button
                onClick={() => setShowCaseDetails(false)}
                className="bg-gray-100 text-gray-600 hover:bg-gray-200 px-4 py-2 rounded-md transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
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
    </div>
  );
};

export default HighCourtSearchPage;
