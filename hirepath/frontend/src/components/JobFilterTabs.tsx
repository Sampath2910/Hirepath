"use client";

const TABS = [
  { id: "all", label: "All Jobs" },
  { id: "remote", label: "Remote" },
  { id: "offcampus", label: "Off-Campus" },
  { id: "walkin", label: "Walk-in Drives" },
  { id: "fresher", label: "Freshers" },
  { id: "internship", label: "Internships" },
];

interface JobFilterTabsProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
  counts?: Record<string, number>;
}

export default function JobFilterTabs({ activeTab, onTabChange, counts = {} }: JobFilterTabsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        const count = counts[tab.id];
        return (
          <button
            key={tab.id}
            id={`filter-tab-${tab.id}`}
            onClick={() => onTabChange(tab.id)}
            className={`
              shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200
              ${isActive
                ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                : "bg-white text-slate-600 border border-slate-200 hover:border-blue-300 hover:text-blue-600"
              }
            `}
          >
            {tab.label}
            {count !== undefined && (
              <span
                className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                  isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                }`}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
