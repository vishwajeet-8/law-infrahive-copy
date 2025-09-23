import React from "react";
import { Link } from "react-router-dom";
import { MessageSquare, Clock } from "lucide-react";
import { useLegalSessions } from "@/context/LegalSessionsContext";

const SessionCards = () => {
  const { legalSessions } = useLegalSessions();

  // Convert sessions to array format
  const sessions = Object.entries(legalSessions).map(([id, messages]) => ({
    id,
    title: messages[0]?.text?.slice(0, 50) + "..." || "New Session",
    timestamp: messages[0]?.timestamp || Date.now(),
    messageCount: messages.length,
  }));

  // Helper function to format timestamp
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "Unknown";

    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800)
      return `${Math.floor(diffInSeconds / 86400)} days ago`;

    return date.toLocaleDateString();
  };

  // Simple Session Card Component
  const SessionCard = ({ session }) => (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-all duration-200 hover:border-blue-300">
      {/* Header */}
      <div className="flex items-center space-x-2 mb-3">
        <MessageSquare className="w-5 h-5 text-blue-500" />
        <span className="text-sm text-gray-500">Legal Session</span>
      </div>

      {/* Title */}
      <h3 className="font-semibold text-gray-900 mb-3 line-clamp-2 hover:text-blue-600 transition-colors">
        {session.title}
      </h3>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center space-x-1">
          <Clock className="w-3 h-3" />
          <span>{formatTimestamp(session.timestamp)}</span>
        </div>
        <div className="flex items-center space-x-1">
          <MessageSquare className="w-3 h-3" />
          <span>{session.messageCount} messages</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Legal Document Intelligence
        </h1>
        <p className="text-gray-600">
          Manage your document analysis conversations
        </p>
      </div>

      {/* Sessions Grid */}
      {sessions.length === 0 ? (
        <div className="text-center py-12">
          <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No conversations found
          </h3>
          <p className="text-gray-500">
            Start a new legal document analysis session
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sessions.map((session) => (
            <Link
              key={session.id}
              to={`/legal-document-intelligence/${session.id}`}
              className="block"
            >
              <SessionCard session={session} />
            </Link>
          ))}
        </div>
      )}

      {/* Stats Footer */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">
            {sessions.length}
          </div>
          <div className="text-sm text-gray-500">Total Conversations</div>
        </div>
      </div>
    </div>
  );
};

export default SessionCards;
