import { useState, useRef, useEffect } from "react";
import {
  X, Maximize2, Minimize2, History, Send, Plus, ChevronDown, Check, Search
} from "lucide-react";
import { agents, llmModels, type Agent } from "@/data/leads";
import ReactMarkdown from "react-markdown";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface ChatbotPanelProps {
  isOpen: boolean;
  isExpanded: boolean;
  onClose: () => void;
  onToggleExpand: () => void;
}

const ChatbotPanel = ({ isOpen, isExpanded, onClose, onToggleExpand }: ChatbotPanelProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [selectedAgent, setSelectedAgent] = useState<Agent>(agents[0]);
  const [selectedModel, setSelectedModel] = useState(llmModels[0]);
  const [showAgentDropdown, setShowAgentDropdown] = useState(false);
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [agentSearch, setAgentSearch] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const agentDropdownRef = useRef<HTMLDivElement>(null);
  const modelDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg: ChatMessage = { id: Date.now().toString(), role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    // Mock bot response
    setTimeout(() => {
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `I'm **${selectedAgent.name}** using **${selectedModel.name}**. How can I help you with your CRM tasks today?\n\nHere are some things I can do:\n- Follow up on leads\n- Analyze your pipeline\n- Draft emails`,
      };
      setMessages((prev) => [...prev, botMsg]);
    }, 800);
  };

  const filteredAgents = agents.filter((a) =>
    a.name.toLowerCase().includes(agentSearch.toLowerCase())
  );

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
                {/* Search */}
                <div className="p-3 border-b border-border">
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary border border-border">
                    <Search size={14} className="text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search"
                      value={agentSearch}
                      onChange={(e) => setAgentSearch(e.target.value)}
                      className="bg-transparent outline-none text-[13px] w-full text-foreground placeholder:text-muted-foreground"
                    />
                  </div>
                </div>
                {/* Agent list */}
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
        </div>

        <div className="flex items-center gap-1">
          <button className="p-1.5 hover:bg-secondary rounded text-muted-foreground" title="Chat History">
            <History size={16} />
          </button>
          <button onClick={onToggleExpand} className="p-1.5 hover:bg-secondary rounded text-muted-foreground" title={isExpanded ? "Collapse" : "Expand"}>
            {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
          <button onClick={onClose} className="p-1.5 hover:bg-secondary rounded text-muted-foreground" title="Close">
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto crm-scrollbar p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="text-4xl mb-3">🤖</div>
            <h3 className="text-base font-semibold text-foreground mb-1">Hi! I'm {selectedAgent.name}</h3>
            <p className="text-[13px] text-muted-foreground max-w-[250px]">
              Ask me anything about your CRM data, leads, or workflows.
            </p>
          </div>
        )}
        {messages.map((msg) => (
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
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="p-3 border-t border-border">
        <div className="flex items-center gap-2 bg-chatbot-input-bg rounded-2xl px-3 py-2 border border-border">
          <button className="text-muted-foreground hover:text-foreground">
            <Plus size={18} />
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type your message..."
            className="flex-1 bg-transparent outline-none text-[13px] text-foreground placeholder:text-muted-foreground"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="text-primary hover:text-primary/80 disabled:text-muted-foreground transition-colors"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatbotPanel;
