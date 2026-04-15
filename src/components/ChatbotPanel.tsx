import { useState, useRef, useEffect, useCallback } from "react";
import {
  X, Maximize2, Minimize2, History, Send, Plus, ChevronDown, Check, Search, ArrowLeft, MessageSquare
} from "lucide-react";
import { agents, llmModels, type Agent } from "@/data/leads";
import ReactMarkdown from "react-markdown";

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
      agent: agents[1],
      model: "GPT-3.5 Turbo",
      messages: [
        { id: "d3", role: "user", content: "Can you analyze my current pipeline?" },
        { id: "d4", role: "assistant", content: "I'd be happy to help analyze your pipeline! Based on the current data, you have **13 leads** in various stages. Let me break it down..." },
      ],
      createdAt: new Date(Date.now() - 172800000),
    },
    {
      id: "demo-3",
      title: "Email template drafting",
      agent: agents[2],
      model: "Gemini Pro",
      messages: [
        { id: "d5", role: "user", content: "Draft a follow-up email for Marcie Thorpe" },
        { id: "d6", role: "assistant", content: "Here's a professional follow-up email:\n\n**Subject:** Great connecting with you, Marcie!\n\nHi Marcie,\n\nIt was wonderful speaking with you. I wanted to follow up on our conversation about..." },
      ],
      createdAt: new Date(Date.now() - 259200000),
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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const agentDropdownRef = useRef<HTMLDivElement>(null);
  const modelDropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const activeConversation = conversations.find(c => c.id === activeConversationId) || null;
  const currentMessages = activeConversation?.messages || [];

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
    const newConv: ChatConversation = {
      id: `conv-${Date.now()}`,
      title: "New Chat",
      agent: selectedAgent,
      model: selectedModel.name,
      messages: [],
      createdAt: new Date(),
    };
    setConversations(prev => [newConv, ...prev]);
    setActiveConversationId(newConv.id);
    setPanelView("chat");
    setInput("");
  }, [selectedAgent, selectedModel]);

  const handleSend = () => {
    if (!input.trim()) return;

    let convId = activeConversationId;

    if (!convId) {
      const newConv: ChatConversation = {
        id: `conv-${Date.now()}`,
        title: input.trim().slice(0, 40),
        agent: selectedAgent,
        model: selectedModel.name,
        messages: [],
        createdAt: new Date(),
      };
      setConversations(prev => [newConv, ...prev]);
      convId = newConv.id;
      setActiveConversationId(convId);
    }

    const userMsg: ChatMessage = { id: `msg-${Date.now()}`, role: "user", content: input.trim() };

    setConversations(prev =>
      prev.map(c => {
        if (c.id !== convId) return c;
        const updated = { ...c, messages: [...c.messages, userMsg] };
        if (c.messages.length === 0) updated.title = input.trim().slice(0, 40);
        return updated;
      })
    );
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const botMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: "assistant",
        content: `I'm **${selectedAgent.name}** using **${selectedModel.name}**.\n\n${context ? `📌 *Context: ${context}*\n\n` : ""}Here's what I can help you with:\n- Analyze your leads and pipeline\n- Draft follow-up emails\n- Suggest next best actions\n- Provide insights on your CRM data\n\nWhat would you like to explore?`,
      };
      setConversations(prev =>
        prev.map(c => c.id === convId ? { ...c, messages: [...c.messages, botMsg] } : c)
      );
      setIsTyping(false);
    }, 1200);
  };

  const handleSelectConversation = (conv: ChatConversation) => {
    setActiveConversationId(conv.id);
    setSelectedAgent(conv.agent);
    const model = llmModels.find(m => m.name === conv.model) || llmModels[0];
    setSelectedModel(model);
    setPanelView("chat");
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
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  if (!isOpen) return null;

  return (
    <div
      className={`border-l border-border bg-chatbot flex flex-col h-full transition-all duration-300 ${
        isExpanded ? "w-[55%]" : "w-[400px]"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-chatbot-header min-h-[46px]">
        <div className="flex items-center gap-2">
          {panelView === "history" ? (
            <button
              onClick={() => setPanelView("chat")}
              className="flex items-center gap-1.5 px-2 py-1 rounded text-[12px] hover:bg-secondary transition-colors text-foreground"
            >
              <ArrowLeft size={14} />
              <span className="font-medium">Back to Chat</span>
            </button>
          ) : (
            <>
              {/* Agent Dropdown */}
              <div className="relative" ref={agentDropdownRef}>
                <button
                  onClick={() => { setShowAgentDropdown(!showAgentDropdown); setShowModelDropdown(false); }}
                  className="flex items-center gap-1.5 px-2 py-1 rounded border border-border bg-background text-[12px] hover:bg-secondary transition-colors"
                >
                  <span className="text-sm">{selectedAgent.avatar}</span>
                  <span className="font-medium text-foreground max-w-[100px] truncate">{selectedAgent.name}</span>
                  <ChevronDown size={12} className="text-muted-foreground" />
                </button>

                {showAgentDropdown && (
                  <div className="absolute top-full left-0 mt-1 w-[300px] bg-background rounded-xl shadow-lg border border-border z-50 overflow-hidden">
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
                    <div className="max-h-[320px] overflow-y-auto crm-scrollbar py-1">
                      {filteredAgents.map((agent) => {
                        const isSelected = selectedAgent.id === agent.id;
                        return (
                          <div
                            key={agent.id}
                            onClick={() => {
                              setSelectedAgent(agent);
                              setShowAgentDropdown(false);
                              setAgentSearch("");
                            }}
                            className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${
                              isSelected ? "bg-secondary" : "hover:bg-secondary/50"
                            }`}
                          >
                            <div className="relative">
                              {isSelected && (
                                <div className="absolute -left-5 top-1/2 -translate-y-1/2">
                                  <Check size={14} className="text-foreground" />
                                </div>
                              )}
                              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-lg border-2 border-border overflow-hidden">
                                {agent.avatar}
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-[14px] font-semibold text-foreground">{agent.name}</div>
                              <div className="text-[12px] text-muted-foreground truncate">{agent.description}</div>
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
                  className="flex items-center gap-1.5 px-2 py-1 rounded border border-border bg-background text-[12px] hover:bg-secondary transition-colors"
                >
                  <span className="font-medium text-foreground">{selectedModel.name}</span>
                  <ChevronDown size={12} className="text-muted-foreground" />
                </button>

                {showModelDropdown && (
                  <div className="absolute top-full left-0 mt-1 w-[180px] bg-background rounded-lg shadow-lg border border-border z-50 py-1">
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

        <div className="flex items-center gap-1">
          {panelView === "chat" && (
            <button
              onClick={() => setPanelView("history")}
              className="p-1.5 hover:bg-secondary rounded text-muted-foreground transition-colors"
              title="Chat History"
            >
              <History size={16} />
            </button>
          )}
          <button onClick={onToggleExpand} className="p-1.5 hover:bg-secondary rounded text-muted-foreground transition-colors" title={isExpanded ? "Collapse" : "Expand"}>
            {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
          <button onClick={onClose} className="p-1.5 hover:bg-secondary rounded text-muted-foreground transition-colors" title="Close">
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
      ) : (
        <>
          {/* Messages area */}
          <div className="flex-1 overflow-y-auto crm-scrollbar p-4 space-y-4">
            {currentMessages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="text-4xl mb-3">🤖</div>
                <h3 className="text-base font-semibold text-foreground mb-1">Hi! I'm {selectedAgent.name}</h3>
                <p className="text-[13px] text-muted-foreground max-w-[250px]">
                  Ask me anything about your CRM data, leads, or workflows.
                </p>
              </div>
            )}
            {currentMessages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-[13px] leading-relaxed ${
                    msg.role === "user"
                      ? "bg-chatbot-user-bubble text-chatbot-user-text rounded-br-md"
                      : "bg-chatbot-bot-bubble text-chatbot-bot-text rounded-bl-md"
                  }`}
                >
                  {msg.role === "assistant" ? (
                    <div className="prose prose-sm max-w-none [&>p]:m-0 [&>ul]:mt-1 [&>ul]:mb-0">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  ) : (
                    msg.content
                  )}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-chatbot-bot-bubble rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex gap-1.5">
                    <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:0ms]" />
                    <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:150ms]" />
                    <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:300ms]" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div className="p-3 border-t border-border">
            {/* Context Band */}
            {context && (
              <div className="mb-2 flex items-center gap-2 px-3 py-1.5 rounded-t-xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 border-b-0">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <span className="text-[11px] font-medium text-primary">
                  📌 Context: {context}
                </span>
              </div>
            )}
            <div className={`flex items-end gap-2 bg-chatbot-input-bg ${context ? "rounded-b-2xl rounded-t-none border-t-0 border border-primary/20" : "rounded-2xl border border-border"} px-3 py-2`}>
              <button className="text-muted-foreground hover:text-foreground transition-colors mb-0.5">
                <Plus size={18} />
              </button>
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  // Auto-resize
                  e.target.style.height = "auto";
                  e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
                }}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                rows={1}
                className="flex-1 bg-transparent outline-none text-[13px] text-foreground placeholder:text-muted-foreground resize-none leading-5 max-h-[120px]"
                style={{ height: "20px" }}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="text-primary hover:text-primary/80 disabled:text-muted-foreground transition-colors mb-0.5"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

/* ─── History View ──────────────────────────────────────────── */

interface HistoryViewProps {
  conversations: ChatConversation[];
  activeConversationId: string | null;
  onSelect: (conv: ChatConversation) => void;
  onNewChat: () => void;
  formatDate: (d: Date) => string;
}

const HistoryView = ({ conversations, activeConversationId, onSelect, onNewChat, formatDate }: HistoryViewProps) => (
  <div className="flex-1 overflow-y-auto crm-scrollbar">
    {/* New Chat Button */}
    <div className="p-3 border-b border-border">
      <button
        onClick={onNewChat}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-[13px] font-medium hover:bg-primary/90 transition-colors"
      >
        <Plus size={16} />
        New Chat
      </button>
    </div>

    {/* Conversation List */}
    <div className="py-1">
      {conversations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <MessageSquare size={32} className="text-muted-foreground/40 mb-3" />
          <p className="text-[13px] text-muted-foreground">No chat history yet</p>
          <p className="text-[12px] text-muted-foreground/60 mt-1">Start a new conversation</p>
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
                isActive ? "bg-primary/5 border-l-2 border-l-primary" : "hover:bg-secondary/50"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <MessageSquare size={14} className="text-muted-foreground shrink-0" />
                <span className="text-[13px] font-semibold text-foreground truncate flex-1">
                  {conv.title}
                </span>
                {/* Agent tag */}
                <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-medium">
                  <span>{conv.agent.avatar}</span>
                  {conv.agent.name.length > 14 ? conv.agent.name.slice(0, 14) + "…" : conv.agent.name}
                </span>
              </div>
              {lastMsg && (
                <p className="text-[12px] text-muted-foreground truncate pl-[22px]">
                  {lastMsg.content.slice(0, 60)}…
                </p>
              )}
              <div className="flex items-center gap-2 mt-1 pl-[22px]">
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
