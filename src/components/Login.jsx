import React, { useState } from "react";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import api from "@/utils/api";
import { jwtDecode } from "jwt-decode";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [rememberMe, setRememberMe] = useState(false);

  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};

    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      const res = await api.post("/login", {
        email,
        password,
      });
      setErrors({ success: "Login successful! Redirecting..." });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      const token = res.data.token;
      const { workspaceId } = jwtDecode(token);
      navigate(`/workspaces/${workspaceId}`);
    } catch (error) {
      setErrors({ general: "Login failed. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.1)_0%,transparent_50%)]"></div>

      <div className="relative bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 w-full max-w-md border border-gray-200/20">
        {/* Logo */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center justify-center space-x-3">
            <div className="relative w-20">
              <img src="/assets/logo.png" alt="" />
            </div>
            <div>
              <span className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                Infra
                <span className="bg-gradient-to-r from-yellow-500 to-yellow-600 bg-clip-text text-transparent">
                  Hive
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Success/Error Messages */}
        {errors.success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-2">
            <CheckCircle className="text-green-600" size={16} />
            <span className="text-green-700 text-sm">{errors.success}</span>
          </div>
        )}

        {errors.general && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
            <AlertCircle className="text-red-600" size={16} />
            <span className="text-red-700 text-sm">{errors.general}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Field */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-semibold text-blue-600 mb-2"
            >
              Email address*
            </label>
            <div className="relative">
              <Mail
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="email"
                id="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${
                  errors.email
                    ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                    : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                }`}
                placeholder="Enter your email"
                disabled={isLoading}
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                <AlertCircle size={14} />
                <span>{errors.email}</span>
              </p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Password*
            </label>
            <div className="relative">
              <Lock
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${
                  errors.password
                    ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                    : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                }`}
                placeholder="Enter your password"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                disabled={isLoading}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                <AlertCircle size={14} />
                <span>{errors.password}</span>
              </p>
            )}
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between">
            <Link
              to={"/request-forgot-password"}
              type="button"
              className="text-sm text-blue-600 hover:text-blue-800 font-medium hover:underline transition-colors"
              disabled={isLoading}
            >
              Forgot password?
            </Link>
          </div>

          {/* Continue Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 disabled:from-gray-300 disabled:to-gray-400 text-black font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:scale-100 shadow-lg hover:shadow-xl disabled:shadow-md"
          >
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                <span>Signing in...</span>
              </div>
            ) : (
              "Continue"
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            By continuing, you agree to our{" "}
            <button className="text-blue-600 hover:underline">Terms</button> and{" "}
            <button className="text-blue-600 hover:underline">
              Privacy Policy
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

// import React, { useState } from "react";
// import {
//   Eye,
//   EyeOff,
//   Mail,
//   Lock,
//   AlertCircle,
//   CheckCircle,
// } from "lucide-react";
// import { Link, useNavigate } from "react-router-dom";
// import api from "@/utils/api";
// import { jwtDecode } from "jwt-decode";

// export default function Login() {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [showPassword, setShowPassword] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
//   const [errors, setErrors] = useState({});
//   const [rememberMe, setRememberMe] = useState(false);

//   const navigate = useNavigate();

//   const validateForm = () => {
//     const newErrors = {};

//     if (!email) {
//       newErrors.email = "Email is required";
//     } else if (!/\S+@\S+\.\S+/.test(email)) {
//       newErrors.email = "Please enter a valid email";
//     }

//     if (!password) {
//       newErrors.password = "Password is required";
//     } else if (password.length < 6) {
//       newErrors.password = "Password must be at least 6 characters";
//     }

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!validateForm()) return;

//     setIsLoading(true);
//     setErrors({});

//     try {
//       const res = await api.post("/login", {
//         email,
//         password,
//       });
//       setErrors({ success: "Login successful! Redirecting..." });
//       localStorage.setItem("token", res.data.token);
//       localStorage.setItem("user", JSON.stringify(res.data.user));

//       const token = res.data.token;
//       const { workspaceId } = jwtDecode(token);
//       navigate(`/workspaces/${workspaceId}`);
//     } catch (error) {
//       setErrors({ general: "Login failed. Please try again." });
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4">
//       <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.1)_0%,transparent_50%)]"></div>

//       <div className="relative bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 w-full max-w-md border border-gray-200/20">
//         {/* Logo */}
//         <div className="flex items-center justify-center mb-8">
//           <div className="flex items-center justify-center space-x-3">
//             <div className="relative w-20">
//               <img src="/assets/logo.png" alt="" />
//             </div>
//             <div>
//               <span className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
//                 Infra
//                 <span className="bg-gradient-to-r from-yellow-500 to-yellow-600 bg-clip-text text-transparent">
//                   Hive
//                 </span>
//               </span>
//             </div>
//           </div>
//         </div>

//         {/* Success/Error Messages */}
//         {errors.success && (
//           <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-2">
//             <CheckCircle className="text-green-600" size={16} />
//             <span className="text-green-700 text-sm">{errors.success}</span>
//           </div>
//         )}

//         {errors.general && (
//           <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
//             <AlertCircle className="text-red-600" size={16} />
//             <span className="text-red-700 text-sm">{errors.general}</span>
//           </div>
//         )}

//         {/* Form */}
//         <form onSubmit={handleSubmit} className="space-y-6">
//           {/* Email Field */}
//           <div>
//             <label
//               htmlFor="email"
//               className="block text-sm font-semibold text-blue-600 mb-2"
//             >
//               Email address*
//             </label>
//             <div className="relative">
//               <Mail
//                 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
//                 size={18}
//               />
//               <input
//                 type="email"
//                 id="email"
//                 autoComplete="email"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${
//                   errors.email
//                     ? "border-red-300 focus:ring-red-500 focus:border-red-500"
//                     : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
//                 }`}
//                 placeholder="Enter your email"
//                 disabled={isLoading}
//               />
//             </div>
//             {errors.email && (
//               <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
//                 <AlertCircle size={14} />
//                 <span>{errors.email}</span>
//               </p>
//             )}
//           </div>

//           {/* Password Field */}
//           <div>
//             <label
//               htmlFor="password"
//               className="block text-sm font-semibold text-gray-700 mb-2"
//             >
//               Password*
//             </label>
//             <div className="relative">
//               <Lock
//                 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
//                 size={18}
//               />
//               <input
//                 type={showPassword ? "text" : "password"}
//                 id="password"
//                 autoComplete="current-password"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${
//                   errors.password
//                     ? "border-red-300 focus:ring-red-500 focus:border-red-500"
//                     : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
//                 }`}
//                 placeholder="Enter your password"
//                 disabled={isLoading}
//               />
//               <button
//                 type="button"
//                 onClick={() => setShowPassword(!showPassword)}
//                 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
//                 disabled={isLoading}
//               >
//                 {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
//               </button>
//             </div>
//             {errors.password && (
//               <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
//                 <AlertCircle size={14} />
//                 <span>{errors.password}</span>
//               </p>
//             )}
//           </div>

//           {/* Remember Me & Forgot Password */}
//           <div className="flex items-center justify-between">
//             <Link
//               to={"/request-forgot-password"}
//               type="button"
//               className="text-sm text-blue-600 hover:text-blue-800 font-medium hover:underline transition-colors"
//               disabled={isLoading}
//             >
//               Forgot password?
//             </Link>
//           </div>

//           {/* Continue Button */}
//           <button
//             type="submit"
//             disabled={isLoading}
//             className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 disabled:from-gray-300 disabled:to-gray-400 text-black font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:scale-100 shadow-lg hover:shadow-xl disabled:shadow-md"
//           >
//             {isLoading ? (
//               <div className="flex items-center justify-center space-x-2">
//                 <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
//                 <span>Signing in...</span>
//               </div>
//             ) : (
//               "Continue"
//             )}
//           </button>
//         </form>

//         {/* Footer */}
//         <div className="mt-6 text-center">
//           <p className="text-xs text-gray-500">
//             By continuing, you agree to our{" "}
//             <button className="text-blue-600 hover:underline">Terms</button> and{" "}
//             <button className="text-blue-600 hover:underline">
//               Privacy Policy
//             </button>
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }
