
import React, { useState, useEffect, useCallback } from "react";
import {
  Search,
  X,
  ArrowLeft,
  Trash2,
  Star,
  ExternalLink,
  FileText,
  Flag,
  User,
  Clock,
  Briefcase,
  Clock as ClockIcon,
  StopCircle,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import DistrictCaseDetailsModal from "./DistrictCaseDetailsModal";
import HighCaseDetailsModal from "./HighCaseDetailsModal";
import NcltCaseDetailsModal from "./NcltCaseDetailsModal";
import api from "@/utils/api";
import { Parser } from "@json2csv/plainjs";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { Download } from "lucide-react";
import CatCaseDetailsModal from "./CatCaseDetailsModal";
import ConsumerForumCaseDetailsModal from "./ConsumerForumCaseDetailsModal";

// Status Badge Component
const StatusBadge = ({ status }) => {
  let bgColor = "bg-yellow-100 text-yellow-800";
  if (
    status === "COMPLETED" ||
    status === "DISPOSED" ||
    status === "REGISTERED"
  ) {
    bgColor = "bg-green-100 text-green-800";
  }
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${bgColor}`}>
      {status || "N/A"}
    </span>
  );
};

// Error Message Component
const ErrorMessage = ({ message }) => (
  <div className="bg-red-50 border border-red-200 rounded-md p-4">
    <p className="text-sm text-red-700">{message}</p>
  </div>
);

const CartPage = () => {
  const navigate = useNavigate();
  const { workspaceId } = useParams();
  const { role } = JSON.parse(localStorage.getItem("user"));

  // State for tab selection
  const [activeCourtTab, setActiveCourtTab] = useState("supreme");

  // State for all followed cases (Supreme Court)
  const [allFollowedCases, setAllFollowedCases] = useState({});
  const [isLoadingAll, setIsLoadingAll] = useState(true);
  const [allError, setAllError] = useState(null);
  const [hasFetchedAll, setHasFetchedAll] = useState(false);

  // State for High Court followed cases
  const [highCourtCases, setHighCourtCases] = useState({});
  const [isLoadingHigh, setIsLoadingHigh] = useState(true);
  const [highError, setHighError] = useState(null);
  const [hasFetchedHigh, setHasFetchedHigh] = useState(false);

  // State for District Court followed cases
  const [districtCourtCases, setDistrictCourtCases] = useState({});
  const [isLoadingDistrict, setIsLoadingDistrict] = useState(true);
  const [districtError, setDistrictError] = useState(null);
  const [hasFetchedDistrict, setHasFetchedDistrict] = useState(false);

  // State for CAT followed cases
  const [catCases, setCatCases] = useState({});
  const [isLoadingCat, setIsLoadingCat] = useState(true);
  const [catError, setCatError] = useState(null);
  const [hasFetchedCat, setHasFetchedCat] = useState(false);

  // State for NCLT followed cases
  const [ncltCases, setNcltCases] = useState({});
  const [isLoadingNclt, setIsLoadingNclt] = useState(true);
  const [ncltError, setNcltError] = useState(null);
  const [hasFetchedNclt, setHasFetchedNclt] = useState(false);

  // State for Consumer Forum followed cases
  const [consumerCases, setConsumerCases] = useState({});
  const [isLoadingConsumer, setIsLoadingConsumer] = useState(true);
  const [consumerError, setConsumerError] = useState(null);
  const [hasFetchedConsumer, setHasFetchedConsumer] = useState(false);

  // State for search and sorting
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "followedAt",
    direction: "desc",
  });

  // State for case details modal
  const [showCaseDetails, setShowCaseDetails] = useState(false);
  const [caseDetails, setCaseDetails] = useState(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [detailsError, setDetailsError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [loadingDetailId, setLoadingDetailId] = useState(null);

  // State for followed cases (for the Follow button)
  const [followedCases, setFollowedCases] = useState({});

  // State for cronjob scheduling
  const [showCronModal, setShowCronModal] = useState(false);
  const [cronDays, setCronDays] = useState("");
  const [cronHours, setCronHours] = useState("");
  const [cronMinutes, setCronMinutes] = useState("");
  const [cronError, setCronError] = useState(null);
  const [cronSuccess, setCronSuccess] = useState(null);
  const [isSubmittingCron, setIsSubmittingCron] = useState(false);
  // New state for current cron schedule
  const [cronSchedule, setCronSchedule] = useState(null);
  const [isLoadingCron, setIsLoadingCron] = useState(true);
  const [cronFetchError, setCronFetchError] = useState(null);

  // State for workspace users and email selection
const [workspaceUsers, setWorkspaceUsers] = useState([]);
const [selectedEmails, setSelectedEmails] = useState([]);
const [isLoadingUsers, setIsLoadingUsers] = useState(false);
const [usersError, setUsersError] = useState(null);
const [showEmailDropdown, setShowEmailDropdown] = useState(false);


  
  const fetchCronSchedule = useCallback(async () => {
    try {
      setIsLoadingCron(true);
      setCronFetchError(null); // Clear any previous errors
      
      const response = await api.get("/get-cron-interval", {
        params: { workspace_id: workspaceId, role },
      });
      
      console.log("Cron fetch response:", response.data); // Debug log
      
      const data = response.data;
      
      // Check if the response is successful and has the expected data
      if (data && (data.success === true || data.days !== undefined)) {
        // Handle both response formats
        const days = data.days || 0;
        const hours = data.hours || 0;
        const minutes = data.minutes || 0;
        
        setCronSchedule({
          days: days,
          hours: hours,
          minutes: minutes,
        });
        
        // Only update form fields if there's an actual schedule
        if (days > 0 || hours > 0 || minutes > 0) {
          setCronDays(days.toString());
          setCronHours(hours.toString());
          setCronMinutes(minutes.toString());
        } else {
          // Clear form fields if no schedule
          setCronDays("");
          setCronHours("");
          setCronMinutes("");
        }
        
        console.log("Cron schedule updated:", { days, hours, minutes }); // Debug log
      } else {
        // Handle case where no schedule exists
        setCronSchedule(null);
        setCronDays("");
        setCronHours("");
        setCronMinutes("");
        setCronFetchError("No cron schedule found");
      }
    } catch (err) {
      console.error("Error fetching cron schedule:", err); // Debug log
      setCronFetchError(err.message || "Failed to fetch cron schedule");
      setCronSchedule(null);
    } finally {
      setIsLoadingCron(false);
    }
  }, [workspaceId, role]);
  
  // Fetch current cron schedule
  useEffect(() => {
    if (role === "Owner") {
      fetchCronSchedule();
    }
  }, [role, fetchCronSchedule]); // Add fetchCronSchedule to dependencies


  // Existing useEffect hooks for fetching cases remain unchanged
  useEffect(() => {
    if (hasFetchedAll) return;
    const fetchAllFollowedCases = async () => {
      try {
        setIsLoadingAll(true);
        const response = await api.get(`/get-followed-cases-by-court`, {
          params: { court: "Supreme Court", workspaceId },
        });
        const data = response.data;
        if (data.success) {
          const allCases = data.cases.reduce((acc, caseData) => {
            const { id, ...cleanedCaseData } = caseData;
            acc[caseData.case_id] = cleanedCaseData;
            return acc;
          }, {});
          setAllFollowedCases(allCases);
          const followed = Object.keys(allCases).reduce((acc, case_id) => {
            acc[allCases[case_id].cnr || case_id] = true;
            return acc;
          }, {});
          setFollowedCases(followed);
        } else {
          throw new Error(
            data.error || "Failed to fetch Supreme Court followed cases"
          );
        }
      } catch (err) {
        setAllError(err.message);
      } finally {
        setIsLoadingAll(false);
        setHasFetchedAll(true);
      }
    };

    fetchAllFollowedCases();
  }, [hasFetchedAll, workspaceId]);

  useEffect(() => {
    if (hasFetchedHigh) return;
    const fetchHighCourtCases = async () => {
      try {
        setIsLoadingHigh(true);
        const response = await api.get(`/get-followed-cases-by-court`, {
          params: { court: "High Court", workspaceId },
        });
        const data = response.data;
        if (data.success) {
          const highCases = data.cases.reduce((acc, caseData) => {
            const { id, ...cleanedCaseData } = caseData;
            // Structure the data to include case_data fields at the top level
            acc[caseData.case_data.cnr] = {
              caseId: caseData.case_data.cnr,
              cnr: caseData.case_data.cnr,
              type: caseData.case_data.type,
              title: caseData.case_data.title,
              caseNumber: caseData.case_data.caseNumber,
              decisionDate: caseData.case_data.decisionDate,
              followedAt: caseData.followed_at,
              updated_details: caseData.updated_details,
              // Keep original structure for other operations
              original_data: cleanedCaseData,
            };
            return acc;
          }, {});
          setHighCourtCases(highCases);
        } else {
          throw new Error(
            data.error || "Failed to fetch High Court followed cases"
          );
        }
      } catch (err) {
        setHighError(err.message);
      } finally {
        setIsLoadingHigh(false);
        setHasFetchedHigh(true);
      }
    };

    fetchHighCourtCases();
  }, [hasFetchedHigh, workspaceId]);

  useEffect(() => {
    if (hasFetchedDistrict) return;
    const fetchDistrictCourtCases = async () => {
      try {
        setIsLoadingDistrict(true);
        const response = await api.get(`/get-followed-cases-by-court`, {
          params: { court: "District Court", workspaceId },
        });
        const data = response.data;
        if (data.success) {
          const districtCases = data.cases.reduce((acc, caseData) => {
            const { id, ...cleanedCaseData } = caseData;
            // Structure the data to include case_data fields at the top level
            acc[caseData.case_data.cnr] = {
              caseId: caseData.case_data.cnr,
              cnr: caseData.case_data.cnr,
              name: caseData.case_data.name,
              type: caseData.case_data.type,
              title: caseData.case_data.title,
              filing: caseData.case_data.filing,
              caseNumber: caseData.case_data.caseNumber,
              decisionDate: caseData.case_data.decisionDate,
              followedAt: caseData.followed_at,
              updated_details: caseData.updated_details,
              // Keep original structure for other operations
              original_data: cleanedCaseData,
            };
            return acc;
          }, {});
          setDistrictCourtCases(districtCases);
        } else {
          throw new Error(
            data.error || "Failed to fetch District Court followed cases"
          );
        }
      } catch (err) {
        setDistrictError(err.message);
      } finally {
        setIsLoadingDistrict(false);
        setHasFetchedDistrict(true);
      }
    };

    fetchDistrictCourtCases();
  }, [hasFetchedDistrict, workspaceId]);

  useEffect(() => {
    if (hasFetchedCat) return;
    const fetchCatCases = async () => {
      try {
        setIsLoadingCat(true);
        const response = await api.get(`/get-followed-cases-by-court`, {
          params: {
            court: "Central Administrative Tribunal (CAT)",
            workspaceId,
          },
        });
        const data = response.data;
        if (data.success) {
          const catCasesData = data.cases.reduce((acc, caseData) => {
            const { id, ...cleanedCaseData } = caseData;
            // Structure the data to include case_data fields at the top level (similar to High/District Court)
            acc[
              `${caseData.diary_number}/${caseData.case_year}/${caseData.bench_id}`
            ] = {
              caseId: `${caseData.diary_number}/${caseData.case_year}`,
              diaryNumber:
                caseData.case_data?.diaryNumber ||
                `${caseData.diary_number}/${caseData.case_year}`,
              caseNumber: caseData.case_data?.caseNumber || "N/A",
              applicantName: caseData.case_data?.applicantName || "N/A",
              defendantName: caseData.case_data?.defendantName || "N/A",
              advocateName: caseData.case_data?.advocateName || "N/A",
              partyName: caseData.case_data?.partyName || "N/A",
              type: caseData.case_data?.type || "N/A",
              benchId:
                caseData.case_data?.benchId || caseData.bench_id || "N/A",
              followedAt: caseData.followed_at,
              updated_details: caseData.updated_details,
              // Keep original structure for other operations
              original_data: cleanedCaseData,
            };
            return acc;
          }, {});
          setCatCases(catCasesData);
        } else {
          throw new Error(data.error || "Failed to fetch CAT followed cases");
        }
      } catch (err) {
        setCatError(err.message);
      } finally {
        setIsLoadingCat(false);
        setHasFetchedCat(true);
      }
    };

    fetchCatCases();
  }, [hasFetchedCat, workspaceId]);

  useEffect(() => {
    if (hasFetchedNclt) return;
    const fetchNcltCases = async () => {
      try {
        setIsLoadingNclt(true);
        const response = await api.get(`/get-followed-cases-by-court`, {
          params: {
            court: "National Company Law Tribunal (NCLT)",
            workspaceId,
          },
        });
        const data = response.data;
        if (data.success) {
          const ncltCasesData = data.cases.reduce((acc, caseData) => {
            const { id, ...cleanedCaseData } = caseData;
            // Structure the data to include case_data fields at the top level (similar to High/District/CAT Court)
            acc[caseData.filing_number] = {
              caseId: caseData.filing_number,
              filingNumber:
                caseData.case_data?.filingNumber || caseData.filing_number,
              caseNumber: caseData.case_data?.caseNumber || "N/A",
              caseTitle: caseData.case_data?.caseTitle || "N/A",
              bench: caseData.case_data?.bench || "N/A",
              courtNumber: caseData.case_data?.courtNumber || "N/A",
              filedOn: caseData.case_data?.filedOn || "N/A",
              nextDate: caseData.case_data?.nextDate || "N/A",
              status: caseData.case_data?.status || "N/A",
              caseType: caseData.case_data?.caseType || "N/A",
              court: caseData.court,
              followedAt: caseData.followed_at,
              updated_details: caseData.updated_details,
              // Keep original structure for other operations
              original_data: cleanedCaseData,
            };
            return acc;
          }, {});
          setNcltCases(ncltCasesData);
        } else {
          throw new Error(data.error || "Failed to fetch NCLT followed cases");
        }
      } catch (err) {
        setNcltError(err.message);
      } finally {
        setIsLoadingNclt(false);
        setHasFetchedNclt(true);
      }
    };

    fetchNcltCases();
  }, [hasFetchedNclt, workspaceId]);

  useEffect(() => {
    if (hasFetchedConsumer) return;
    const fetchConsumerCases = async () => {
      try {
        setIsLoadingConsumer(true);
        const response = await api.get(`/get-followed-cases-by-court`, {
          params: { court: "Consumer Forum", workspaceId },
        });
        const data = response.data;
        if (data.success) {
          const consumerCasesData = data.cases.reduce((acc, caseData) => {
            const { id, ...cleanedCaseData } = caseData;
            // Structure the data to include case details at the top level (similar to other courts)
            acc[caseData.cnr] = {
              caseId: caseData.cnr,
              cnr: caseData.cnr,
              caseNumber: caseData.case_data?.caseNumber || caseData.cnr,
              commission: caseData.case_data?.commission || "N/A",
              filingNumber: caseData.case_data?.filingNumber || "N/A",
              filingDate: caseData.case_data?.filingDate || "N/A",
              complainant: caseData.case_data?.complainant || "N/A",
              respondent: caseData.case_data?.respondent || "N/A",
              status: caseData.case_data?.status || "N/A",
              nextHearing: caseData.case_data?.nextHearing || "N/A",
              court: caseData.court,
              followedAt: caseData.followed_at,
              updated_details: caseData.updated_details,
              // Store the complete details for the modal
              details: caseData.case_data?.details || caseData.case_data,
              // Keep original structure for other operations
              original_data: cleanedCaseData,
            };
            return acc;
          }, {});
          setConsumerCases(consumerCasesData);
        } else {
          throw new Error(
            data.error || "Failed to fetch Consumer Forum followed cases"
          );
        }
      } catch (err) {
        setConsumerError(err.message);
      } finally {
        setIsLoadingConsumer(false);
        setHasFetchedConsumer(true);
      }
    };

    fetchConsumerCases();
  }, [hasFetchedConsumer, workspaceId]);

  // Filter and sort cases based on active tab
  const currentCases =
    activeCourtTab === "supreme"
      ? allFollowedCases
      : activeCourtTab === "high"
      ? highCourtCases
      : activeCourtTab === "district"
      ? districtCourtCases
      : activeCourtTab === "cat"
      ? catCases
      : activeCourtTab === "nclt"
      ? ncltCases
      : consumerCases;

  const filteredCases = Object.entries(currentCases).filter(
    ([id, caseData]) => {
      const searchIn =
        activeCourtTab === "consumer"
          ? Object.values(caseData.details || {})
              .join(" ")
              .toLowerCase()
          : Object.values(caseData).join(" ").toLowerCase();
      return searchIn.includes(searchQuery.toLowerCase());
    }
  );

  const sortedCases = [...filteredCases].sort((a, b) => {
    const aValue =
      activeCourtTab === "consumer"
        ? (a[1].details && a[1].details[sortConfig.key]) ||
          a[1][sortConfig.key] ||
          ""
        : a[1][sortConfig.key] || "";
    const bValue =
      activeCourtTab === "consumer"
        ? (b[1].details && b[1].details[sortConfig.key]) ||
          b[1][sortConfig.key] ||
          ""
        : b[1][sortConfig.key] || "";
    if (aValue === "") return sortConfig.direction === "asc" ? 1 : -1;
    if (bValue === "") return sortConfig.direction === "asc" ? -1 : 1;
    if (new Date(aValue) && new Date(bValue)) {
      return sortConfig.direction === "asc"
        ? new Date(aValue) - new Date(bValue)
        : new Date(bValue) - new Date(aValue);
    }
    return sortConfig.direction === "asc"
      ? aValue.localeCompare(bValue)
      : bValue.localeCompare(bValue);
  });

  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const getSortIndicator = (key) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === "asc" ? "↑" : "↓";
    }
    return "";
  };

  // Function to download table as CSV
  const handleDownloadCSV = () => {
    try {
      const headers =
        activeCourtTab === "supreme"
          ? [
              "caseId",
              "title",
              "caseNumber",
              "diaryNumber",
              "petitioner",
              "respondent",
              "status",
              "court",
              "followedAt",
            ]
          : activeCourtTab === "high"
          ? ["cnr", "type", "title", "caseNumber", "decisionDate", "followedAt"]
          : activeCourtTab === "district"
          ? [
              "cnr",
              "name",
              "type",
              "title",
              "filing.year",
              "filing.number",
              "caseNumber",
              "decisionDate",
              "followedAt",
            ]
          : activeCourtTab === "cat"
          ? [
              "diaryNumber",
              "caseNumber",
              "applicantName",
              "defendantName",
              "advocateName",
              "partyName",
              "type",
              "benchId",
              "followedAt",
            ]
          : activeCourtTab === "nclt"
          ? [
              "filingNumber",
              "caseNumber",
              "caseTitle",
              "bench",
              "courtNumber",
              "filedOn",
              "nextDate",
              "status",
              "caseType",
              "court",
              "followedAt",
            ]
          : [
              "cnr",
              "caseNumber",
              "commission",
              "complainant",
              "respondent",
              "status",
              "filingNumber",
              "filingDate",
              "nextHearing",
              "court",
              "followedAt",
            ];

      const csvData = sortedCases.map(([id, caseData]) => {
        const row = {};
        headers.forEach((header) => {
          const keys = header.split(".");
          let value =
            activeCourtTab === "consumer" ? caseData.details : caseData;
          for (const key of keys) {
            value = value ? value[key] : null;
          }
          row[header] = Array.isArray(value)
            ? value.join(", ")
            : header.includes("date") || header === "followedAt"
            ? formatDate(value)
            : value || "N/A";
        });
        return row;
      });

      const parser = new Parser({ fields: headers });
      const csv = parser.parse(csvData);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `${activeCourtTab}_cases.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Error generating CSV:", err);
    }
  };

  // Function to download case details as PDF
  const handleDownloadPDF = () => {
    if (!caseDetails) return;

    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Case Details", 20, 20);

    doc.setFontSize(12);
    doc.text(
      `Case Number: ${caseDetails.caseNumber || caseDetails.cnr || "N/A"}`,
      20,
      30
    );
    doc.text(`Title: ${caseDetails.title || "N/A"}`, 20, 40);
    doc.text(
      `Court: ${caseDetails.court || caseDetails.commission || "N/A"}`,
      20,
      50
    );
    doc.text(
      `Status: ${caseDetails.status?.stage || caseDetails.status || "N/A"}`,
      20,
      60
    );
    doc.text(
      `Filed On: ${formatDate(
        caseDetails.details?.filedOn || caseDetails.filing?.date
      )}`,
      20,
      70
    );

    if (
      activeCourtTab === "supreme" ||
      activeCourtTab === "high" ||
      activeCourtTab === "district"
    ) {
      doc.text(
        `Petitioner: ${
          caseDetails.petitioner ||
          caseDetails.parties?.petitioners?.join(", ") ||
          "N/A"
        }`,
        20,
        80
      );
      doc.text(
        `Respondent: ${
          caseDetails.respondent ||
          caseDetails.parties?.respondents?.join(", ") ||
          "N/A"
        }`,
        20,
        90
      );
    } else if (activeCourtTab === "consumer") {
      doc.text(
        `Complainant: ${caseDetails.parties?.complainant?.join(", ") || "N/A"}`,
        20,
        80
      );
      doc.text(
        `Respondent: ${caseDetails.parties?.respondent?.join(", ") || "N/A"}`,
        20,
        90
      );
    }

    if (caseDetails.history && caseDetails.history.length > 0) {
      doc.text("Case History", 20, 100);
      doc.autoTable({
        startY: 110,
        head: [["Date", "Type", "Stage", "Purpose", "Judge", "Remarks"]],
        body: caseDetails.history.map((item) => [
          formatDate(item.date),
          item.type || "N/A",
          item.stage || "N/A",
          item.purpose || "N/A",
          item.judge || "N/A",
          item.remarks || item.proceeding || "N/A",
        ]),
      });
    }

    doc.save(`${caseDetails.caseNumber || caseDetails.cnr || "case"}.pdf`);
  };

  const handleUnfollow = async (caseId) => {
    try {
      const endpoint = "/unfollow-case";

      let requestData;

      if (activeCourtTab === "cat") {
        const caseData = currentCases[caseId];
        const diaryNumber = caseData.original_data?.diary_number;
        const caseYear = caseData.original_data?.case_year;
        const benchId = caseData.original_data?.bench_id;
        const catCaseId = `${diaryNumber}/${caseYear}`;

        requestData = {
          caseId: catCaseId,
          court: "Central Administrative Tribunal (CAT)",
          benchId: benchId,
        };
      } else if (activeCourtTab === "nclt") {
        requestData = {
          caseId: caseId,
          court: "National Company Law Tribunal (NCLT)",
        };
      } else if (activeCourtTab === "consumer") {
        // Add Consumer Forum support
        requestData = {
          caseId: caseId, // This should be the CNR
          court: "Consumer Forum",
        };
      } else {
        requestData = { caseId };
      }

      const response = await api.delete(endpoint, {
        data: requestData,
      });

      const data = response.data;
      if (response.status === 200 && data.success) {
        const updatedCases = { ...currentCases };
        delete updatedCases[caseId];

        if (activeCourtTab === "supreme") {
          setAllFollowedCases(updatedCases);
          setFollowedCases((prev) => {
            const updated = { ...prev };
            delete updated[currentCases[caseId].cnr];
            return updated;
          });
        } else if (activeCourtTab === "high") {
          setHighCourtCases(updatedCases);
        } else if (activeCourtTab === "district") {
          setDistrictCourtCases(updatedCases);
        } else if (activeCourtTab === "cat") {
          setCatCases(updatedCases);
        } else if (activeCourtTab === "nclt") {
          setNcltCases(updatedCases);
        } else {
          setConsumerCases(updatedCases);
        }
      } else {
        throw new Error(data.error || "Failed to unfollow case");
      }
    } catch (err) {
      console.error("Unfollow error:", err);
      activeCourtTab === "supreme"
        ? setAllError(err.message)
        : activeCourtTab === "high"
        ? setHighError(err.message)
        : activeCourtTab === "district"
        ? setDistrictError(err.message)
        : activeCourtTab === "cat"
        ? setCatError(err.message)
        : activeCourtTab === "nclt"
        ? setNcltError(err.message)
        : setConsumerError(err.message);
    }
  };


  // Function to stop the cron job
  
  
  

  const handleStopCron = async () => {
    if (
      window.confirm("Are you sure you want to stop the scheduled updates?")
    ) {
      try {
        setIsSubmittingCron(true);
        const response = await api.delete("/stop-cron", {
          data: { workspace_id: workspaceId, role },
        });
        const data = response.data;
        if (data.success) {
          // Refetch the cron schedule to confirm it was stopped
          await fetchCronSchedule();
          
          setCronSuccess("Scheduled updates stopped successfully.");
          setTimeout(() => {
            setCronSuccess(null);
          }, 2000);
        } else {
          throw new Error(data.error || "Failed to stop cron job");
        }
      } catch (err) {
        setCronError(err.message);
      } finally {
        setIsSubmittingCron(false);
      }
    }
  };


  // Function to fetch case details

  const handleViewDetails = async (
    caseData,
    index,
    isUpdatedDetails = false
  ) => {
    setIsLoadingDetails(true);
    setLoadingDetailId(index);
    setDetailsError(null);
    setActiveTab("overview");
    setCaseDetails(null);

    try {
      if (
        isUpdatedDetails &&
        (activeCourtTab === "high" ||
          activeCourtTab === "district" ||
          activeCourtTab === "cat" ||
          activeCourtTab === "nclt" ||
          activeCourtTab === "consumer")
      ) {
        // Directly set updated_details for all courts that support it
        setCaseDetails(caseData.updated_details);
        setShowCaseDetails(true);
      } else if (activeCourtTab === "supreme") {
        const diaryNumber = caseData.diaryNumber || caseData.cnr;
        const year =
          diaryNumber.split("/")[1] || new Date().getFullYear().toString();
        const diaryNumberOnly = diaryNumber.split("/")[0];

        const response = await fetch(
          `${
            import.meta.env.VITE_RESEARCH_API
          }legal-infrahive/supreme-court/case/`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ diaryNumber: diaryNumberOnly, year }),
          }
        );

        const data = await response.json();
        if (response.ok && !data.error) {
          await api.post(
            "/research-credit",
            {
              userId: JSON.parse(localStorage.getItem("user")).id,
            },
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );
          setCaseDetails(data);
          setShowCaseDetails(true);
        } else {
          throw new Error(
            data.error || "Failed to fetch Supreme Court case details"
          );
        }
      } else if (activeCourtTab === "high") {
        const response = await fetch(
          `${
            import.meta.env.VITE_RESEARCH_API
          }legal-infrahive/high-court/case/`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ cnr: caseData.cnr }),
          }
        );

        const data = await response.json();
        if (response.ok) {
          await api.post(
            "/research-credit",
            {
              userId: JSON.parse(localStorage.getItem("user")).id,
            },
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );
          setCaseDetails(data);
          setShowCaseDetails(true);
        } else {
          throw new Error(
            data.error || "Failed to fetch High Court case details"
          );
        }
      } else if (activeCourtTab === "district") {
        const response = await fetch(
          `${
            import.meta.env.VITE_RESEARCH_API
          }legal-infrahive/district-court/case/`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ cnr: caseData.cnr }),
          }
        );

        const data = await response.json();
        if (response.ok) {
          await api.post(
            "/research-credit",
            {
              userId: JSON.parse(localStorage.getItem("user")).id,
            },
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );
          setCaseDetails(data);
          setShowCaseDetails(true);
        } else {
          throw new Error(
            data.error || "Failed to fetch District Court case details"
          );
        }
      } else if (activeCourtTab === "cat") {
        // Extract diary info for CAT cases
        const diaryNumber =
          caseData.diaryNumber?.split("/")[0] ||
          caseData.original_data?.diary_number;
        const caseYear =
          caseData.diaryNumber?.split("/")[1] ||
          caseData.original_data?.case_year;
        const benchId = caseData.benchId || caseData.original_data?.bench_id;

        const response = await fetch(
          `${
            import.meta.env.VITE_RESEARCH_API
          }legal-infrahive/central-administrative-tribunal/diary-number/`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: import.meta.env.VITE_RESEARCH_AUTHORIZATION_KEY,
            },
            body: JSON.stringify({
              benchId: benchId,
              diaryNumber: diaryNumber,
              caseYear: caseYear,
            }),
          }
        );

        const data = await response.json();
        if (response.ok) {
          await api.post(
            "/research-credit",
            {
              userId: JSON.parse(localStorage.getItem("user")).id,
            },
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );
          setCaseDetails(data);
          setShowCaseDetails(true);
        } else {
          throw new Error(data.error || "Failed to fetch CAT case details");
        }
      } else if (activeCourtTab === "nclt") {
        const response = await fetch(
          `${
            import.meta.env.VITE_RESEARCH_API
          }legal-infrahive/national-company-law-tribunal/filing-number/`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: import.meta.env.VITE_RESEARCH_AUTHORIZATION_KEY,
            },
            body: JSON.stringify({
              filingNumber: caseData.filingNumber || caseData.caseId,
            }),
          }
        );

        const data = await response.json();
        if (response.ok) {
          await api.post(
            "/research-credit",
            {
              userId: JSON.parse(localStorage.getItem("user")).id,
            },
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );
          setCaseDetails(data);
          setShowCaseDetails(true);
        } else {
          throw new Error(data.error || "Failed to fetch NCLT case details");
        }
      } else if (activeCourtTab === "consumer") {
        // For Consumer Forum Details button, use the API
        const caseNumber = caseData.cnr || caseData.caseNumber;

        const response = await fetch(
          `${
            import.meta.env.VITE_RESEARCH_API
          }legal-infrahive/consumer-forum/case/`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: import.meta.env.VITE_RESEARCH_AUTHORIZATION_KEY,
            },
            body: JSON.stringify({ caseNumber }),
          }
        );

        const data = await response.json();
        if (response.ok) {
          await api.post(
            "/research-credit",
            {
              userId: JSON.parse(localStorage.getItem("user")).id,
            },
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );
          setCaseDetails(data);
          setShowCaseDetails(true);
        } else {
          throw new Error(
            data.error || "Failed to fetch Consumer Forum case details"
          );
        }
      } else {
        setShowCaseDetails(false);
      }
    } catch (err) {
      setDetailsError(err.message);
      setShowCaseDetails(true);
    } finally {
      setIsLoadingDetails(false);
      setLoadingDetailId(null);
    }
  };

  // Function to handle follow/unfollow in the modal (for Supreme Court)
  const handleFollowCase = async (caseData) => {
    const cnr = caseData.diaryNumber || caseData.cnr;
    if (followedCases[cnr]) {
      await handleUnfollow(caseData.caseId || cnr);
    } else {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_FOLLOW_API_URL}/api/follow-supreme-case`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              caseId: cnr,
              cnr,
              title: caseData.title,
              caseNumber: caseData.caseNumber,
              status: caseData.status,
            }),
          }
        );
        const data = await response.json();
        if (response.ok && data.success) {
          setFollowedCases((prev) => ({ ...prev, [cnr]: true }));
          setAllFollowedCases((prev) => ({
            ...prev,
            [cnr]: {
              caseId: cnr,
              cnr,
              title: caseData.title,
              caseNumber: caseData.caseNumber,
              status: caseData.status,
            },
          }));
        } else {
          throw new Error(data.error || "Failed to follow case");
        }
      } catch (err) {
        setDetailsError(err.message);
      }
    }
  };


  // Add this useEffect to fetch workspace users
useEffect(() => {
  if (role === "Owner" && workspaceId) {
    fetchWorkspaceUsers();
  }
}, [workspaceId, role]);

// Function to fetch workspace users
const fetchWorkspaceUsers = async () => {
  try {
    setIsLoadingUsers(true);
    setUsersError(null);
    
    const response = await fetch(`https://apilegalnod.infrahive.ai/legal-api/all-invites?workspaceId=${workspaceId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem("token")}`,
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Filter only accepted members and add current user (owner)
    const acceptedMembers = data.filter(invite => invite.status === "Accepted");
    
    // Get current user info from localStorage
    const currentUser = JSON.parse(localStorage.getItem("user"));
    
    // Create users array with accepted members + current user
    const users = [
      // Add current user (owner) first
      {
        id: currentUser.id,
        email: currentUser.email,
        role: currentUser.role,
        name: currentUser.name || currentUser.email.split('@')[0], // Use name or email prefix
        status: "Owner"
      },
      // Add accepted workspace members
      ...acceptedMembers.map(member => ({
        id: member.id,
        email: member.email,
        role: member.role,
        name: member.email.split('@')[0], // Use email prefix as name since API doesn't provide name
        status: member.status
      }))
    ];
    
    setWorkspaceUsers(users);
    // Pre-select all users by default
    setSelectedEmails(users.map(user => user.email));
    
  } catch (err) {
    setUsersError(err.message);
    console.error("Error fetching workspace users:", err);
  } finally {
    setIsLoadingUsers(false);
  }
};

// Function to handle email selection
const handleEmailSelection = (email) => {
  setSelectedEmails(prev => {
    if (prev.includes(email)) {
      return prev.filter(e => e !== email);
    } else {
      return [...prev, email];
    }
  });
};

// Function to select/deselect all emails
const handleSelectAllEmails = () => {
  if (selectedEmails.length === workspaceUsers.length) {
    setSelectedEmails([]);
  } else {
    setSelectedEmails(workspaceUsers.map(user => user.email));
  }
};

// Update your handleSetCronInterval function to include selected emails
const handleSetCronInterval = async (e) => {
  e.preventDefault();
  setCronError(null);
  setCronSuccess(null);
  setIsSubmittingCron(true);

  if (!cronDays || cronDays < 0) {
    setCronError("Please enter valid days (minimum 0).");
    setIsSubmittingCron(false);
    return;
  }

  if (selectedEmails.length === 0) {
    setCronError("Please select at least one email address for notifications.");
    setIsSubmittingCron(false);
    return;
  }

  try {
    console.log("Setting cron interval:", { 
      days: parseInt(cronDays), 
      hours: 0, 
      minutes: 0, 
      emails: selectedEmails 
    });
    
    const response = await api.post("/set-cron-interval", {
      days: parseInt(cronDays),
      hours: 0,
      minutes: 0,
      workspace_id: workspaceId,
      role,
      notification_emails: selectedEmails, // Add selected emails
    });
    
    console.log("Set cron response:", response.data);
    
    const data = response.data;
    if (data.success) {
      setCronSuccess(data.message);
      
      setTimeout(async () => {
        await fetchCronSchedule();
      }, 500);
      
      setTimeout(() => {
        setShowCronModal(false);
        setCronDays("");
        setCronHours("");
        setCronMinutes("");
        setCronSuccess(null);
      }, 2000);
    } else {
      throw new Error(data.error || "Failed to set cron interval");
    }
  } catch (err) {
    console.error("Error setting cron interval:", err);
    setCronError(err.message);
  } finally {
    setIsSubmittingCron(false);
  }
};

  
  // const handleSetCronInterval = async (e) => {
  //   e.preventDefault();
  //   setCronError(null);
  //   setCronSuccess(null);
  //   setIsSubmittingCron(true);

  //   if (!cronDays || cronDays < 0) {
  //     setCronError("Please enter valid days (minimum 0).");
  //     setIsSubmittingCron(false);
  //     return;
  //   }

  //   try {
  //     console.log("Setting cron interval:", { days: parseInt(cronDays), hours: 0, minutes: 0 }); // Debug log
      
  //     const response = await api.post("/set-cron-interval", {
  //       days: parseInt(cronDays),
  //       hours: 0, // Always set to 0
  //       minutes: 0, // Always set to 0
  //       workspace_id: workspaceId,
  //       role,
  //     });
      
  //     console.log("Set cron response:", response.data); // Debug log
      
  //     const data = response.data;
  //     if (data.success) {
  //       setCronSuccess(data.message);
        
  //       // Wait a moment before refetching to ensure server has processed the update
  //       setTimeout(async () => {
  //         await fetchCronSchedule();
  //       }, 500);
        
  //       setTimeout(() => {
  //         setShowCronModal(false);
  //         setCronDays("");
  //         setCronHours("");
  //         setCronMinutes("");
  //         setCronSuccess(null);
  //       }, 2000);
  //     } else {
  //       throw new Error(data.error || "Failed to set cron interval");
  //     }
  //   } catch (err) {
  //     console.error("Error setting cron interval:", err); // Debug log
  //     setCronError(err.message);
  //   } finally {
  //     setIsSubmittingCron(false);
  //   }
  // };

  // const formatDate = (dateString) => {
  //   if (!dateString) return "N/A";
  //   const date = new Date(dateString);
  //   return date.toLocaleDateString("en-US", {
  //     day: "numeric",
  //     month: "long",
  //     year: "numeric",
  //   });
  // };



  const formatDate = (dateString) => {
  console.log("Formatting date:", dateString, typeof dateString); // Add this line for debugging
  
  if (!dateString) return "N/A";
  
  // Handle empty strings, null, undefined, or "N/A" values
  if (dateString === "" || dateString === "N/A" || dateString === null || dateString === undefined) {
    return "N/A";
  }
  
  // Convert to string if it's not already
  const dateStr = String(dateString).trim();
  
  // If it's already "N/A" or empty after trimming
  if (dateStr === "" || dateStr.toLowerCase() === "n/a") {
    return "N/A";
  }
  
  try {
    let date;
    
    // Handle different date formats
    if (dateStr.includes('/')) {
      // Handle DD/MM/YYYY format (common in Indian courts)
      const parts = dateStr.split('/');
      if (parts.length === 3) {
        date = new Date(`${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`);
      } else {
        date = new Date(dateStr);
      }
    } else {
      // Handle YYYY-MM-DD format or other formats
      date = new Date(dateStr);
    }
    
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      console.warn(`Invalid date format: ${dateString}`);
      return dateString; // Return original string if can't parse
    }
    
    // Format the date
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "long", 
      year: "numeric",
    });
  } catch (error) {
    console.error(`Error formatting date: ${dateString}`, error);
    return dateString; // Return original string if error occurs
  }
};
  
  
  const closeDetailsPopup = () => setShowCaseDetails(false);

  const goBack = () => navigate(-1);

  // Define headers based on active tab
  const supremeHeaders = [
    "caseId",
    "title",
    "caseNumber",
    "diaryNumber",
    "petitioner",
    "respondent",
    "status",
    "court",
    "followedAt",
  ];
  const highHeaders = [
    "cnr",
    "type",
    "title",
    "caseNumber",
    "decisionDate",
    "followedAt",
    "updated_details",
  ];
  const districtHeaders = [
    "cnr",
    "name",
    "type",
    "title",
    "filing.year",
    "filing.number",
    "caseNumber",
    "decisionDate",
    "followedAt",
    "updated_details",
  ];
  const catHeaders = [
    "diaryNumber",
    "caseNumber",
    "applicantName",
    "defendantName",
    "advocateName",
    "partyName",
    "type",
    "benchId",
    "followedAt",
    "updated_details",
  ];
  const ncltHeaders = [
    "filingNumber",
    "caseNumber",
    "caseTitle",
    "bench",
    "courtNumber",
    "filedOn",
    "nextDate",
    "status",
    "caseType",
    "court",
    "followedAt",
    "updated_details",
  ];
  const consumerHeaders = [
    "cnr",
    "caseNumber",
    "commission",
    "complainant",
    "respondent",
    "status",
    "filingNumber",
    "filingDate",
    "nextHearing",
    "court",
    "followedAt",
    "updated_details",
  ];

  const headers =
    activeCourtTab === "supreme"
      ? supremeHeaders
      : activeCourtTab === "high"
      ? highHeaders
      : activeCourtTab === "district"
      ? districtHeaders
      : activeCourtTab === "cat"
      ? catHeaders
      : activeCourtTab === "nclt"
      ? ncltHeaders
      : consumerHeaders;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">Followed Cases</h1>
          <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
            {Object.keys(currentCases).length}
          </span>
        </div>
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-3 justify-end w-full">
            {role === "Owner" && (
              <>
                <button
                  onClick={() => setShowCronModal(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <ClockIcon size={18} />
                  <span>Schedule Updates</span>
                </button>
                <button
                  onClick={handleStopCron}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!cronSchedule || isSubmittingCron}
                >
                  <StopCircle size={18} />
                  <span>Stop Updates</span>
                </button>
                {/* <button
            onClick={handleUnfollowAll}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={Object.keys(currentCases).length === 0}
          >
            <Trash2 size={18} />
            <span>Unfollow All</span>
          </button> */}
              </>
            )}
            <button
              onClick={handleDownloadCSV}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={Object.keys(currentCases).length === 0}
            >
              <Download size={18} />
              <span>Download CSV</span>
            </button>
          </div>
          {role === "Owner" && (
            <div className="flex justify-end w-full">
              <div className="text-sm text-green-700 bg-green-100 px-3 py-1 rounded-md flex items-center space-x-2">
                {isLoadingCron ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                    <span>Loading schedule...</span>
                  </>
                ) : cronFetchError ? (
                  <span>No cron schedule set</span>
                ) : cronSchedule ? (
                  <>
                    <ClockIcon size={16} />
                    <span>
                      Updates scheduled every{" "}
                      {cronSchedule.days > 0
                        ? `${cronSchedule.days} day(s)`
                        : ""}
                      {cronSchedule.days === 0 ? "No schedule set" : ""}
                    </span>
                  </>
                ) : (
                  <span>No update schedule set</span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Search */}
      {!(activeCourtTab === "supreme"
        ? isLoadingAll
        : activeCourtTab === "high"
        ? isLoadingHigh
        : activeCourtTab === "district"
        ? isLoadingDistrict
        : activeCourtTab === "cat"
        ? isLoadingCat
        : activeCourtTab === "nclt"
        ? isLoadingNclt
        : isLoadingConsumer) &&
        Object.keys(currentCases).length > 0 && (
          <div className="mb-6">
            <div className="relative max-w-md">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search ${
                  activeCourtTab === "supreme"
                    ? "Supreme Court"
                    : activeCourtTab === "high"
                    ? "High Court"
                    : activeCourtTab === "district"
                    ? "District Court"
                    : activeCourtTab === "cat"
                    ? "CAT"
                    : activeCourtTab === "nclt"
                    ? "NCLT"
                    : "Consumer Forum"
                } followed cases...`}
                className="w-full border border-gray-300 rounded-md pl-10 p-3 focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-sm"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-500" />
              </div>
            </div>
          </div>
        )}

      {/* Tabs */}
      <div className="mb-6 border-b">
        <div className="flex overflow-x-auto">
          <button
            className={`px-4 py-2 font-medium text-sm ${
              activeCourtTab === "supreme"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveCourtTab("supreme")}
          >
            Supreme Court
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm ${
              activeCourtTab === "high"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveCourtTab("high")}
          >
            High Court
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm ${
              activeCourtTab === "district"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveCourtTab("district")}
          >
            District Court
          </button>
          {/* <button
            className={`px-4 py-2 font-medium text-sm ${
              activeCourtTab === "cat"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveCourtTab("cat")}
          >
            CAT
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm ${
              activeCourtTab === "nclt"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveCourtTab("nclt")}
          >
            NCLT
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm ${
              activeCourtTab === "consumer"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveCourtTab("consumer")}
          >
            Consumer Forum
          </button> */}
        </div>
      </div>

      {/* Error Message */}
      {(activeCourtTab === "supreme"
        ? allError
        : activeCourtTab === "high"
        ? highError
        : activeCourtTab === "district"
        ? districtError
        : activeCourtTab === "cat"
        ? catError
        : activeCourtTab === "nclt"
        ? ncltError
        : consumerError) && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <p className="text-sm text-red-700">
            {activeCourtTab === "supreme"
              ? allError
              : activeCourtTab === "high"
              ? highError
              : activeCourtTab === "district"
              ? districtError
              : activeCourtTab === "cat"
              ? catError
              : activeCourtTab === "nclt"
              ? ncltError
              : consumerError}
          </p>
        </div>
      )}

      {/* Loading State */}
      {(activeCourtTab === "supreme"
        ? isLoadingAll
        : activeCourtTab === "high"
        ? isLoadingHigh
        : activeCourtTab === "district"
        ? isLoadingDistrict
        : activeCourtTab === "cat"
        ? isLoadingCat
        : activeCourtTab === "nclt"
        ? isLoadingNclt
        : isLoadingConsumer) && (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Case List */}
      {!(activeCourtTab === "supreme"
        ? isLoadingAll
        : activeCourtTab === "high"
        ? isLoadingHigh
        : activeCourtTab === "district"
        ? isLoadingDistrict
        : activeCourtTab === "cat"
        ? isLoadingCat
        : activeCourtTab === "nclt"
        ? isLoadingNclt
        : isLoadingConsumer) && Object.keys(currentCases).length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <div className="flex flex-col items-center justify-center py-8">
            <div className="bg-blue-100 p-4 rounded-full mb-4">
              <X size={48} className="text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold mb-2">
              No Followed{" "}
              {activeCourtTab === "supreme"
                ? "Supreme Court"
                : activeCourtTab === "high"
                ? "High Court"
                : activeCourtTab === "district"
                ? "District Court"
                : activeCourtTab === "cat"
                ? "CAT"
                : activeCourtTab === "nclt"
                ? "NCLT"
                : "Consumer Forum"}{" "}
              Cases
            </h2>
            <p className="text-gray-600 mb-6 max-w-md">
              You haven't followed any{" "}
              {activeCourtTab === "supreme"
                ? "Supreme Court"
                : activeCourtTab === "high"
                ? "High Court"
                : activeCourtTab === "district"
                ? "District Court"
                : activeCourtTab === "cat"
                ? "CAT"
                : activeCourtTab === "nclt"
                ? "NCLT"
                : "Consumer Forum"}{" "}
              cases yet.
            </p>
          </div>
        </div>
      ) : !(activeCourtTab === "supreme"
          ? isLoadingAll
          : activeCourtTab === "high"
          ? isLoadingHigh
          : activeCourtTab === "district"
          ? isLoadingDistrict
          : activeCourtTab === "cat"
          ? isLoadingCat
          : activeCourtTab === "nclt"
          ? isLoadingNclt
          : isLoadingConsumer) && sortedCases.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 text-yellow-700">
          No{" "}
          {activeCourtTab === "supreme"
            ? "Supreme Court"
            : activeCourtTab === "high"
            ? "High Court"
            : activeCourtTab === "district"
            ? "District Court"
            : activeCourtTab === "cat"
            ? "CAT"
            : activeCourtTab === "nclt"
            ? "NCLT"
            : "Consumer Forum"}{" "}
          cases match your search criteria. Try a different search term.
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  {headers.map((header, headerIndex) => (
                    <th
                      key={`header-${headerIndex}`}
                      onClick={() => requestSort(header.split(".")[0])}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200"
                    >
                      <div className="flex items-center space-x-1">
                        <span>
                          {header === "filing.year"
                            ? "filing year"
                            : header === "filing.number"
                            ? "filing number"
                            : header.split(".").pop()}
                        </span>
                        <span>{getSortIndicator(header.split(".")[0])}</span>
                      </div>
                    </th>
                  ))}
                  {/* REMOVE the condition activeCourtTab !== "cat" - Show Actions for ALL courts */}
                  <th
                    key="actions-header"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                  {role === "Owner" && (
                    <th
                      key="unfollow-header"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
                    >
                      Unfollow
                    </th>
                  )}
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {sortedCases.map(([id, caseData], index) => (
                  <tr
                    key={`case-${id}-${index}`}
                    className="hover:bg-blue-50 transition-colors"
                  >
                    {headers.map((header, headerIndex) => {
                      const keys = header.split(".");
                      let value =
                        activeCourtTab === "consumer"
                          ? caseData // Changed from caseData.details to caseData since we restructured the data
                          : caseData;
                      for (const key of keys) {
                        value = value ? value[key] : null;
                      }
                      return (
                        <td
                          key={`${id}-${header}-${headerIndex}`}
                          className="px-6 py-4 text-sm text-gray-700"
                        >
                          {header === "updated_details" &&
                          (activeCourtTab === "high" ||
                            activeCourtTab === "district" ||
                            activeCourtTab === "cat" ||
                            activeCourtTab === "consumer") ? (
                            // Show View button for High Court, District Court, CAT, and Consumer Forum when updated_details exists
                            value ? (
                              <button
                                onClick={() =>
                                  handleViewDetails(caseData, index, true)
                                } // Pass true to indicate updated_details
                                className="bg-green-100 text-green-700 w-24 hover:bg-green-200 px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1"
                                disabled={loadingDetailId === index}
                              >
                                {loadingDetailId === index ? (
                                  <div className="flex items-center space-x-1">
                                    <span>Loading..</span>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-700"></div>
                                  </div>
                                ) : (
                                  <>
                                    <span>View</span>
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
                                  </>
                                )}
                              </button>
                            ) : (
                              "N/A"
                            )
                          ) : header === "updated_details" &&
                            activeCourtTab === "nclt" ? (
                            // For NCLT, always show View button regardless of data
                            <button
                              onClick={() =>
                                handleViewDetails(caseData, index, true)
                              } // Pass true to indicate updated_details
                              className="bg-green-100 text-green-700 w-24 hover:bg-green-200 px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1"
                              disabled={loadingDetailId === index}
                            >
                              {loadingDetailId === index ? (
                                <div className="flex items-center space-x-1">
                                  <span>Loading..</span>
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-700"></div>
                                </div>
                              ) : (
                                <>
                                  <span>View</span>
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
                                </>
                              )}
                            </button>
                          ) : header === "status" ||
                            header === "status.stage" ? (
                            <StatusBadge
                              status={
                                activeCourtTab === "consumer"
                                  ? caseData.status // Changed from caseData.details?.status?.stage to caseData.status
                                  : caseData.status
                              }
                            />
                          ) : header === "followedAt" ||
                            header === "filing.date" ||
                            header === "status.nextHearing" ||
                            header === "decisionDate" ||
                            header === "filedOn" ||
                            header === "nextDate" ||
                            header === "filingDate" || // Added filingDate for Consumer Forum
                            header === "nextHearing" ? ( // Added nextHearing for Consumer Forum
                            formatDate(value)
                          ) : Array.isArray(value) ? (
                            value.join(", ") || "N/A"
                          ) : (
                            value || "N/A"
                          )}
                        </td>
                      );
                    })}

                    {/* Actions Column - Now shows for ALL courts including CAT */}
                    <td
                      key={`actions-${id}-${index}`}
                      className="px-6 py-4 text-sm"
                    >
                      <button
                        onClick={() => handleViewDetails(caseData, index)}
                        className="bg-blue-100 text-blue-700 w-24 hover:bg-blue-200 px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1"
                        disabled={loadingDetailId === index}
                      >
                        {loadingDetailId === index ? (
                          <div className="flex items-center space-x-1">
                            <span>Loading..</span>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700"></div>
                          </div>
                        ) : (
                          <>
                            <span>Details</span>
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
                          </>
                        )}
                      </button>
                    </td>

                    {/* Unfollow Column */}
                    {role === "Owner" && (
                      <td
                        key={`unfollow-${id}-${index}`}
                        className="px-6 py-4 text-sm"
                      >
                        <button
                          onClick={() => handleUnfollow(id)}
                          className="bg-red-100 text-red-700 hover:bg-red-200 px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1"
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
        </div>
      )}

      {/* Cron Modal */}
      {/* {showCronModal && role === "Owner" && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div className="flex justify-between items-center border-b p-4">
              <h3 className="text-lg font-semibold">Schedule Case Updates</h3>
              <button
                onClick={() => {
                  setShowCronModal(false);
                  setCronDays(cronSchedule?.days?.toString() || "");
                  // Reset hours and minutes to empty strings in state (they'll be 0 in payload)
                  setCronHours("");
                  setCronMinutes("");
                  setCronError(null);
                  setCronSuccess(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSetCronInterval} className="p-4">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Days
                </label>
                <input
                  type="number"
                  value={cronDays}
                  onChange={(e) => setCronDays(e.target.value)}
                  placeholder="Enter days (e.g., 1)"
                  className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  min="0"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Updates will be scheduled to run every specified number of
                  days
                </p>
              </div>

              {cronError && <ErrorMessage message={cronError} />}
              {cronSuccess && (
                <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-4">
                  <p className="text-sm text-green-700">{cronSuccess}</p>
                </div>
              )}
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCronModal(false);
                    setCronDays(cronSchedule?.days?.toString() || "");
                    setCronHours("");
                    setCronMinutes("");
                    setCronError(null);
                    setCronSuccess(null);
                  }}
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSubmittingCron}
                >
                  {isSubmittingCron ? (
                    <>
                      <span>Submitting...</span>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    </>
                  ) : (
                    <>
                      <ClockIcon size={18} />
                      <span>Schedule</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )} */}

      {showCronModal && role === "Owner" && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
      <div className="flex justify-between items-center border-b p-4">
        <h3 className="text-lg font-semibold">Schedule Case Updates</h3>
        <button
          onClick={() => {
            setShowCronModal(false);
            setCronDays(cronSchedule?.days?.toString() || "");
            setCronHours("");
            setCronMinutes("");
            setCronError(null);
            setCronSuccess(null);
            setShowEmailDropdown(false);
          }}
          className="text-gray-500 hover:text-gray-700"
        >
          <X size={20} />
        </button>
      </div>
      
      <form onSubmit={handleSetCronInterval} className="p-4">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Days
          </label>
          <input
            type="number"
            value={cronDays}
            onChange={(e) => setCronDays(e.target.value)}
            placeholder="Enter days (e.g., 1)"
            className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
            min="0"
          />
          <p className="text-xs text-gray-500 mt-1">
            Updates will be scheduled to run every specified number of days
          </p>
        </div>

        {/* Email Selection Field */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notification Recipients
          </label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowEmailDropdown(!showEmailDropdown)}
              className="w-full border border-gray-300 rounded-md p-2 text-left bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 flex justify-between items-center"
              disabled={isLoadingUsers}
            >
              <span className="text-sm">
                {isLoadingUsers ? (
                  "Loading users..."
                ) : selectedEmails.length === 0 ? (
                  "Select email addresses"
                ) : selectedEmails.length === 1 ? (
                  selectedEmails[0]
                ) : (
                  `${selectedEmails.length} emails selected`
                )}
              </span>
              <svg
                className={`w-4 h-4 transition-transform ${
                  showEmailDropdown ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {showEmailDropdown && !isLoadingUsers && (
              <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg mt-1 max-h-48 overflow-y-auto">
                {/* Select All Option */}
                <div className="p-2 border-b">
                  <label className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                    <input
                      type="checkbox"
                      checked={
                        selectedEmails.length === workspaceUsers.length &&
                        workspaceUsers.length > 0
                      }
                      onChange={handleSelectAllEmails}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Select All ({workspaceUsers.length})
                    </span>
                  </label>
                </div>

                {/* Individual Email Options */}
                {workspaceUsers.map((user) => (
                  <div key={user.id} className="p-2">
                    <label className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                      <input
                        type="checkbox"
                        checked={selectedEmails.includes(user.email)}
                        onChange={() => handleEmailSelection(user.email)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-900">{user.name}</span>
                        <span className="text-xs text-gray-500">{user.email}</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-blue-600">{user.role}</span>
                          {user.status === "Owner" && (
                            <span className="text-xs bg-green-100 text-green-800 px-1 rounded">
                              Current User
                            </span>
                          )}
                          {user.status === "Accepted" && (
                            <span className="text-xs bg-blue-100 text-blue-800 px-1 rounded">
                              Accepted
                            </span>
                          )}
                        </div>
                      </div>
                    </label>
                  </div>
                ))}

                {workspaceUsers.length === 0 && (
                  <div className="p-3 text-sm text-gray-500 text-center">
                    No accepted members found in this workspace
                  </div>
                )}
              </div>
            )}
          </div>

          {usersError && (
            <p className="text-xs text-red-600 mt-1">{usersError}</p>
          )}

          <p className="text-xs text-gray-500 mt-1">
            Select users who will receive email notifications when case updates are found
          </p>

          {/* Selected Emails Preview */}
          {selectedEmails.length > 0 && (
            <div className="mt-2">
              <p className="text-xs text-gray-600 mb-1">Selected recipients:</p>
              <div className="flex flex-wrap gap-1">
                {selectedEmails.map((email) => (
                  <span
                    key={email}
                    className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                  >
                    {email}
                    <button
                      type="button"
                      onClick={() => handleEmailSelection(email)}
                      className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {cronError && <ErrorMessage message={cronError} />}
        {cronSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-4">
            <p className="text-sm text-green-700">{cronSuccess}</p>
          </div>
        )}
        
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => {
              setShowCronModal(false);
              setCronDays(cronSchedule?.days?.toString() || "");
              setCronHours("");
              setCronMinutes("");
              setCronError(null);
              setCronSuccess(null);
              setShowEmailDropdown(false);
            }}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmittingCron || selectedEmails.length === 0}
          >
            {isSubmittingCron ? (
              <>
                <span>Submitting...</span>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              </>
            ) : (
              <>
                <ClockIcon size={18} />
                <span>Schedule</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  </div>
)}

      {/* Case Details Modal */}
      {showCaseDetails && activeCourtTab === "district" && (
        <DistrictCaseDetailsModal
          caseDetails={caseDetails}
          isLoading={isLoadingDetails}
          error={detailsError}
          onClose={closeDetailsPopup}
        />
      )}

      {showCaseDetails && activeCourtTab === "supreme" && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-screen overflow-y-auto">
            {/* Modal Header */}
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

            {/* Modal Content */}
            <div className="p-4">
              {isLoadingDetails ? (
                <div className="flex justify-center items-center py-20">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
                </div>
              ) : detailsError ? (
                <ErrorMessage message={detailsError} />
              ) : caseDetails ? (
                <div>
                  {/* Case Title Section */}
                  <div className="mb-6">
                    <div className="flex justify-between items-start">
                      <h2 className="text-xl font-bold mb-2">
                        {caseDetails.title || "N/A"}
                      </h2>
                      <button
                        className={`flex items-center space-x-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors shadow-sm ${
                          followedCases[caseDetails.cnr]
                            ? "text-yellow-700 bg-yellow-100 hover:bg-yellow-200"
                            : "text-gray-700 bg-gray-100 hover:bg-gray-200"
                        }`}
                        onClick={() =>
                          handleFollowCase({
                            caseId: caseDetails.cnr,
                            cnr: caseDetails.cnr,
                            title: caseDetails.title,
                            caseNumber: caseDetails.details?.caseNumber,
                            status: caseDetails.status?.stage,
                          })
                        }
                      >
                        <Star
                          size={16}
                          className={
                            followedCases[caseDetails.cnr]
                              ? "text-yellow-600 fill-yellow-500"
                              : ""
                          }
                        />
                        <span>
                          {followedCases[caseDetails.cnr]
                            ? "Following"
                            : "Follow"}
                        </span>
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2 items-center">
                      <span className="text-gray-600 text-sm">
                        CNR: {caseDetails.cnr || "N/A"}
                      </span>
                      <span className="text-gray-600 text-sm mx-2">|</span>
                      <span className="text-gray-600 text-sm">
                        Filed: {formatDate(caseDetails.details?.filedOn)}
                      </span>
                      <span className="text-gray-600 text-sm mx-2">|</span>
                      <StatusBadge status={caseDetails.status?.stage} />
                    </div>
                  </div>

                  {/* Tabs Navigation */}
                  <div className="border-b mb-4">
                    <div className="flex overflow-x-auto">
                      {[
                        "overview",
                        "parties",
                        "history",
                        "orders",
                        "defects",
                      ].map((tab) => (
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

                  {/* Tab Content */}
                  <div className="mb-4">
                    {activeTab === "overview" && (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h3 className="text-sm font-medium text-gray-500 mb-1">
                              Case Number
                            </h3>
                            <p className="text-sm">
                              {caseDetails.details?.caseNumber || "N/A"}
                            </p>
                          </div>
                          <div>
                            <h3 className="text-sm font-medium text-gray-500 mb-1">
                              Category
                            </h3>
                            <p className="text-sm">
                              {caseDetails.details?.category || "N/A"}
                            </p>
                          </div>
                        </div>

                        <div>
                          <h3 className="font-medium mb-2">
                            Status Information
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-md">
                            <div>
                              <p className="text-sm text-gray-500">
                                Current Status
                              </p>
                              <p className="text-sm">
                                {caseDetails.status?.status || "N/A"}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">
                                Last Listed On
                              </p>
                              <p className="text-sm">
                                {formatDate(caseDetails.status?.lastListedOn)}
                              </p>
                            </div>
                            {caseDetails.status?.nextDate && (
                              <div>
                                <p className="text-sm text-gray-500">
                                  Next Date
                                </p>
                                <p className="text-sm">
                                  {formatDate(caseDetails.status?.nextDate)}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        {caseDetails.history &&
                          caseDetails.history.length > 0 && (
                            <div>
                              <h3 className="font-medium mb-2">
                                Recent Hearing
                              </h3>
                              <div className="bg-gray-50 p-4 rounded-md">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <p className="text-sm text-gray-500">
                                      Date
                                    </p>
                                    <p className="text-sm">
                                      {formatDate(caseDetails.history[0].date)}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-500">
                                      Type
                                    </p>
                                    <p className="text-sm">
                                      {caseDetails.history[0].type || "N/A"}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-500">
                                      Stage
                                    </p>
                                    <p className="text-sm">
                                      {caseDetails.history[0].stage || "N/A"}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-500">
                                      Purpose
                                    </p>
                                    <p className="text-sm">
                                      {caseDetails.history[0].purpose || "N/A"}
                                    </p>
                                  </div>
                                  <div className="col-span-2">
                                    <p className="text-sm text-gray-500">
                                      Bench
                                    </p>
                                    <p className="text-sm">
                                      {caseDetails.history[0].judge || "N/A"}
                                    </p>
                                  </div>
                                  <div className="col-span-2">
                                    <p className="text-sm text-gray-500">
                                      Remarks
                                    </p>
                                    <p className="text-sm font-medium">
                                      {caseDetails.history[0].remarks || "N/A"}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                      </div>
                    )}

                    {activeTab === "parties" && (
                      <div className="space-y-6">
                        <div>
                          <h3 className="font-medium mb-2">Petitioners</h3>
                          <ul className="bg-gray-50 p-4 rounded-md space-y-2">
                            {caseDetails.parties?.petitioners?.map(
                              (petitioner, index) => (
                                <li key={index} className="text-sm">
                                  {petitioner || "N/A"}
                                </li>
                              )
                            ) || <li className="text-sm">N/A</li>}
                          </ul>
                        </div>

                        <div>
                          <h3 className="font-medium mb-2">Respondents</h3>
                          <ul className="bg-gray-50 p-4 rounded-md space-y-2">
                            {caseDetails.parties?.respondents?.map(
                              (respondent, index) => (
                                <li key={index} className="text-sm">
                                  {respondent || "N/A"}
                                </li>
                              )
                            ) || <li className="text-sm">N/A</li>}
                          </ul>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h3 className="font-medium mb-2">
                              Petitioner Advocates
                            </h3>
                            <p className="bg-gray-50 p-4 rounded-md text-sm">
                              {caseDetails.parties?.petitionerAdvocates ||
                                "N/A"}
                            </p>
                          </div>
                          <div>
                            <h3 className="font-medium mb-2">
                              Respondent Advocates
                            </h3>
                            <p className="bg-gray-50 p-4 rounded-md text-sm">
                              {caseDetails.parties?.respondentAdvocates ||
                                "N/A"}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === "history" && (
                      <div>
                        <h3 className="font-medium mb-4">Case History</h3>
                        <div className="overflow-x-auto">
                          <table className="min-w-full border-collapse">
                            <thead>
                              <tr className="bg-gray-100">
                                <th className="border border-black p-2 text-left text-xs font-medium text-black">
                                  Date
                                </th>
                                <th className="border border-black p-2 text-left text-xs font-medium text-black">
                                  Type
                                </th>
                                <th className="border border-black p-2 text-left text-xs font-medium text-black">
                                  Stage
                                </th>
                                <th className="border border-black p-2 text-left text-xs font-medium text-black">
                                  Purpose
                                </th>
                                <th className="border border-black p-2 text-left text-xs font-medium text-black">
                                  Judge
                                </th>
                                <th className="border border-black p-2 text-left text-xs font-medium text-black">
                                  Remarks
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {caseDetails.history?.map((item, index) => (
                                <tr
                                  key={index}
                                  className="hover:bg-blue-100 even:bg-[#FEFCE8] odd:bg-white"
                                >
                                  <td className="border border-black p-2 text-sm">
                                    {formatDate(item.date)}
                                  </td>
                                  <td className="border border-black p-2 text-sm">
                                    {item.type || "N/A"}
                                  </td>
                                  <td className="border border-black p-2 text-sm">
                                    {item.stage || "N/A"}
                                  </td>
                                  <td className="border border-black p-2 text-sm">
                                    {item.purpose || "N/A"}
                                  </td>
                                  <td className="border border-black p-2 text-sm">
                                    {item.judge || "N/A"}
                                  </td>
                                  <td className="border border-black p-2 text-sm">
                                    {item.remarks || "N/A"}
                                  </td>
                                </tr>
                              )) || (
                                <tr>
                                  <td
                                    colSpan={6}
                                    className="border border-black p-2 text-sm text-center"
                                  >
                                    No history available
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {activeTab === "orders" && (
                      <div>
                        <h3 className="font-medium mb-4">Orders</h3>
                        {caseDetails.orders && caseDetails.orders.length > 0 ? (
                          <div className="space-y-3">
                            {caseDetails.orders.map((order, index) => (
                              <div
                                key={index}
                                className="flex justify-between items-center p-3 bg-gray-50 rounded-md"
                              >
                                <span className="text-sm font-medium">
                                  {formatDate(order.date)}
                                </span>
                                <a
                                  href={order.url}
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

                    {activeTab === "defects" && (
                      <div>
                        <h3 className="font-medium mb-4">Defects</h3>
                        {caseDetails.defects &&
                        caseDetails.defects.length > 0 ? (
                          <div className="overflow-x-auto">
                            <table className="min-w-full border-collapse">
                              <thead>
                                <tr className="bg-gray-100">
                                  <th className="border border-black p-2 text-left text-xs font-medium text-black">
                                    S.No
                                  </th>
                                  <th className="border border-black p-2 text-left text-xs font-medium text-black">
                                    Defect
                                  </th>
                                  <th className="border border-black p-2 text-left text-xs font-medium text-black">
                                    Remarks
                                  </th>
                                  <th className="border border-black p-2 text-left text-xs font-medium text-black">
                                    Notification Date
                                  </th>
                                  <th className="border border-black p-2 text-left text-xs font-medium text-black">
                                    Removal Date
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {caseDetails.defects.map((defect, index) => (
                                  <tr
                                    key={index}
                                    className="hover:bg-blue-100 even:bg-[#FEFCE8] odd:bg-white"
                                  >
                                    <td className="border border-black p-2 text-sm">
                                      {defect.serialNumber || "N/A"}
                                    </td>
                                    <td className="border border-black p-2 text-sm">
                                      {defect.default || "N/A"}
                                    </td>
                                    <td className="border border-black p-2 text-sm">
                                      {defect.remarks || "N/A"}
                                    </td>
                                    <td className="border border-black p-2 text-sm">
                                      {formatDate(defect.notificationDate)}
                                    </td>
                                    <td className="border border-black p-2 text-sm">
                                      {formatDate(defect.removalDate)}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 text-yellow-700">
                            No defects found for this case.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ) : null}
            </div>

            {/* Modal Footer */}
            <div className="border-t p-4 flex justify-end">
              <button
                onClick={closeDetailsPopup}
                className="bg-gray-100 text-gray-700 hover:bg-gray-200 px-4 py-2 rounded-md transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showCaseDetails && activeCourtTab === "high" && (
        <HighCaseDetailsModal
          caseDetails={caseDetails}
          isLoadingDetails={isLoadingDetails}
          detailsError={detailsError}
          closeDetailsPopup={closeDetailsPopup}
        />
      )}

      {showCaseDetails && activeCourtTab === "nclt" && (
        <NcltCaseDetailsModal
          caseDetails={caseDetails}
          isLoading={isLoadingDetails}
          error={detailsError}
          onClose={closeDetailsPopup}
        />
      )}

      {showCaseDetails && activeCourtTab === "consumer" && (
        <ConsumerForumCaseDetailsModal
          caseDetails={caseDetails}
          isLoading={isLoadingDetails}
          error={detailsError}
          onClose={closeDetailsPopup}
        />
      )}

      {showCaseDetails && activeCourtTab === "cat" && (
        <CatCaseDetailsModal
          caseDetails={caseDetails}
          isLoading={isLoadingDetails}
          error={detailsError}
          onClose={closeDetailsPopup}
          onRetry={() => {
            if (selectedCase) {
              handleViewDetails(selectedCase, loadingDetailId);
            }
          }}
          handleFollowCase={(caseData) => {
            // You can implement follow functionality here if needed
            console.log("Follow case:", caseData);
          }}
          isCaseFollowed={(diaryNumber) => {
            // You can implement check if case is followed here if needed
            return false;
          }}
          followLoading={false}
        />
      )}
    </div>
  );
};

export default CartPage;
