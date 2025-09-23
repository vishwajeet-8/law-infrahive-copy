import React, { useState } from "react";
import ProgressBar from "./components/ProgressBar";
import FileUpload from "./components/FileUpload";
import TagInput from "./components/TagInput";
import DataView from "./components/DataView";
import { Sparkles, FileText, Settings } from "lucide-react";
import api from "@/utils/api";
import { useParams } from "react-router-dom";

const Extract = () => {
  const { workspaceId } = useParams();
  const [currentStep, setCurrentStep] = useState(1);
  const [files, setFiles] = useState([]);
  const [tags, setTags] = useState([]);
  const [extractedData, setExtractedData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const handleExtraction = async ({ tags, instructions, agent }) => {
    setIsLoading(true);
    setError(null);
    setProgress(0);

    try {
      const base64Files = await Promise.all(
        files.map((file) => {
          return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result.split(",")[1]);
            reader.onerror = (error) => reject(error);
            reader.readAsDataURL(file.file);
          });
        })
      );

      const payload = {
        files: base64Files,
        user_prompt: instructions || "",
        variables: tags,
      };

      const response = await fetch(
        `${import.meta.env.VITE_PY_LEGAL_API}/extract`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      console.log("API Response:", responseData);

      const results = files.map((file) => {
        const extractedData = responseData.content[0] || {};
        return {
          fileName: file.file.name,
          extractedData: extractedData,
          usage: responseData.usage,
          rawResponse: responseData,
          agent: agent || "Unassigned", // Include agent in results
        };
      });

      setExtractedData(results);
      setCurrentStep(3);

      await api.post(
        "/save-extraction",
        {
          extractedResults: results,
          workspaceId,
          agent: agent || "Unassigned", // Pass custom agent name
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
    } catch (err) {
      setError(`Error during extraction: ${err.message}`);
      console.error("Error during extraction:", err);
    } finally {
      setIsLoading(false);
      setProgress(0);
    }
  };

  const containerStyle = {
    transition: "margin-right 0.3s ease-in-out",
    marginRight: isChatOpen ? "384px" : "0",
  };

  const getStepInfo = (step) => {
    const stepInfo = {
      1: {
        title: "Upload Documents",
        subtitle: "Select your files for processing",
        icon: FileText,
      },
      2: {
        title: "Configure Extraction",
        subtitle: "Define keywords and parameters",
        icon: Settings,
      },
      3: {
        title: "Review Results",
        subtitle: "Analyze extracted data",
        icon: Sparkles,
      },
    };
    return stepInfo[step] || stepInfo[1];
  };

  const currentStepInfo = getStepInfo(currentStep);
  const StepIcon = currentStepInfo.icon;

  return (
    <>
      {/* Modern minimal background */}
      <div className="min-h-screen bg-gray-50">
        <div
          className="min-h-screen transition-all duration-300"
          style={containerStyle}
        >
          <div className="max-w-7xl m-auto p-6 ml-10">
            {/* Clean Header Section */}
            <div className="mb-10">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                  <StepIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-semibold text-gray-900">
                    {currentStepInfo.title}
                  </h1>
                  <p className="text-gray-500 mt-1">
                    {currentStepInfo.subtitle}
                  </p>
                </div>
              </div>
            </div>

            {/* Modern Content Card */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
              {/* Progress Section */}
              <div className="bg-gray-50 px-8 py-6 border-b border-gray-100">
                <ProgressBar currentStep={currentStep} />
              </div>

              {/* Content Section */}
              <div className="p-8">
                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span className="font-medium text-red-900">Error</span>
                    </div>
                    <p className="mt-1 text-sm text-red-700">{error}</p>
                  </div>
                )}

                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-16">
                    {/* Modern Loading Animation */}
                    <div className="relative mb-8">
                      <div className="w-16 h-16 border-4 border-gray-200 rounded-full"></div>
                      <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-blue-500 rounded-full animate-spin"></div>
                    </div>

                    <div className="text-center max-w-sm">
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Processing Documents
                      </h3>
                      <p className="text-gray-500 mb-6">
                        Document {Math.round((progress / 100) * files.length)}{" "}
                        of {files.length}
                      </p>

                      {/* Clean Progress Bar */}
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        />
                      </div>

                      <div className="mt-3 text-sm text-gray-400">
                        {Math.round(progress)}% Complete
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    {currentStep === 1 && (
                      <FileUpload
                        files={files}
                        setFiles={setFiles}
                        onNext={() => setCurrentStep(2)}
                      />
                    )}

                    {currentStep === 2 && (
                      <TagInput
                        onBack={() => setCurrentStep(1)}
                        onNext={handleExtraction}
                      />
                    )}

                    {currentStep === 3 && (
                      <DataView
                        extractedData={extractedData}
                        onBack={() => setCurrentStep(2)}
                        uploadedFiles={files}
                        onChatOpen={() => setIsChatOpen(true)}
                        onChatClose={() => setIsChatOpen(false)}
                      />
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Extract;
