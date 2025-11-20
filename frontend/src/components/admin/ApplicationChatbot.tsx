/**
 * ApplicationChatbot Component
 * Context-aware chatbot for querying specific application details
 */

import React, { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2, X, MessageCircle } from "lucide-react";
import ReactMarkdown from "react-markdown";

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
  analysis?: any;
}

interface Props {
  applicationData: ApplicationData;
  apiBaseUrl?: string;
  mode?: "embedded" | "floating"; 
  isOpen?: boolean;
  onClose?: () => void;
}

export function ApplicationChatbot({ 
  applicationData, 
  apiBaseUrl = "http://localhost:8000",
  mode = "embedded",
  isOpen = true,
  onClose
}: Props) {
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

  useEffect(() => {
    if (isOpen && inputRef.current && mode === "floating") {
      inputRef.current.focus();
    }
  }, [isOpen, mode]);

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
      let enhancedPrompt = `
  You are a BSWD/CSG-DSE application assessment assistant with complete knowledge of the scoring system.

CRITICAL RESPONSE RULES:
1. Maximum 2 sentences OR 1 sentence + a bullet list
2. Bullet list must use standard Markdown (* or -)
3. Bullets must be concise (15–20 words max)
4. Use official BSWD/CSG-DSE policy terminology
5. When explaining scores, cite SPECIFIC penalty amounts and dollar amounts
6. NEVER suggest the scoring logic might be wrong - it is deterministic and correct
7. When referencing the student, use "the student"
8. ALWAYS return bullets in standard Markdown list format (e.g., * item)
9. EACH BULLET MUST BE ON ITS OWN LINE (use a newline between bullets)

CRITICAL TERMINOLOGY:
- "Federal/Provincial Need" = Federal/Provincial FUNDING REQUESTED (not equipment cost)
- "Requested Items" = EQUIPMENT/SERVICE COSTS (the actual needs)
- Ratio = (Provincial + Federal) / Equipment Costs = Funding / Equipment

BSWD CONFIDENCE SCORING SYSTEM:

Step 1 - Eligibility (start at 100, -33 each):
* No verified permanent/persistent disability
* Has OSAP restrictions

Step 2 - Funding Limits:
* Full-time OSAP: BSWD $2K (provincial) + CSG $20K (federal) = $22K max
* Part-time OSAP: BSWD $2K (provincial) only, NO federal CSG
* No OSAP: BSWD $2K (provincial) only, NO federal CSG

Penalties (-30 each, can stack):
* Provincial funding > $2,000
* Federal funding > $20,000 (full-time only)
* Federal funding > $0 (part-time or no OSAP)

Step 3 - Funding/Equipment Ratio (ratio = funding / equipment):
* Ratio ≥ 4.0 (funding 4x+ equipment, severe over-funding): -60
* Ratio ≥ 2.0 (funding 2x+ equipment, major over-funding): -30
* Ratio > 1.2 (funding 21%+ over equipment): -15
* Ratio 1.0-1.2 (funding 0-20% over equipment): -2 per 10%
* Ratio ≤ 0.5 (funding 2x under equipment, major gap): -15
* Ratio 0.5-1.0 (funding is under equipment, minor gap): -5

Thresholds: 90-100=APPROVED | 75-89=MANUAL REVIEW | 0-74=REJECTED

Example: Equipment $6,900, Funding $9,000 (provincial $1 + federal $6,899)
- Step 1: 100 (passes)
- Step 2: 100 (within limits)
- Step 3: -15 (ratio 9000/6900 = 1.30, funding exceeds equipment by 30%)
- Final: 85 → MANUAL REVIEW

Example: Equipment $6,900, Funding $4,301 (provincial $1 + federal $3,300)
- Step 1: 100 (passes)
- Step 2: 100 (within limits)
- Step 3: -5 (ratio 3301/6900 = 0.623, funding is under equipment costs by 37.7%)
- Final: 95 → APPROVED

  Application Data:
  ${JSON.stringify(applicationData, null, 2)}
  `;

      if (applicationData.analysis) {
        enhancedPrompt += `

  AI ANALYSIS RESULTS:
  Decision: ${applicationData.analysis.decision || 'PENDING'}
  Confidence: ${applicationData.analysis.confidence || 0}%
  ${applicationData.analysis.reasoning ? `Reasoning: ${applicationData.analysis.reasoning}` : ''}

  Eligibility Checks:
  - Verified Disability: ${applicationData.analysis.eligibility?.verified_disability ? 'PASS ✓' : 'FAIL ✗'}
  - Full-Time Student: ${applicationData.analysis.eligibility?.full_time_student ? 'PASS ✓' : 'FAIL ✗'}
  - No OSAP Restrictions: ${applicationData.analysis.eligibility?.no_osap_restrictions ? 'PASS ✓' : 'FAIL ✗'}

  ${applicationData.analysis.strengths && applicationData.analysis.strengths.length > 0 ? `
  Strengths:
  ${applicationData.analysis.strengths.map((s: string) => `- ${s}`).join('\n')}
  ` : ''}

  ${applicationData.analysis.risk_factors && applicationData.analysis.risk_factors.length > 0 ? `
  Risk Factors:
  ${applicationData.analysis.risk_factors.map((r: string) => `- ${r}`).join('\n')}
  ` : ''}

  ${applicationData.analysis.recommended_funding ? `
  Recommended Funding: $${applicationData.analysis.recommended_funding}
  ` : ''}
  `;
      }

      enhancedPrompt += `

  Now answer the user's question clearly and professionally:
  ${input}

  Remember: The scoring is deterministic. Never suggest the logic might be incorrect.
  `;

      const response = await fetch(`${apiBaseUrl}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: enhancedPrompt,
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

  if (mode === "floating" && !isOpen) return null;

  const containerClasses = mode === "floating"
    ? "fixed bottom-6 right-6 w-96 sm:w-[450px] h-[500px] border rounded-lg bg-white shadow-2xl flex flex-col z-50 animate-slideUp"
    : "border rounded-xl bg-white shadow-sm flex flex-col h-[600px]";

  const headerClasses = mode === "floating"
    ? "px-5 py-4 border-b bg-red-800 rounded-t-lg"
    : "p-4 border-b bg-gradient-to-r from-cyan-50 to-blue-50";

  return (
    <div className={containerClasses}>
      {/* Header */}
      <div className={headerClasses}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {mode === "embedded" && (
              <div className="w-10 h-10 rounded-full bg-cyan-800 flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
            )}
            <div>
              <h3 className={`font-semibold text-base ${mode === "floating" ? "text-white" : "text-gray-900"}`}>
                {mode === "floating" ? "Admin Assistant" : "Application Assistant"}
              </h3>
              <p className={`text-sm ${mode === "floating" ? "text-white opacity-90" : "text-gray-600"}`}>
                Ask about {applicationData.first_name}'s application
              </p>
            </div>
          </div>
          {mode === "floating" && onClose && (
            <button
              onClick={onClose}
              className="p-1 text-white hover:text-gray-200 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-100 space-y-4">
        {messages.map((message, idx) => (
          <div
            key={idx}
            className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-lg px-4 py-3 shadow-sm ${
                message.role === "user"
                  ? mode === "floating" 
                    ? "bg-red-800 text-white rounded-tr-none"
                    : "bg-cyan-800 text-white rounded-tr-none"
                  : "bg-white text-gray-800 rounded-tl-none"
              }`}
            >
              {message.role === "assistant" ? (
                <ReactMarkdown
                  components={{
                    p: ({node, ...props}) => <p className="mb-2" {...props} />,
                    ul: ({node, ...props}) => <ul className="space-y-1 my-2 pl-0" {...props} />,
                    li: ({node, children, ...props}) => (
                      <li className="flex" {...props}>
                        <span className="mr-2 font-bold text-gray-800 flex-shrink-0">•</span>
                        <span className="flex-1">{children}</span>
                      </li>
                    ),
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              ) : (
                <p className="text-base leading-relaxed whitespace-pre-wrap">
                  {message.content}
                </p>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-white rounded-lg rounded-tl-none px-4 py-3 shadow-sm">
              <Loader2 className={`w-5 h-5 animate-spin ${mode === "floating" ? "text-red-800" : "text-cyan-800"}`} />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions */}
      {messages.filter((m) => m.role === "user").length === 0 && (
        <div className="px-4 py-3 border-t bg-gray-50">
          <p className="text-xs font-semibold text-gray-600 mb-2">Suggested questions:</p>
          <div className="flex flex-wrap gap-2">
            {suggestedQuestions.slice(0, 3).map((question, idx) => (
              <button
                key={idx}
                onClick={() => handleSuggestionClick(question)}
                className={`text-xs px-3 py-1.5 rounded-full bg-white border border-gray-200 transition-colors ${
                  mode === "floating"
                    ? "hover:border-red-300 hover:bg-red-50"
                    : "hover:border-cyan-300 hover:bg-cyan-50"
                }`}
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-5 border-t bg-white rounded-b-lg">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            disabled={loading}
            className={`flex-1 px-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed ${
              mode === "floating" ? "focus:ring-red-500" : "focus:ring-cyan-500"
            }`}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className={`p-3 rounded-lg transition-colors ${
              input.trim() && !loading
                ? mode === "floating"
                  ? "bg-red-800 text-white hover:bg-red-700"
                  : "bg-cyan-800 text-white hover:bg-cyan-700"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <Send className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ApplicationChatbot;
