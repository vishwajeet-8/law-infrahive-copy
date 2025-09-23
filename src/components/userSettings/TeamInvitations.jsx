import React, { useEffect, useState, useCallback } from "react";
import { Mail, Users, Clock, CheckCircle } from "lucide-react";
import SendInvite from "@/invite/SendInvite";
import api from "@/utils/api";
import UserManagement from "./UserManagement";
import TeamsIntegrationCard from "../TeamsIntegrationCard";

export default function TeamInvitations() {
  const [invitations, setInvitations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Extract fetchAllInvites as a reusable function
  const fetchAllInvites = useCallback(async () => {
    console.log("fetchAllInvites called - refreshing invitations...");
    const token = localStorage.getItem("token");
    try {
      setIsLoading(true);
      const res = await api.get("/all-invites", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("Fetched invitations:", res.data);
      setInvitations(res.data);
      console.log("Invitations state updated");
    } catch (error) {
      console.error("Error fetching invitations:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial fetch on component mount
  useEffect(() => {
    console.log("TeamInvitations mounted - fetching invitations");
    fetchAllInvites();
  }, [fetchAllInvites]);

  const getStatusBadge = (status) => {
    const styles = {
      Accepted: "bg-green-100 text-green-800 border-green-200",
      Pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      Expired: "bg-red-100 text-red-800 border-red-200",
    };

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-medium border ${styles[status]} transition-all duration-200`}
      >
        {status}
      </span>
    );
  };

  const totalInvites = invitations.length;
  const pendingInvites = invitations.filter(
    (inv) => inv.status === "Pending"
  ).length;
  const acceptedInvites = invitations.filter(
    (inv) => inv.status === "Accepted"
  ).length;

  return (
    <div className="max-w-6xl mx-auto py-12 space-y-12">
      {/* Invitations Section */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
        {/* Header */}
        <div className="bg-gray-50 px-6 py-8 text-center border-b">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Team Invitations
          </h1>
          <p className="text-gray-600 max-w-md mx-auto">
            Invite team members to collaborate and manage their access levels
            seamlessly.
          </p>
        </div>

        <div className="p-8">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading invitations...</p>
            </div>
          ) : (
            <>
              <div className="flex flex-col lg:flex-row gap-8">
                {/* Send Invitation Form */}
                <div className="lg:w-1/3">
                  <SendInvite onInviteSent={fetchAllInvites} />
                </div>

                {/* Sent Invitations */}
                <div className="lg:w-2/3">
                  <div className="flex items-center gap-3 mb-6">
                    <Users className="w-6 h-6 text-indigo-600" />
                    <h2 className="text-xl font-semibold text-gray-900">
                      Sent Invitations ({invitations.length})
                    </h2>
                  </div>
                  <p className="text-sm text-gray-600 mb-6">
                    Manage your team invitations and track their status.
                  </p>

                  {invitations.length === 0 ? (
                    <div className="text-center py-12">
                      <Mail className="w-12 h-12 text-gray-400 mx-auto" />
                      <h2 className="mt-4 text-lg font-semibold text-gray-900">
                        Send Invitations to Your Teammates
                      </h2>
                      <p className="mt-2 text-gray-600">
                        Get started by inviting your team to collaborate.
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* Table Header */}
                      <div className="bg-gray-50 rounded-t-lg px-6 py-4 flex items-center text-sm font-medium text-gray-700 border border-gray-200">
                        <div className="flex-1 min-w-0">Email</div>
                        <div className="w-24 text-center">Role</div>
                        <div className="w-24 text-center">Status</div>
                        <div className="w-40 text-center">Sent At</div>
                      </div>

                      {/* Table Rows */}
                      <div className="border-l border-r border-b rounded-b-lg max-h-96 overflow-y-auto">
                        {invitations.map((invitation) => (
                          <div
                            key={invitation.id}
                            className="px-6 py-4 flex items-center border-b last:border-b-0 hover:bg-gray-50 transition-colors duration-200"
                          >
                            <div className="flex-1 min-w-0 text-sm text-gray-900 truncate pr-4">
                              {invitation.email}
                            </div>
                            <div className="w-24 text-sm text-gray-600 text-center">
                              {invitation.role}
                            </div>
                            <div className="w-24 flex justify-center">
                              {getStatusBadge(invitation.status)}
                            </div>
                            <div className="w-40 text-sm text-gray-600 text-center">
                              {new Date(invitation.sentAt).toLocaleString(
                                "en-IN",
                                {
                                  dateStyle: "medium",
                                  timeStyle: "short",
                                }
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
                <div className="bg-blue-50 rounded-lg p-6 border border-blue-200 flex items-center justify-between transition-all duration-200 hover:shadow-md">
                  <div>
                    <p className="text-blue-600 text-sm font-medium">
                      Total Invites
                    </p>
                    <p className="text-2xl font-bold text-blue-900">
                      {totalInvites}
                    </p>
                  </div>
                  <Users className="w-10 h-10 text-blue-500" />
                </div>
                <div className="bg-yellow-50 rounded-lg p-6 border border-yellow-200 flex items-center justify-between transition-all duration-200 hover:shadow-md">
                  <div>
                    <p className="text-yellow-600 text-sm font-medium">
                      Pending
                    </p>
                    <p className="text-2xl font-bold text-yellow-900">
                      {pendingInvites}
                    </p>
                  </div>
                  <Clock className="w-10 h-10 text-yellow-500" />
                </div>
                <div className="bg-green-50 rounded-lg p-6 border border-green-200 flex items-center justify-between transition-all duration-200 hover:shadow-md">
                  <div>
                    <p className="text-green-600 text-sm font-medium">
                      Accepted
                    </p>
                    <p className="text-2xl font-bold text-green-900">
                      {acceptedInvites}
                    </p>
                  </div>
                  <CheckCircle className="w-10 h-10 text-green-500" />
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* User Management */}
      <div className="bg-white rounded-2xl shadow-xl p-8 transition-all duration-300 hover:shadow-2xl">
        <UserManagement />
      </div>

      {/* Teams Integration Card */}
      <div className="mx-auto p-6 bg-white mt-2 rounded-2xl shadow-xl transition-all duration-300 hover:shadow-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Integrations
          </h1>
        </div>
        <TeamsIntegrationCard />
      </div>
    </div>
  );
}
