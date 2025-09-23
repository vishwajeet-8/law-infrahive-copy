import {
  Bell,
  Mail,
  Home,
  User,
  FileText,
  Search,
  PenTool,
  ArrowRight,
  Sparkles,
  Shield,
  Clock,
  TrendingUp,
  Zap,
  BookOpen,
  Brain,
  Target,
  CheckCircle,
  Star,
  ChevronRight,
  Activity,
  BarChart3,
  Users,
  Globe,
  Lightbulb,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

const Dashboard = () => {
  const [hoveredCard, setHoveredCard] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [animatedStats, setAnimatedStats] = useState({});
  const { workspaceId } = useParams();

  const navigate = useNavigate();

  // Animation effect for page load
  useEffect(() => {
    setIsVisible(true);
    // Animate stats counters
    const timer = setTimeout(() => {
      setAnimatedStats({
        documents: 10247,
        hours: 1200,
        accuracy: 99.2,
        users: 847,
      });
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Enhanced pages configuration with more detailed data
  const pages = [
    {
      id: "extract",
      title: "Smart Extract",
      subtitle: "AI Document Processing",
      icon: <FileText size={28} />,
      description:
        "Extract key information from legal documents with precision AI that understands context and legal terminology",
      points: [
        "Automated text extraction with 99% accuracy",
        "Key clause identification and categorization",
        "Intelligent document summarization",
        "Multi-language entity recognition",
        "Bulk processing capabilities",
      ],
      url: `/workspaces/${workspaceId}/Extractions`,
      stats: "99.5% accuracy",
      gradient: "from-blue-500 via-blue-600 to-indigo-600",
      bgGradient: "from-blue-50 via-blue-100 to-indigo-100",
      borderColor: "border-blue-200",
      iconBg: "bg-gradient-to-br from-blue-500 to-blue-600",
      dotColor: "bg-blue-500",
      buttonColor:
        "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700",
      category: "Document Processing",
      trending: true,
    },
    {
      id: "research",
      title: "Research Memo",
      subtitle: "Legal Intelligence Hub",
      icon: <Brain size={28} />,
      description:
        "Generate comprehensive legal research memos with AI that analyzes case law, statutes, and legal precedents",
      points: [
        "Advanced case law analysis and synthesis",
        "Jurisdiction-specific research automation",
        "Professional citation formatting",
        "Legal precedent correlation mapping",
        "Real-time legal updates integration",
      ],
      url: `/workspaces/${workspaceId}/legal-ai-research`,
      stats: "10K+ cases analyzed",
      gradient: "from-emerald-500 via-emerald-600 to-teal-600",
      bgGradient: "from-emerald-50 via-emerald-100 to-teal-100",
      borderColor: "border-emerald-200",
      iconBg: "bg-gradient-to-br from-emerald-500 to-emerald-600",
      dotColor: "bg-emerald-500",
      buttonColor:
        "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700",
      category: "Research & Analysis",
      trending: false,
    },
    {
      id: "autodraft",
      title: "AutoDraft Pro",
      subtitle: "Intelligent Document Creation",
      icon: <PenTool size={28} />,
      description:
        "Automated legal document drafting with smart templates and AI-powered clause recommendations",
      points: [
        "Template-based intelligent drafting",
        "Dynamic clause library with AI suggestions",
        "Multiple format support (PDF, Word, HTML)",
        "Advanced version control and tracking",
        "Collaborative editing with real-time sync",
      ],
      url: `/workspaces/${workspaceId}/AutoDraftChat`,
      stats: "200+ templates",
      gradient: "from-purple-500 via-purple-600 to-violet-600",
      bgGradient: "from-purple-50 via-purple-100 to-violet-100",
      borderColor: "border-purple-200",
      iconBg: "bg-gradient-to-br from-purple-500 to-purple-600",
      dotColor: "bg-purple-500",
      buttonColor:
        "bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700",
      category: "Document Creation",
      trending: true,
    },
  ];

  const stats = [
    {
      label: "Documents Processed",
      value: "10,247",
      icon: <FileText size={24} />,
      gradient: "from-blue-500 to-blue-600",

      changeType: "positive",
    },
    {
      label: "Time Saved",
      value: "1,200hrs",
      icon: <Clock size={24} />,
      gradient: "from-emerald-500 to-emerald-600",

      changeType: "positive",
    },
    {
      label: "Accuracy Rate",
      value: "99.2%",
      icon: <Shield size={24} />,
      gradient: "from-amber-500 to-amber-600",

      changeType: "positive",
    },
    {
      label: "Active Users",
      value: "847",
      icon: <Users size={24} />,
      gradient: "from-purple-500 to-purple-600",

      changeType: "positive",
    },
  ];

  const quickActions = [
    {
      title: "Upload Document",
      description: "Start extracting data instantly",
      icon: <FileText size={20} />,
      color: "blue",
      action: () => navigate("/Extractions"),
    },
    {
      title: "New Research",
      description: "Begin legal research",
      icon: <Search size={20} />,
      color: "emerald",
      action: () => navigate("/legal-ai-research"),
    },
    {
      title: "Draft Document",
      description: "Create new legal document",
      icon: <PenTool size={20} />,
      color: "purple",
      action: () => navigate("/AutoDraftChat"),
    },
  ];

  const HeroSection = () => (
    <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-0 right-0 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-0 left-1/2 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-2000"></div>
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="w-full h-full"
          style={{
            backgroundImage:
              "radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)",
            backgroundSize: "30px 30px",
          }}
        ></div>
      </div>

      <div className="relative px-6 py-24 bg-[#0f172a] overflow-hidden">
        {/* Subtle background elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-indigo-500 blur-3xl"></div>
          <div className="absolute bottom-1/3 right-1/4 w-72 h-72 rounded-full bg-blue-500 blur-3xl"></div>
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          <div
            className={`text-center transition-all duration-700 ease-out ${
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-6 opacity-0"
            }`}
          >
            {/* Enhanced Heading with animated gradient */}
            <h1 className="text-4xl md:text-6xl pb-3 font-bold mb-5 bg-white bg-clip-text text-transparent leading-tight animate-gradient bg-100%">
              Legal AI Workspace
            </h1>

            {/* Subheading with animated border */}
            <div className="inline-flex items-center text-lg md:text-xl text-white mb-4 font-medium relative group">
              <span className="relative z-10 px-2">
                Powered by Advanced Artificial Intelligence
              </span>
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent group-hover:via-blue-300 transition-all duration-500"></span>
            </div>

            <p className="text-base md:text-lg text-white mb-12 max-w-3xl mx-auto leading-relaxed">
              Transform your legal practice with modern AI tools that streamline
              documents, boost research, and elevate drafting accuracy and
              speed.
            </p>

            {/* Enhanced Stats Grid with staggered animations */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className={`group relative backdrop-blur-lg bg-white/5 border border-white/10 rounded-2xl p-6 transition-all duration-300 hover:scale-[1.03] hover:shadow-xl hover:border-white/20 hover:bg-white/10
            ${isVisible ? "animate-fadeInUp" : "opacity-0"}`}
                  style={{
                    animationDelay: `${index * 100}ms`,
                    animationFillMode: "forwards",
                  }}
                >
                  {/* Enhanced gradient overlay with pulse effect */}
                  <div
                    className={`absolute inset-0 z-0 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 bg-gradient-to-br ${stat.gradient}`}
                  ></div>

                  {/* Glow effect on hover */}
                  <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                    <div
                      className={`absolute -inset-1 blur-md bg-gradient-to-br ${stat.gradient} rounded-2xl`}
                    ></div>
                  </div>

                  <div className="relative z-10">
                    {/* Animated icon container */}
                    <div
                      className={`flex items-center justify-center m-auto mb-4 w-12 h-12 rounded-xl text-white
                bg-gradient-to-br ${stat.gradient} shadow-lg group-hover:shadow-xl transition-shadow duration-300`}
                    >
                      <div className="group-hover:scale-110 transition-transform duration-300">
                        {stat.icon}
                      </div>
                    </div>

                    <div className="text-2xl font-semibold text-white mb-1 group-hover:text-white/90 transition-colors">
                      {stat.value}
                    </div>

                    <div className="text-sm text-slate-400 mb-1 group-hover:text-slate-300 transition-colors">
                      {stat.label}
                    </div>

                    <div
                      className={`text-xs font-medium flex items-center gap-1 ${
                        stat.changeType === "positive"
                          ? "text-emerald-400 group-hover:text-emerald-300"
                          : "text-red-400 group-hover:text-red-300"
                      } transition-colors`}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Add these animations to your global CSS */}
      <style>{`
        @keyframes animate-gradient {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-gradient {
          animation: animate-gradient 6s ease infinite;
        }

        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );

  const EnhancedCard = ({ page, index }) => (
    <div
      className="w-full lg:w-1/3 px-4 mb-8 transition-opacity duration-500"
      style={{ transitionDelay: `${index * 100}ms` }}
      onMouseEnter={() => setHoveredCard(page.id)}
      onMouseLeave={() => setHoveredCard(null)}
    >
      <Card
        className={`h-full overflow-hidden cursor-pointer border rounded-2xl bg-white transition-all duration-300
        ${
          hoveredCard === page.id
            ? "shadow-md scale-[1.015] border-gray-300"
            : "hover:shadow-sm"
        }`}
      >
        <div className="relative p-6">
          {/* Trending badge */}
          {page.trending && (
            <div className="absolute top-4 right-4 text-xs font-medium bg-red-500 text-white px-2 py-1 rounded">
              <Star className="w-3 h-3 inline mr-1" />
              Trending
            </div>
          )}

          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-medium bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
              {page.category}
            </span>
            <ArrowRight
              className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
                hoveredCard === page.id ? "translate-x-1 text-gray-600" : ""
              }`}
            />
          </div>

          {/* Title & Subtitle */}
          <div className="flex items-center gap-4 mb-4">
            <div className={`p-3 rounded-xl ${page.iconBg} text-white`}>
              {page.icon}
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-800">
                {page.title}
              </h3>
              <p className="text-sm text-gray-500">{page.subtitle}</p>
            </div>
          </div>

          {/* Description */}
          <p className="text-gray-600 text-sm mb-6">{page.description}</p>

          {/* Features */}
          <div className="mb-6">
            <h4 className="text-xs text-gray-500 font-medium uppercase mb-2 flex items-center gap-1">
              <Lightbulb className="w-4 h-4" />
              Key Features
            </h4>
            <ul className="space-y-2">
              {page.points.map((point, pointIndex) => (
                <li
                  key={pointIndex}
                  className="text-sm text-gray-700 flex gap-2"
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full mt-1.5 ${page.dotColor}`}
                  />
                  {point}
                </li>
              ))}
            </ul>
          </div>

          {/* CTA Button */}
          <Button
            className={`w-full text-white font-medium py-3 rounded-xl transition-all duration-300 
            ${page.buttonColor} hover:opacity-90`}
            onClick={() => navigate(page.url)}
          >
            <div className="flex items-center justify-center gap-2">
              <Zap className="w-4 h-4" />
              Launch {page.title}
            </div>
          </Button>
        </div>
      </Card>
    </div>
  );

  const CardsGrid = () => (
    <div className="py-20 px-6 bg-gradient-to-br from-gray-50 via-white to-gray-100 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-20 w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-64 h-64 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div
          className={`text-center mb-16 transition-all duration-1000 transform ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-12 h-0.5 bg-gradient-to-r from-transparent to-blue-500"></div>
            <Target className="w-6 h-6 text-blue-600" />
            <div className="w-12 h-0.5 bg-gradient-to-l from-transparent to-blue-500"></div>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
            Choose Your AI-Powered Solution
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Discover our comprehensive suite of AI-powered legal tools, each
            designed to revolutionize different aspects of your legal practice
            with cutting-edge technology
          </p>
        </div>

        <div className="flex flex-wrap -mx-4">
          {pages.map((page, index) => (
            <EnhancedCard key={page.id} page={page} index={index} />
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      <HeroSection />
      <CardsGrid />

      {/* Enhanced Footer */}
      <div className="bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 text-white py-12 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="w-full h-full"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)",
              backgroundSize: "20px 20px",
            }}
          ></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center">
            <div className="flex items-center justify-center gap-4 mb-6">
              <img
                src="https://www.infrahive.ai/_next/image?url=%2Fimages%2Flogo%2Flogo.png&w=640&q=75"
                className="w-[120px] mx-auto filter group-hover:brightness-110 transition-all duration-200"
                alt="Logo"
              />
            </div>
            <p className="text-slate-900 text-lg mb-4">
              Empowering legal professionals worldwide with advanced AI
              technology
            </p>
            <p className="text-slate-700 text-sm">
              © 2025 All rights reserved. Built with ❤️ for the legal community.
            </p>
          </div>
        </div>
      </div>

      {/* Custom styles for animations */}
      <style>{`
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
