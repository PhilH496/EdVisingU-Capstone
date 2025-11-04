/**
 * ChatbotWidget Component
 * 
 */

import { useState } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';

export function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      // TODO: Integrate with actual chatbot logic
      console.log('Message sent:', message);
      setMessage('');
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
                  Hi! I'm your BSWD Assistant. How can I help you today?
                </p>
              </div>
            </div>

            {/* Placeholder for future messages */}
            {/* Messages will be rendered here */}
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 p-5 bg-white">
            <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-[#0066A1] focus:border-transparent"
              />
              <button
                type="submit"
                disabled={!message.trim()}
                className={`p-3 rounded-lg transition-colors ${
                  message.trim()
                    ? 'bg-[#0066A1] text-white hover:bg-[#004f7d]'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
                aria-label="Send message"
              >
                <Send className="w-6 h-6" />
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