import { Search, Plus, Bell, Calendar, Settings, Grid3X3, User, Sparkles } from "lucide-react";

interface CrmTopbarProps {
  onZiaClick: () => void;
  isChatbotOpen: boolean;
}

const CrmTopbar = ({ onZiaClick, isChatbotOpen }: CrmTopbarProps) => {
  return (
    <div className="h-[46px] bg-crm-topbar border-b border-border flex items-center px-4 justify-between">
      <div className="flex items-center gap-3">
        {/* Breadcrumb area is handled by page */}
      </div>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 bg-secondary rounded-md px-2.5 py-1.5">
          <Search size={14} className="text-muted-foreground" />
          <span className="text-[12px] text-muted-foreground">Search records</span>
        </div>
        <button className="p-1.5 hover:bg-secondary rounded text-muted-foreground">
          <Plus size={18} />
        </button>
        <button
          onClick={onZiaClick}
          className={`p-1.5 rounded transition-colors ${
            isChatbotOpen ? "bg-primary text-primary-foreground" : "hover:bg-secondary text-muted-foreground"
          }`}
          title="Zia - AI Assistant"
        >
          <Sparkles size={18} />
        </button>
        <button className="p-1.5 hover:bg-secondary rounded text-muted-foreground">
          <Bell size={18} />
        </button>
        <button className="p-1.5 hover:bg-secondary rounded text-muted-foreground">
          <Calendar size={18} />
        </button>
        <button className="p-1.5 hover:bg-secondary rounded text-muted-foreground">
          <Settings size={18} />
        </button>
        <button className="p-1.5 hover:bg-secondary rounded text-muted-foreground">
          <User size={18} />
        </button>
        <button className="p-1.5 hover:bg-secondary rounded text-muted-foreground">
          <Grid3X3 size={18} />
        </button>
      </div>
    </div>
  );
};

export default CrmTopbar;
