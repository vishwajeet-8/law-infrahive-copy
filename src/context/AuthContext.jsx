import React, { createContext, useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem("token")
  );
  //   const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsAuthenticated(false);
    window.location.href = "/login";
  };

  const checkTokenExpiration = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setIsAuthenticated(false);
      return;
    }

    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now();
      if (decoded.exp * 1000 < currentTime) {
        handleLogout();
      } else {
        setIsAuthenticated(true);
        const timeUntilExpiration = decoded.exp * 1000 - currentTime;
        setTimeout(handleLogout, timeUntilExpiration);
      }
    } catch (err) {
      console.error("Invalid token:", err);
      handleLogout();
    }
  };

  useEffect(() => {
    checkTokenExpiration();
    // Optional: Poll periodically to check token validity
    const interval = setInterval(checkTokenExpiration, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, handleLogout }}>
      {children}
    </AuthContext.Provider>
  );
};
