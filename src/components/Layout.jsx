// components/Layout.jsx
import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate, useParams } from "react-router-dom";
import Sidebar from "./Sidebar";
import { ChevronLeft } from "lucide-react";
import EnhancedNavbar from "./EnhancedNavbar";
import api from "@/utils/api";
// import { MaintenanceBanner } from "./MaintenanceBanner";

function Layout() {
  const { workspaceId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [isNewsHubActive, setIsNewsHubActive] = useState(false);
  const [isLegalAIResearchActive, setIsLegalAIResearchActive] = useState(false);
  const [isCourtDashboardActive, setIsCourtDashboardActive] = useState(false);
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setIsNewsHubActive(
      location.pathname === `/workspaces/${workspaceId}/newshub`
    );
    setIsLegalAIResearchActive(
      location.pathname === `/workspaces/${workspaceId}/legal-ai-research`
    );
    setIsCourtDashboardActive(
      location.pathname === `/workspaces/${workspaceId}/CourtDashboard`
    );
  }, [location.pathname]);

  useEffect(() => {
    const fetchWorkspaces = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const res = await api.get("/get-workspaces", {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log(res.data);
        setWorkspaces(res.data);
        setError(null);
      } catch (err) {
        setError("Failed to load workspaces");
        console.error("Error fetching workspaces:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkspaces();
  }, []);

  const handleSidebarToggle = (expanded) => {
    setIsSidebarExpanded(expanded);
  };

  const handleReturnFromFullPage = () => {
    navigate(`/workspaces/${workspaceId}`);
  };

  const handleNavigate = (path) => {
    navigate(path);
  };

  const shouldHideSidebar = isCourtDashboardActive;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* <MaintenanceBanner /> */}
      {/* Enhanced Navbar - Always at top */}
      <EnhancedNavbar
        isSidebarExpanded={isSidebarExpanded}
        shouldHideSidebar={shouldHideSidebar}
        workspaces={workspaces}
        loading={loading}
        error={error}
      />

      <div className="flex">
        {/* Sidebar */}
        {!shouldHideSidebar && (
          <div className="fixed top-0 left-0 h-full z-40">
            <Sidebar
              onSidebarToggle={handleSidebarToggle}
              isExpanded={isSidebarExpanded}
              onNewsHubClick={() =>
                handleNavigate(`/workspaces/${workspaceId}/newshub`)
              }
              onLegalAIResearchClick={() =>
                handleNavigate(`/workspaces/${workspaceId}/legal-ai-research`)
              }
              onCourtDashboardClick={() =>
                handleNavigate(`/workspaces/${workspaceId}/CourtDashboard`)
              }
            />
          </div>
        )}

        {/* Main Content Area */}
        <div
          className={`flex-1 transition-all duration-300 ${
            shouldHideSidebar ? "ml-0" : isSidebarExpanded ? "ml-72" : "ml-20"
          } `}
        >
          {/* Back button for Court Dashboard */}
          {isCourtDashboardActive && (
            <button
              onClick={handleReturnFromFullPage}
              className="fixed top-24 left-4 z-50 flex items-center gap-2 bg-white p-2 rounded-lg shadow-md hover:bg-gray-100 transition-colors border"
            >
              <ChevronLeft size={20} />
              <span>Back</span>
            </button>
          )}

          {/* Page Content */}
          <div className="min-h-screen ml-10">
            <Outlet
              context={{
                isNewsHubActive,
                isLegalAIResearchActive,
                isCourtDashboardActive,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Layout;
