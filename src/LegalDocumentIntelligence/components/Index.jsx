import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Paperclip,
  FileText,
  User,
  Bot,
  Scale,
  MessageSquare,
} from "lucide-react";
import { useParams } from "react-router-dom";
import { useLegalSessions } from "@/context/LegalSessionsContext";

const LegalDocumentIntelligence = () => {
  const { sessionId } = useParams();
  const { legalSessions, setLegalSessions } = useLegalSessions();
  // Load session messages
  const [messages, setMessages] = useState(legalSessions[sessionId] || []);

  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    setMessages(legalSessions[sessionId] || []);
  }, [sessionId, legalSessions]);

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: "user",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setLegalSessions((prev) => ({
      ...prev,
      [sessionId]: [...(prev[sessionId] || []), userMessage],
    }));
    setInputMessage("");
    setIsTyping(true);

    setTimeout(() => {
      const aiResponse = {
        id: Date.now() + 1,
        text: getAIResponse(inputMessage),
        sender: "ai",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => [...prev, aiResponse]);
      setLegalSessions((prev) => ({
        ...prev,
        [sessionId]: [...(prev[sessionId] || []), aiResponse],
      }));
      setIsTyping(false);
    }, 1500);
  };

  const getAIResponse = (message) => {
    const lowerMessage = message.toLowerCase();

    if (
      lowerMessage.includes("contract") ||
      lowerMessage.includes("agreement")
    ) {
      return "When reviewing contracts, I recommend focusing on these key areas:\\n\\n• Parties and Scope - Clearly defined roles and responsibilities\\n• Terms and Conditions - Payment terms, deliverables, and timelines\\n• Termination Clauses - How and when the contract can be ended\\n• Liability and Indemnification - Who's responsible for what risks\\n• Dispute Resolution - How conflicts will be handled\\n\\nWould you like me to explain any of these areas in more detail?";
    }

    if (lowerMessage.includes("liability")) {
      return "Liability clauses are crucial in legal agreements. They determine:\\n\\n• Limitation of Liability - Caps on damages one party can claim\\n• Mutual Indemnification - Both parties protect each other from third-party claims\\n• Exclusion of Damages - Types of damages that cannot be claimed\\n• Insurance Requirements - Minimum coverage requirements\\n\\nThese clauses protect parties from excessive financial exposure.";
    }

    const generalResponses = [
      "I'm here to help with your legal questions. Could you provide more specific details about the legal matter you're dealing with?",
      "That's an interesting legal question. To give you the best guidance, could you share more context about your situation?",
      "I can help analyze legal documents and explain legal concepts. What specific area of law are you most interested in?",
      "Legal matters can be complex. I'm here to help break down the concepts and guide you through the key considerations.",
    ];

    return generalResponses[
      Math.floor(Math.random() * generalResponses.length)
    ];
  };

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    const newFiles = files.map((file) => ({
      id: Date.now() + Math.random(),
      name: file.name,
      size: (file.size / 1024 / 1024).toFixed(2) + " MB",
    }));

    setUploadedFiles((prev) => [...prev, ...newFiles]);

    const uploadMessage = {
      id: Date.now(),
      text: `📄 Successfully uploaded: ${files
        .map((f) => f.name)
        .join(", ")}\\n\\nI can now help you analyze these documents.`,
      sender: "system",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    setMessages((prev) => [...prev, uploadMessage]);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="flex items-center gap-3">
          <div>
            <p className="font-bold text-gray-900">AI Legal Assistant</p>
            <p className="text-gray-600">
              Legal document analysis and advisory
            </p>
          </div>
        </div>

        {uploadedFiles.length > 0 && (
          <div className="mt-4 bg-gray-100 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-gray-700">
                Uploaded Documents:
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {uploadedFiles.map((file) => (
                <span
                  key={file.id}
                  className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                >
                  {file.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="bg-blue-600 p-6 rounded-full mb-6">
              <Bot className="w-12 h-12 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              Ready to Assist
            </h3>
            <p className="text-gray-600 max-w-md">
              Your AI legal assistant, specialized in document analysis,
              contract review, and legal guidance.
            </p>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.sender === "user" ? "justify-end" : "justify-start"
                } ${message.sender === "system" ? "justify-center" : ""}`}
              >
                <div
                  className={`flex items-start gap-3 max-w-3xl ${
                    message.sender === "user" ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  {message.sender !== "system" && (
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        message.sender === "user"
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {message.sender === "user" ? (
                        <User className="w-4 h-4" />
                      ) : (
                        <Bot className="w-4 h-4" />
                      )}
                    </div>
                  )}
                  <div
                    className={`px-4 py-3 rounded-lg ${
                      message.sender === "user"
                        ? "bg-blue-600 text-white"
                        : message.sender === "system"
                        ? "bg-green-100 text-green-800 border border-green-200"
                        : "bg-white text-gray-900 border border-gray-200"
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{message.text}</div>
                    <div
                      className={`text-xs mt-2 ${
                        message.sender === "user"
                          ? "text-blue-100"
                          : message.sender === "system"
                          ? "text-green-600"
                          : "text-gray-500"
                      }`}
                    >
                      {message.timestamp}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="bg-white border border-gray-200 px-4 py-3 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                      </div>
                      <span className="text-gray-600 text-sm">Thinking...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Enhanced Input */}
      <div className="bg-gradient-to-t from-gray-50 to-white border-t border-gray-200 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="relative bg-white rounded-2xl border-2 border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 focus-within:border-blue-500 focus-within:shadow-blue-100">
            <div className="flex items-end gap-3 p-4">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="group flex-shrink-0 p-3 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-300 border border-gray-200 hover:border-blue-300 hover:shadow-sm"
                title="Upload legal documents (PDF, DOC, TXT)"
              >
                <Paperclip className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
              </button>

              <div className="flex-1 relative">
                <textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about contracts, legal terms, document analysis, or any legal questions..."
                  className="w-full px-4 py-3 bg-transparent border-none focus:outline-none resize-none text-gray-900 placeholder-gray-500 text-base leading-relaxed"
                  rows="1"
                  style={{
                    minHeight: "50px",
                    maxHeight: "150px",
                    lineHeight: "1.6",
                  }}
                  onInput={(e) => {
                    e.target.style.height = "auto";
                    e.target.style.height =
                      Math.min(e.target.scrollHeight, 150) + "px";
                  }}
                  onFocus={(e) =>
                    e.target.parentElement.parentElement.parentElement.classList.add(
                      "ring-2",
                      "ring-blue-500",
                      "ring-opacity-20"
                    )
                  }
                  onBlur={(e) =>
                    e.target.parentElement.parentElement.parentElement.classList.remove(
                      "ring-2",
                      "ring-blue-500",
                      "ring-opacity-20"
                    )
                  }
                />

                {/* Character counter for long messages */}
                {inputMessage.length > 100 && (
                  <div className="absolute bottom-1 left-2 text-xs text-gray-400 bg-white px-2 rounded">
                    {inputMessage.length}/1000
                  </div>
                )}

                {/* Enhanced hint */}
                {!inputMessage && (
                  <div className="absolute bottom-2 right-3 text-xs text-gray-400 bg-white px-2 rounded flex items-center gap-1">
                    <span>⏎</span>
                    <span>Send</span>
                  </div>
                )}
              </div>

              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isTyping}
                className="group flex-shrink-0 p-3.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 active:bg-blue-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95 disabled:transform-none disabled:hover:scale-100 relative overflow-hidden"
                title={
                  !inputMessage.trim()
                    ? "Type a message to send"
                    : "Send message"
                }
              >
                <Send className="w-5 h-5 relative z-10 group-hover:translate-x-0.5 transition-transform duration-300" />
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            </div>

            {/* Progress bar when typing */}
            {inputMessage && (
              <div
                className="absolute bottom-0 left-0 h-0.5 bg-blue-500 transition-all duration-300"
                style={{
                  width: `${Math.min((inputMessage.length / 100) * 100, 100)}%`,
                }}
              ></div>
            )}
          </div>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.doc,.docx,.txt,.rtf"
        onChange={handleFileUpload}
        className="hidden"
      />
    </div>
  );
};

export default LegalDocumentIntelligence;
