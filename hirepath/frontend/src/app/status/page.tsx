"use client";
import { CheckCircle2, Clock, MessageSquare, Award, XCircle, Search, Filter, X, ChevronDown, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const ALL_STATUSES = ["APPLIED", "SCREENING", "INTERVIEW", "OFFER", "REJECTED"] as const;
type AppStatus = typeof ALL_STATUSES[number];

interface Application {
  id: number;
  company: string;
  role: string;
  date: string;
  status: string;
  type: string;
  matchScore: number;
}

export default function TrackerPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [apps, setApps] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [filterOpen, setFilterOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchApplications();
    }
  }, [user]);

  async function fetchApplications() {
    setIsLoading(true);
    try {
      const res = await fetch(`http://localhost:8080/api/applications?userId=${user?.id.replace("user_", "")}`);
      if (res.ok) {
        const data = await res.json();
        // Map backend data to frontend interface
        const mapped = data.map((app: any) => ({
          id: app.id,
          company: app.job.company,
          role: app.job.title,
          date: new Date(app.appliedAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
          status: app.status,
          type: app.job.jobType.toLowerCase(),
          matchScore: app.matchScore
        }));
        setApps(mapped);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load applications.");
    } finally {
      setIsLoading(false);
    }
  }

  // Update Status Modal
  const [modalApp, setModalApp] = useState<Application | null>(null);
  const [selectedNewStatus, setSelectedNewStatus] = useState<string>("");

  const stages = [
    { label: "APPLIED", icon: <Clock className="text-blue-500" />, count: apps.filter(a => a.status === "APPLIED").length, color: "bg-blue-50 border-blue-200" },
    { label: "SCREENING", icon: <MessageSquare className="text-purple-500" />, count: apps.filter(a => a.status === "SCREENING").length, color: "bg-purple-50 border-purple-200" },
    { label: "INTERVIEW", icon: <Award className="text-amber-500" />, count: apps.filter(a => a.status === "INTERVIEW").length, color: "bg-amber-50 border-amber-200" },
    { label: "OFFER", icon: <CheckCircle2 className="text-emerald-500" />, count: apps.filter(a => a.status === "OFFER").length, color: "bg-emerald-50 border-emerald-200" },
    { label: "REJECTED", icon: <XCircle className="text-red-500" />, count: apps.filter(a => a.status === "REJECTED").length, color: "bg-red-50 border-red-200" },
  ];

  const openUpdateModal = (app: Application) => {
    setModalApp(app);
    setSelectedNewStatus(app.status);
  };

  const confirmStatusUpdate = async () => {
    if (!modalApp || !selectedNewStatus) return;
    try {
      const res = await fetch(`http://localhost:8080/api/applications/${modalApp.id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: selectedNewStatus })
      });
      if (res.ok) {
        setApps(prev => prev.map(a => a.id === modalApp.id ? { ...a, status: selectedNewStatus } : a));
        toast.success(`${modalApp.company} status updated to "${selectedNewStatus}"`);
        setModalApp(null);
        // Refresh dashboard stats
        window.dispatchEvent(new Event("statsUpdated"));
      }
    } catch (err) {
      toast.error("Failed to update status.");
    }
  };

  const filteredApps = apps.filter(app => {
    const matchesSearch =
      app.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.role.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "All" || app.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  if (isLoading && user) {
    return <div className="p-12 text-center animate-pulse text-slate-400">Loading your pipeline...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-fade-in">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold text-slate-900">Application Pipeline</h1>
        </div>
        <p className="text-slate-500">Track your progress, prepare for interviews, and manage offers.</p>
      </div>

      {/* Pipeline Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
        {stages.map((stage, i) => (
          <div
            key={i}
            onClick={() => setFilterStatus(stage.label === filterStatus ? "All" : stage.label)}
            className={`p-6 rounded-2xl border transition-all duration-200 hover:shadow-md cursor-pointer ${stage.color} ${filterStatus === stage.label ? "ring-2 ring-blue-500 ring-offset-1" : ""}`}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-2.5 bg-white rounded-xl shadow-sm">{stage.icon}</div>
              <span className="text-2xl font-black text-slate-900">{stage.count}</span>
            </div>
            <p className="text-xs font-bold text-slate-700 uppercase">{stage.label}</p>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search company or role..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="relative w-full sm:w-auto">
          <button
            id="filter-status-btn"
            onClick={() => setFilterOpen(!filterOpen)}
            className="btn-secondary flex items-center gap-2 w-full sm:w-auto justify-center"
          >
            <Filter size={16} />
            {filterStatus === "All" ? "Filter Status" : `Status: ${filterStatus}`}
            <ChevronDown size={14} className={`transition-transform ${filterOpen ? "rotate-180" : ""}`} />
          </button>
          {filterOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl z-20 overflow-hidden">
              {["All", ...ALL_STATUSES].map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setFilterStatus(s);
                    setFilterOpen(false);
                    toast.success(s === "All" ? "Showing all applications" : `Filtered by: ${s}`);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors ${filterStatus === s ? "bg-blue-50 text-blue-700 font-bold" : "text-slate-700 hover:bg-slate-50"}`}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Detailed List */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Company & Role</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Applied Date</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredApps.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400 font-medium">
                    No applications match your filter.
                  </td>
                </tr>
              ) : (
                filteredApps.map((app) => (
                  <TableRow key={app.id} {...app} onUpdate={() => openUpdateModal(app)} />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Update Status Modal */}
      {modalApp && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-fade-in">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-lg">Update Application Status</h3>
              <button onClick={() => setModalApp(null)} className="p-1.5 hover:bg-slate-100 rounded-lg transition">
                <X size={18} />
              </button>
            </div>
            <div className="px-6 py-5">
              <div className="mb-4">
                <p className="font-bold text-slate-900">{modalApp.company}</p>
                <p className="text-sm text-slate-500">{modalApp.role}</p>
              </div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Select New Status</p>
              <div className="space-y-2">
                {ALL_STATUSES.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSelectedNewStatus(s)}
                    className={`w-full text-left px-4 py-3 rounded-xl border-2 font-semibold text-sm transition-all ${
                      selectedNewStatus === s
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-slate-200 text-slate-700 hover:border-slate-300"
                    }`}
                  >
                    {selectedNewStatus === s && <span className="mr-2">✓</span>}
                    {s}
                    {s === modalApp.status && <span className="ml-2 text-xs text-slate-400 font-normal">(current)</span>}
                  </button>
                ))}
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex gap-3 justify-end">
              <button onClick={() => setModalApp(null)} className="btn-secondary text-sm">
                Cancel
              </button>
              <button
                onClick={confirmStatusUpdate}
                disabled={selectedNewStatus === modalApp.status}
                className="btn-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save Status
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TableRow({ id, company, role, date, status, type, matchScore, onUpdate }: any) {
  const router = useRouter();
  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPLIED": return "bg-blue-50 text-blue-700 border-blue-200";
      case "SCREENING": return "bg-purple-50 text-purple-700 border-purple-200";
      case "INTERVIEW": return "bg-amber-50 text-amber-700 border-amber-200";
      case "OFFER": return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "REJECTED": return "bg-red-50 text-red-700 border-red-200";
      default: return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "remote": return <span className="badge badge-remote ml-2">Remote</span>;
      case "walk-in":
      case "walkin": return <span className="badge badge-walkin ml-2">Walk-in</span>;
      case "off-campus":
      case "offcampus": return <span className="badge badge-offcampus ml-2">Off-Campus</span>;
      case "onsite": return <span className="badge badge-default ml-2">Onsite</span>;
      case "hybrid": return <span className="badge badge-default ml-2">Hybrid</span>;
      default: return null;
    }
  };

  return (
    <tr className="hover:bg-slate-50 transition-colors group">
      <td className="px-6 py-4">
        <div className="font-bold text-slate-900">{company}</div>
        <div className="text-sm text-slate-500 flex items-center">
          {role} {getTypeBadge(type)}
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="text-sm text-slate-600 mb-1">{date}</div>
        <div className="flex items-center gap-1.5">
          <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500" style={{ width: `${matchScore}%` }} />
          </div>
          <span className="text-[10px] font-bold text-slate-400">{matchScore}% Match</span>
        </div>
      </td>
      <td className="px-6 py-4">
        <span className={`px-3 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${getStatusColor(status)}`}>
          {status}
        </span>
      </td>
      <td className="px-6 py-4 text-right space-x-2">
        <button
          onClick={() => router.push(`/interview-prep?appId=${id}&job=${role} - ${company}`)}
          className="inline-flex items-center gap-1.5 text-blue-600 font-bold text-xs bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition shadow-sm"
        >
          <Sparkles size={12} />
          Prepare
        </button>
        <button
          onClick={onUpdate}
          className="text-slate-500 font-bold text-xs hover:text-slate-700 transition-colors border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-white"
        >
          Status
        </button>
      </td>
    </tr>
  );
}
