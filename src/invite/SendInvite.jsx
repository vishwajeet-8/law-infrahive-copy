

import { useState } from "react";
import { Mail, Send, Check, User, AlertCircle, Loader2 } from "lucide-react";
import api from "@/utils/api";
import { useParams } from "react-router-dom";

const SendInvite = ({ onInviteSent }) => { // 🔥 Accept the callback prop
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState("");

  // Debug: Check if callback is received
  console.log("SendInvite received onInviteSent:", typeof onInviteSent);

  const { workspaceId } = useParams();

  // Mock user data - replace with your preferred auth solution
  const user = {
    email: "john.doe@example.com",
    name: "John Doe",
  };

  // Mock authentication state - replace with your preferred auth solution
  const isAuthenticated = true; // Set to false to test unauthenticated state

  const handleInvite = async () => {
    if (!isAuthenticated) {
      setError("Please log in to send invites");
      return;
    }

    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }

    setIsLoading(true);
    setError("");
    const token = localStorage.getItem("token");

    try {
      const res = await api.post(
        "/send-invite",
        {
          email,
          workspace_id: workspaceId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setIsSent(true);
      
      // 🔥 Call the callback to refresh the parent component
      console.log("Invite sent successfully, calling refresh callback...");
      if (onInviteSent) {
        console.log("Calling onInviteSent callback");
        await onInviteSent();
        console.log("Callback completed");
      } else {
        console.log("No onInviteSent callback provided");
      }
      
      setTimeout(() => {
        setIsSent(false);
        setEmail("");
      }, 3000);
    } catch (err) {
      console.error("Error sending invite:", err);

      // Axios error message
      const message =
        err.response?.data?.error || "Failed to send invite. Please try again.";

      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const isValidEmail = email.includes("@") && email.length > 5;

  if (!isAuthenticated) {
    return (
      <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-2xl p-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-2xl mb-4">
            <User className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Authentication Required
          </h3>
          <p className="text-gray-600">Please log in to send invites</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center">
      <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-2xl p-8 max-w-md mx-auto">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Send Invite</h2>
          <p className="text-gray-600">Invite someone to join your workspace</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          {/* Email Input */}
          <div className="space-y-2 mb-4">
            <label
              htmlFor="email"
              className="block text-sm font-semibold text-gray-700"
            >
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError(""); // Clear error when user types
                }}
                placeholder="colleague@company.com"
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400 bg-gray-50 focus:bg-white ${
                  error
                    ? "border-red-300 focus:ring-red-500"
                    : "border-gray-200"
                }`}
                disabled={isLoading || isSent}
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-800">
                <AlertCircle className="w-4 h-4" />
                <p className="text-sm font-medium">{error}</p>
              </div>
            </div>
          )}

          {/* Send Button */}
          <button
            onClick={handleInvite}
            disabled={!isValidEmail || isLoading || isSent}
            className={`
            w-full py-3 px-6 rounded-lg font-semibold text-white
            transition-all duration-300 ease-out
            flex items-center justify-center gap-2
            ${
              isSent
                ? "bg-green-500 hover:bg-green-600 shadow-lg shadow-green-200"
                : isValidEmail && !isLoading
                ? "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg shadow-blue-200 hover:shadow-xl hover:-translate-y-0.5"
                : "bg-gray-300 cursor-not-allowed"
            }
          `}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Sending...</span>
              </>
            ) : isSent ? (
              <>
                <Check className="w-5 h-5" />
                <span>Invite Sent!</span>
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                <span>Send Invite</span>
              </>
            )}
          </button>

          {/* Success Message */}
          {isSent && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 text-green-800">
                <Check className="w-4 h-4" />
                <p className="text-sm font-medium">
                  Invitation sent successfully to {email}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SendInvite;