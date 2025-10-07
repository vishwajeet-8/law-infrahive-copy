// import { useState, useEffect } from "react";
// import { Lock, Eye, EyeOff, CheckCircle } from "lucide-react";
// import api from "@/utils/api";

// export default function ResetPassword() {
//   const [password, setPassword] = useState("");
//   const [confirmPassword, setConfirmPassword] = useState("");
//   const [showPassword, setShowPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);
//   const [token, setToken] = useState("");
//   const [isLoading, setIsLoading] = useState(false);
//   const [isSuccess, setIsSuccess] = useState(false);
//   const [error, setError] = useState("");

//   // Extract token from URL parameters on component mount
//   useEffect(() => {
//     const urlParams = new URLSearchParams(window.location.search);
//     const tokenFromUrl = urlParams.get("token");
//     if (tokenFromUrl) {
//       setToken(tokenFromUrl);
//     } else {
//       setError("Invalid or missing reset token");
//     }
//   }, []);

//   // Password validation
//   const isPasswordValid = password.length >= 8;
//   const passwordsMatch = password === confirmPassword && confirmPassword !== "";

//   const handleResetPassword = async () => {
//     if (!token) {
//       setError("Reset token is missing");
//       return;
//     }

//     if (!isPasswordValid) {
//       setError("Password must be at least 8 characters long");
//       return;
//     }

//     if (!passwordsMatch) {
//       setError("Passwords do not match");
//       return;
//     }

//     setIsLoading(true);
//     setError("");

//     try {
//       const response = await api.post("/reset-password", {
//         token: token,
//         newPassword: password,
//       });

//       if (response.status === 200) {
//         setIsSuccess(true);
//         setTimeout(() => {
//           window.location.href = "/login";
//         }, 2000);
//       } else {
//         setError(response.data?.message || "Failed to reset password");
//       }
//     } catch (err) {
//       setError(
//         err.response?.data?.message || "Network error. Please try again."
//       );
//       console.error("Reset password error:", err);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Success state
//   if (isSuccess) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
//         <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md text-center">
//           <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
//             <CheckCircle className="w-8 h-8 text-green-600" />
//           </div>
//           <h2 className="text-2xl font-bold text-gray-900 mb-4">
//             Password Reset Successful!
//           </h2>
//           <p className="text-gray-600 mb-6">
//             Your password has been successfully reset. You will be redirected to
//             the login page in a moment.
//           </p>
//           <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 mx-auto"></div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
//       <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
//         {/* Header */}
//         <div className="text-center mb-8">
//           <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
//             <Lock className="w-8 h-8 text-indigo-600" />
//           </div>
//           <h1 className="text-2xl font-bold text-gray-900 mb-2">
//             Reset Your Password
//           </h1>
//           <p className="text-gray-600">Enter your new password below</p>
//         </div>

//         {/* Error Message */}
//         {error && (
//           <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
//             <p className="text-red-700 text-sm">{error}</p>
//           </div>
//         )}

//         {/* Form */}
//         <div className="space-y-6">
//           {/* New Password */}
//           <div>
//             <label
//               htmlFor="password"
//               className="block text-sm font-medium text-gray-700 mb-2"
//             >
//               New Password
//             </label>
//             <div className="relative">
//               <input
//                 id="password"
//                 type={showPassword ? "text" : "password"}
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 placeholder="Enter your new password"
//                 className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors pr-12 ${
//                   password && !isPasswordValid
//                     ? "border-red-300"
//                     : "border-gray-300"
//                 }`}
//                 required
//               />
//               <button
//                 type="button"
//                 onClick={() => setShowPassword(!showPassword)}
//                 className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
//               >
//                 {showPassword ? (
//                   <EyeOff className="w-5 h-5" />
//                 ) : (
//                   <Eye className="w-5 h-5" />
//                 )}
//               </button>
//             </div>
//             {password && !isPasswordValid && (
//               <p className="text-red-500 text-xs mt-1">
//                 Password must be at least 8 characters long
//               </p>
//             )}
//           </div>

//           {/* Confirm Password */}
//           <div>
//             <label
//               htmlFor="confirmPassword"
//               className="block text-sm font-medium text-gray-700 mb-2"
//             >
//               Confirm New Password
//             </label>
//             <div className="relative">
//               <input
//                 id="confirmPassword"
//                 type={showConfirmPassword ? "text" : "password"}
//                 value={confirmPassword}
//                 onChange={(e) => setConfirmPassword(e.target.value)}
//                 placeholder="Confirm your new password"
//                 className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors pr-12 ${
//                   confirmPassword && !passwordsMatch
//                     ? "border-red-300"
//                     : "border-gray-300"
//                 }`}
//                 required
//               />
//               <button
//                 type="button"
//                 onClick={() => setShowConfirmPassword(!showConfirmPassword)}
//                 className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
//               >
//                 {showConfirmPassword ? (
//                   <EyeOff className="w-5 h-5" />
//                 ) : (
//                   <Eye className="w-5 h-5" />
//                 )}
//               </button>
//             </div>
//             {confirmPassword && !passwordsMatch && (
//               <p className="text-red-500 text-xs mt-1">
//                 Passwords do not match
//               </p>
//             )}
//           </div>

//           {/* Reset Button */}
//           <button
//             onClick={handleResetPassword}
//             disabled={
//               !token || !isPasswordValid || !passwordsMatch || isLoading
//             }
//             className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
//           >
//             {isLoading ? (
//               <>
//                 <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
//                 Resetting Password...
//               </>
//             ) : (
//               "Reset Password"
//             )}
//           </button>
//         </div>

//         {/* Footer */}
//         <div className="mt-8 text-center">
//           <p className="text-sm text-gray-600">
//             Remember your password?{" "}
//             <a
//               href="/login"
//               className="text-indigo-600 hover:text-indigo-500 font-medium transition-colors"
//             >
//               Back to Login
//             </a>
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }

import { useState, useEffect } from "react";
import { Lock, Eye, EyeOff, CheckCircle } from "lucide-react";
import api from "@/utils/api";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [token, setToken] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  // Extract token from URL parameters on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get("token");
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    } else {
      setError("Invalid or missing reset token");
    }
  }, []);

  // Password validation
  const isPasswordValid = password.length >= 8;
  const passwordsMatch = password === confirmPassword && confirmPassword !== "";

  const handleResetPassword = async () => {
    if (!token) {
      setError("Reset token is missing");
      return;
    }

    if (!isPasswordValid) {
      setError("Password must be at least 8 characters long");
      return;
    }

    if (!passwordsMatch) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await api.post("/reset-password", {
        token: token,
        newPassword: password,
      });

      if (response.status === 200) {
        setIsSuccess(true);
        setTimeout(() => {
          window.location.href = "/login";
        }, 2000);
      } else {
        setError(response.data?.message || "Failed to reset password");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Network error. Please try again."
      );
      console.error("Reset password error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Success state
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Password Reset Successful!
          </h2>
          <p className="text-gray-600 mb-6">
            Your password has been successfully reset. You will be redirected to
            the login page in a moment.
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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Reset Your Password
          </h1>
          <p className="text-gray-600">Enter your new password below</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Form */}
        <div className="space-y-6">
          {/* New Password */}
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your new password"
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
              <p className="text-red-500 text-xs mt-1">
                Password must be at least 8 characters long
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Confirm New Password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your new password"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors pr-12 ${
                  confirmPassword && !passwordsMatch
                    ? "border-red-300"
                    : "border-gray-300"
                }`}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {confirmPassword && !passwordsMatch && (
              <p className="text-red-500 text-xs mt-1">
                Passwords do not match
              </p>
            )}
          </div>

          {/* Reset Button */}
          <button
            onClick={handleResetPassword}
            disabled={
              !token || !isPasswordValid || !passwordsMatch || isLoading
            }
            className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Resetting Password...
              </>
            ) : (
              "Reset Password"
            )}
          </button>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            Remember your password?{" "}
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
