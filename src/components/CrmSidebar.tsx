import { useState } from "react";
import {
  Home, BarChart3, FileText, Inbox, Users, Building2, Handshake,
  TrendingUp, FileBox, Megaphone, Activity, CheckSquare, Calendar,
  Phone, Package, Headphones, Puzzle, Briefcase, Wrench, FolderOpen,
  MessageSquare, ChevronDown, ChevronRight, Search, MoreHorizontal, Sparkles
} from "lucide-react";

interface CrmSidebarProps {
  activeItem: string;
  onNavigate?: (item: string) => void;
}

const CrmSidebar = ({ activeItem }: CrmSidebarProps) => {
  const [salesOpen, setSalesOpen] = useState(true);
  const [activitiesOpen, setActivitiesOpen] = useState(true);

  const topItems = [
    { icon: Home, label: "Home" },
    { icon: BarChart3, label: "Reports" },
    { icon: FileText, label: "Analytics" },
    { icon: Inbox, label: "My Requests" },
  ];

  const salesItems = [
    { icon: Users, label: "Leads" },
    { icon: Users, label: "Contacts" },
    { icon: Building2, label: "Accounts" },
    { icon: Handshake, label: "Deals" },
    { icon: TrendingUp, label: "Forecasts" },
    { icon: FileBox, label: "Documents" },
    { icon: Megaphone, label: "Campaigns" },
  ];

  const activityItems = [
    { icon: CheckSquare, label: "Tasks" },
    { icon: Calendar, label: "Meetings" },
    { icon: Phone, label: "Calls" },
  ];

  const bottomItems = [
    { icon: Package, label: "Inventory" },
    { icon: Headphones, label: "Support" },
    { icon: Puzzle, label: "Integrations" },
    { icon: Briefcase, label: "My Jobs" },
    { icon: Wrench, label: "Services" },
    { icon: FolderOpen, label: "Projects" },
    { icon: MessageSquare, label: "Voice of the Customer" },
  ];

  const renderItem = (item: { icon: React.ElementType; label: string }, idx: number) => {
    const isActive = activeItem === item.label;
    return (
      <div
        key={idx}
        className={`flex items-center gap-2.5 px-3 py-1.5 rounded cursor-pointer text-[13px] ${
          isActive
            ? "bg-crm-sidebar-active text-crm-sidebar-active-text font-medium"
            : "text-foreground hover:bg-crm-table-hover"
        }`}
      >
        <item.icon size={15} />
        <span>{item.label}</span>
      </div>
    );
  };

  return (
    <div className="w-[200px] min-w-[200px] bg-crm-sidebar border-r border-border h-full flex flex-col crm-scrollbar overflow-y-auto">
      {/* Logo */}
      <div className="flex items-center gap-2 px-3 py-3 border-b border-border">
        <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
          <span className="text-primary-foreground text-[10px] font-bold">Z</span>
        </div>
        <span className="font-semibold text-sm text-foreground">Zoho CRM</span>
      </div>

      <div className="flex-1 py-2 space-y-0.5 px-1">
        {topItems.map(renderItem)}

        {/* CRM Teamspace */}
        <div className="flex items-center gap-2 px-3 py-1.5 mt-3">
          <div className="w-5 h-5 rounded bg-crm-success flex items-center justify-center">
            <span className="text-primary-foreground text-[9px] font-bold">CT</span>
          </div>
          <span className="text-[13px] font-medium text-foreground">CRM Teamspace</span>
          <ChevronDown size={12} className="ml-auto text-muted-foreground" />
          <MoreHorizontal size={14} className="text-muted-foreground" />
        </div>

        <div className="px-3 py-1">
          <div className="flex items-center gap-2 px-2 py-1 bg-background rounded border border-border">
            <Search size={12} className="text-muted-foreground" />
            <span className="text-[11px] text-muted-foreground">Search</span>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 cursor-pointer text-[13px] text-foreground hover:bg-crm-table-hover rounded">
          <Sparkles size={15} className="text-crm-warning" />
          <span>Workqueue</span>
          <Sparkles size={10} className="text-crm-warning" />
        </div>

        {/* Sales */}
        <div
          className="flex items-center gap-2 px-3 py-1.5 cursor-pointer text-[13px] font-medium text-foreground"
          onClick={() => setSalesOpen(!salesOpen)}
        >
          <Building2 size={15} className="text-primary" />
          <span>Sales</span>
          {salesOpen ? <ChevronDown size={12} className="ml-auto" /> : <ChevronRight size={12} className="ml-auto" />}
        </div>
        {salesOpen && <div className="pl-3">{salesItems.map(renderItem)}</div>}

        {/* Activities */}
        <div
          className="flex items-center gap-2 px-3 py-1.5 cursor-pointer text-[13px] font-medium text-foreground"
          onClick={() => setActivitiesOpen(!activitiesOpen)}
        >
          <Activity size={15} className="text-primary" />
          <span>Activities</span>
          {activitiesOpen ? <ChevronDown size={12} className="ml-auto" /> : <ChevronRight size={12} className="ml-auto" />}
        </div>
        {activitiesOpen && <div className="pl-3">{activityItems.map(renderItem)}</div>}

        {/* Bottom items */}
        <div className="space-y-0.5 mt-2">
          {bottomItems.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2.5 px-3 py-1.5 cursor-pointer text-[13px] text-foreground hover:bg-crm-table-hover rounded"
            >
              <item.icon size={15} />
              <span>{item.label}</span>
              {["Inventory", "Support", "Integrations"].includes(item.label) && (
                <ChevronDown size={12} className="ml-auto text-muted-foreground" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-border flex items-center justify-around py-2 px-3">
        <MessageSquare size={16} className="text-muted-foreground cursor-pointer" />
        <BarChart3 size={16} className="text-muted-foreground cursor-pointer" />
        <Users size={16} className="text-muted-foreground cursor-pointer" />
      </div>
    </div>
  );
};

export default CrmSidebar;
