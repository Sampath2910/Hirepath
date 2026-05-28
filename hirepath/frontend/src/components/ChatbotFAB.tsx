"use client";
import { API_BASE_URL } from "@/config";
import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Sparkles, Key, ChevronDown } from "lucide-react";

type Message = { role: "user" | "assistant"; content: string };

// ✅ Rule-based response engine
function getRuleBasedResponse(input: string): string {
  const msg = input.toLowerCase();

  if (msg.includes("job") || msg.includes("search") || msg.includes("find")) {
    return "Great question! 🎯 Head to the **Search Jobs** tab to browse 12+ curated jobs. You can filter by Remote, Walk-in, Off-Campus, Freshers, and Internships. Upload your resume first for personalized AI match scores!";
  }
  if (msg.includes("resume") || msg.includes("cv")) {
    return "Your resume is key! 📄 Go to **Resume Hub** to view your master resume, see AI-tailored versions for specific companies, and identify skill gaps. You can preview and download any version instantly.";
  }
  if (msg.includes("interview") || msg.includes("prepare") || msg.includes("practice")) {
    return "Let's get you ready! 💪 The **Interview Prep** page has company-specific question sets for Infosys, Swiggy, and Razorpay. Start the 25-minute mock timer, expand questions to see AI answers, and generate alternative answers for variety.";
  }
  if (msg.includes("status") || msg.includes("applied") || msg.includes("application") || msg.includes("track")) {
    return "Your applications are tracked in **Applied & Status**. 📊 Click the pipeline cards to filter by stage, use 'Update Status' to move applications forward, and search by company or role name.";
  }
  if (msg.includes("upgrade") || msg.includes("plan") || msg.includes("pro") || msg.includes("elite") || msg.includes("price") || msg.includes("payment")) {
    return "Ready to level up? 🚀 Check the **Upgrade Plan** page. Pro (₹199/mo) gives you unlimited resume tailoring and AI interview prep. Elite (₹499/mo) adds full auto-apply and LinkedIn AI outreach. Both plans have annual options with 2 months free!";
  }
  if (msg.includes("skill") || msg.includes("docker") || msg.includes("kubernetes") || msg.includes("learn")) {
    return "Skill gaps are opportunities! 📈 The **Resume Hub** sidebar shows your missing skills. For each gap, there's a direct YouTube tutorial link. Adding Docker can boost your match score by ~15%!";
  }
  if (msg.includes("hello") || msg.includes("hi") || msg.includes("hey") || msg.includes("start")) {
    return "Hello! 👋 I'm your HirePath AI assistant. I can help you with:\n• **Finding jobs** (search, filters, match scores)\n• **Resume tips** (tailoring, skill gaps)\n• **Interview prep** (questions, mock timer)\n• **Application tracking** (status updates)\n• **Plan upgrades** (Pro/Elite features)\n\nWhat would you like to work on today?";
  }
  if (msg.includes("thank")) {
    return "You're welcome! 😊 Best of luck with your job search. You've got this! 💪 Feel free to ask anything else.";
  }
  if (msg.includes("tip") || msg.includes("advice") || msg.includes("help")) {
    return "Here are my top 3 tips for faster placements:\n1. **Tailor your resume** for each application — AI-matched resumes get 3x more callbacks\n2. **Apply within 24 hours** of a posting — early applicants have 60% better odds\n3. **Practice 2 mock interviews/week** — consistent practice builds confidence fast!";
  }
  if (msg.includes("api") || msg.includes("key") || msg.includes("gemini") || msg.includes("openai")) {
    return "To use real AI responses, click the 🔑 key icon at the top of this chat and enter your Gemini API key. Your key is stored locally and never sent to our servers. With a valid key, I can give personalized career advice powered by Google Gemini!";
  }

  // Default fallback
  const fallbacks = [
    "That's a great question! 🤔 While I'm running in smart offline mode, I can help you with job search, resume tips, interview prep, and tracking applications. What aspect of your job hunt can I assist with?",
    "I'm here to help with your career journey! Try asking me about finding jobs, improving your resume, practicing for interviews, or tracking your applications.",
    "Interesting! I'd love to give you a personalized answer — add your Gemini API key (click the 🔑 icon) for real AI responses. Or ask me about jobs, resumes, interviews, or your application status!",
  ];
  return fallbacks[Math.floor(Math.random() * fallbacks.length)];
}

// ✅ Gemini API call
async function callGeminiAPI(apiKey: string, messages: Message[]): Promise<string> {
  const contents = messages.map((m) => ({
    role: m.role === "user" ? "user" : "model",
    parts: [{ text: m.content }],
  }));

  const primaryUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  const altUrl = primaryUrl.replace(":generateContent", ":generate");

  const body = {
    contents,
    systemInstruction: {
      parts: [{ text: "You are HirePath AI, a career assistant helping Indian tech professionals find jobs, improve resumes, prepare for interviews, and track applications. Be concise, friendly, and actionable. Use emojis sparingly." }],
    },
  };

  // Try primary endpoint first; if 404, retry with alternate URL
  let res = await fetch(primaryUrl, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  if (res.status === 404) {
    res = await fetch(altUrl, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  }

  if (!res.ok) throw new Error(`API call failed: ${res.status}`);
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || data.output?.text || "I couldn't generate a response. Please try again.";
}

export default function ChatbotFAB() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi! I'm your HirePath AI assistant 🤖. I can help you find jobs, improve your resume, prepare for interviews, or track your applications. What would you like to do?\n\n💡 *Tip: Add a Gemini API key (click 🔑) for real AI responses.*",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showApiInput, setShowApiInput] = useState(false);
  const [apiKey, setApiKey] = useState(() => {
    if (typeof window !== "undefined") return localStorage.getItem("hirepath_gemini_key") || "";
    return "";
  });
  const [apiKeyDraft, setApiKeyDraft] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const saveApiKey = () => {
    localStorage.setItem("hirepath_gemini_key", apiKeyDraft);
    setApiKey(apiKeyDraft);
    setShowApiInput(false);
    setMessages((prev) => [
      ...prev,
      { role: "assistant", content: "✅ API key saved! I'm now powered by Google Gemini AI. Ask me anything about your career!" },
    ]);
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userMessage = input.trim();
    setInput("");
    const newMessages: Message[] = [...messages, { role: "user", content: userMessage }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      // 1. Try real AI backend first (Multi-model)
      const res = await fetch(`${API_BASE_URL}/api/ai/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage, history: messages })
      });

      if (res.ok) {
        const aiResponse = await res.text();
        setMessages((prev) => [...prev, { role: "assistant", content: aiResponse }]);
      } else {
        // 2. Fallback to client-side Gemini if backend key isn't set
        if (apiKey) {
          const geminiRes = await callGeminiAPI(apiKey, newMessages);
          setMessages((prev) => [...prev, { role: "assistant", content: geminiRes }]);
        } else {
          // 3. Fallback to rules if no keys anywhere
          await new Promise((r) => setTimeout(r, 700));
          const ruleRes = getRuleBasedResponse(userMessage);
          setMessages((prev) => [...prev, { role: "assistant", content: ruleRes }]);
        }
      }
    } catch (err) {
      console.error("Chat error:", err);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "⚠️ AI service is currently unavailable. Switching to smart offline mode.\n\n" + getRuleBasedResponse(userMessage) },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatMessage = (text: string) => {
    return text.split("\n").map((line, i) => {
      // BUG 25 FIX: Escape HTML special chars FIRST to prevent XSS injection,
      // then apply safe markdown bold/italic replacements on the escaped text.
      const escaped = line
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");

      // Now safe to apply markdown formatting (operates on escaped HTML)
      const formatted = escaped
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
        .replace(/\*(.*?)\*/g, "<em>$1</em>");

      return <p key={i} className="mb-1 last:mb-0" dangerouslySetInnerHTML={{ __html: formatted || "&nbsp;" }} />;
    });
  };

  return (
    <>
      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-[380px] h-[520px] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col z-50 overflow-hidden"
          style={{ animation: "slideUp 0.2s ease-out" }}>
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-5 py-3.5 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <Sparkles size={18} />
              <div>
                <p className="font-semibold text-sm">HirePath AI</p>
                <p className="text-blue-200 text-xs flex items-center gap-1">
                  {apiKey ? "🟢 Gemini AI Active" : "🟡 Smart Offline Mode"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowApiInput(!showApiInput)}
                title="Configure API key"
                className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
              >
                <Key size={15} />
              </button>
              <button onClick={() => setIsOpen(false)} className="p-1.5 rounded-lg hover:bg-white/20 transition-colors">
                <X size={18} />
              </button>
            </div>
          </div>

          {/* API Key Input Panel */}
          {showApiInput && (
            <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 shrink-0">
              <p className="text-xs font-bold text-slate-700 mb-2">Gemini API Key</p>
              <div className="flex gap-2">
                <input
                  type="password"
                  value={apiKeyDraft || apiKey}
                  onChange={(e) => setApiKeyDraft(e.target.value)}
                  placeholder="AIza..."
                  className="flex-1 text-xs bg-white border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <button onClick={saveApiKey} className="text-xs bg-blue-600 text-white px-3 py-2 rounded-lg font-bold hover:bg-blue-700 transition">
                  Save
                </button>
              </div>
              <p className="text-xs text-slate-400 mt-1.5">Get a free key at <a href="https://aistudio.google.com" target="_blank" rel="noreferrer" className="text-blue-500 underline">aistudio.google.com</a></p>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white rounded-br-md"
                      : "bg-slate-100 text-slate-700 rounded-bl-md"
                  }`}
                >
                  {formatMessage(msg.content)}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-slate-100 px-4 py-3 rounded-2xl rounded-bl-md">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0.15s" }} />
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0.3s" }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-slate-100 p-3 shrink-0">
            <form
              onSubmit={(e) => { e.preventDefault(); handleSend(); }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about jobs, resumes, interviews..."
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
              >
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        id="chatbot-fab"
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 ${
          isOpen ? "bg-slate-700 hover:bg-slate-800" : "bg-blue-600 hover:bg-blue-700"
        }`}
        aria-label="Open AI chatbot"
      >
        {isOpen ? <X size={22} className="text-white" /> : <MessageCircle size={22} className="text-white" />}
      </button>
    </>
  );
}