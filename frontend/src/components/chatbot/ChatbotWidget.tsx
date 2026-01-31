/**
 * ChatbotWidget Component
 *
 * Features:
 * - Collapsible chat window
 * - Floating action button
 * - Real-time chat with BSWD Assistant backend
 * - Conversation history display
 */

import { useState, useRef, useEffect, FormEvent } from 'react';
import ReactMarkdown from 'react-markdown';
import { useDraggable } from '@/hooks/useDraggable';

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { elementRef, onMouseDown } = useDraggable();

  // Auto-scroll to bottom when new msgs arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleToggle = () => {
    setIsOpen(!isOpen);

    // Clear error when opening
    if (!isOpen) {
      setError(null);
    }
  };

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    const userMessage = message.trim();
    setMessage("");
    setError(null);

    // Adds user message to chat
    const newUserMessage: Message = {
      role: "user",
      content: userMessage,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newUserMessage]);

    // Set loading state when message in progress
    setIsLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/chat-stream`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: userMessage,
            history: messages.map((msg) => ({
              role: msg.role,
              content: msg.content,
            })),
          }),
        },
      );

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      // Initiate tools to read streaming data from backend
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      // Add assistant response to chat
      const assistantMessage: Message = {
        role: "assistant",
        content: "", //"Sorry, I couldn't generate a response."
        timestamp: new Date(),
      };
      let isFirstLoop = true;
      while (true) {
        const { value, done } = await reader!.read();
        if (done) break;
        const chunk = decoder.decode(value);

        // Initally, chatbot reponse will have a loading icon
        // When it reaches here
        // The icon dissapears and replaced with a streamreponse
        if (isFirstLoop) {
          setMessages((prev) => [...prev, assistantMessage]);
          setIsLoading(false);
          isFirstLoop = false;
        }
        setMessages((prev) =>
          prev.map((message, idx) => {
            if (idx === prev.length - 1) {
              return { ...message, content: message.content + chunk };
            }
            return message;
          }),
        );
      }
    } catch (err) {
      console.error("Chat error:", err);
      setError(
        "Failed to connect to chatbot. Please make sure the backend is running.",
      );

      // Add error message to chat
      const errorMessage: Message = {
        role: "assistant",
        content:
          "Sorry, I'm having trouble connecting right now. Please try again later.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>    
      {/* Chat Window */}
      {isOpen && (
        <div 
          ref={elementRef}
          onMouseDown={onMouseDown}
          className="fixed bottom-6 right-6 z-50 w-96 sm:w-[450px] bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden animate-slideUp"
        >
          {/* Header */}
          <div 
            data-drag-handle
            className="bg-[#0066A1] text-white px-5 py-4 flex items-center justify-between cursor-move select-none"
          >
            <div className="flex items-center space-x-3 pointer-events-none">
              <div>
                <h3 className="font-semibold text-base">BSWD Assistant</h3>
                <p className="text-sm text-blue-100">Online</p>
              </div>
            </div>
            <button
              onClick={handleToggle}
              className="text-white hover:text-gray-200 transition-colors pointer-events-auto"
              aria-label="Close chat"
            >
              <i className="fa-solid fa-xmark text-xl"></i>
            </button>
          </div>

          {/* Chat Messages Area */}
          <div className="h-96 overflow-y-auto p-4 bg-gray-100">
            {/* Welcome Message */}
            <div className="flex items-start space-x-3 mb-4">
              <img
                src="/custom-ontario-logo.png"
                alt="Ontario Logo"
                className="w-10 h-10 object-contain flex-shrink-0"
              />
              <div className="bg-white rounded-lg rounded-tl-none px-4 py-3 shadow-sm max-w-[85%]">
                <p className="text-base text-gray-800">
                  Hi! I&apos;m your BSWD Assistant. How can I help you today?
                </p>
              </div>
            </div>

            {/* Conversation Messages */}
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex items-start space-x-3 mb-4 ${
                  msg.role === "user" ? "flex-row-reverse space-x-reverse" : ""
                }`}
              >
                {msg.role === "assistant" && (
                  <img
                    src="/custom-ontario-logo.png"
                    alt="Ontario Logo"
                    className="w-10 h-10 object-contain flex-shrink-0"
                  />
                )}
                <div
                  id="chatbotResponse"
                  className={`rounded-lg px-4 py-3 shadow-sm max-w-[85%] ${
                    msg.role === "user"
                      ? "bg-[#0066A1] text-white rounded-tr-none"
                      : "bg-white text-gray-800 rounded-tl-none"
                  }`}
                >
                  {msg.role === "assistant" ? (
                    <div className="text-base max-w-none">
                      <ReactMarkdown
                        components={{
                          p: ({ node, ...props }) => (
                            <p className="mb-2" {...props} />
                          ),
                          ul: ({ node, ...props }) => (
                            <ul className="space-y-1 my-2 pl-0" {...props} />
                          ),
                          li: ({ node, children, ...props }) => (
                            <li className="flex" {...props}>
                              <span className="mr-2 font-bold text-brand-black flex-shrink-0">
                                •
                              </span>
                              <span className="flex-1">{children}</span>
                            </li>
                          ),
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-base whitespace-pre-wrap">
                      {msg.content}
                    </p>
                  )}
                </div>
              </div>
            ))}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex items-start space-x-3 mb-4">
                <img
                  src="/custom-ontario-logo.png"
                  alt="Ontario Logo"
                  className="w-10 h-10 object-contain flex-shrink-0"
                />
                <div className="bg-white rounded-lg rounded-tl-none px-4 py-3 shadow-sm">
                  <i className="fa-solid fa-spinner fa-spin text-[#0066A1]"></i>
                </div>
              </div>
            )}

            {/* Error msg */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-4">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {/* Scrolling */}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 p-5 bg-white">
            <form
              onSubmit={handleSendMessage}
              className="flex items-center space-x-2"
            >
              <label htmlFor="chatbot-input-student" className="sr-only">
                Type your message...
              </label>
              <input
                id="chatbot-input-student"
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                disabled={isLoading}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-[#0066A1] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              <button
                type="submit"
                disabled={!message.trim() || isLoading}
                className={`p-3 rounded-lg transition-colors ${
                  message.trim() && !isLoading
                    ? "bg-[#0066A1] text-white hover:bg-[#004f7d]"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
                aria-label="Send message"
              >
                {isLoading ? (
                  <i className="fa-solid fa-spinner fa-spin text-xl"></i>
                ) : (
                  <i className="fa-solid fa-paper-plane text-xl"></i>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      {!isOpen && (
        <button
          onClick={handleToggle}
          className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 bg-[#0066A1] hover:bg-[#004f7d] hover:scale-110"
          aria-label="Open chat"
        >
          <i className="fa-solid fa-comment text-white text-3xl"></i>
        </button>
      )}
    </div>
  );
}
