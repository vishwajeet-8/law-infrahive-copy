import { useSearchParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Lock, Eye, EyeOff, CheckCircle } from "lucide-react";
import api from "@/utils/api";

export default function AcceptInvite() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const token = params.get("token");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Enhanced password validation
  const passwordValidation = {
    minLength: password.length >= 8,
    hasUpperCase: /[A-Z]/.test(password),
    hasLowerCase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  const isPasswordValid =
    passwordValidation.minLength &&
    passwordValidation.hasUpperCase &&
    passwordValidation.hasLowerCase &&
    passwordValidation.hasNumber &&
    passwordValidation.hasSpecialChar;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isPasswordValid) {
      setStatus("Password does not meet the required criteria.");
      return;
    }
    setIsLoading(true);
    setStatus("");
    try {
      await api.post(
        "/accept-invite",
        { token, password },
        { withCredentials: true }
      );
      setStatus("Success! You can now log in.");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      setStatus("Invite invalid or expired.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!token)
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md text-center">
          <p className="text-red-600 text-sm">Invalid invite link.</p>
        </div>
      </div>
    );

  if (status.includes("Success")) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Signup Complete!
          </h2>
          <p className="text-gray-600 mb-6">
            Your account has been successfully created. You will be redirected
            to the login page in a moment.
          </p>
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-8 h-8 text-indigo-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Complete Your Signup
          </h2>
          <p className="text-gray-600">Set a password to join the workspace</p>
        </div>

        {/* Error Message */}
        {status && !status.includes("Success") && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{status}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              New Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Set a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors pr-12 ${
                  password && !isPasswordValid
                    ? "border-red-300"
                    : "border-gray-300"
                }`}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {password && !isPasswordValid && (
              <div className="text-red-500 text-xs mt-1">
                <p>Password must include:</p>
                <ul className="list-disc list-inside">
                  {!passwordValidation.minLength && (
                    <li>At least 8 characters</li>
                  )}
                  {!passwordValidation.hasUpperCase && (
                    <li>At least one uppercase letter</li>
                  )}
                  {!passwordValidation.hasLowerCase && (
                    <li>At least one lowercase letter</li>
                  )}
                  {!passwordValidation.hasNumber && (
                    <li>At least one number</li>
                  )}
                  {!passwordValidation.hasSpecialChar && (
                    <li>At least one special character (e.g., !@#$%^&*)</li>
                  )}
                </ul>
              </div>
            )}
          </div>
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
            disabled={!isPasswordValid || isLoading}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Joining Workspace...
              </>
            ) : (
              "Join Workspace"
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <a
              href="/login"
              className="text-indigo-600 hover:text-indigo-500 font-medium transition-colors"
            >
              Back to Login
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
