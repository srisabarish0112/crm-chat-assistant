import { useState, useRef, useEffect, useCallback } from "react";
import {
  X, Maximize2, Minimize2, History, Send, Plus, ChevronDown, Check, Search,
  ArrowLeft, MessageSquare, Sparkles, ArrowRight, Pin
} from "lucide-react";
import { agents, llmModels, type Agent } from "@/data/leads";
import ReactMarkdown from "react-markdown";
import ziaHero from "@/assets/zia-hero.png";
import ziaShield from "@/assets/zia-shield.png";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface ChatConversation {
  id: string;
  title: string;
  agent: Agent;
  model: string;
  messages: ChatMessage[];
  createdAt: Date;
}

interface ChatbotPanelProps {
  isOpen: boolean;
  isExpanded: boolean;
  onClose: () => void;
  onToggleExpand: () => void;
  context?: string;
}

type PanelView = "chat" | "history";
type OnboardingMode = "generic" | "agent" | null;

const ChatbotPanel = ({ isOpen, isExpanded, onClose, onToggleExpand, context }: ChatbotPanelProps) => {
  const [conversations, setConversations] = useState<ChatConversation[]>([
    {
      id: "demo-1",
      title: "Lead follow-up strategy",
      agent: agents[0],
      model: "GPT-4",
      messages: [
        { id: "d1", role: "user", content: "How should I follow up with cold leads?" },
        { id: "d2", role: "assistant", content: "Here's a proven strategy for cold lead follow-up:\n\n1. **Wait 24-48 hours** after initial contact\n2. **Personalize** your message based on their company\n3. **Provide value** — share a relevant case study\n4. **Set a clear CTA** — suggest a specific meeting time" },
      ],
      createdAt: new Date(Date.now() - 86400000),
    },
    {
      id: "demo-2",
      title: "Pipeline analysis help",
      agent: agents[2],
      model: "GPT-3.5 Turbo",
      messages: [
        { id: "d3", role: "user", content: "Can you analyze my current pipeline?" },
        { id: "d4", role: "assistant", content: "Sure — your pipeline has **13 leads** with strong concentration in Tech and Retail. Let me break it down..." },
      ],
      createdAt: new Date(Date.now() - 172800000),
    },
  ]);

  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [selectedAgent, setSelectedAgent] = useState<Agent>(agents[0]);
  const [selectedModel, setSelectedModel] = useState(llmModels[0]);
  const [showAgentDropdown, setShowAgentDropdown] = useState(false);
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [agentSearch, setAgentSearch] = useState("");
  const [panelView, setPanelView] = useState<PanelView>("chat");
  const [isTyping, setIsTyping] = useState(false);
  // Onboarding: "generic" on first open, "agent" when user switches agent, null after dismissed
  const [onboarding, setOnboarding] = useState<OnboardingMode>("generic");
  const [hasSeenGeneric, setHasSeenGeneric] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const agentDropdownRef = useRef<HTMLDivElement>(null);
  const modelDropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const activeConversation = conversations.find(c => c.id === activeConversationId) || null;
  const currentMessages = activeConversation?.messages || [];

  // When panel opens for the first time, show generic onboarding
  useEffect(() => {
    if (isOpen && !hasSeenGeneric) {
      setOnboarding("generic");
    }
  }, [isOpen, hasSeenGeneric]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentMessages, isTyping]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (agentDropdownRef.current && !agentDropdownRef.current.contains(e.target as Node)) {
        setShowAgentDropdown(false);
      }
      if (modelDropdownRef.current && !modelDropdownRef.current.contains(e.target as Node)) {
        setShowModelDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const createNewChat = useCallback(() => {
    setActiveConversationId(null);
    setPanelView("chat");
    setInput("");
    setOnboarding("agent");
  }, []);

  const handleAgentSwitch = (agent: Agent) => {
    setSelectedAgent(agent);
    setShowAgentDropdown(false);
    setAgentSearch("");
    // Show agent onboarding when switching
    setOnboarding("agent");
    setActiveConversationId(null);
  };

  const dismissOnboarding = () => {
    setOnboarding(null);
    setHasSeenGeneric(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    let convId = activeConversationId;
    if (!convId) {
      const newConv: ChatConversation = {
        id: `conv-${Date.now()}`,
        title: text.trim().slice(0, 40),
        agent: selectedAgent,
        model: selectedModel.name,
        messages: [],
        createdAt: new Date(),
      };
      setConversations(prev => [newConv, ...prev]);
      convId = newConv.id;
      setActiveConversationId(convId);
    }

    const userMsg: ChatMessage = { id: `msg-${Date.now()}`, role: "user", content: text.trim() };
    setConversations(prev =>
      prev.map(c => {
        if (c.id !== convId) return c;
        const updated = { ...c, messages: [...c.messages, userMsg] };
        if (c.messages.length === 0) updated.title = text.trim().slice(0, 40);
        return updated;
      })
    );
    setInput("");
    setOnboarding(null);
    setHasSeenGeneric(true);
    setIsTyping(true);

    setTimeout(() => {
      const botMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: "assistant",
        content: `I'm **${selectedAgent.name}** powered by **${selectedModel.name}**.\n\n${context ? `📌 *Context: ${context}*\n\n` : ""}Here's what I can do for you:\n- ${selectedAgent.capabilities.map(c => c.title).join("\n- ")}\n\nWhat would you like to explore?`,
      };
      setConversations(prev =>
        prev.map(c => c.id === convId ? { ...c, messages: [...c.messages, botMsg] } : c)
      );
      setIsTyping(false);
    }, 900);
  };

  const handleSend = () => sendMessage(input);

  const handleSelectConversation = (conv: ChatConversation) => {
    setActiveConversationId(conv.id);
    setSelectedAgent(conv.agent);
    const model = llmModels.find(m => m.name === conv.model) || llmModels[0];
    setSelectedModel(model);
    setPanelView("chat");
    setOnboarding(null);
    setHasSeenGeneric(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const filteredAgents = agents.filter((a) =>
    a.name.toLowerCase().includes(agentSearch.toLowerCase())
  );

  const formatDate = (date: Date) => {
    const days = Math.floor((Date.now() - date.getTime()) / 86400000);
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  if (!isOpen) return null;

  const showOnboarding = onboarding !== null && currentMessages.length === 0 && panelView === "chat";

  return (
    <div
      className={`border-l border-border bg-chatbot flex flex-col h-full transition-all duration-300 ${
        isExpanded ? "w-[55%]" : "w-[440px]"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-chatbot-header min-h-[52px] backdrop-blur">
        <div className="flex items-center gap-2 min-w-0">
          {panelView === "history" ? (
            <button
              onClick={() => setPanelView("chat")}
              className="flex items-center gap-1.5 px-2 py-1 rounded text-[12px] hover:bg-secondary transition-colors text-foreground"
            >
              <ArrowLeft size={14} />
              <span className="font-medium">Back</span>
            </button>
          ) : (
            <>
              {/* Zia brand mark — icon only to save space */}
              <div className="flex items-center gap-1.5 pr-2 mr-0.5 border-r border-border shrink-0">
                <div className="w-6 h-6 rounded-md zia-gradient flex items-center justify-center shrink-0">
                  <Sparkles size={13} className="text-white" />
                </div>
                <span className="text-[13px] font-bold zia-text-gradient whitespace-nowrap hidden sm:inline">Zia</span>
              </div>

              {/* Agent Dropdown */}
              <div className="relative" ref={agentDropdownRef}>
                <button
                  onClick={() => { setShowAgentDropdown(!showAgentDropdown); setShowModelDropdown(false); }}
                  className="flex items-center gap-1.5 px-2 py-1 rounded-lg border border-border bg-background text-[12px] hover:bg-secondary transition-colors max-w-[160px]"
                >
                  {selectedAgent.image ? (
                    <img src={selectedAgent.image} alt="" className="w-5 h-5 rounded-full object-cover" />
                  ) : (
                    <span className="text-sm">{selectedAgent.avatar}</span>
                  )}
                  <span className="font-medium text-foreground truncate">{selectedAgent.name}</span>
                  <ChevronDown size={12} className="text-muted-foreground shrink-0" />
                </button>

                {showAgentDropdown && (
                  <div className="absolute top-full left-0 mt-1 w-[320px] bg-background rounded-xl shadow-xl border border-border z-50 overflow-hidden animate-zia-in">
                    <div className="p-3 border-b border-border">
                      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary border border-border">
                        <Search size={14} className="text-muted-foreground" />
                        <input
                          type="text"
                          placeholder="Search agents..."
                          value={agentSearch}
                          onChange={(e) => setAgentSearch(e.target.value)}
                          className="bg-transparent outline-none text-[13px] w-full text-foreground placeholder:text-muted-foreground"
                        />
                      </div>
                    </div>
                    <div className="max-h-[340px] overflow-y-auto crm-scrollbar py-1">
                      {filteredAgents.map((agent) => {
                        const isSelected = selectedAgent.id === agent.id;
                        return (
                          <div
                            key={agent.id}
                            onClick={() => handleAgentSwitch(agent)}
                            className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${
                              isSelected ? "bg-secondary" : "hover:bg-secondary/50"
                            }`}
                          >
                            <div className="relative shrink-0">
                              {agent.image ? (
                                <img src={agent.image} alt={agent.name} className="w-10 h-10 rounded-full object-cover ring-2 ring-border" />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-lg ring-2 ring-border">
                                  {agent.avatar}
                                </div>
                              )}
                              {isSelected && (
                                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-primary text-primary-foreground flex items-center justify-center ring-2 ring-background">
                                  <Check size={10} />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-[13px] font-semibold text-foreground">{agent.name}</div>
                              <div className="text-[11px] text-muted-foreground truncate">{agent.description}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Model Dropdown */}
              <div className="relative" ref={modelDropdownRef}>
                <button
                  onClick={() => { setShowModelDropdown(!showModelDropdown); setShowAgentDropdown(false); }}
                  className="flex items-center gap-1.5 px-2 py-1 rounded-lg border border-border bg-background text-[12px] hover:bg-secondary transition-colors"
                >
                  <span className="font-medium text-foreground">{selectedModel.name}</span>
                  <ChevronDown size={12} className="text-muted-foreground" />
                </button>

                {showModelDropdown && (
                  <div className="absolute top-full left-0 mt-1 w-[180px] bg-background rounded-lg shadow-xl border border-border z-50 py-1 animate-zia-in">
                    {llmModels.map((model) => (
                      <div
                        key={model.id}
                        onClick={() => { setSelectedModel(model); setShowModelDropdown(false); }}
                        className={`flex items-center gap-2 px-3 py-2 cursor-pointer text-[13px] transition-colors ${
                          selectedModel.id === model.id ? "bg-secondary font-medium" : "hover:bg-secondary/50"
                        }`}
                      >
                        {selectedModel.id === model.id && <Check size={12} />}
                        <span className="text-foreground">{model.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {panelView === "chat" && (
            <button onClick={() => setPanelView("history")} className="p-1.5 hover:bg-secondary rounded-md text-muted-foreground transition-colors" title="History">
              <History size={16} />
            </button>
          )}
          <button onClick={onToggleExpand} className="p-1.5 hover:bg-secondary rounded-md text-muted-foreground transition-colors" title={isExpanded ? "Collapse" : "Expand"}>
            {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
          <button onClick={onClose} className="p-1.5 hover:bg-secondary rounded-md text-muted-foreground transition-colors" title="Close">
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Body */}
      {panelView === "history" ? (
        <HistoryView
          conversations={conversations}
          activeConversationId={activeConversationId}
          onSelect={handleSelectConversation}
          onNewChat={createNewChat}
          formatDate={formatDate}
        />
      ) : showOnboarding ? (
        onboarding === "generic" ? (
          <GenericOnboarding onStart={dismissOnboarding} />
        ) : (
          <AgentOnboarding
            agent={selectedAgent}
            onStart={dismissOnboarding}
            onPrompt={(p) => sendMessage(p)}
          />
        )
      ) : (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto crm-scrollbar p-4 space-y-4 zia-gradient-bg">
            {currentMessages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-zia-in`}>
                {msg.role === "assistant" && (
                  <div className="w-7 h-7 rounded-full zia-gradient flex items-center justify-center mr-2 shrink-0 mt-1">
                    <Sparkles size={13} className="text-white" />
                  </div>
                )}
                <div
                  className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-[13px] leading-relaxed ${
                    msg.role === "user"
                      ? "zia-gradient text-white rounded-br-md shadow-md"
                      : "bg-white text-chatbot-bot-text rounded-bl-md border border-border zia-card-shadow"
                  }`}
                >
                  {msg.role === "assistant" ? (
                    <div className="prose prose-sm max-w-none [&>p]:m-0 [&>ul]:mt-1 [&>ul]:mb-0 [&>ol]:mt-1 [&>ol]:mb-0">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  ) : (
                    msg.content
                  )}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start items-center gap-2 animate-zia-in">
                <div className="w-7 h-7 rounded-full zia-gradient flex items-center justify-center">
                  <Sparkles size={13} className="text-white" />
                </div>
                <div className="bg-white rounded-2xl rounded-bl-md px-4 py-3 border border-border zia-card-shadow">
                  <div className="flex gap-1.5">
                    <span className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce [animation-delay:0ms]" />
                    <span className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce [animation-delay:150ms]" />
                    <span className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce [animation-delay:300ms]" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </>
      )}

      {/* Input — always visible (also during onboarding so user can skip) */}
      {panelView === "chat" && (
        <div className="p-3 border-t border-border bg-background">
          {context && (
            <div className="mb-2 flex items-center gap-2 px-3 py-1.5 rounded-lg zia-gradient-soft border border-primary/15">
              <Pin size={12} className="text-primary" />
              <span className="text-[11px] font-semibold zia-text-gradient">Context:</span>
              <span className="text-[11px] text-foreground/70 truncate">{context}</span>
            </div>
          )}
          <div className="flex items-end gap-2 bg-chatbot-input-bg rounded-2xl border border-border focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/10 transition-all px-3 py-2">
            <button className="text-muted-foreground hover:text-primary transition-colors mb-0.5" title="Attach">
              <Plus size={18} />
            </button>
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                e.target.style.height = "auto";
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
              }}
              onKeyDown={handleKeyDown}
              placeholder={`Ask ${selectedAgent.name}…`}
              rows={1}
              className="flex-1 bg-transparent outline-none text-[13px] text-foreground placeholder:text-muted-foreground resize-none leading-5 max-h-[120px]"
              style={{ height: "20px" }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                input.trim()
                  ? "zia-gradient text-white shadow-md hover:opacity-90"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              <Send size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

/* ─── Generic Onboarding (Zia Assist intro) ─────────────────────── */

const GenericOnboarding = ({ onStart }: { onStart: () => void }) => {
  const cards = [
    {
      icon: "👥", title: "Leads & Contacts",
      desc: "Find, filter, and analyze leads and contact details.",
      iconBg: "from-blue-400 to-blue-600",
      cardBg: "from-blue-50 to-blue-100/50",
      titleColor: "text-blue-600",
      arrowBg: "bg-blue-500",
      align: "left" as const,
    },
    {
      icon: "📊", title: "Insights & Reports",
      desc: "Get instant insights and visual reports from your data.",
      iconBg: "from-emerald-400 to-emerald-600",
      cardBg: "from-emerald-50 to-emerald-100/50",
      titleColor: "text-emerald-600",
      arrowBg: "bg-emerald-500",
      align: "right" as const,
    },
    {
      icon: "⚡", title: "Workflows & Tasks",
      desc: "Track tasks, automate follow-ups, and never miss a beat.",
      iconBg: "from-violet-400 to-violet-600",
      cardBg: "from-violet-50 to-violet-100/50",
      titleColor: "text-violet-600",
      arrowBg: "bg-violet-500",
      align: "left" as const,
    },
    {
      icon: "🔍", title: "Ask Anything",
      desc: "Ask questions in natural language and get answers instantly.",
      iconBg: "from-orange-400 to-orange-600",
      cardBg: "from-orange-50 to-orange-100/50",
      titleColor: "text-orange-600",
      arrowBg: "bg-orange-500",
      align: "right" as const,
    },
  ];

  return (
    <div className="flex-1 overflow-y-auto crm-scrollbar zia-gradient-bg">
      <div className="px-5 py-6 animate-zia-in flex flex-col items-center">
        {/* Hero mascot */}
        <div className="relative flex justify-center mb-3">
          <div className="absolute inset-0 m-auto w-40 h-40 rounded-full zia-gradient opacity-20 blur-3xl" />
          <img
            src={ziaHero}
            alt="Zia"
            className="relative w-32 h-32 object-contain animate-zia-float drop-shadow-xl"
          />
        </div>

        <h2 className="text-center text-[18px] font-bold text-foreground mb-1.5">
          Hi! I'm <span className="zia-text-gradient">Zia Assist</span> <span className="inline-block">👋</span>
        </h2>
        <p className="text-center text-[12.5px] text-muted-foreground max-w-[280px] mb-4 leading-relaxed">
          Your AI assistant for smarter CRM management and follow-ups.
        </p>

        {/* Capability card group */}
        <div className="w-full bg-white/90 backdrop-blur rounded-3xl p-4 border border-white shadow-[0_8px_32px_-8px_hsl(258_50%_50%/0.15)] mb-4">
          {/* "Here's how I can help you" pill */}
          <div className="flex justify-center mb-4">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full zia-gradient-soft border border-primary/15">
              <Sparkles size={12} className="text-primary" />
              <span className="text-[12px] font-medium text-foreground">
                Here's <span className="zia-text-gradient font-bold">how</span> I can help you
              </span>
            </div>
          </div>

          {/* 4 cards in a 2x2 with center node */}
          <div className="relative grid grid-cols-2 gap-3">
            {cards.map((c) => (
              <div
                key={c.title}
                className={`relative bg-gradient-to-br ${c.cardBg} rounded-2xl p-3 border border-white/80 shadow-sm`}
              >
                <div className="flex items-start gap-2">
                  <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${c.iconBg} flex items-center justify-center text-white text-base shadow-md shrink-0`}>
                    {c.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className={`text-[12.5px] font-bold ${c.titleColor} leading-tight mb-0.5`}>{c.title}</div>
                    <div className="text-[10.5px] text-foreground/65 leading-snug">{c.desc}</div>
                  </div>
                </div>
                <button
                  className={`mt-2 w-6 h-6 rounded-full ${c.arrowBg} text-white flex items-center justify-center shadow-sm hover:scale-110 transition-transform`}
                  aria-label={c.title}
                >
                  <ArrowRight size={12} />
                </button>
              </div>
            ))}

            {/* Center sparkle node */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none">
              <div className="w-9 h-9 rounded-full bg-white shadow-lg border border-primary/15 flex items-center justify-center">
                <Sparkles size={14} className="text-primary" fill="currentColor" />
              </div>
            </div>
          </div>
        </div>

        {/* Security band */}
        <div className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl bg-violet-50/70 border border-violet-100 mb-4">
          <img src={ziaShield} alt="" className="w-10 h-10 object-contain shrink-0" loading="lazy" />
          <div className="flex-1 min-w-0">
            <div className="text-[12.5px] font-semibold text-foreground">
              Your data is safe &amp; secure 🔒
            </div>
            <div className="text-[10.5px] text-muted-foreground">
              I only access the data I need to help you.
            </div>
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={onStart}
          className="w-full flex items-center justify-between gap-2 zia-gradient text-white font-semibold text-[14px] px-5 py-3 rounded-2xl shadow-lg zia-glow hover:opacity-95 transition-opacity"
        >
          <span className="w-5" />
          <span className="flex items-center gap-2">
            <Sparkles size={16} />
            Let's Get Started 🚀
          </span>
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};

/* ─── Per-Agent Onboarding ──────────────────────────────────────── */

const AgentOnboarding = ({
  agent,
  onStart,
  onPrompt,
}: {
  agent: Agent;
  onStart: () => void;
  onPrompt: (p: string) => void;
}) => (
  <div className="flex-1 overflow-y-auto crm-scrollbar zia-gradient-bg">
    <div className="px-5 py-6 animate-zia-in">
      {/* Hero with agent avatar */}
      <div className="relative flex justify-center mb-4">
        <div className={`absolute w-36 h-36 rounded-full bg-gradient-to-br ${agent.gradient} opacity-25 blur-2xl`} />
        <div className={`absolute w-28 h-28 rounded-full bg-gradient-to-br ${agent.gradient} opacity-20 animate-zia-ring`} />
        <div className="relative animate-zia-float">
          {agent.image ? (
            <img
              src={agent.image}
              alt={agent.name}
              className="w-28 h-28 rounded-full object-cover shadow-2xl ring-4 ring-white"
            />
          ) : (
            <div className={`w-28 h-28 rounded-full bg-gradient-to-br ${agent.gradient} flex items-center justify-center text-5xl shadow-2xl ring-4 ring-white`}>
              {agent.avatar}
            </div>
          )}
        </div>
      </div>

      <h2 className="text-center text-[19px] font-bold text-foreground mb-1">
        {agent.greeting} <span className="inline-block animate-zia-float">👋</span>
      </h2>
      <p className="text-center text-[12.5px] text-muted-foreground max-w-[300px] mx-auto mb-5">
        {agent.tagline}
      </p>

      {/* Capability cards */}
      <div className="bg-white/80 backdrop-blur rounded-2xl p-3 border border-border zia-card-shadow mb-4">
        <div className="flex items-center justify-center gap-1.5 mb-3">
          <Sparkles size={13} className="text-primary" />
          <span className="text-[12px] font-semibold text-foreground">
            Here's <span className="zia-text-gradient">how</span> I can help
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {agent.capabilities.map((cap) => (
            <div key={cap.title} className="bg-white rounded-xl p-2.5 border border-border/60 hover:border-primary/30 hover:shadow-md transition-all cursor-default">
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${cap.color} flex items-center justify-center text-white text-sm mb-1.5 shadow-sm`}>
                {cap.icon}
              </div>
              <div className="text-[12px] font-semibold text-foreground leading-tight">{cap.title}</div>
              <div className="text-[10.5px] text-muted-foreground mt-0.5 leading-snug line-clamp-2">{cap.description}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Starter prompts */}
      <div className="mb-4">
        <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">
          Try asking
        </div>
        <div className="space-y-1.5">
          {agent.starterPrompts.map((p) => (
            <button
              key={p}
              onClick={() => onPrompt(p)}
              className="w-full text-left flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl bg-white border border-border hover:border-primary/40 hover:bg-primary/[0.03] group transition-all"
            >
              <span className="text-[12.5px] text-foreground">{p}</span>
              <ArrowRight size={13} className="text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
            </button>
          ))}
        </div>
      </div>

      {/* CTA */}
      <button
        onClick={onStart}
        className={`w-full flex items-center justify-center gap-2 bg-gradient-to-r ${agent.gradient} text-white font-semibold text-[13px] py-2.5 rounded-2xl shadow-lg hover:opacity-95 transition-opacity`}
      >
        Start chatting
        <ArrowRight size={15} />
      </button>
    </div>
  </div>
);

/* ─── History View ──────────────────────────────────────────────── */

interface HistoryViewProps {
  conversations: ChatConversation[];
  activeConversationId: string | null;
  onSelect: (conv: ChatConversation) => void;
  onNewChat: () => void;
  formatDate: (d: Date) => string;
}

const HistoryView = ({ conversations, activeConversationId, onSelect, onNewChat, formatDate }: HistoryViewProps) => (
  <div className="flex-1 overflow-y-auto crm-scrollbar bg-chatbot">
    <div className="p-3 border-b border-border">
      <button
        onClick={onNewChat}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl zia-gradient text-white text-[13px] font-semibold hover:opacity-95 transition-opacity zia-glow"
      >
        <Plus size={16} />
        New Chat
      </button>
    </div>

    <div className="py-1">
      {conversations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <MessageSquare size={32} className="text-muted-foreground/40 mb-3" />
          <p className="text-[13px] text-muted-foreground">No chat history yet</p>
        </div>
      ) : (
        conversations.map((conv) => {
          const isActive = conv.id === activeConversationId;
          const lastMsg = conv.messages[conv.messages.length - 1];
          return (
            <div
              key={conv.id}
              onClick={() => onSelect(conv)}
              className={`px-4 py-3 cursor-pointer border-b border-border/50 transition-colors ${
                isActive ? "zia-gradient-soft border-l-2 border-l-primary" : "hover:bg-secondary/50"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[13px] font-semibold text-foreground truncate flex-1">
                  {conv.title}
                </span>
                <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-medium">
                  {conv.agent.image ? (
                    <img src={conv.agent.image} alt="" className="w-3 h-3 rounded-full object-cover" />
                  ) : (
                    <span>{conv.agent.avatar}</span>
                  )}
                  {conv.agent.name.length > 14 ? conv.agent.name.slice(0, 14) + "…" : conv.agent.name}
                </span>
              </div>
              {lastMsg && (
                <p className="text-[12px] text-muted-foreground truncate">
                  {lastMsg.content.slice(0, 70)}…
                </p>
              )}
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] text-muted-foreground/60">{formatDate(conv.createdAt)}</span>
                <span className="text-[10px] text-muted-foreground/40">•</span>
                <span className="text-[10px] text-muted-foreground/60">{conv.messages.length} messages</span>
              </div>
            </div>
          );
        })
      )}
    </div>
  </div>
);

export default ChatbotPanel;
