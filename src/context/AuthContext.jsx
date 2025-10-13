// import React, { createContext, useEffect, useState } from "react";
// // import { useNavigate } from "react-router-dom";
// import { jwtDecode } from "jwt-decode";

// export const AuthContext = createContext();

// export const AuthProvider = ({ children }) => {
//   const [isAuthenticated, setIsAuthenticated] = useState(
//     !!localStorage.getItem("token")
//   );
//   //   const navigate = useNavigate();

//   const handleLogout = () => {
//     localStorage.removeItem("token");
//     localStorage.removeItem("user");
//     setIsAuthenticated(false);
//     window.location.href = "/login";
//   };

//   const checkTokenExpiration = () => {
//     const token = localStorage.getItem("token");
//     if (!token) {
//       setIsAuthenticated(false);
//       return;
//     }

//     try {
//       const decoded = jwtDecode(token);
//       const currentTime = Date.now();
//       if (decoded.exp * 1000 < currentTime) {
//         handleLogout();
//       } else {
//         setIsAuthenticated(true);
//         const timeUntilExpiration = decoded.exp * 1000 - currentTime;
//         setTimeout(handleLogout, timeUntilExpiration);
//       }
//     } catch (err) {
//       console.error("Invalid token:", err);
//       handleLogout();
//     }
//   };

//   useEffect(() => {
//     checkTokenExpiration();
//     // Optional: Poll periodically to check token validity
//     const interval = setInterval(checkTokenExpiration, 60000); // Check every minute
//     return () => clearInterval(interval);
//   }, []);

//   return (
//     <AuthContext.Provider value={{ isAuthenticated, handleLogout }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

import React, { createContext, useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// jwtDecode is no longer needed since we rely on the server/interceptor for validation.
// import { jwtDecode } from "jwt-decode";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Use 'token' presence to determine initial authentication state.
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem("token")
  );
  // const navigate = useNavigate(); // Uncomment if you are using React Router v6 navigate hook

  /**
   * Performs the manual logout action, clearing local storage and state.
   * This is called when a user explicitly clicks "Log Out."
   * Automatic logout is now handled by the Axios 401 interceptor.
   */
  const handleLogout = () => {
    localStorage.removeItem("token");
    // localStorage.removeItem("user");
    setIsAuthenticated(false);
    // Use window.location.replace to ensure the interceptor's redirect logic is consistent
    window.location.replace("/login");
  };

  /**
   * Simplifies token check to just verify presence.
   * Expiration handling is now done by the server and API interceptor.
   */
  const checkTokenStatus = () => {
    const token = localStorage.getItem("token");
    // If a token is present, we assume it's valid until the server tells us otherwise (via 401).
    setIsAuthenticated(!!token);
  };

  useEffect(() => {
    // Check token status once on mount
    checkTokenStatus();

    // Optional: Keep a periodic check, but this mainly ensures the state is correct
    // if the token was removed outside of a standard flow. The secure logout is still 401-driven.
    const interval = setInterval(checkTokenStatus, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  // Effect to listen for changes in localStorage (e.g., if token is set/cleared outside of context)
  useEffect(() => {
    const syncAuth = () => {
      setIsAuthenticated(!!localStorage.getItem("token"));
    };
    window.addEventListener("storage", syncAuth);

    return () => {
      window.removeEventListener("storage", syncAuth);
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, handleLogout, setIsAuthenticated }}
    >
      {children}
    </AuthContext.Provider>
  );
};
