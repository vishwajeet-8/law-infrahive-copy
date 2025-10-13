import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  BrowserRouter,
  useParams,
} from "react-router-dom";
import Dashboard from "./components/Dashboard";
import Layout from "./components/Layout";
import KnowledgeCards from "./components/Integration";
import { knowledgeData } from "./lib/utils";
import OnecleChat from "./components/OnecleChat";
import RbiChat from "./components/RbiChat";
import Extract from "./extract/Extract";
import ChatInterface from "./components/ResearchChat";
import News from "./news/News";
import LegalAiResearch from "./LegalAIResearch/LegalAiResearch";
import LegalDocumentIntelligence from "./LegalDocumentIntelligence/components/Index";
import Extractions from "./extract/pages/Extractions";
import Documents from "./DocumentHub/Documents";
import SessionCards from "./components/SessionCards";
import AcceptInvite from "./invite/AcceptInvite";
import SendInvite from "./invite/SendInvite";
import Login from "./components/Login";
import ProtectedRoute from "./auth/ProtectedRoute";
import ReqForgotPassword from "./components/ReqForgotPassword";
import ResetPassword from "./components/ResetPassword";
import TeamInvitations from "./components/userSettings/TeamInvitations";
import Profile from "./components/userSettings/Profile";
import Workspace from "./workspaces/Workspace";
import TiptapEditor from "./autoDrafting/src/components/tiptap-editor";
import ExtractedData from "./extract/pages/ExtractedData";
import LegalAIResearchAgent from "./components/LegalAIResearchAgent";
import { jwtDecode } from "jwt-decode";

// Assume you have a way to check if the user is authenticated
// Replace this with your actual authentication logic (e.g., context, Redux, or localStorage)
const isAuthenticated = () => {
  // Example: Check if a token exists in localStorage or context
  return !!localStorage.getItem("token"); // Adjust based on your auth method
};

// Assume you have a way to get the default workspaceId
const getDefaultWorkspaceId = () => {
  // Replace with your logic to get the workspaceId (e.g., from localStorage, context, or API)
  // const user = localStorage.getItem("user"); // Fallback to "default" if not found
  const token = localStorage.getItem("token");
  const { workspaceId } = jwtDecode(token)
  console.log(workspaceId);
  return workspaceId;
};

// PublicRoute component to handle routes accessible only to unauthenticated users
const PublicRoute = ({ children }) => {
  if (isAuthenticated()) {
    const workspaceId = getDefaultWorkspaceId();
    return <Navigate to={`/workspaces/${workspaceId}`} replace />;
  }
  return children;
};

const App = () => {
  return (
    <BrowserRouter
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Wrap the Login route with PublicRoute */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/request-forgot-password"
          element={<ReqForgotPassword />}
        />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/accept-invite" element={<AcceptInvite />} />
        <Route
          path="/workspaces/:workspaceId"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="Extractions" element={<Extractions />} />
          <Route path="ExtractChat" element={<Extract />} />
          <Route path="ResearchChat" element={<ChatInterface />} />
          <Route path="AutoDraftChat" element={<TiptapEditor />} />
          <Route
            path="integrations"
            element={<KnowledgeCards data={knowledgeData} />}
          />
          <Route path="oneclechat" element={<OnecleChat />} />
          <Route path="newshub" element={<News />} />
          <Route path="legal-ai-research" element={<LegalAiResearch />} />
          <Route path="ai-research-agent" element={<LegalAIResearchAgent />} />
          <Route path="integration/rbi-chat" element={<RbiChat />} />
          <Route
            path="legal-document-intelligence/:sessionId"
            element={<LegalDocumentIntelligence />}
          />
          <Route path="Documents" element={<Documents />} />
          <Route path="extracted/:id" element={<ExtractedData />} />
          <Route path="Recent-conversation" element={<SessionCards />} />
          <Route path="send-invite" element={<SendInvite />} />
          <Route path="settings" element={<TeamInvitations />} />
          <Route path="profile" element={<Profile />} />
          <Route path="workspace" element={<Workspace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
