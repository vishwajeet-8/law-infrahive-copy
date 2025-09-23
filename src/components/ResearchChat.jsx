import { useState, useRef, useEffect } from 'react';
import { 
  Sun, Moon, HelpCircle, RotateCcw, Send, 
  Loader, ExternalLink, Home
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// CombinedMessageBox Component
const CombinedMessageBox = ({ userMessage, assistantMessage, isDarkMode, renderAssistantContent, loading, loadingMessage, sources }) => (
  <div
    className={`max-w-2xl min-w-[900px] mx-auto p-4 mb-4 mt-8 rounded-lg border bg-[#FEFCF4] `}
 
  
  >
    {/* User Message */}
    <div className="flex justify-start mb-4">
      <div className='px-3 text-2xl  rounded-full'>
        {userMessage.content}
      </div>
    </div>

    {/* Divider */}
    <div className={`mb-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`} />

    {assistantMessage ? (
      <>
        {/* Assistant Message */}
        <div className="flex gap-4">
          <div className="flex-1 space-y-2">
            <div className={isDarkMode ? 'text-white' : 'text-gray-900'}>
              {renderAssistantContent(assistantMessage.content)}
            </div>
          </div>
        </div>
        {/* Sources */}
        {sources.length > 0 && (
          <div className="mt-6">
            <h3 className={`text-lg font-medium mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Authentic Sources:-
            </h3>
            <ul className="space-y-2">
              {sources.map((source, index) => (
                <li key={index} className={`border rounded-lg p-4 bg-slate-200 hover:bg-red-100 ${isDarkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-white'}`}>
                  
                  {/* <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {source.meta_title}
                  </p> */}
                  <a
                    href={source.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center gap-2 text-sm font-medium ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}
                  >
                    <ExternalLink size={14} />
                    <h4 className={`text-md font-semibold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                    {source.title}
                  </h4>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </>
    ) : loading ? (
      <div className="flex flex-col items-center">
        <Loader className="animate-spin mb-2" size={24} />
        <div className={isDarkMode ? 'text-white' : 'text-gray-900'}>
          {loadingMessage}
        </div>
      </div>
    ) : null}
  </div>
);

const ResearchChat = () => {
  // State declarations
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Fetching the data...');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentResources, setCurrentResources] = useState([]);
  const [showSources, setShowSources] = useState(false);
  const [messageIdCounter, setMessageIdCounter] = useState(1);

  const navigate = useNavigate();
  const messagesEndRef = useRef(null);

  const loadingMessages = [
    'Fetching the data...',
    'Processing the request...',
    'Analyzing the information...',
    'Sorting the data...'
  ];

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('auth') === 'true';
    if (!isAuthenticated) {
      navigate('/');
      window.location.replace("/");
    }
  }, [navigate]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  useEffect(() => {
    let interval;
    if (loading) {
      let index = 0;
      interval = setInterval(() => {
        setLoadingMessage(loadingMessages[index]);
        index = (index + 1) % loadingMessages.length;
      }, 2000); // Change message every 2 seconds
    }
    return () => clearInterval(interval);
  }, [loading]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);
  const isEmpty = messages.length === 0 && !loading;

  // Handle Submit Function
  const handleSubmit = async (e) => {
    e.preventDefault();
    const currentInput = input.trim();
    
    if (currentInput) {
      const userMessageId = messageIdCounter;
      setMessageIdCounter(prev => prev + 1);
      
      // Add the user's message to the messages state immediately
      const newUserMessage = {
        role: 'user',
        content: currentInput,
        id: userMessageId,
        assistantMessage: null // Placeholder for the assistant message
      };

      setMessages(prev => [...prev, newUserMessage]);
      setInput(''); // Clear input immediately
      setLoading(true);

      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}legal/research/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_prompt: currentInput })
        });

        if (!response.ok) throw new Error(`API request failed with status ${response.status}`);

        const data = await response.json();
        const assistantMessageId = messageIdCounter + 1;
        setMessageIdCounter(prev => prev + 1);

        // Update the message with the assistant's response
        setMessages(prev => prev.map(msg => 
          msg.id === userMessageId
            ? { ...msg, assistantMessage: {
                role: 'assistant',
                content: {
                  legal_info: data.legal_info,
                  resources: data.legal_info.map(info => ({
                    title: info.title,
                    meta_title: info.jurisdiction,
                    heading: info.summary,
                    link: info.doc_link
                  }))
                },
                id: assistantMessageId
              }}
            : msg
        ));

        setCurrentResources(data.legal_info.map(info => ({
          title: info.title,
          meta_title: info.jurisdiction,
          heading: info.summary,
          link: info.doc_link
        })));
        setShowSources(true);
      } catch (error) {
        console.error('Error:', error);
        const errorMessageId = messageIdCounter + 1;
        setMessageIdCounter(prev => prev + 1);

        // Update the message with an error response
        setMessages(prev => prev.map(msg => 
          msg.id === userMessageId
            ? { ...msg, assistantMessage: {
                role: 'assistant',
                content: {
                  legal_info: [{
                    title: 'Error',
                    summary: `Error: ${error.message}. Please try again.`,
                    jurisdiction: 'System Error',
                    implications: 'Please try your query again.',
                    doc_link: '#'
                  }],
                  resources: []
                },
                id: errorMessageId
              }}
            : msg
        ));
      } finally {
        setLoading(false);
      }
    }
  };

  // Render Assistant Content Function
  const renderAssistantContent = (content) => {
    if (typeof content === 'string') return content;

    const legalInfo = content?.legal_info;

    if (!Array.isArray(legalInfo) || legalInfo.length === 0) {
      return (
        <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          No results found.
        </div>
      );
    }

    return (
      <div className={`space-y-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        <div className="mb-6">
          {/* <p className="text-sm leading-relaxed mb-6">
            To address this query about recent judgments in India, here is a comprehensive 
            overview of notable cases, their legal precedents, and broader implications for the judicial 
            system and society.
          </p> */}
          <h3 className="text-lg font-medium ">Results:</h3>
        </div>

        {legalInfo.map((info, index) => (
          <div 
            key={index}
            className={`border rounded-lg p-6 ${
              isDarkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-[#F8FAFC]'
            }`}
          >
            <div className="mb-4">
              <h3 className={`text-xl font-semibold mb-2 ${
                isDarkMode ? 'text-blue-400' : 'text-blue-600'
              }`}>
                {info.title}
              </h3>
              <div className={`text-sm ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {info.jurisdiction}
              </div>
            </div>

            <div className={`space-y-4 text-sm leading-relaxed ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              <div>
                <div className="font-semibold mb-1">Summary:</div>
                <div>{info.summary}</div>
              </div>
              
              <div>
                <div className="font-semibold mb-1">Key Terms:</div>
                <div>{info.key_terms}</div>
              </div>
              
              <div>
                <div className="font-semibold mb-1">Implications:</div>
                <div>{info.implications}</div>
              </div>
            </div>

            <div className="mt-6">
              <a
                href={info.doc_link}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-2 text-sm font-medium ${
                  isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'
                }`}
              >
                <ExternalLink size={14} />
                View full document
              </a>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="flex h-screen" style={{ backgroundColor: isDarkMode ? "#212121" : "#ffffff" }}>
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
            <div className="h-full flex flex-col justify-center items-center p-4">
              <h1 className={`text-4xl font-bold text-center mb-8 ${
                isDarkMode ? 'text-white' : 'text-gray-800'
              }`}>
                Legal Research Assistant
              </h1>
              <div className="w-full max-w-2xl">
                <form onSubmit={handleSubmit} className="relative">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about legal cases..."
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
            <div className="pb-2">
              {messages.map((message) => (
                <CombinedMessageBox 
                  key={message.id} 
                  userMessage={message} 
                  assistantMessage={message.assistantMessage} 
                  isDarkMode={isDarkMode} 
                  renderAssistantContent={renderAssistantContent} 
                  loading={loading && message.assistantMessage === null}
                  loadingMessage={loadingMessage}
                  sources={currentResources}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Box */}
        {!isEmpty && (
          <div 
            className={`sticky bottom-0 p-4 w-full border-t ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            }`}
            style={{ backgroundColor: isDarkMode ? '#212121' : '#ffffff'}}
          >
            <div className="max-w-2xl min-w-[850px] mx-auto">
              <form onSubmit={handleSubmit} className="relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about legal cases.."
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
        )}
      </div>
    </div>
  );
};

export default ResearchChat;