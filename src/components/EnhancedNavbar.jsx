import { useEffect, useState } from "react";
import api from "@/utils/api";
import WorkspaceSelector from "@/workspaces/WorkspaceSelector";
import {
  Settings,
  User,
  ChevronDown,
  Bell,
  Shield,
  LogOut,
  ArrowLeft,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

const EnhancedNavbar = ({
  isSidebarExpanded,
  shouldHideSidebar,
  workspaces,
  loading,
  error,
}) => {
  const { workspaceId } = useParams();
  const [seat, setSeat] = useState({
    seat_limit: 5,
    used: 0,
  });
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [notifications, setNotifications] = useState(3); // Example notification count

  const user = localStorage.getItem("user");
  const userCredentials = JSON.parse(user);
  const navigate = useNavigate();

  useEffect(() => {
    const getSeatUsage = async () => {
      const token = localStorage.getItem("token");

      try {
        const res = await api.get("/seat-usage", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setSeat(res.data);
      } catch (error) {
        console.log(error);
      }
    };

    getSeatUsage();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const getInitials = (email) => {
    return email ? email.charAt(0).toUpperCase() : "U";
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "Owner":
        return "text-amber-700 bg-amber-50 border-amber-200";
      case "Admin":
        return "text-blue-700 bg-blue-50 border-blue-200";
      case "Member":
        return "text-green-700 bg-green-50 border-green-200";
      default:
        return "text-gray-700 bg-gray-50 border-gray-200";
    }
  };

  return (
    <nav
      className={`w-[100vw] shadow-sm border-b border-gray-200 sticky top-0  z-10 transition-all duration-300  bg-white ${
        shouldHideSidebar ? "ml-0" : isSidebarExpanded ? "ml-0" : "ml-0"
      }`}
    >
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-end items-center h-16">
          <div className="flex items-center space-x-4">
            {/* Workspace Selector */}
            <div className="hidden sm:block">
              <WorkspaceSelector
                workspaces={workspaces}
                loading={loading}
                error={error}
              />
            </div>

            {/* Seat Usage - Owner only */}
            {userCredentials?.role === "Owner" && (
              <div className="hidden lg:flex items-center space-x-4">
                <div className="text-right">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-semibold text-gray-900">
                      {seat?.seat_limit - seat?.used}
                    </span>
                    <span className="text-xs text-gray-500">of</span>
                    <span className="text-xs text-gray-500">
                      {seat?.seat_limit} invites
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">available</p>
                </div>
                <div className="w-px h-6 bg-gray-200"></div>
              </div>
            )}

            {/* Settings - Owner only */}
            {userCredentials?.role === "Owner" && (
              <button
                onClick={() => navigate(`/workspaces/${workspaceId}/settings`)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                title="Workspace Settings"
              >
                <Settings className="w-5 h-5" />
              </button>
            )}

            {/* User Menu */}
            {userCredentials && (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    {/* Avatar */}
                    <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-white">
                        {getInitials(userCredentials.email)}
                      </span>
                    </div>

                    {/* User info - hidden on mobile */}
                    <div className="hidden md:block text-left">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium text-gray-900">
                          {userCredentials.name ||
                            userCredentials.email?.split("@")[0]}
                        </p>
                        <span
                          className={`px-2 py-0.5 text-xs font-medium rounded-full border ${getRoleColor(
                            userCredentials.role
                          )}`}
                        >
                          {userCredentials.role}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 truncate max-w-32">
                        {userCredentials.email}
                      </p>
                    </div>
                  </div>

                  <ChevronDown
                    className={`w-4 h-4 text-gray-400 transition-transform ${
                      showUserMenu ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    {/* Mobile user info */}
                    <div className="md:hidden px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">
                        {userCredentials.name ||
                          userCredentials.email?.split("@")[0]}
                      </p>
                      <p className="text-xs text-gray-500">
                        {userCredentials.email}
                      </p>
                      <span
                        className={`inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full border ${getRoleColor(
                          userCredentials.role
                        )}`}
                      >
                        {userCredentials.role}
                      </span>
                    </div>

                    {/* Menu Items */}
                    <div className="py-1">
                      <button
                        onClick={() =>
                          navigate(`/workspaces/${workspaceId}/profile`)
                        }
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <User className="w-4 h-4 mr-3" />
                        Profile
                      </button>

                      {userCredentials?.role === "Owner" && (
                        <button
                          onClick={() =>
                            navigate(`/workspaces/${workspaceId}/workspace`)
                          }
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <Settings className="w-4 h-4 mr-3" />
                          Workspace
                        </button>
                      )}

                      <div className="border-t border-gray-100 my-1"></div>

                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="w-4 h-4 mr-3" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Click outside to close menu */}
      {showUserMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </nav>
  );
};

export default EnhancedNavbar;
