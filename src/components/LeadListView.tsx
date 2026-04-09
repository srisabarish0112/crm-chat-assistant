import { useState } from "react";
import {
  Filter, ArrowUpDown, List, LayoutGrid, Table2, Eye, Copy, Download,
  Check as CheckIcon, MoreHorizontal, ChevronDown, Phone as PhoneIcon,
  Search, AlertCircle
} from "lucide-react";
import { leads, type Lead } from "@/data/leads";

interface LeadListViewProps {
  onSelectLead: (lead: Lead) => void;
}

const LeadListView = ({ onSelectLead }: LeadListViewProps) => {
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set());

  const columns = ["Lead Name", "Company", "Email", "Phone", "Lead Source", "Lead Owner"];

  const toggleSelect = (id: string) => {
    setSelectedLeads((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Page Header */}
      <div className="px-6 py-3 border-b border-border bg-background">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-[15px] font-semibold text-foreground">All Leads</span>
            <MoreHorizontal size={16} className="text-muted-foreground cursor-pointer" />
          </div>
          <div className="flex items-center gap-2">
            <button className="px-4 py-1.5 bg-primary text-primary-foreground rounded text-[13px] font-medium hover:bg-primary/90 flex items-center gap-1">
              Create Lead
              <ChevronDown size={12} />
            </button>
            <button className="p-1.5 border border-border rounded hover:bg-secondary">
              <MoreHorizontal size={16} className="text-muted-foreground" />
            </button>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="px-6 py-2 border-b border-border bg-background flex items-center gap-3">
        <button className="flex items-center gap-1.5 text-[13px] text-foreground hover:text-primary">
          <Filter size={14} />
          Filter
        </button>
        <button className="flex items-center gap-1.5 text-[13px] text-foreground hover:text-primary">
          <ArrowUpDown size={14} />
          Sort
        </button>
        <div className="flex items-center gap-0.5 ml-2">
          {[List, LayoutGrid, Table2, Eye, Copy, Download, CheckIcon].map((Icon, idx) => (
            <button key={idx} className={`p-1.5 rounded hover:bg-secondary ${idx === 0 ? "bg-secondary" : ""}`}>
              <Icon size={14} className="text-muted-foreground" />
            </button>
          ))}
        </div>
      </div>

      {/* Content area with filter sidebar */}
      <div className="flex flex-1 overflow-hidden">
        {/* Filter Sidebar */}
        <div className="w-[220px] min-w-[220px] border-r border-border bg-background overflow-y-auto crm-scrollbar p-4">
          <h3 className="text-[13px] font-semibold text-foreground mb-2">Filter Leads by</h3>
          <div className="mb-3">
            <div className="flex items-center gap-2 px-2 py-1.5 bg-secondary rounded border border-border">
              <Search size={12} className="text-muted-foreground" />
              <span className="text-[11px] text-muted-foreground">Search</span>
            </div>
          </div>

          <div className="mb-3">
            <h4 className="text-[12px] font-semibold text-foreground mb-1.5 flex items-center gap-1">
              <ChevronDown size={10} /> System Defined Fil...
            </h4>
            {["Activities", "Cadences", "Campaigns", "Latest Email Status", "Locked", "Record Action", "Related Records Action", "Touched Records", "Untouched Records"].map((f) => (
              <label key={f} className="flex items-center gap-2 py-1 px-1 text-[12px] text-foreground cursor-pointer hover:bg-secondary rounded">
                <input type="checkbox" className="rounded border-border w-3 h-3" />
                {f}
              </label>
            ))}
          </div>

          <div>
            <h4 className="text-[12px] font-semibold text-foreground mb-1.5 flex items-center gap-1">
              <ChevronDown size={10} /> Filter By Fields
            </h4>
            {["Address", "Address - City", "Address - Country / Region", "Address - Flat / House No./ Building / Apartment Name", "Address - State / Province", "Address - Street Address", "Address - Zip / Postal Code"].map((f) => (
              <label key={f} className="flex items-center gap-2 py-1 px-1 text-[12px] text-foreground cursor-pointer hover:bg-secondary rounded">
                <input type="checkbox" className="rounded border-border w-3 h-3" />
                {f}
              </label>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto crm-scrollbar">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="bg-crm-table-header border-b border-crm-table-border sticky top-0">
                <th className="w-8 px-2 py-2"><input type="checkbox" className="rounded border-border w-3 h-3" /></th>
                <th className="w-8 px-1 py-2"></th>
                <th className="w-8 px-1 py-2"><input type="checkbox" className="rounded border-border w-3 h-3" /></th>
                {columns.map((col) => (
                  <th key={col} className="px-3 py-2 text-left font-medium text-foreground whitespace-nowrap">
                    {col === "Lead Name" ? (
                      <span className="flex items-center gap-1">{col} <span className="text-muted-foreground text-[11px]">All ▾</span></span>
                    ) : col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr
                  key={lead.id}
                  className="border-b border-crm-table-border hover:bg-crm-table-hover cursor-pointer group"
                  onClick={() => onSelectLead(lead)}
                >
                  <td className="px-2 py-2">
                    <div className="w-4 h-4 rounded bg-muted flex items-center justify-center text-[9px] text-muted-foreground">📋</div>
                  </td>
                  <td className="px-1 py-2" onClick={(e) => { e.stopPropagation(); toggleSelect(lead.id); }}>
                    <input type="checkbox" checked={selectedLeads.has(lead.id)} readOnly className="rounded border-border w-3 h-3" />
                  </td>
                  <td className="px-1 py-2">
                    {lead.dueDate && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded flex items-center gap-0.5 whitespace-nowrap ${
                        lead.dueDate.includes("Apr") ? "text-crm-badge-red" : "text-crm-badge-red"
                      }`}>
                        <AlertCircle size={10} />
                        {lead.dueDate}
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-crm-link font-medium whitespace-nowrap">{lead.name}</td>
                  <td className="px-3 py-2 text-foreground whitespace-nowrap">{lead.company}</td>
                  <td className="px-3 py-2 text-foreground whitespace-nowrap max-w-[200px] truncate">{lead.email || "-"}</td>
                  <td className="px-3 py-2 text-foreground whitespace-nowrap flex items-center gap-1.5">
                    {lead.phone || "-"}
                    {lead.phone && <PhoneIcon size={13} className="text-crm-success opacity-0 group-hover:opacity-100 transition-opacity" />}
                  </td>
                  <td className="px-3 py-2 text-foreground whitespace-nowrap">{lead.leadSource}</td>
                  <td className="px-3 py-2 text-foreground whitespace-nowrap">{lead.leadOwner}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-4 py-2 text-[12px] text-muted-foreground border-t border-crm-table-border flex items-center justify-between bg-background">
            <span>Total Records {leads.length}</span>
            <div className="flex items-center gap-2">
              <span>1 to {leads.length}</span>
              <button className="text-muted-foreground hover:text-foreground"><ChevronDown size={14} className="rotate-90" /></button>
              <button className="text-muted-foreground hover:text-foreground"><ChevronDown size={14} className="-rotate-90" /></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadListView;
