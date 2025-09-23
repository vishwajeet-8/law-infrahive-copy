


import React, { useState, useCallback } from "react";
import {
  Search,
  Calendar,
  FileText,
  Clock,
  User,
  Briefcase,
  Flag,
  X,
  ExternalLink,
  AlertTriangle,
  Star,
} from "lucide-react";
import api from "@/utils/api";
import { useParams } from "react-router-dom";

const ConsumerForumCaseDetails = () => {
  const { workspaceId } = useParams();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const role = user?.role || "Member";
  const isOwner = role === "Owner";
  const [caseNumber, setCaseNumber] = useState("");
  const [caseDetails, setCaseDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  }, []);

  const fetchCaseDetails = useCallback(async () => {
    if (!caseNumber.trim()) {
      setError("Please enter a valid case number");
      return;
    }

    setIsLoading(true);
    setError(null);
    setCaseDetails(null);
    setIsFollowing(false);

    try {
      const response = await api.post(
        `${import.meta.env.VITE_RESEARCH_API}legal-infrahive/consumer-forum/case/`,
        { caseNumber },
        {
          headers: {
            Authorization: import.meta.env.VITE_RESEARCH_AUTHORIZATION_KEY,
          },
        }
      );
      const data = response.data;
      await api.post(
        "/research-credit",
        {
          userId: JSON.parse(localStorage.getItem("user")).id,
          usage: data?.length === 0 ? 1 : data?.length,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setCaseDetails(data);
      setSearchPerformed(true);

      try {
        const followCheckResponse = await api.get(`/get-followed-cases-by-court`, {
          params: { court: "Consumer Forum", workspaceId },
        });
        const followData = followCheckResponse.data;

        if (followData.success && followData.cases) {
          const isAlreadyFollowed = followData.cases.some(
            (c) =>
              c.cnr === data.caseNumber ||
              c.case_id === data.caseNumber ||
              c.case_data?.caseNumber === data.caseNumber
          );
          setIsFollowing(isAlreadyFollowed);
          console.log("Follow check result:", isAlreadyFollowed);
          console.log("Followed cases:", followData.cases);
        }
      } catch (followErr) {
        console.error("Error checking follow status:", followErr);
      }
    } catch (err) {
      const message =
        err.response?.data?.error ||
        err.message ||
        "An error occurred during search";
      setError(message);
      setCaseDetails(null);
      setSearchPerformed(true);
    } finally {
      setIsLoading(false);
    }
  }, [caseNumber, workspaceId]);

  const handleFollowToggle = async () => {
    if (!isOwner || !caseDetails) return;

    setFollowLoading(true);
    const caseId = caseDetails.caseNumber;

    // Optimistic update
    const originalIsFollowing = isFollowing;
    setIsFollowing(!isFollowing);

    try {
      if (isFollowing) {
        const response = await api.delete("/unfollow-case", {
          data: {
            caseId: caseId,
            court: "Consumer Forum",
          },
        });
        const data = response.data;

        if (!data.success) {
          throw new Error(data.error || "Failed to unfollow case");
        }
        showToast(`Case ${caseId} unfollowed successfully`);
      } else {
        const followData = {
          cnr: caseDetails.caseNumber,
          caseId: caseDetails.caseNumber,
          caseData: {
            caseNumber: caseDetails.caseNumber,
            commission: caseDetails.commission,
            status: caseDetails.status?.stage,
            filingNumber: caseDetails.filing?.number,
            filingDate: caseDetails.filing?.date,
            complainant: caseDetails.parties?.complainant?.join(", ") || "N/A",
            respondent: caseDetails.parties?.respondent?.join(", ") || "N/A",
            nextHearing: caseDetails.status?.nextHearing,
            purpose: caseDetails.status?.purpose,
            details: caseDetails,
          },
          court: "Consumer Forum",
          workspace_id: workspaceId,
        };
        const response = await api.post("/follow-case", followData);
        const data = response.data;

        if (!data.success) {
          throw new Error(data.error || "Failed to follow case");
        }
        showToast(`Case ${caseId} followed successfully`);
      }
    } catch (err) {
      console.error("Follow toggle error:", err);
      setIsFollowing(originalIsFollowing); // Revert optimistic update
      const message =
        err.response?.data?.error ||
        err.message ||
        "Failed to toggle follow state";
      setError(message);
      setTimeout(() => setError(null), 5000);
    } finally {
      setFollowLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchCaseDetails();
  };

  const handleRetry = () => {
    fetchCaseDetails();
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "N/A";
      return date.toLocaleDateString("en-US", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch (error) {
      return "N/A";
    }
  };

  const safeRender = (data) => {
    if (data === null || data === undefined) return "N/A";
    if (typeof data === "object") return JSON.stringify(data);
    return data;
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">
        Consumer Forum - Case Details
      </h2>
      <div className="bg-white p-6 rounded-md border border-gray-200 max-w-xl shadow-sm">
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="case-number"
                className="block text-sm font-medium mb-1 text-gray-700"
              >
                Case Number
              </label>
              <input
                type="text"
                id="case-number"
                value={caseNumber}
                onChange={(e) => setCaseNumber(e.target.value)}
                className="w-full border border-gray-200 rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-blue-600"
                placeholder="e.g. DC/83/CC/332/2024"
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                Enter the complete case number (Example:- DC/83/CC/332/2024)
              </p>
            </div>
            <div className="flex justify-between pt-2">
              <button
                type="button"
                onClick={() => {
                  setCaseNumber("");
                  setCaseDetails(null);
                  setSearchPerformed(false);
                  setError(null);
                  setIsFollowing(false);
                  setToast(null);
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Clear
              </button>
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                disabled={isLoading || !caseNumber.trim()}
              >
                {isLoading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-r-transparent"></div>
                    <span>Searching...</span>
                  </>
                ) : (
                  <>
                    <Search size={16} />
                    <span>Get Case Details</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {error && (
        <div className="mt-6 bg-red-50 border border-red-200 rounded-md">
          <div className="p-4 flex items-start">
            <AlertTriangle className="h-5 w-5 mr-3 flex-shrink-0 text-red-600" />
            <div className="flex-1 text-red-700">
              <p className="font-medium">{error}</p>
              {error.includes("403") && (
                <p className="mt-1 text-sm">
                  This could be due to an expired session or authentication issue.
                </p>
              )}
              <div className="mt-3">
                <button
                  onClick={handleRetry}
                  className="bg-red-100 text-red-800 px-3 py-1 rounded-md text-sm hover:bg-red-200 transition-colors"
                >
                  Retry Request
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="mt-6 p-4 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-2 text-gray-600">Fetching case details...</p>
        </div>
      )}

      {caseDetails && (
        <div className="mt-6">
          <div className="bg-white rounded-md border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-gray-50 p-4 border-b border-gray-200">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                <div>
                  <h3 className="text-lg font-semibold">
                    {caseDetails.caseNumber || "N/A"}
                  </h3>
                  <p className="text-gray-600 text-sm mt-1">
                    Commission: {caseDetails.commission || "N/A"}
                  </p>
                </div>
                <div className="mt-2 md:mt-0 flex items-center gap-4">
                  {caseDetails.status && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {caseDetails.status.stage || "UNKNOWN"}
                    </span>
                  )}
                  {isOwner && (
                    <button
                      onClick={handleFollowToggle}
                      disabled={followLoading}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        isFollowing
                          ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                      data-testid="follow-button"
                    >
                      {followLoading ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"></div>
                      ) : (
                        <>
                          <Star
                            size={16}
                            className={
                              isFollowing ? "text-yellow-600 fill-yellow-500" : ""
                            }
                          />
                          <span>{isFollowing ? "Following" : "Follow"}</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                  <FileText size={16} className="mr-2" />
                  Filing Information
                </h4>
                <div className="space-y-2">
                  <div className="flex">
                    <span className="text-gray-500 w-32">Filing Number:</span>
                    <span>{caseDetails.filing?.number || "N/A"}</span>
                  </div>
                  <div className="flex">
                    <span className="text-gray-500 w-32">Filing Date:</span>
                    <span>{formatDate(caseDetails.filing?.date)}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                  <Flag size={16} className="mr-2" />
                  Current Status
                </h4>
                <div className="space-y-2">
                  <div className="flex">
                    <span className="text-gray-500 w-32">Stage:</span>
                    <span>{caseDetails.status?.stage || "N/A"}</span>
                  </div>
                  <div className="flex">
                    <span className="text-gray-500 w-32">Purpose:</span>
                    <span>{caseDetails.status?.purpose || "N/A"}</span>
                  </div>
                  <div className="flex">
                    <span className="text-gray-500 w-32">Next Hearing:</span>
                    <span>{formatDate(caseDetails.status?.nextHearing)}</span>
                  </div>
                </div>
              </div>

              <div className="md:col-span-2">
                <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                  <User size={16} className="mr-2" />
                  Parties
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="text-xs uppercase text-gray-500 mb-2">
                      Complainant(s)
                    </h5>
                    {caseDetails.parties?.complainant?.length ? (
                      <ul className="list-disc list-inside space-y-1">
                        {caseDetails.parties.complainant.map(
                          (complainant, index) => (
                            <li key={index} className="text-gray-800">
                              {safeRender(complainant)}
                            </li>
                          )
                        )}
                      </ul>
                    ) : (
                      <p className="text-gray-500 text-sm">
                        No complainant information available
                      </p>
                    )}
                  </div>
                  <div>
                    <h5 className="text-xs uppercase text-gray-500 mb-2">
                      Respondent(s)
                    </h5>
                    {caseDetails.parties?.respondent?.length ? (
                      <ul className="list-disc list-inside space-y-1">
                        {caseDetails.parties.respondent.map(
                          (respondent, index) => (
                            <li key={index} className="text-gray-800">
                              {safeRender(respondent)}
                            </li>
                          )
                        )}
                      </ul>
                    ) : (
                      <p className="text-gray-500 text-sm">
                        No respondent information available
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {caseDetails.history && caseDetails.history.length > 0 && (
                <div className="md:col-span-2 mt-2">
                  <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                    <Clock size={16} className="mr-2" />
                    Case History
                  </h4>
                  <div className="space-y-4">
                    {caseDetails.history.map((event, index) => (
                      <div
                        key={index}
                        className="border border-gray-200 rounded-md p-3"
                      >
                        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-2">
                          <div className="flex flex-col">
                            <div className="flex items-center">
                              <span className="text-gray-700 font-medium">
                                {formatDate(event.date)}
                              </span>
                              {event.dailyOrder && (
                                <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">
                                  Daily Order
                                </span>
                              )}
                            </div>
                            <span className="text-sm text-gray-500 mt-1">
                              ID: {event.id || "N/A"}
                            </span>
                          </div>
                          <div className="text-sm text-gray-500 mt-1 md:mt-0">
                            Stage: {event.stage || "N/A"}
                          </div>
                        </div>
                        {event.proceeding && (
                          <div className="mt-2 bg-gray-50 p-3 rounded text-gray-700 text-sm whitespace-pre-line">
                            {typeof event.proceeding === "object"
                              ? JSON.stringify(event.proceeding)
                              : event.proceeding}
                          </div>
                        )}
                        {event.nextDate && (
                          <div className="mt-2 text-sm">
                            <span className="text-gray-500">Next Date:</span>
                            <span className="text-gray-700">
                              {formatDate(event.nextDate)}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {caseDetails.applications &&
                caseDetails.applications.length > 0 && (
                  <div className="md:col-span-2 mt-2">
                    <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                      <Briefcase size={16} className="mr-2" />
                      Applications
                    </h4>
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th
                            scope="col"
                            className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase"
                          >
                            Type
                          </th>
                          <th
                            scope="col"
                            className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase"
                          >
                            Filed On
                          </th>
                          <th
                            scope="col"
                            className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase"
                          >
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {caseDetails.applications.map((app, index) => (
                          <tr key={index}>
                            <td className="px-3 py-2 text-sm text-gray-800">
                              {safeRender(app.type)}
                            </td>
                            <td className="px-3 py-2 text-sm text-gray-800">
                              {formatDate(app.filedOn)}
                            </td>
                            <td className="px-3 py-2 text-sm text-gray-800">
                              {safeRender(app.status)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

              {caseDetails.lowerCourtCases &&
                caseDetails.lowerCourtCases.length > 0 && (
                  <div className="md:col-span-2 mt-2">
                    <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                      <Briefcase size={16} className="mr-2" />
                      Lower Court Cases
                    </h4>
                    <div className="space-y-2">
                      {caseDetails.lowerCourtCases.map((lowerCase, index) => (
                        <div
                          key={index}
                          className="p-3 border border-gray-200 rounded-md"
                        >
                          <p className="font-medium">
                            {lowerCase.caseNumber || "N/A"}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            {safeRender(lowerCase.court)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          </div>
        </div>
      )}

      {searchPerformed && !caseDetails && !isLoading && !error && (
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-md p-4 text-yellow-700">
          No case details found for the provided case number. Please verify and
          try again.
        </div>
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

export default ConsumerForumCaseDetails;