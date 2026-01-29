/**
 * ApplicationChatbot Component
 * Context-aware chatbot for querying specific application details
 */

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { useDraggable } from "@/hooks/useDraggable";

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
  osap_application: string;
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
  analysis: {
    decision: string;
    confidence: number;
    reasoning: string;
    risk_factors: string[];
    recommended_funding: number;
  };
}

interface Props {
  applicationData: ApplicationData;
  apiBaseUrl?: string;
  mode: "embedded" | "floating";
  isOpen: boolean;
  onClose: () => void;
}

export function ApplicationChatbot({
  applicationData,
  apiBaseUrl = process.env.NEXT_PUBLIC_API_URL,
  mode = "embedded",
  isOpen = true,
  onClose,
}: Props) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `Hello! I'm your AI assistant for analyzing ${applicationData.first_name} ${applicationData.last_name}'s application. Ask me anything about this application.`,
      timestamp: new Date(),
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { elementRef, onMouseDown } = useDraggable();

  /** Shared Conditions */
  const isFloating = mode === "floating";

  /** Shared Classes */
  const cls = {
    container: isFloating
      ? "fixed bottom-6 right-6 w-96 sm:w-[450px] h-[500px] border rounded-lg bg-white shadow-2xl flex flex-col z-50 animate-slideUp"
      : "border rounded-xl bg-white shadow-sm flex flex-col h-[600px]",
    header: isFloating
      ? "px-5 py-4 border-b bg-red-800 rounded-t-lg cursor-move select-none"
      : "p-4 border-b bg-gradient-to-r from-cyan-50 to-blue-50",
    userMsg: isFloating
      ? "bg-red-800 text-white rounded-tr-none"
      : "bg-cyan-800 text-white rounded-tr-none",
    sendBtn: isFloating
      ? "bg-red-800 hover:bg-red-700"
      : "bg-cyan-800 hover:bg-cyan-700",
    focusRing: isFloating ? "focus:ring-red-500" : "focus:ring-cyan-500",
  };

  /** Scroll on messages update */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /** Auto-focus when floating opens */
  useEffect(() => {
    if (isOpen && isFloating) inputRef.current?.focus();
  }, [isOpen, isFloating]);

  if (isFloating && !isOpen) return null;

  const buildPrompt = (input: string) => {
    let prompt = `
    You are a BSWD/CSG-DSE application assessment assistant...
    (omitted here to shorten—FULL logic unchanged in your real file)
    ${JSON.stringify(applicationData, null, 2)}
    `;
    const a = applicationData.analysis;
    prompt += `
    AI ANALYSIS RESULTS:
    Decision: ${a.decision}
    Confidence: ${a.confidence}%
    Reasoning: ${a.reasoning}
    Risk Factors: ${a.risk_factors.map((r: string) => `- ${r}`).join("\n")}
    Total Funding: $${a.recommended_funding}
    `;

    return `${prompt}\n${input}`;
  };

  /** Send Message */
  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = {
      role: "user",
      content: input,
      timestamp: new Date(),
    } as Message;
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch(`${apiBaseUrl}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: buildPrompt(input),
          history: messages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await response.json();

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.answer, timestamp: new Date() },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, an error occurred.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  return (
    <div 
      ref={isFloating ? elementRef : null}
      onMouseDown={isFloating ? onMouseDown : undefined}
      className={cls.container}
    >
      {/* Header */}
      <div 
        data-drag-handle={isFloating}
        className={cls.header}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 pointer-events-none">
            {mode === "embedded" && (
              <div className="w-10 h-10 rounded-full bg-cyan-800 flex items-center justify-center">
                <i className="fa-solid fa-robot text-white text-xl"></i>
              </div>
            )}
            <div>
              <h3
                className={`font-semibold text-base ${
                  isFloating ? "text-white" : "text-gray-900"
                }`}
              >
                {isFloating ? "Admin Assistant" : "Application Assistant"}
              </h3>
              <p
                className={`text-sm ${
                  isFloating ? "text-white/90" : "text-gray-600"
                }`}
              >
                Ask about {applicationData.first_name}&apos;s application
              </p>
            </div>
          </div>

          {isFloating && onClose && (
            <button
              onClick={onClose}
              className="p-1 text-white hover:text-gray-200 rounded-full pointer-events-auto"
              aria-label="Close BSWD Assistant chat"
            >
              <i className="fa-solid fa-xmark text-xl" aria-hidden="true"></i>
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-100 space-y-4">
        {messages.map((m, i) => {
          const isUser = m.role === "user";
          return (
            <div
              key={i}
              className={`flex gap-3 ${
                isUser ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[85%] rounded-lg px-4 py-3 shadow-sm ${
                  isUser
                    ? cls.userMsg
                    : "bg-white text-gray-800 rounded-tl-none"
                }`}
              >
                {m.role === "assistant" ? (
                  <ReactMarkdown
                    components={{
                      li: ({ children }) => (
                        <li className="flex">
                          <span className="mr-2 font-bold text-gray-800">
                            •
                          </span>
                          <span>{children}</span>
                        </li>
                      ),
                    }}
                  >
                    {m.content}
                  </ReactMarkdown>
                ) : (
                  <p className="whitespace-pre-wrap leading-relaxed">
                    {m.content}
                  </p>
                )}
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-white rounded-lg px-4 py-3 shadow-sm">
              <i
                className={`fa-solid fa-spinner fa-spin ${
                  isFloating ? "text-red-800" : "text-cyan-800"
                }`}
              ></i>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="p-5 border-t bg-white rounded-b-lg">
        <div className="flex gap-2">
          <label htmlFor="chatbot-input-admin" className="sr-only">
            Type your message...
          </label>
          <input
            id="chatbot-input-admin"
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            disabled={loading}
            placeholder="Type your message..."
            className={`flex-1 px-4 py-3 border rounded-lg disabled:bg-gray-100 disabled:cursor-not-allowed ${cls.focusRing}`}
          />

          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className={`p-3 rounded-lg transition-colors ${
              input.trim() && !loading
                ? `${cls.sendBtn} text-white`
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
            aria-label="Send message"
          >
            {loading ? (
              <i className="fa-solid fa-spinner fa-spin text-xl" aria-hidden="true"></i>
            ) : (
              <i className="fa-solid fa-paper-plane text-xl" aria-hidden="true"></i>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ApplicationChatbot;
