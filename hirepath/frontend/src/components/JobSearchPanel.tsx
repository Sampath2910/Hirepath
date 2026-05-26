"use client";
import { useState } from "react";
import { Search, ChevronDown } from "lucide-react";

const JOB_ROLES = [
  "Software Engineer",
  "Backend Developer",
  "Frontend Developer",
  "Full Stack Developer",
  "Data Scientist",
  "Data Analyst",
  "DevOps Engineer",
  "Cloud Engineer",
  "ML Engineer",
  "AI Engineer",
  "Mobile Developer (Android)",
  "Mobile Developer (iOS)",
  "React Developer",
  "Java Developer",
  "Python Developer",
  "Node.js Developer",
  "QA / Test Engineer",
  "Cybersecurity Analyst",
  "Product Manager",
  "UI/UX Designer",
  "Database Administrator",
  "System Administrator",
  "Network Engineer",
  "Embedded Engineer",
  "Blockchain Developer",
  "Game Developer",
  "Technical Writer",
  "Business Analyst",
  "Salesforce Developer",
  "SAP Consultant",
];

const EXPERIENCE_LEVELS = [
  "Fresher (0 yrs)",
  "0-1 yrs",
  "1-2 yrs",
  "2-3 yrs",
  "3-5 yrs",
  "5+ yrs",
];

const DAILY_TARGETS = [
  { label: "10 jobs/day (Free)", value: 10 },
  { label: "20 jobs/day (Pro)", value: 20 },
  { label: "50 jobs/day (Elite)", value: 50 },
];

interface JobSearchPanelProps {
  onSearch?: (params: {
    role: string;
    experience: string;
    dailyTarget: number;
    query: string;
  }) => void;
  initialQuery?: string;
}

export default function JobSearchPanel({ onSearch, initialQuery = "" }: JobSearchPanelProps) {
  const [role, setRole] = useState("Software Engineer");
  const [experience, setExperience] = useState("Fresher (0 yrs)");
  const [dailyTarget, setDailyTarget] = useState(10);
  const [query, setQuery] = useState(initialQuery);

  const handleSearch = () => {
    onSearch?.({ role: query.trim() || role, experience, dailyTarget, query });
  };

  return (
    <div className="bg-gradient-to-br from-blue-600 via-blue-600 to-blue-700 rounded-2xl p-6 md:p-8 text-white shadow-blue">
      <h2 className="text-xl md:text-2xl font-bold mb-1">
        Find your next opportunity
      </h2>
      <p className="text-blue-200 text-sm mb-6">
        AI matches jobs to your actual resume — not just keywords
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Job Role */}
        <div>
          <label className="text-xs font-semibold text-blue-200 uppercase tracking-wider mb-1.5 block">
            Job Role
          </label>
          <div className="relative">
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full appearance-none bg-white text-slate-800 rounded-xl px-4 py-3 pr-10 text-sm font-medium border-0 focus:ring-2 focus:ring-blue-300 cursor-pointer"
            >
              {JOB_ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            <ChevronDown
              size={16}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
          </div>
        </div>

        {/* Experience Level */}
        <div>
          <label className="text-xs font-semibold text-blue-200 uppercase tracking-wider mb-1.5 block">
            Experience Level
          </label>
          <div className="relative">
            <select
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              className="w-full appearance-none bg-white text-slate-800 rounded-xl px-4 py-3 pr-10 text-sm font-medium border-0 focus:ring-2 focus:ring-blue-300 cursor-pointer"
            >
              {EXPERIENCE_LEVELS.map((e) => (
                <option key={e} value={e}>
                  {e}
                </option>
              ))}
            </select>
            <ChevronDown
              size={16}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
          </div>
        </div>

        {/* Daily Target */}
        <div>
          <label className="text-xs font-semibold text-blue-200 uppercase tracking-wider mb-1.5 block">
            Daily Target
          </label>
          <div className="relative">
            <select
              value={dailyTarget}
              onChange={(e) => setDailyTarget(Number(e.target.value))}
              className="w-full appearance-none bg-white text-slate-800 rounded-xl px-4 py-3 pr-10 text-sm font-medium border-0 focus:ring-2 focus:ring-blue-300 cursor-pointer"
            >
              {DAILY_TARGETS.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
            <ChevronDown
              size={16}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
          </div>
        </div>
      </div>

      <div className="mb-6">
        <label className="text-xs font-semibold text-blue-200 uppercase tracking-wider mb-1.5 block">
          Search keywords
        </label>
        <div className="relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Role, company, or skill"
            className="w-full rounded-xl bg-white text-slate-800 px-4 py-3 pl-11 pr-4 text-sm font-medium border-0 focus:ring-2 focus:ring-blue-300"
          />
        </div>
      </div>

      <button
        onClick={handleSearch}
        className="inline-flex items-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-xl font-bold text-sm hover:bg-blue-50 transition-all duration-200 shadow-sm"
      >
        <Search size={16} />
        Search Jobs →
      </button>
    </div>
  );
}
