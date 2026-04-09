import { useState } from "react";
import CrmSidebar from "@/components/CrmSidebar";
import CrmTopbar from "@/components/CrmTopbar";
import LeadListView from "@/components/LeadListView";
import LeadDetailView from "@/components/LeadDetailView";
import ChatbotPanel from "@/components/ChatbotPanel";
import type { Lead } from "@/data/leads";

const Index = () => {
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [chatbotOpen, setChatbotOpen] = useState(false);
  const [chatbotExpanded, setChatbotExpanded] = useState(false);

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <CrmTopbar onZiaClick={() => setChatbotOpen(!chatbotOpen)} isChatbotOpen={chatbotOpen} />
      <div className="flex flex-1 overflow-hidden">
        <CrmSidebar activeItem="Leads" />
        <div className="flex flex-1 overflow-hidden">
          <div className={`flex-1 flex overflow-hidden transition-all duration-300`}>
            {selectedLead ? (
              <LeadDetailView lead={selectedLead} onBack={() => setSelectedLead(null)} />
            ) : (
              <LeadListView onSelectLead={setSelectedLead} />
            )}
          </div>
          <ChatbotPanel
            isOpen={chatbotOpen}
            isExpanded={chatbotExpanded}
            onClose={() => { setChatbotOpen(false); setChatbotExpanded(false); }}
            onToggleExpand={() => setChatbotExpanded(!chatbotExpanded)}
          />
        </div>
      </div>
    </div>
  );
};

export default Index;
