/**
 * ApplicationChatbot Component
 * Context-aware chatbot for querying specific application details
 */

import React, { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2 } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ApplicationData {
  application_id: string;
  student_id: string;
  first_name: string;
  last_name: string;
  disability_type: string;
  study_type: string;
  has_osap_restrictions: boolean;
  federal_need: number;
  provincial_need: number;
  disability_verification_date?: string;
  functional_limitations: string[];
  needs_psycho_ed_assessment: boolean;
  requested_items: Array<{
    category: string;
    item: string;
    cost: number;
    funding_source: string;
  }>;
  institution: string;
  program?: string;
}

interface Props {
  applicationData: ApplicationData;
  apiBaseUrl?: string;
}

export function ApplicationChatbot({ applicationData, apiBaseUrl = "http://localhost:8000" }: Props) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `Hello! I'm your AI assistant for analyzing ${applicationData.first_name} ${applicationData.last_name}'s application. Ask me anything about this application, eligibility requirements, funding recommendations, or BSWD guidelines.`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
        const response = await fetch(`${apiBaseUrl}/api/chat`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        body: JSON.stringify({
          message: `
        You are a BSWD/CSG-DSE application assessment assistant.

        You must answer using the official BSWD policy voice and the following rules:

        CRITICAL RESPONSE RULES:
        1. Maximum 2 sentences OR 1 sentence + a bullet list
        2. Bullet list must use the • symbol (NOT - or *)
        3. Bullets must be concise (15–20 words max)
        4. Use official terminology from BSWD/CSG-DSE policy
        5. Do not explain internal reasoning; answer as a decision-support specialist
        6. If data is missing, say so directly and list what is missing
        7. When referencing the student, use “the student” rather than name

        You are reviewing the following BSWD/CSG-DSE application data (JSON):
        ${JSON.stringify(applicationData, null, 2)}

        Now answer the user’s question clearly and professionally:
        ${input}
        `,
            history: messages.map((m) => ({
              role: m.role,
              content: m.content,
            })),
          }),
        });


      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data = await response.json();

      const assistantMessage: Message = {
        role: "assistant",
        content: data.answer,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: Message = {
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Suggested questions
  const suggestedQuestions = [
    "Is this student eligible for BSWD funding?",
    "What is the recommended funding amount?",
    "Are there any issues with this application?",
    "Does this student need a psycho-educational assessment?",
    "What equipment costs are within policy limits?",
  ];

  const handleSuggestionClick = (question: string) => {
    setInput(question);
    inputRef.current?.focus();
  };

  return (
    <div className="border rounded-xl bg-white shadow-sm flex flex-col h-[600px]">
      {/* Header */}
      <div className="p-4 border-b bg-gradient-to-r from-cyan-50 to-blue-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-cyan-800 flex items-center justify-center">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Application Assistant</h3>
            <p className="text-xs text-gray-600">
              Ask about {applicationData.first_name}'s application
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, idx) => (
          <div
            key={idx}
            className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {message.role === "assistant" && (
              <div className="w-8 h-8 rounded-full bg-cyan-100 flex items-center justify-center flex-shrink-0">
                <Bot className="w-5 h-5 text-cyan-800" />
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                message.role === "user"
                  ? "bg-cyan-800 text-white"
                  : "bg-gray-100 text-gray-900"
              }`}
            >
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
              <p
                className={`text-xs mt-2 ${
                  message.role === "user" ? "text-cyan-100" : "text-gray-500"
                }`}
              >
                {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
            {message.role === "user" && (
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-gray-600" />
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-cyan-100 flex items-center justify-center">
              <Bot className="w-5 h-5 text-cyan-800" />
            </div>
            <div className="bg-gray-100 rounded-2xl px-4 py-3">
              <Loader2 className="w-5 h-5 text-gray-600 animate-spin" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions (only show if no user messages yet) */}
      {messages.filter((m) => m.role === "user").length === 0 && (
        <div className="px-4 py-3 border-t bg-gray-50">
          <p className="text-xs font-semibold text-gray-600 mb-2">Suggested questions:</p>
          <div className="flex flex-wrap gap-2">
            {suggestedQuestions.slice(0, 3).map((question, idx) => (
              <button
                key={idx}
                onClick={() => handleSuggestionClick(question)}
                className="text-xs px-3 py-1.5 rounded-full bg-white border border-gray-200 hover:border-cyan-300 hover:bg-cyan-50 transition-colors"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about this application..."
            disabled={loading}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="px-4 py-2 bg-cyan-800 text-white rounded-xl hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Send className="w-5 h-5" />
                <span className="hidden sm:inline">Send</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ApplicationChatbot;