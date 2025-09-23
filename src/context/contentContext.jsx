import { createContext, useEffect, useState } from "react";
import mammoth from "mammoth";
// import PizZip from "pizzip";
// import Docxtemplater from "docxtemplater";

export const contentContext = createContext();

export const ContentProvider = ({ children }) => {
  const [fileContent, setFileContent] = useState({
    type: "",
    content: "",
  });
  const [fileName, setFileName] = useState("");

  const handleFileChange = async (event) => {
    const file = event.target.files[0];

    if (file && file.name.endsWith(".docx")) {
      try {
        const arrayBuffer = await file.arrayBuffer();

        const result = await mammoth.convertToHtml({ arrayBuffer });

        if (result.value) {
          const chunks = result.value;
          setFileContent(() => ({ type: "file", content: chunks }));
        } else {
          console.log("Error: No content extracted");
        }
        setFileName(file.name);
      } catch (error) {
        console.error("Error reading .docx file:", error);
        setFileContent("Error extracting content from the document.");
      }
    } else {
      setFileContent("Unsupported file type. Please upload a .docx file.");
    }
  };

  return (
    <contentContext.Provider
      value={{ fileContent, setFileContent, handleFileChange, fileName }}
    >
      {children}
    </contentContext.Provider>
  );
};
