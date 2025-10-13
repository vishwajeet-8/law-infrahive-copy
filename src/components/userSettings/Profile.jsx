import api from "@/utils/api.js";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import CreditAudit from "./Audit";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [showRoadmapModal, setShowRoadmapModal] = useState(false);
  const [roadmapData, setRoadmapData] = useState([]);
  const [newFeature, setNewFeature] = useState({
    feature: "",
    description: "",
    expectedDate: "",
    status: "",
  });
  const [editingId, setEditingId] = useState(null);
  const { workspaceId } = useParams();

  const fetchUser = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await api.get("/user", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(response.data);
      setName(response.data.name || response.data.email.split("@")[0]);
      setPreviewUrl(response.data.profile_picture_url || null);
      setData(response.data);
    } catch (err) {
      console.error("Failed to fetch user:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoadmap = async () => {
    try {
      const response = await api.get(`/roadmaps`);
      setRoadmapData(response.data);
    } catch (err) {
      console.error("Failed to fetch roadmap:", err);
      alert("Failed to load roadmap data");
    }
  };

  const handleUpdateProfile = async () => {
    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("name", name);
    if (profilePhoto) formData.append("profile_picture", profilePhoto);

    try {
      setUpdating(true);
      await api.patch("/user/profile", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchUser();
      setIsEditing(false);
      setPreviewUrl(null);
    } catch (err) {
      console.error("Profile update failed", err);
      alert("Update failed. Try again.");
    } finally {
      setUpdating(false);
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePhoto(file);
      const reader = new FileReader();
      reader.onload = (e) => setPreviewUrl(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setName(user.name || user.email.split("@")[0]);
    setProfilePhoto(null);
    setPreviewUrl(null);
  };

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    if (showRoadmapModal) {
      fetchRoadmap();
    }
  }, [showRoadmapModal]);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? "Invalid Date" : date.toLocaleDateString(); // Returns date in local format like "8/12/2025" for US
  };
  const getRoleColor = (role) => {
    switch (role?.toLowerCase()) {
      case "owner":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "admin":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "user":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getInitials = (email) => {
    return email?.split("@")[0]?.charAt(0)?.toUpperCase() || "U";
  };

  const CreditsOverview = () => {
    return (
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden mt-8">
        <div className="p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Credits Overview
            </h2>
            <p className="text-gray-600">
              Credits are assigned to each account and used across workspaces
              for all users
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="border border-gray-200 rounded-xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-blue-600 text-lg">🔍</span>
                </div>
                <h3 className="text-lg font-semibold text-blue-600">
                  Research Queries/Credits
                </h3>
              </div>
              <p className="text-gray-600 text-sm mb-4">
                User searches for Court cases. Successful results count as 1
                credit.
              </p>
              <div className="mb-4">
                <div className="flex items-baseline space-x-2">
                  <span className="text-3xl font-bold text-gray-900">
                    {(data?.research_credit?.credit || 0).toLocaleString()}
                  </span>
                  <span className="text-gray-500">/ 1,00,000 per year</span>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-600 mt-1">
                  <span>
                    Used:{" "}
                    {(
                      100000 - data?.research_credit?.credit || 0
                    ).toLocaleString()}
                  </span>
                  <span>
                    {(
                      ((100000 - (data?.research_credit?.credit ?? 0)) /
                        100000) *
                      100
                    ).toFixed(1)}
                    %
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{
                      width: `${(
                        ((100000 - (data?.research_credit?.credit ?? 0)) /
                          100000) *
                        100
                      ).toFixed(1)}%`,
                    }}
                  ></div>
                </div>
              </div>
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">Definition</h4>
                <p className="text-blue-800 text-sm">
                  A user search for a Court case that returns successful results
                  counts as 1 credit.
                </p>
              </div>
            </div>
            <div className="border border-gray-200 rounded-xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-green-600 text-lg">📄</span>
                </div>
                <h3 className="text-lg font-semibold text-green-600">
                  Drafting Credits
                </h3>
              </div>
              <p className="text-gray-600 text-sm mb-4">
                AI Drafting and extractor with word-based usage tracking.
              </p>
              <div className="mb-4">
                <div className="flex items-baseline space-x-2">
                  <span className="text-3xl font-bold text-gray-900">
                    {(data?.extraction_credit?.credit || 0).toLocaleString()}
                  </span>
                  <span className="text-gray-500">
                    / 1,00,000 words per day
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-600 mt-1">
                  <span>
                    Used:{" "}
                    {(
                      100000 - data?.extraction_credit?.credit || 0
                    ).toLocaleString()}
                  </span>
                  <span>
                    {(
                      ((100000 - (data?.extraction_credit?.credit ?? 0)) /
                        100000) *
                      100
                    ).toFixed(1)}
                    %
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{
                      width: `${(
                        ((100000 - (data?.extraction_credit?.credit ?? 0)) /
                          100000) *
                        100
                      ).toFixed(1)}%`,
                    }}
                  ></div>
                </div>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <h4 className="font-semibold text-green-900 mb-2">
                  Definition
                </h4>
                <p className="text-green-800 text-sm">
                  Use Drafts documents and data extraction. Each word in the
                  extracted results counts towards daily limit
                </p>
              </div>
            </div>
          </div>
          <CreditAudit creditData={data} />
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-gray-50 rounded-xl">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-purple-600 text-xl">📅</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-1">Reset Period</h4>
              <p className="text-sm text-gray-600 mb-2">
                Research: Yearly Reset
                <br />
                Extraction: Daily Reset at 12am
              </p>
            </div>
            <div className="text-center p-6 bg-gray-50 rounded-xl">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-orange-600 text-xl">📊</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-1">Total Usage</h4>
              <p className="text-sm text-gray-600 mb-2">38,570 credits used</p>
            </div>
            <div className="text-center p-6 bg-gray-50 rounded-xl">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 text-xl">🔍</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-1">
                Account Scope
              </h4>
              <p className="text-sm text-gray-600 mb-2">
                Credits shared across all workspaces and users
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="text-gray-600 font-medium">Loading profile...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="text-5xl mb-4">😔</div>
          <div className="text-red-500 text-lg font-medium mb-4">
            Failed to load user data
          </div>
          <button
            onClick={fetchUser}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto px-4">
        {/* Main Profile Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 h-24 relative">
            <div className="absolute top-4 right-4">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-all font-medium border border-white/30"
                >
                  Edit Profile
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={handleCancelEdit}
                    className="px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-all font-medium border border-white/30"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateProfile}
                    disabled={updating}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {updating ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="relative px-8 pb-8">
            <div className="relative -mt-12 mb-6">
              <div className="w-24 h-24 bg-white rounded-full shadow-lg flex items-center justify-center border-4 border-white overflow-hidden">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : user.profile_picture_url ? (
                  <img
                    src={user.profile_picture_url}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-3xl font-bold text-gray-700">
                    {getInitials(user.email)}
                  </span>
                )}
              </div>
              <div className="absolute bottom-1 right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white"></div>
              {isEditing && (
                <div className="absolute -bottom-2 -right-2">
                  <label className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-700 transition-colors shadow-lg">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                    <span className="text-sm">📷</span>
                  </label>
                </div>
              )}
            </div>
            <div className="space-y-6">
              <div>
                {isEditing ? (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your name"
                    />
                  </div>
                ) : (
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    {user.name || user.email.split("@")[0]}
                  </h1>
                )}
                <div className="flex items-center space-x-3">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium border ${getRoleColor(
                      user.role
                    )}`}
                  >
                    {user.role}
                  </span>
                  <span className="text-gray-500">ID: {user.id}</span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-blue-600 text-lg">✉️</span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Email</p>
                    <p className="text-gray-900">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-green-600 text-lg">📅</span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">
                      Member Since
                    </p>
                    <p className="text-gray-900">
                      {formatDate(user.created_at)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-100">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {user.id}
                  </div>
                  <div className="text-sm text-gray-500">User ID</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">Active</div>
                  <div className="text-sm text-gray-500">Status</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Credits Overview - Only show for owners */}
        {user.role?.toLowerCase() === "owner" && <CreditsOverview />}

        {/* Support Section */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mt-8">
          <div className="p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Support & Resources
              </h2>
              <p className="text-gray-600">
                Access our user guide, roadmap, or contact our support team for
                assistance
              </p>
            </div>
            <div className="grid md:grid-cols-4 gap-6">
              {/* User Guide */}
              <div className="text-center p-6 bg-gray-50 rounded-xl">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <span className="text-blue-600 text-xl">📖</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">User Guide</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Download our comprehensive user guide (PDF)
                </p>
                <a
                  href="https://apilegalnod.infrahive.ai/legal-api/user-guide"
                  download="User-Guide-InfraLegal-AI.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Download PDF
                </a>
              </div>
              {/* Roadmap */}
              <div className="text-center p-6 bg-gray-50 rounded-xl">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <span className="text-yellow-600 text-xl">🛠️</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">
                  Feature Roadmap
                </h4>
                <p className="text-sm text-gray-600 mb-4">
                  View our upcoming features and their status
                </p>
                <button
                  onClick={() => setShowRoadmapModal(true)}
                  className="inline-block px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors font-medium"
                >
                  View Roadmap
                </button>
              </div>
              {/* Chat Support */}
              <div className="text-center p-6 bg-gray-50 rounded-xl">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <span className="text-green-600 text-xl">💬</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">
                  Chat Support
                </h4>
                <p className="text-sm text-gray-600 mb-4">
                  Join our WhatsApp support group for quick assistance
                </p>
                <a
                  href="https://chat.whatsapp.com/BYVNO57fjz648B4tslllG4"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  Join WhatsApp Group
                </a>
              </div>
              {/* Contact Support */}
              <div className="text-center p-6 bg-gray-50 rounded-xl">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <span className="text-purple-600 text-xl">📞</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">
                  Contact Support
                </h4>
                <p className="text-sm text-gray-600 mb-2">
                  Reach out to our support team directly
                </p>
                <div className="text-sm text-gray-900">
                  <p>
                    Email:{" "}
                    <a
                      href="mailto:support@infrahive.ai"
                      className="text-blue-600 hover:underline"
                    >
                      support@infrahive.ai
                    </a>
                  </p>
                  <p>
                    Phone:{" "}
                    <a
                      href="tel:+917014114843"
                      className="text-blue-600 hover:underline"
                    >
                      +91-7014114843
                    </a>{" "}
                    /{" "}
                    <a
                      href="tel:+919999744814"
                      className="text-blue-600 hover:underline"
                    >
                      +91 99997 44814
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Roadmap Modal */}

        {showRoadmapModal && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
              {/* Header */}
              <div className="flex justify-between items-center p-6 border-b border-gray-100">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Product Roadmap
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Track upcoming features and progress
                  </p>
                </div>
                <button
                  onClick={() => setShowRoadmapModal(false)}
                  className="p-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-gray-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Main Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {/* Roadmap Table */}
                <div className="overflow-hidden rounded-lg border border-gray-200 shadow-sm">
                  <table className="w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Feature
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Description
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Timeline
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {roadmapData.map((item) => (
                        <tr
                          key={item.id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          {editingId === item.id ? (
                            <>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <input
                                  type="text"
                                  value={item.feature}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-gray-100"
                                  readOnly
                                />
                              </td>
                              <td className="px-6 py-4">
                                <input
                                  type="text"
                                  value={item.description}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-gray-100"
                                  readOnly
                                />
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <input
                                  type="text"
                                  value={formatDate(item.expecteddate)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-gray-100"
                                  readOnly
                                />
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <select
                                  value={item.status}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-gray-100"
                                  disabled
                                >
                                  <option value="Planned">Planned</option>
                                  <option value="In Progress">
                                    In Progress
                                  </option>
                                  <option value="Completed">Completed</option>
                                </select>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button
                                  onClick={() =>
                                    handleUpdateFeature(
                                      item.id,
                                      roadmapData.find((i) => i.id === item.id)
                                    )
                                  }
                                  className="text-green-600 hover:text-green-900 mr-3 inline-flex items-center"
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5 mr-1"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                  Save
                                </button>
                                <button
                                  onClick={() => setEditingId(null)}
                                  className="text-gray-600 hover:text-gray-900 inline-flex items-center"
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5 mr-1"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                  Cancel
                                </button>
                              </td>
                            </>
                          ) : (
                            <>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="font-medium text-gray-900">
                                  {item.feature}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-gray-600 line-clamp-2">
                                  {item.description}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-gray-600">
                                  {formatDate(item.expecteddate)}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                    item.status === "Completed"
                                      ? "bg-green-100 text-green-800"
                                      : item.status === "In Progress"
                                      ? "bg-blue-100 text-blue-800"
                                      : "bg-gray-100 text-gray-800"
                                  }`}
                                >
                                  {item.status}
                                </span>
                              </td>
                            </>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Footer */}
              <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 flex justify-between items-center">
                <p className="text-sm text-gray-500">
                  Showing {roadmapData.length} feature
                  {roadmapData.length !== 1 ? "s" : ""}
                </p>
                <button
                  onClick={() => setShowRoadmapModal(false)}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
