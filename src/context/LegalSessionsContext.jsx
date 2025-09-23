import { createContext, useContext, useState, useEffect } from "react";

const LegalSessionsContext = createContext();

export function LegalSessionsProvider({ children }) {
  const [legalSessions, setLegalSessions] = useState(() => {
    return JSON.parse(localStorage.getItem("legalSessions") || "{}");
  });

  useEffect(() => {
    localStorage.setItem("legalSessions", JSON.stringify(legalSessions));
  }, [legalSessions]);

  return (
    <LegalSessionsContext.Provider value={{ legalSessions, setLegalSessions }}>
      {children}
    </LegalSessionsContext.Provider>
  );
}

export function useLegalSessions() {
  return useContext(LegalSessionsContext);
}
