import { useContext, useState } from "react";
import { createContext } from "react";

const ExtractionContext = createContext();

export const ExtractionProvider = ({ children }) => {
  const [agents, setAgents] = useState(() => {
    const stored = localStorage.getItem("agents");
    return stored ? JSON.parse(stored) : [];
  });

  return (
    <ExtractionContext.Provider value={{ agents, setAgents }}>
      {children}
    </ExtractionContext.Provider>
  );
};

export const useExtraction = () => useContext(ExtractionContext);
