import { useState } from "react";
import { ArrowLeft, Mail, MoreHorizontal, ChevronLeft, ChevronRight, Sparkles, Phone as PhoneIcon } from "lucide-react";
import type { Lead } from "@/data/leads";

interface LeadDetailViewProps {
  lead: Lead;
  onBack: () => void;
}

const LeadDetailView = ({ lead, onBack }: LeadDetailViewProps) => {
  const [activeTab, setActiveTab] = useState("Overview");

  const tabs = ["Overview", "Timeline", "Data Privacy"];

  const relatedList = [
    "Notes", "Connected Records", "Cadences", "Attachments", "Products",
    "Open Activities", "Closed Activities", "Invited Meetings", "Emails",
    "Campaigns", "Social", "Voice of the Customer"
  ];

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border bg-background">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="text-muted-foreground hover:text-foreground">
              <ArrowLeft size={18} />
            </button>
            <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-sm font-semibold text-foreground">
              {lead.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground">{lead.name} <span className="font-normal text-muted-foreground">- {lead.company}</span></h1>
              <div className="flex items-center gap-1 text-[12px] text-crm-link cursor-pointer">
                <span>🏷️</span> Add Tags
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-1.5 rounded hover:bg-secondary">
              <Sparkles size={18} className="text-primary" />
            </button>
            <button className="px-3 py-1.5 bg-primary text-primary-foreground rounded text-[13px] font-medium hover:bg-primary/90">
              Send Email
            </button>
            <button className="px-3 py-1.5 border border-border rounded text-[13px] font-medium text-foreground hover:bg-secondary">
              Convert
            </button>
            <button className="px-3 py-1.5 border border-border rounded text-[13px] font-medium text-foreground hover:bg-secondary">
              Edit
            </button>
            <button className="px-3 py-1.5 border border-border rounded text-[13px] font-medium text-foreground hover:bg-secondary flex items-center gap-1">
              Agenttest <ChevronLeft size={12} />
            </button>
            <button className="p-1.5 border border-border rounded hover:bg-secondary">
              <MoreHorizontal size={16} className="text-muted-foreground" />
            </button>
            <button className="p-1.5 hover:bg-secondary rounded text-muted-foreground"><ChevronLeft size={16} /></button>
            <button className="p-1.5 hover:bg-secondary rounded text-muted-foreground"><ChevronRight size={16} /></button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Related List Sidebar */}
        <div className="w-[200px] min-w-[200px] border-r border-border bg-background overflow-y-auto crm-scrollbar p-4">
          <h3 className="text-[13px] font-semibold text-foreground mb-2">Related List</h3>
          <div className="space-y-1">
            {relatedList.map((item, idx) => (
              <div key={idx} className="text-[13px] text-foreground py-1 px-2 rounded hover:bg-secondary cursor-pointer">
                {item} {item === "Notes" && <span className="text-muted-foreground ml-1">2</span>}
              </div>
            ))}
          </div>
          <div className="mt-3 text-[13px] text-crm-link cursor-pointer px-2">Add Related List</div>
          <h3 className="text-[13px] font-semibold text-foreground mt-4 mb-2">Links</h3>
          <div className="text-[13px] text-crm-link cursor-pointer px-2">Add Link</div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto crm-scrollbar">
          {/* Tabs */}
          <div className="flex items-center gap-1 px-6 pt-3 border-b border-border">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-[13px] font-medium border-b-2 transition-colors ${
                  activeTab === tab
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab}
              </button>
            ))}
            <div className="ml-auto text-[11px] text-muted-foreground">Last Update : 1 day(s) ago</div>
          </div>

          {/* Overview Content */}
          {activeTab === "Overview" && (
            <div className="p-6 space-y-6">
              {/* Quick Info */}
              <div className="space-y-3 border-b border-border pb-4">
                {[
                  ["Lead Owner", lead.leadOwner],
                  ["Email", lead.email || "-"],
                  ["Phone", lead.phone],
                  ["Mobile", lead.mobile || "-"],
                  ["Lead Status", lead.leadStatus],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center">
                    <span className="w-[140px] text-right text-[13px] text-muted-foreground pr-4">{label}</span>
                    <span className="text-[13px] text-foreground flex items-center gap-1.5">
                      {value}
                      {label === "Phone" && value !== "-" && (
                        <PhoneIcon size={14} className="text-crm-success cursor-pointer" />
                      )}
                    </span>
                  </div>
                ))}
              </div>

              <button className="text-[13px] font-semibold text-foreground">Hide Details</button>

              {/* Lead Information */}
              <div>
                <h3 className="text-[14px] font-semibold text-foreground mb-4">Lead Information</h3>
                <div className="grid grid-cols-2 gap-y-3">
                  {[
                    [["Lead Owner", lead.leadOwner], ["Company", lead.company]],
                    [["Title", lead.title], ["Lead Name", lead.name]],
                    [["Phone", lead.phone], ["Email", lead.email || "-"]],
                    [["Mobile", lead.mobile || "-"], ["Fax", lead.fax || "-"]],
                    [["Lead Source", lead.leadSource], ["Website", lead.website || "-"]],
                    [["Industry", lead.industry || "-"], ["Lead Status", lead.leadStatus]],
                    [["Annual Revenue", lead.annualRevenue || "-"], ["No. of Employees", lead.numberOfEmployees || "-"]],
                    [["Email Opt Out", lead.emailOptOut || "-"], ["Rating", lead.rating || "-"]],
                  ].map((row, rIdx) => (
                    row.map(([label, value], cIdx) => (
                      <div key={`${rIdx}-${cIdx}`} className="flex items-center">
                        <span className="w-[140px] text-right text-[13px] text-muted-foreground pr-4">{label}</span>
                        <span className="text-[13px] text-foreground flex items-center gap-1.5">
                          {value}
                          {label === "Phone" && value !== "-" && (
                            <PhoneIcon size={14} className="text-crm-success cursor-pointer" />
                          )}
                        </span>
                      </div>
                    ))
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeadDetailView;
