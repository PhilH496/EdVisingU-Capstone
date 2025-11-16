/**
 * ChatbotWidget Component
 *
 * Features:
 * - Collapsible chat window
 * - Floating action button
 * - Real-time chat with BSWD Assistant backend
 * - Conversation history display
 */

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";

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

  const handleSendMessage = async (e: React.FormEvent) => {
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
      const response = await fetch("http://localhost:8000/api/chat", {
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
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();

      // Add assistant response to chat
      const assistantMessage: Message = {
        role: "assistant",
        content:
          data.answer ||
          data.response ||
          "Sorry, I couldn't generate a response.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error("Chat error:", err);
      setError(
        "Failed to connect to chatbot. Please make sure the backend is running."
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
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 w-96 sm:w-[450px] bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden animate-slideUp">
          {/* Header */}
          <div className="bg-[#0066A1] text-white px-5 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div>
                <h3 className="font-semibold text-base">BSWD Assistant</h3>
                <p className="text-sm text-blue-100">Online</p>
              </div>
            </div>
            <button
              onClick={handleToggle}
              className="text-white hover:text-gray-200 transition-colors"
              aria-label="Close chat"
            >
              <X className="w-6 h-6" />
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
                  className={`rounded-lg px-4 py-3 shadow-sm max-w-[85%] ${
                    msg.role === "user"
                      ? "bg-[#0066A1] text-white rounded-tr-none"
                      : "bg-white text-gray-800 rounded-tl-none"
                  }`}
                >
                  <p className="text-base whitespace-pre-wrap">{msg.content}</p>
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
                  <Loader2 className="w-5 h-5 animate-spin text-[#0066A1]" />
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
              <input
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
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <Send className="w-6 h-6" />
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      <button
        onClick={handleToggle}
        className="w-16 h-16 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 bg-[#0066A1] hover:bg-[#004f7d] hover:scale-110"
        aria-label="Open chat"
      >
        <MessageCircle className="w-7 h-7 text-white" />
      </button>

      {/* Notification Badge */}
      {!isOpen && (
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
          <span className="text-white text-xs font-bold">!</span>
        </div>
      )}
    </div>
  );
}
