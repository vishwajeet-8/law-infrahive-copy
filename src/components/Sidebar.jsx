import {
  ChevronRight,
  FileText,
  Search,
  PenTool,
  Bell,
  Home,
  Database,
  Plus,
  File,
  ChevronLeft,
  X,
  Briefcase,
  Settings,
  Users,
  Clock,
  Zap,
  Sparkles,
  MessageSquare,
  Archive,
  Star,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, Link, NavLink, useParams } from "react-router-dom";
import { FiLogOut } from "react-icons/fi";
import { v4 as uuidv4 } from "uuid";
// import { useLegalSessions } from "@/context/LegalSessionsContext";
import { useContext, useState, useEffect } from "react";
import api from "@/utils/api";
import { AuthContext } from "@/context/AuthContext";

// Enhanced Workspace Modal Component with modern design
const CreateWorkspaceModal = ({ isOpen, onClose }) => {
  const [workspaceName, setWorkspaceName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setWorkspaceName("");
      setError("");
    }
  }, [isOpen]);

  const handleCreateWorkspace = async () => {
    if (!workspaceName.trim()) {
      setError("Workspace name is required");
      return;
    }

    const token = localStorage.getItem("token");
    setIsLoading(true);
    setError("");

    try {
      const response = await api.post(
        "workspaces",
        {
          name: workspaceName.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Workspace created:", response.data);
      setWorkspaceName("");
      onClose();
      window.location.reload();
    } catch (err) {
      console.error("Create workspace error:", err);
      const msg =
        err.response?.data?.message || "Failed to create workspace. Try again.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
    setWorkspaceName("");
    setError("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !isLoading) {
      handleCreateWorkspace();
    }
    if (e.key === "Escape") {
      handleClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay with blur effect */}
        <div
          className="fixed inset-0 transition-all duration-300 bg-black/60 backdrop-blur-sm"
          onClick={handleClose}
        ></div>

        {/* Modal panel with modern glassmorphism effect */}
        <div className="inline-block w-full max-w-md p-0 my-8 overflow-hidden text-left align-middle transition-all transform bg-white/95 backdrop-blur-xl shadow-2xl rounded-3xl border border-white/20">
          {/* Header with gradient */}
          <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 p-6 rounded-t-3xl relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>

            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                  <Briefcase className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-1">
                    Create Workspace
                  </h3>
                  <p className="text-blue-100/80 text-sm">
                    Set up your new collaborative space
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="text-white/80 hover:text-white hover:bg-white/20 rounded-xl p-2 transition-all duration-200 backdrop-blur-sm"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-100/50">
              <Sparkles className="w-5 h-5 text-blue-600" />
              <p className="text-gray-700 text-sm leading-relaxed">
                Give your workspace a memorable name that reflects its purpose.
                You can customize settings later.
              </p>
            </div>

            {/* Error Message with modern styling */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200/50 rounded-2xl flex items-center space-x-3 animate-in slide-in-from-top duration-300">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <p className="text-red-700 text-sm font-medium">{error}</p>
              </div>
            )}

            {/* Input with modern styling */}
            <div className="space-y-3">
              <label
                htmlFor="workspaceName"
                className="block text-sm font-semibold text-gray-800"
              >
                Workspace Name
              </label>
              <div className="relative group">
                <input
                  id="workspaceName"
                  type="text"
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="e.g., Legal Team 2025, Corporate Law Hub..."
                  className="w-full px-4 py-4 border-2 border-gray-200/60 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 text-gray-900 placeholder-gray-400 bg-gray-50/50 group-hover:border-gray-300/80 backdrop-blur-sm"
                  autoFocus
                  maxLength={50}
                  disabled={isLoading}
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <span className="text-xs text-gray-500 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-gray-200/50 font-medium">
                    {workspaceName.length}/50
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions with modern styling */}
          <div className="flex justify-end space-x-3 p-6 bg-gray-50/50 backdrop-blur-sm rounded-b-3xl border-t border-gray-200/30">
            <button
              onClick={handleClose}
              disabled={isLoading}
              className="px-6 py-3 text-sm font-medium text-gray-700 bg-white/80 backdrop-blur-sm border border-gray-300/50 rounded-xl hover:bg-gray-50 hover:border-gray-400/60 focus:outline-none focus:ring-4 focus:ring-gray-500/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateWorkspace}
              disabled={!workspaceName.trim() || isLoading}
              className="px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 border border-transparent rounded-xl hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Create Workspace
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Sidebar = ({
  onSidebarToggle,
  isExpanded,
  onNewsHubClick,
  onLegalAIResearchClick,
  onCourtDashboardClick,
}) => {
  const { workspaceId } = useParams();
  const navigate = useNavigate();
  const { handleLogout } = useContext(AuthContext);
  const [isWorkspaceModalOpen, setIsWorkspaceModalOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);

  const handleNewsHubClick = () => {
    if (onNewsHubClick) {
      onNewsHubClick();
    }
  };

  const handleLegalAIResearchClick = () => {
    if (onLegalAIResearchClick) {
      onLegalAIResearchClick();
    }
  };

  const handleCourtDashboardClick = () => {
    if (onCourtDashboardClick) {
      onCourtDashboardClick();
    }
  };

  // No-op for agent click; navigation handled via route URL

  const handleCreateWorkspaceClick = () => {
    setIsWorkspaceModalOpen(true);
  };

  // Enhanced pages with modern styling and better categorization
  const pages = [
    // {
    //   id: "newconversation",
    //   title: "New Chat",
    //   icon: <MessageSquare size={18} />,
    //   onClick: startNewConversation,
    //   description: "Start fresh conversation",
    //   gradient: "from-blue-500 to-blue-600",
    //   hoverGradient: "from-blue-600 to-blue-700",
    //   category: "primary",
    // },
    {
      id: "extract",
      title: "Smart Extract",
      icon: <FileText size={18} />,
      url: `/workspaces/${workspaceId}/Extractions`,
      description: "AI document extraction",
      iconColor: "text-purple-600",
      bgColor: "hover:bg-purple-50",
      borderColor: "hover:border-purple-200",
      category: "tools",
    },
    {
      id: "autodraft",
      title: "AutoDraft",
      icon: <PenTool size={18} />,
      url: `/workspaces/${workspaceId}/AutoDraftChat`,
      description: "AI-powered drafting",
      iconColor: "text-emerald-600",
      bgColor: "hover:bg-emerald-50",
      borderColor: "hover:border-emerald-200",
      category: "tools",
    },
    {
      id: "newshub",
      title: "Legal News",
      icon: <TrendingUp size={18} />,
      onClick: handleNewsHubClick,
      description: "Latest legal updates",
      iconColor: "text-orange-600",
      bgColor: "hover:bg-orange-50",
      borderColor: "hover:border-orange-200",
      category: "insights",
    },
    {
      id: "legalairesearch",
      title: "AI Research",
      icon: <Database size={18} />,
      onClick: handleLegalAIResearchClick,
      description: "Advanced legal research",
      iconColor: "text-indigo-600",
      bgColor: "hover:bg-indigo-50",
      borderColor: "hover:border-indigo-200",
      category: "insights",
    },
    {
      id: "legalairesearchagent",
      title: "AI Research Agent",
      icon: <Database size={18} />,
      url: `/workspaces/${workspaceId}/ai-research-agent`,
      description: "Do research with simple language",
      iconColor: "text-indigo-600",
      bgColor: "hover:bg-indigo-50",
      borderColor: "hover:border-indigo-200",
      category: "insights",
      beta: true,
    },
    {
      id: "documents",
      title: "Documents",
      icon: <Archive size={18} />,
      url: `/workspaces/${workspaceId}/Documents`,
      description: "Document management",
      iconColor: "text-slate-600",
      bgColor: "hover:bg-slate-50",
      borderColor: "hover:border-slate-200",
      category: "storage",
    },
  ];

  const renderNavigationItem = (page) => {
    const isHovered = hoveredItem === page.id;

    if (page.id === "newconversation" && page.onClick) {
      return (
        <button
          onClick={page.onClick}
          key={page.id}
          onMouseEnter={() => setHoveredItem(page.id)}
          onMouseLeave={() => setHoveredItem(null)}
          className={`
            group flex items-center w-full p-3 rounded-2xl cursor-pointer
            transition-all duration-300 ease-out bg-gradient-to-r ${
              page.gradient
            } hover:${page.hoverGradient} text-white
            shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]
            ${isExpanded ? "justify-start" : "justify-center"}
            relative overflow-hidden
          `}
        >
          {/* Animated background gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

          <div className="flex-shrink-0 relative z-10 group-hover:scale-110 transition-transform duration-200">
            {page.icon}
          </div>
          {isExpanded && (
            <div className="ml-3 text-left relative z-10">
              <div className="text-sm font-semibold">{page.title}</div>
              <div className="text-xs text-blue-100/90">{page.description}</div>
            </div>
          )}
          {isExpanded && (
            <div className="ml-auto relative z-10">
              <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-200" />
            </div>
          )}
        </button>
      );
    }

    const ItemComponent = page.onClick ? "button" : NavLink;
    const itemProps = page.onClick
      ? { onClick: page.onClick }
      : {
          to: page.url,
          className: ({ isActive }) => `
            group flex items-center w-full p-3 rounded-2xl cursor-pointer
            transition-all duration-300 ease-out border-2 border-transparent
            ${
              isActive
                ? `bg-gradient-to-r from-${
                    page.iconColor.split("-")[1]
                  }-50 to-${page.iconColor.split("-")[1]}-100 border-${
                    page.iconColor.split("-")[1]
                  }-200 shadow-md`
                : `${page.bgColor || "hover:bg-gray-50"} ${
                    page.borderColor || "hover:border-gray-200"
                  }`
            }
            ${isExpanded ? "justify-start" : "justify-center"}
            transform hover:scale-[1.02] active:scale-[0.98]
          `,
        };

    if (page.onClick) {
      return (
        <button
          key={page.id}
          onClick={page.onClick}
          onMouseEnter={() => setHoveredItem(page.id)}
          onMouseLeave={() => setHoveredItem(null)}
          className={`
            group flex items-center w-full p-3 rounded-2xl cursor-pointer
            transition-all duration-300 ease-out border-2 border-transparent
            ${page.bgColor || "hover:bg-gray-50"} ${
            page.borderColor || "hover:border-gray-200"
          }
            ${isExpanded ? "justify-start" : "justify-center"}
            transform hover:scale-[1.02] active:scale-[0.98]
          `}
        >
          <div
            className={`flex-shrink-0 ${
              page.iconColor || "text-gray-600"
            } group-hover:scale-110 transition-transform duration-200`}
          >
            {page.icon}
          </div>
          {isExpanded && (
            <div className="ml-3 text-left flex-1">
              <div className="text-sm font-semibold text-gray-800 group-hover:text-gray-900 flex items-center gap-2">
                <span>{page.title}</span>
                {page.beta && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700 border border-indigo-200">
                    Beta
                  </span>
                )}
              </div>
              <div className="text-xs text-gray-500 group-hover:text-gray-600">
                {page.description}
              </div>
            </div>
          )}
          {isExpanded && (
            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 flex-shrink-0 group-hover:translate-x-1 transition-transform duration-200" />
          )}
        </button>
      );
    }

    return (
      <NavLink key={page.id} {...itemProps}>
        {({ isActive }) => (
          <>
            <div
              className={`flex-shrink-0 transition-all duration-200 ${
                isActive
                  ? `text-${page.iconColor.split("-")[1]}-700`
                  : page.iconColor || "text-gray-600"
              } group-hover:scale-110`}
            >
              {page.icon}
            </div>
            {isExpanded && (
              <div className="ml-3 text-left flex-1">
                <div
                  className={`text-sm font-semibold transition-colors duration-200 flex items-center gap-2 ${
                    isActive
                      ? `text-${page.iconColor.split("-")[1]}-800`
                      : "text-gray-800 group-hover:text-gray-900"
                  }`}
                >
                  <span>{page.title}</span>
                  {page.beta && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700 border border-indigo-200">
                      Beta
                    </span>
                  )}
                </div>
                <div
                  className={`text-xs transition-colors duration-200 ${
                    isActive
                      ? `text-${page.iconColor.split("-")[1]}-600`
                      : "text-gray-500 group-hover:text-gray-600"
                  }`}
                >
                  {page.description}
                </div>
              </div>
            )}
            {isExpanded && (
              <ChevronRight
                className={`w-4 h-4 flex-shrink-0 transition-all duration-200 ${
                  isActive
                    ? `text-${page.iconColor.split("-")[1]}-600`
                    : "text-gray-400 group-hover:text-gray-600"
                } group-hover:translate-x-1`}
              />
            )}
          </>
        )}
      </NavLink>
    );
  };

  return (
    <>
      <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div
          className={`bg-white/80 backdrop-blur-xl h-full shadow-2xl transition-all duration-500 ease-out flex flex-col border-r border-white/20 ${
            isExpanded ? "w-80" : "w-16"
          }`}
        >
          {/* Header with enhanced styling */}
          <div className="p-4 border-b border-gray-200/50 flex-shrink-0 bg-gradient-to-r from-white/90 to-gray-50/90 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              {isExpanded && (
                <div
                  onClick={() => navigate(`/workspaces/${workspaceId}`)}
                  className="cursor-pointer group transform hover:scale-105 transition-transform duration-200"
                >
                  <img
                    src="https://www.infrahive.ai/_next/image?url=%2Fimages%2Flogo%2Flogo.png&w=640&q=75"
                    className="w-[120px] mx-auto filter group-hover:brightness-110 transition-all duration-200"
                    alt="Logo"
                  />
                </div>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onSidebarToggle(!isExpanded)}
                className="ml-auto hover:bg-gray-100/60 rounded-xl transition-all duration-200 backdrop-blur-sm border border-transparent hover:border-gray-200/50"
              >
                {isExpanded ? (
                  <ChevronLeft className="w-5 h-5 text-gray-600" />
                ) : (
                  <div className="transform hover:scale-110 transition-transform duration-200">
                    <img
                      src="https://infrahive-ai-search.vercel.app/Logo%20(Digest).png"
                      className="w-[32px] mx-auto"
                      alt="Mini logo"
                    />
                  </div>
                )}
              </Button>
            </div>
          </div>

          {/* Main Navigation with enhanced sections */}
          <nav className="flex-1 p-3 overflow-y-auto custom-scrollbar">
            <div className="space-y-3">
              {/* Primary Actions */}
              <div>
                {pages
                  .filter((p) => p.category === "primary")
                  .map(renderNavigationItem)}
              </div>

              {/* Tools Section */}
              <div>
                {isExpanded && (
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-2">
                    AI Tools
                  </h3>
                )}
                <div className="space-y-1">
                  {pages
                    .filter((p) => p.category === "tools")
                    .map(renderNavigationItem)}
                </div>
              </div>

              {/* Insights Section */}
              <div>
                {isExpanded && (
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-2">
                    Insights
                  </h3>
                )}
                <div className="space-y-1">
                  {pages
                    .filter((p) => p.category === "insights")
                    .map(renderNavigationItem)}
                </div>
              </div>

              {/* Storage Section */}
              <div>
                {isExpanded && (
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-2">
                    Storage
                  </h3>
                )}
                <div className="space-y-1">
                  {pages
                    .filter((p) => p.category === "storage")
                    .map(renderNavigationItem)}
                </div>
              </div>
            </div>
          </nav>

          {/* Bottom Actions with enhanced styling */}
          <div className="p-4 border-t border-gray-200/50 flex-shrink-0 space-y-3 bg-gradient-to-r from-white/90 to-gray-50/90 backdrop-blur-sm">
            {/* Logout Button with enhanced styling */}
            <button
              onClick={handleLogout}
              className={`
                group flex items-center w-full p-3 rounded-2xl transition-all duration-300
                text-red-600 hover:text-red-700 bg-red-50/50 hover:bg-red-50 border-2 border-red-200/50 hover:border-red-300
                ${isExpanded ? "justify-start" : "justify-center"}
                transform hover:scale-[1.02] active:scale-[0.98] backdrop-blur-sm
              `}
            >
              <div className="flex-shrink-0 group-hover:scale-110 transition-transform duration-200">
                <FiLogOut className="text-lg" />
              </div>
              {isExpanded && (
                <div className="ml-3 text-left flex-1">
                  <div className="text-sm font-semibold">Sign Out</div>
                  <div className="text-xs text-red-500">Logout securely</div>
                </div>
              )}
              {isExpanded && (
                <ChevronRight className="w-4 h-4 text-red-400 flex-shrink-0 group-hover:translate-x-1 transition-transform duration-200" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Workspace Modal */}
      <CreateWorkspaceModal
        isOpen={isWorkspaceModalOpen}
        onClose={() => setIsWorkspaceModalOpen(false)}
      />

      {/* Custom scrollbar styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.1);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </>
  );
};

export default Sidebar;
