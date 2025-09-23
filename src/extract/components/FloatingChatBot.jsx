import React, { useState, useEffect, useRef } from "react";
import {
  ChevronRight,
  MessageCircle,
  Send,
  X,
  Loader2,
  Download,
} from "lucide-react";
import { createPortal } from "react-dom";
// import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';

const FloatingChatBot = ({ documentName, onClose, isOpen }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef(null);

  const cleanFileName = (fileName) => {
    return fileName ? fileName.replace(/\.[^/.]+$/, "") : "";
  };

  useEffect(() => {
    if (isOpen) {
      setMessages([
        {
          type: "bot",
          content: `Hello! I'm here to help you with questions about ${cleanFileName(
            documentName
          )}. What would you like to know?`,
        },
      ]);
      setInputMessage("");
      setIsLoading(false);
    }
  }, [isOpen, documentName]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleDownload = async (userQuery, response, citations) => {
    try {
      // Create a new document
      const doc = new Document({
        sections: [
          {
            properties: {},
            children: [
              new Paragraph({
                heading: HeadingLevel.HEADING_1,
                children: [
                  new TextRun({
                    text: "User Query",
                    bold: true,
                    size: 28,
                  }),
                ],
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: userQuery,
                    size: 24,
                  }),
                ],
              }),
              new Paragraph({
                children: [new TextRun("")],
              }),
              new Paragraph({
                heading: HeadingLevel.HEADING_1,
                children: [
                  new TextRun({
                    text: "Response",
                    bold: true,
                    size: 28,
                  }),
                ],
              }),
              ...response.split("\n").map((line) => {
                // Process bold text within each line
                const segments = [];
                let lastIndex = 0;
                const boldRegex = /\*\*(.*?)\*\*/g;
                let match;

                while ((match = boldRegex.exec(line)) !== null) {
                  // Add text before the bold part
                  if (match.index > lastIndex) {
                    segments.push(
                      new TextRun({
                        text: line.slice(lastIndex, match.index),
                        size: 24,
                      })
                    );
                  }
                  // Add the bold text
                  segments.push(
                    new TextRun({
                      text: match[1],
                      bold: true,
                      size: 24,
                    })
                  );
                  lastIndex = match.index + match[0].length;
                }
                // Add remaining text after last bold part
                if (lastIndex < line.length) {
                  segments.push(
                    new TextRun({
                      text: line.slice(lastIndex),
                      size: 24,
                    })
                  );
                }

                return new Paragraph({
                  children:
                    segments.length > 0
                      ? segments
                      : [new TextRun({ text: line, size: 24 })],
                });
              }),
            ],
          },
        ],
      });

      // Add citations if they exist
      if (citations && citations.length > 0) {
        doc.addSection({
          children: [
            new Paragraph({
              heading: HeadingLevel.HEADING_1,
              children: [
                new TextRun({
                  text: "Citations",
                  bold: true,
                  size: 28,
                }),
              ],
            }),
            ...citations
              .map((citation, index) => [
                new Paragraph({
                  heading: HeadingLevel.HEADING_2,
                  children: [
                    new TextRun({
                      text: `Citation ${index + 1} (Page ${
                        citation.page_number
                      })`,
                      bold: true,
                      size: 24,
                    }),
                  ],
                }),
                ...citation.content.split("\n").map((line) => {
                  // Process bold text within each citation line
                  const segments = [];
                  let lastIndex = 0;
                  const boldRegex = /\*\*(.*?)\*\*/g;
                  let match;

                  while ((match = boldRegex.exec(line)) !== null) {
                    if (match.index > lastIndex) {
                      segments.push(
                        new TextRun({
                          text: line.slice(lastIndex, match.index),
                          size: 24,
                        })
                      );
                    }
                    segments.push(
                      new TextRun({
                        text: match[1],
                        bold: true,
                        size: 24,
                      })
                    );
                    lastIndex = match.index + match[0].length;
                  }
                  if (lastIndex < line.length) {
                    segments.push(
                      new TextRun({
                        text: line.slice(lastIndex),
                        size: 24,
                      })
                    );
                  }

                  return new Paragraph({
                    children:
                      segments.length > 0
                        ? segments
                        : [new TextRun({ text: line, size: 24 })],
                  });
                }),
                new Paragraph({
                  children: [new TextRun("")],
                }),
              ])
              .flat(),
          ],
        });
      }

      // Generate the document
      const blob = await Packer.toBlob(doc);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const timestamp = new Date()
        .toISOString()
        .slice(0, 19)
        .replace(/:/g, "-");
      a.href = url;
      a.download = `response_${timestamp}.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error generating document:", error);
      alert("Failed to generate document. Please try again.");
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const newMessage = { type: "user", content: inputMessage };
    setMessages((prev) => [...prev, newMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const response = await fetch(
        "https://legal-ai-backend-draft-drh9bmergvh7a4a9.southeastasia-01.azurewebsites.net/legal/query/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            document: documentName,
            user_prompt: inputMessage,
          }),
        }
      );

      const data = await response.json();
      setMessages((prev) => [
        ...prev,
        {
          type: "bot",
          content: formatBotResponse(
            data.response,
            data.citations,
            inputMessage
          ),
          rawResponse: data.response,
          citations: data.citations,
          userQuery: inputMessage,
        },
      ]);
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => [
        ...prev,
        {
          type: "bot",
          content: "Sorry, I encountered an error. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatBotResponse = (response, citations) => {
    const boldText = (text) => {
      const regex = /\*\*(.*?)\*\*/g;
      return text.replace(regex, "<strong>$1</strong>");
    };

    const formattedResponse = response
      .split("\n")
      .map((line, index) => (
        <span
          key={index}
          dangerouslySetInnerHTML={{ __html: boldText(line) }}
        />
      ));

    return (
      <div>
        <div>
          {formattedResponse.map((line, index) => (
            <React.Fragment key={index}>
              {line}
              <br />
            </React.Fragment>
          ))}
        </div>
        {citations && citations.length > 0 && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <strong>Citations:</strong>
              <button
                onClick={() =>
                  handleDownload(inputMessage, response, citations)
                }
                className="flex items-center gap-2 px-3 py-1 text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-lg focus:outline-none transition-colors"
                title="Download response and citations"
              >
                <Download className="w-4 h-4" />
                <span>Save as Word</span>
              </button>
            </div>
            <div className="space-y-2">
              {citations.map((citation, index) => (
                <div key={index} className="border rounded-lg">
                  <button
                    className="w-full flex justify-between text-left px-4 py-2 bg-slate-400 rounded-md hover:bg-gray-300 focus:outline-none focus:bg-gray-300"
                    onClick={() => toggleAccordion(index)}
                  >
                    <span>
                      Citation {index + 1} (Page {citation.page_number})
                    </span>
                    <span id={`toggle-icon-${index}`}>+</span>
                  </button>
                  <div className="accordion-content hidden px-4 py-2 bg-[#FAF5EB]">
                    <pre className="whitespace-pre-wrap">
                      {boldText(citation.content)}
                    </pre>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const toggleAccordion = (index) => {
    const content = document.querySelectorAll(".accordion-content")[index];
    const isOpen = content.classList.contains("hidden");
    content.classList.toggle("hidden", !isOpen);

    const toggleIcon = document.getElementById(`toggle-icon-${index}`);
    toggleIcon.textContent = isOpen ? "-" : "+";
  };

  if (!isOpen) return null;

  const chatWindow = (
    <div className="fixed bottom-0 right-0 w-96 bg-white shadow-xl flex flex-col h-[93.5vh] border-l-2 border-gray-300">
      {/* Rest of the component remains the same */}
      <div className="flex justify-between items-center p-4 border-b bg-blue-600 text-white">
        <h3 className="font-semibold flex items-center gap-2">
          <img
            src="https://infrahive-ai-search.vercel.app/Logo%20(Digest).png"
            alt="Logo"
            className="h-8 z-20"
          />
          Chat with {cleanFileName(documentName)}
        </h3>
        <button onClick={onClose} className="text-white hover:text-gray-50">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.type === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-lg ${
                message.type === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 text-black shadow-lg"
              }`}
              ref={message.type === "user" ? inputRef : null}
            >
              {message.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start items-center space-x-2">
            <div className="bg-slate-100 shadow-lg text-black p-3 rounded-lg flex items-center space-x-2">
              <span>Getting Data</span>
              <span className="dot-1">.</span>
              <span className="dot-2">.</span>
              <span className="dot-3">.</span>
            </div>
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder="Type your message..."
            className="flex-1 py-2 px-4 h-12 border-2 border-blue-400 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoading || !inputMessage.trim()}
            className="p-2"
          >
            <svg
              width="35"
              height="35"
              className="text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-400"
              viewBox="0 0 44 44"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="22" cy="22" r="22" fill="#2463EB" />
              <path
                d="M14.5882 18.1194L15.3143 18.307L14.5882 18.1194ZM18.088 14.8253L18.2293 15.5619L18.088 14.8253ZM20.1526 23.5436L19.941 22.8241L20.1526 23.5436ZM21.2594 24.6503L20.5398 24.4387L21.2594 24.6503ZM26.6836 30.2148L26.8712 30.941L26.6836 30.2148ZM29.9777 26.715L30.7142 26.8563L29.9777 26.715ZM31.7323 17.5659L30.9957 17.4247L31.7323 17.5659ZM27.237 13.0707L27.0958 12.3341L27.237 13.0707ZM16.0052 27.7371C15.7123 28.03 15.7123 28.5049 16.0052 28.7978C16.2981 29.0907 16.773 29.0907 17.0659 28.7978L16.0052 27.7371ZM18.4801 27.3836C18.773 27.0907 18.773 26.6158 18.4801 26.3229C18.1872 26.03 17.7123 26.03 17.4194 26.3229L18.4801 27.3836ZM16.7123 31.2727C16.4194 31.5656 16.4194 32.0404 16.7123 32.3333C17.0052 32.6262 17.4801 32.6262 17.773 32.3333L16.7123 31.2727ZM19.1872 30.9191C19.4801 30.6262 19.4801 30.1514 19.1872 29.8585C18.8943 29.5656 18.4194 29.5656 18.1265 29.8585L19.1872 30.9191ZM12.4697 27.03C12.1768 27.3229 12.1768 27.7978 12.4697 28.0907C12.7626 28.3836 13.2374 28.3836 13.5303 28.0907L12.4697 27.03ZM14.9445 26.6765C15.2374 26.3836 15.2374 25.9087 14.9445 25.6158C14.6517 25.3229 14.1768 25.3229 13.8839 25.6158L14.9445 26.6765ZM30.9957 17.4247L29.2411 26.5737L30.7142 26.8563L32.4689 17.7072L30.9957 17.4247ZM18.2293 15.5619L27.3783 13.8073L27.0958 12.3341L17.9467 14.0888L18.2293 15.5619ZM15.3143 18.307C15.6759 16.9075 16.8144 15.8333 18.2293 15.5619L17.9467 14.0888C15.9579 14.4702 14.3673 15.9756 13.862 17.9318L15.3143 18.307ZM19.941 22.8241C17.1886 23.6335 14.5918 21.1041 15.3143 18.307L13.862 17.9318C12.8531 21.8374 16.4752 25.4068 20.3642 24.2631L19.941 22.8241ZM21.9789 24.8619C22.3454 23.6155 21.1874 22.4575 19.941 22.8241L20.3642 24.2631C20.4716 24.2315 20.5714 24.3313 20.5398 24.4387L21.9789 24.8619ZM26.496 29.4887C23.6989 30.2112 21.1695 27.6144 21.9789 24.8619L20.5398 24.4387C19.3962 28.3278 22.9656 31.9499 26.8712 30.941L26.496 29.4887ZM29.2411 26.5737C28.9697 27.9886 27.8955 29.1272 26.496 29.4887L26.8712 30.941C28.8274 30.4357 30.3328 28.8451 30.7142 26.8563L29.2411 26.5737ZM32.4689 17.7072C33.08 14.5206 30.2824 11.723 27.0958 12.3341L27.3783 13.8073C29.5237 13.3958 31.4072 15.2793 30.9957 17.4247L32.4689 17.7072ZM17.0659 28.7978L18.4801 27.3836L17.4194 26.3229L16.0052 27.7371L17.0659 28.7978ZM17.773 32.3333L19.1872 30.9191L18.1265 29.8585L16.7123 31.2727L17.773 32.3333ZM13.5303 28.0907L14.9445 26.6765L13.8839 25.6158L12.4697 27.03L13.5303 28.0907Z"
                fill="#F2F4F5"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(chatWindow, document.body);
};

export default FloatingChatBot;
