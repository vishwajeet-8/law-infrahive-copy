import { useState, useRef, useEffect } from 'react';
import { 
  Sun, Moon, HelpCircle, Bot, ThumbsUp, 
  ThumbsDown, RotateCcw, Send, Loader, Link, ExternalLink, Home
} from 'lucide-react';
import '../index.css'

const ExtractChat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentResources, setCurrentResources] = useState([]);
  const [showSources, setShowSources] = useState(false);
  const [messageIdCounter, setMessageIdCounter] = useState(1);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (input.trim()) {
      const userMessageId = messageIdCounter;
      setMessageIdCounter(prev => prev + 1);

      setMessages(prev => [...prev, { 
        role: 'user', 
        content: input.trim(),
        id: userMessageId
      }]);
      setLoading(true);
      setInput('');
      setShowSources(false);

      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}legal/summarise/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_prompt: input.trim()
          })
        });

        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }

        const data = await response.json();
        
        const assistantMessageId = messageIdCounter + 1;
        setMessageIdCounter(prev => prev + 1);

        const resources = data.source_files.map((file, index) => ({
          title: file,
          link: data.links[index] || '#',
        }));

        const formattedResponse = {
          role: 'assistant',
          content: {
            text: data.response,
            resources: resources
          },
          id: assistantMessageId
        };
        
        setMessages(prev => [...prev, formattedResponse]);
        setCurrentResources(resources);
      } catch (error) {
        console.error('Error:', error);
        const errorMessageId = messageIdCounter + 1;
        setMessageIdCounter(prev => prev + 1);
        
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: {
            text: `Error: ${error.message}. Please try again.`,
            resources: []
          },
          id: errorMessageId
        }]);
      } finally {
        setLoading(false);
      }
    }
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const toggleSources = () => {
    setShowSources(!showSources);
  };

  const isEmpty = messages.length === 0 && !loading;

  const renderAssistantContent = (content) => {
  if (!content?.text) return null;

  // Replace literal \n with actual line breaks
  const processedText = content.text.replace(/\\n/g, '\n');
  const lines = processedText.split('\n');

  return (
    <div className={`space-y-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
      <div className={`text-sm leading-relaxed ${
        isDarkMode ? 'text-gray-300' : 'text-gray-700'
      }`}>
        {lines.map((line, index) => {
          if (!line.trim()) {
            return <div key={index} className="h-4" />; // Empty line spacing
          }

          const isBulletPoint = line.trim().startsWith('-');
          const isNumberedPoint = /^\d+\./.test(line.trim());

          return (
            <div 
              key={index} 
              className={`
                ${isBulletPoint ? 'pl-8 py-1' : ''}
                ${isNumberedPoint ? 'font-semibold py-2' : ''}
              `}
            >
              <p>{line.trim()}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

  return (
    <div className="flex h-screen" style={{ backgroundColor: isDarkMode ? '#212121' : '#ffffff' }}>
      <div className="flex-1 flex flex-col relative">
      {/* Navigation Bar */}
      <nav
        className={`border-b p-2 flex items-center justify-between sticky top-0 z-20 ${
          isDarkMode ? "border-gray-700" : "border-gray-200"
        }`}
        style={{ backgroundColor: isDarkMode ? "#212121" : "#ffffff" }}
      >
          <div className="flex items-center">
          <a
            href="/"
            className={`p-2 rounded-md ${
              isDarkMode ? "hover:bg-gray-800 text-white" : "hover:bg-gray-100 text-gray-800"
            }`}
          >
            <Home size={20} />
          </a>
        </div>
          <div className="flex items-center gap-2">
            <button onClick={toggleTheme} className={`p-2 rounded-md ${
              isDarkMode ? 'hover:bg-gray-800 text-white' : 'hover:bg-gray-100 text-gray-800'
            }`}>
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button className={`p-2 rounded-md ${
              isDarkMode ? 'hover:bg-gray-800 text-white' : 'hover:bg-gray-100 text-gray-800'
            }`}>
              <HelpCircle size={20} />
            </button>
          </div>
        </nav>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          {isEmpty ? (
            // Empty State
            <div className="h-full flex flex-col justify-center items-center p-4">
              <h1 className={`text-4xl font-bold text-center mb-8 ${
                isDarkMode ? 'text-white' : 'text-gray-800'
              }`}>
                Document Analysis Assistant
              </h1>
              <div className="w-full max-w-2xl">
                <form onSubmit={handleSubmit} className="relative">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about your documents..."
                    className={`w-full p-4 pr-12 rounded-lg border focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      isDarkMode 
                        ? 'border-gray-600 bg-gray-800 text-white placeholder-gray-400' 
                        : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                    }`}
                  />
                  <button 
                    type="submit"
                    disabled={!input.trim() || loading}
                    className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 disabled:opacity-50 ${
                      isDarkMode
                        ? 'text-gray-400 hover:text-gray-200'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Send size={20} />
                  </button>
                </form>
              </div>
            </div>
          ) : (
            // Chat Interface
            <div className="flex">
              <div className="flex-1">
                <div className="pb-32">
                  {messages.map((message) => (
                    <div key={message.id}>
                      <div className="max-w-2xl mx-auto p-4">
                        {message.role === 'assistant' ? (
                          <div className="flex gap-4">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white shrink-0 ${
                              isDarkMode ? 'bg-[#3FA2F6]' : 'bg-[#BFECFF]'
                            }`}>
                              <Bot size={16} />
                              <img src="https://infrahive-ai-search.vercel.app/Logo%20(Digest).png"/>
                            </div>
                            <div className="flex-1 space-y-2">
                              <div className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                                {renderAssistantContent(message.content)}
                              </div>
                              <div className="flex items-center gap-2 mt-2">
                                {/* <button className={`p-1 rounded ${
                                  isDarkMode ? 'text-gray-300 hover:bg-gray-800' : 'hover:bg-gray-100'
                                }`}>
                                  <ThumbsUp size={16} />
                                </button>
                                <button className={`p-1 rounded ${
                                  isDarkMode ? 'text-gray-300 hover:bg-gray-800' : 'hover:bg-gray-100'
                                }`}>
                                  <ThumbsDown size={16} />
                                </button> */}
                                <button className={`p-1 rounded ${
                                  isDarkMode ? 'text-gray-300 hover:bg-gray-800' : 'hover:bg-gray-100'
                                }`}>
                                  <RotateCcw size={16} />
                                </button>
                                {message.content.resources?.length > 0 && (
                                  <button 
                                    onClick={toggleSources}
                                    className={`flex items-center gap-1 p-1 px-2 rounded border text-sm ${
                                      isDarkMode 
                                        ? 'border-white bg-gray-700 hover:bg-gray-800 text-blue-400 hover:text-blue-300' 
                                        : 'border-black bg-gray-200 hover:bg-gray-100 text-blue-600 hover:text-blue-700'
                                    }`}
                                  >
                                    <Link size={14} />
                                    Sources ({message.content.resources.length})
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="flex justify-end gap-4">
                            <div className="max-w-[85%] space-y-2">
                              <div className="bg-[#3FA2F6] text-white p-5 rounded-2xl">
                                {message.content}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {loading && (
                    <div className="max-w-2xl mx-auto p-4 flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white">
                          <Bot size={16} />
                          <img src="https://infrahive-ai-search.vercel.app/Logo%20(Digest).png"/>
                      </div>
                      <div className={`flex items-center ${
                        isDarkMode ? 'text-gray-300 hover:bg-gray-800' : 'hover:bg-gray-100'
                      }`}>
                        <Loader className="animate-spin" size={16} />
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Box */}
                <div 
                className={`customWidth fixed bottom-0 p-4 w-full sm:z-[100] ${
                  isDarkMode ? 'border-gray-700' : 'border-gray-200'
                }`}
                style={{ backgroundColor: isDarkMode ? '#212121' : '#ffffff'}}
                >
                  <div className="max-w-2xl mx-auto">
                    <form onSubmit={handleSubmit} className="relative">
                      <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask about your documents..."
                        className={`w-full p-4 pr-12 rounded-lg border focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                          isDarkMode 
                            ? 'border-gray-600 bg-gray-800 text-white placeholder-gray-400' 
                            : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                        }`}
                      />
                      <button 
                        type="submit"
                        disabled={!input.trim() || loading}
                        className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 disabled:opacity-50 ${
                          isDarkMode
                            ? 'text-gray-400 hover:text-gray-200'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        <Send size={20} />
                      </button>
                    </form>
                  </div>
                </div>
              </div>

              {/* Sources Panel */}
              {showSources && currentResources.length > 0 && (
                <div 
                  className={`w-72 border-l p-4 overflow-y-auto fixed right-0 top-0 h-screen z-40 ${
                    isDarkMode ? 'border-gray-700 bg-[#212121] text-white' : 'border-gray-200 bg-white text-gray-900'
                  }`}
                >
                  <div className="space-y-4 pb-24">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-semibold flex items-center gap-2">
                        <Link size={20} />
                        Sources
                      </h2>
                      <button 
                        onClick={toggleSources}
                        className={`p-1 rounded-full ${
                          isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
                        }`}
                      >
                        ×
                      </button>
                    </div>
                    {currentResources.map((resource, index) => (
                      <div
                        key={`${resource.link}-${index}`}
                        className={`space-y-2 p-3 rounded-lg border ${
                          isDarkMode 
                            ? 'border-gray-700 bg-gray-800/50' 
                            : 'border-gray-200 bg-gray-50'
                        }`}
                      >
                        <div className="font-medium">
                          {resource.title}
                        </div>
                        <a
                          href={resource.link}
                          className={`flex items-center gap-2 mt-2 text-sm ${
                            isDarkMode 
                              ? 'text-blue-400 hover:text-blue-300' 
                              : 'text-blue-600 hover:text-blue-700'
                          }`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink size={14} />
                          View document
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExtractChat;