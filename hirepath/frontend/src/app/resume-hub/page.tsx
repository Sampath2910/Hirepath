"use client";
import { API_BASE_URL } from "@/config";
import { useState, useEffect, useRef } from "react";
import { FileText, Download, Eye, ExternalLink, TrendingUp, AlertTriangle, X, Upload, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import ResumePreview from "@/components/ResumePreview";

interface ResumeVersion {
  id: number;
  pdfUrl: string;
  atsScore: number;
  tailoredText: string;
  createdAt: string;
  job: {
    title: string;
    company: string;
  };
}

interface SkillGap {
  skill: string;
  occurrence: number;
  jobs: string[];
}

export default function ResumeHubPage() {
  const { user } = useAuth();
  const [versions, setVersions] = useState<ResumeVersion[]>([]);
  const [skillGaps, setSkillGaps] = useState<SkillGap[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [previewVersion, setPreviewVersion] = useState<ResumeVersion | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingMaster, setUploadingMaster] = useState(false);
  const [masterName, setMasterName] = useState("master_resume.pdf");

  const handleUploadMaster = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploadingMaster(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${API_BASE_URL}/api/resumes/upload?userId=${user.id.replace("user_", "")}`, {
        method: "POST",
        body: formData
      });
      if (res.ok) {
        setMasterName(file.name);
        toast.success("Master resume updated successfully!");
        fetchVersions();
      } else {
        toast.error("Failed to upload master resume.");
      }
    } catch (err) {
      toast.error("Error connecting to server.");
    } finally {
      setUploadingMaster(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchVersions();
    }
  }, [user]);

  async function fetchVersions() {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/resumes/versions?userId=${user?.id.replace("user_", "")}`);
      if (res.ok) {
        const data = await res.json();
        setVersions(data);
        calculateSkillGaps(data);
      }
    } catch (err) {
      toast.error("Failed to load resume versions.");
    } finally {
      setIsLoading(false);
    }
  }

  function calculateSkillGaps(data: ResumeVersion[]) {
    // In a real app, the AI would return specific missing skills.
    // For this demo, we'll simulate skill gap analysis based on common tech job keywords
    const mockGaps = [
      { skill: "Docker", occurrence: 8, jobs: ["Backend Engineer", "DevOps"] },
      { skill: "Kubernetes", occurrence: 5, jobs: ["Cloud Engineer"] },
      { skill: "System Design", occurrence: 12, jobs: ["Senior Developer", "Architect"] },
    ];
    setSkillGaps(mockGaps);
  }

  if (isLoading && user) {
    return <div className="p-12 text-center animate-pulse text-slate-400">Analyzing your resume versions...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Resume Hub</h1>
          <p className="text-slate-500 text-sm">Manage tailored versions and analyze skill gaps.</p>
        </div>
        <div className="flex gap-3">
          <div className="bg-blue-50 border border-blue-100 px-4 py-2 rounded-xl flex items-center gap-2">
            <TrendingUp size={18} className="text-blue-600" />
            <span className="text-sm font-bold text-blue-700">Avg. ATS Score: {versions.length > 0 ? Math.round(versions.reduce((acc, v) => acc + v.atsScore, 0) / versions.length) : 0}%</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Versions List */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-2">Recent Versions ({versions.length})</h2>
          {versions.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center">
              <FileText size={40} className="mx-auto text-slate-200 mb-4" />
              <p className="text-slate-500 font-medium">No tailored resumes yet. Start by upgrading a resume on the Search page!</p>
            </div>
          ) : (
            versions.map((v) => (
              <div key={v.id} className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-blue-300 transition-all shadow-sm group">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex gap-4">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <FileText size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">{v.job.title}</h3>
                      <p className="text-sm text-slate-500">{v.job.company} · {new Date(v.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-black text-blue-600">{v.atsScore}%</div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">ATS Score</p>
                  </div>
                </div>
                <div className="flex gap-2 pt-4 border-t border-slate-50">
                  <button 
                    onClick={() => setPreviewVersion(v)}
                    className="flex-1 btn-secondary py-2 text-xs flex items-center justify-center gap-1.5"
                  >
                    <Eye size={14} /> Preview
                  </button>
                  <a 
                    href={`${API_BASE_URL}/api/resumes/download/${v.id}`}
                    className="flex-1 btn-secondary py-2 text-xs flex items-center justify-center gap-1.5"
                    download
                  >
                    <Download size={14} /> PDF
                  </a>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Skill Gap Analysis */}
        <div className="space-y-6">
          <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <TrendingUp size={80} />
            </div>
            <h2 className="text-lg font-bold mb-1 flex items-center gap-2">
              <AlertTriangle size={20} className="text-amber-400" />
              Skill Gap Analysis
            </h2>
            <p className="text-slate-400 text-xs mb-6">Skills appearing in target jobs that you're missing.</p>
            
            <div className="space-y-4">
              {skillGaps.map((gap, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-bold text-slate-200">{gap.skill}</span>
                    <span className="text-amber-400 text-xs">{gap.occurrence} mentions</span>
                  </div>
                  <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-amber-400 rounded-full"
                      style={{ width: `${(gap.occurrence / 15) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <button className="w-full mt-8 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-bold transition flex items-center justify-center gap-2 border border-white/10">
              Get Learning Path <ExternalLink size={14} />
            </button>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-6">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Upload size={18} className="text-blue-600" />
              Master Resume
            </h3>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <FileText size={20} className="text-slate-400" />
                <div className="text-xs">
                  <p className="font-bold text-slate-700">{masterName}</p>
                  <p className="text-slate-400">{uploadingMaster ? "Uploading..." : "Active Master Resume"}</p>
                </div>
              </div>
              {uploadingMaster ? (
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              ) : (
                <CheckCircle size={18} className="text-green-500" />
              )}
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleUploadMaster}
              accept=".pdf,.docx"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingMaster}
              className="w-full py-2.5 text-blue-600 text-xs font-bold border-2 border-blue-600 rounded-xl hover:bg-blue-50 transition disabled:opacity-50"
            >
              {uploadingMaster ? "Uploading..." : "Replace Master Resume"}
            </button>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {previewVersion && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-fade-in">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
              <div>
                <h3 className="font-bold text-slate-900">{previewVersion.job.title}</h3>
                <p className="text-sm text-slate-500">Tailored for {previewVersion.job.company}</p>
              </div>
              <button onClick={() => setPreviewVersion(null)} className="p-2 hover:bg-slate-100 rounded-lg transition">
                <X size={18} />
              </button>
            </div>
            <div className="overflow-y-auto flex-1 px-8 py-6">
              <div className="font-sans text-sm text-slate-800 leading-relaxed bg-slate-50 p-5 rounded-2xl shadow-inner">
                <ResumePreview text={previewVersion.tailoredText} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
