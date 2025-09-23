import { createContext, useState } from "react";

export const variableContext = createContext();

export const VariableProvider = ({ children }) => {
  const [focusedVariable, setFocusedVariable] = useState(null);

  return (
    <variableContext.Provider value={{ focusedVariable, setFocusedVariable }}>
      {children}
    </variableContext.Provider>
  );
};
