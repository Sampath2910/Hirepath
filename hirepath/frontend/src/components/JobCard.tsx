"use client";
import { API_BASE_URL } from "@/config";
import { Check, Eye, Download, MessageSquare, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import ResumePreview from "@/components/ResumePreview";

export interface JobCardProps {
  id: number;
  title: string;
  typeBadge: {
    label: string;
    style: "remote" | "walkin" | "offcampus" | "default" | "fresher" | "internship";
  };
  company: string;
  location: string;
  skills: string[];
  salary: string;
  experience: string;
  source: string;
  postedTime: string;
  matchScore: {
    grade: "A" | "B" | "C" | "D";
    score: number;
  };
  resumeUpgraded: boolean;
  description?: string;
}

export default function JobCard(props: JobCardProps) {
  const {
    id,
    title,
    typeBadge,
    company,
    location,
    skills,
    salary,
    experience,
    source,
    postedTime,
    matchScore,
    resumeUpgraded,
    description
  } = props;

  const { user } = useAuth();
  const [isApplying, setIsApplying] = useState(false);
  const [isApplied, setIsApplied] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [hasUpgraded, setHasUpgraded] = useState(resumeUpgraded);

  // Modals & Action States
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isCoverLetterOpen, setIsCoverLetterOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [previewText, setPreviewText] = useState("");
  const [coverLetterText, setCoverLetterText] = useState("");
  const [isCoverLetterLoading, setIsCoverLetterLoading] = useState(false);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [dbJobId, setDbJobId] = useState<number | null>(null);

  const getOrCreateDbJobId = async (): Promise<number | null> => {
    if (dbJobId) return dbJobId;
    try {
      const jobData = buildJobPayload();
      const jobRes = await fetch(`${API_BASE_URL}/api/jobs/scraped`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(jobData)
      });
      if (!jobRes.ok) throw new Error("Failed to sync job data");
      const savedJob = await jobRes.json();
      setDbJobId(savedJob.id);
      return savedJob.id;
    } catch (err) {
      console.error("Error in getOrCreateDbJobId:", err);
      throw err;
    }
  };

  const handlePreviewResume = async () => {
    if (!user) {
      toast.error("Please login to preview tailored resumes.");
      return;
    }
    if (!hasUpgraded) {
      toast.error("Please upgrade your resume for this job first!");
      return;
    }

    setIsPreviewLoading(true);
    try {
      const jobIdToUse = await getOrCreateDbJobId();
      if (!jobIdToUse) throw new Error("Could not retrieve job ID");

      const numericUserId = user.id.replace("user_", "");
      const res = await fetch(`${API_BASE_URL}/api/resumes/version?userId=${numericUserId}&jobId=${jobIdToUse}`);
      if (!res.ok) {
        throw new Error("Tailored resume version not found. Try upgrading again.");
      }
      const data = await res.json();
      setPreviewText(data.tailoredText);
      setIsPreviewOpen(true);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to fetch tailored resume.");
    } finally {
      setIsPreviewLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!user) {
      toast.error("Please login to download your resume.");
      return;
    }
    if (!hasUpgraded) {
      toast.error("Please upgrade your resume for this job first!");
      return;
    }

    setIsDownloading(true);
    try {
      const jobIdToUse = await getOrCreateDbJobId();
      if (!jobIdToUse) throw new Error("Could not retrieve job ID");

      const numericUserId = user.id.replace("user_", "");
      const res = await fetch(`${API_BASE_URL}/api/resumes/version?userId=${numericUserId}&jobId=${jobIdToUse}`);
      if (!res.ok) {
        throw new Error("Tailored resume version not found. Try upgrading again.");
      }
      const data = await res.json();
      
      const downloadRes = await fetch(`${API_BASE_URL}/api/resumes/download/${data.id}`);
      if (!downloadRes.ok) throw new Error("Failed to generate PDF file.");
      const blob = await downloadRes.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      // Use role-specific filename (e.g., "Full_Stack_Developer_Resume.pdf")
      const roleFilename = title.replace(/[^a-zA-Z0-9]/g, "_") + "_Resume.pdf";
      a.download = roleFilename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success(`${title} Resume downloaded!`);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to download tailored resume PDF.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCoverLetter = async () => {
    if (!user) {
      toast.error("Please login to generate cover letters.");
      return;
    }

    setIsCoverLetterLoading(true);
    try {
      const jobIdToUse = await getOrCreateDbJobId();
      if (!jobIdToUse) throw new Error("Could not retrieve job ID");

      const numericUserId = user.id.replace("user_", "");
      const res = await fetch(`${API_BASE_URL}/api/resumes/cover-letter/${jobIdToUse}?userId=${numericUserId}`, {
        method: "POST"
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Failed to generate cover letter.");
      }
      
      const text = await res.text();
      setCoverLetterText(text);
      setIsCoverLetterOpen(true);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Error generating cover letter.");
    } finally {
      setIsCoverLetterLoading(false);
    }
  };

  const getBackendJobType = (style: string) => {
    switch (style) {
      case "remote":
        return "REMOTE";
      case "walkin":
      case "offcampus":
      case "fresher":
      case "internship":
        return "ONSITE";
      default:
        return "REMOTE";
    }
  };

  const getBackendJobCategory = (style: string) => {
    switch (style) {
      case "remote":
        return "REMOTE";
      case "walkin":
        return "WALK_IN";
      case "offcampus":
        return "OFF_CAMPUS";
      case "fresher":
        return "FRESHERS";
      case "internship":
        return "INTERNSHIP";
      default:
        return "REMOTE";
    }
  };

  const buildJobPayload = () => ({
    title,
    company,
    location,
    url: "#",
    sourcePlatform: source,
    postedSource: source,
    jobType: getBackendJobType(typeBadge.style),
    category: getBackendJobCategory(typeBadge.style),
    salaryRange: salary,
    experienceRequired: experience,
    skillsRequired: skills.join(", "),
    description: description || "No description provided.",
    dedupHash: `hirepath_${id}`,
  });

  const handleUpgrade = async () => {
    if (!user) {
      toast.error("Please login to upgrade your resume.");
      return;
    }

    setIsUpgrading(true);
    try {
      // 1. Ensure job exists
      const jobData = buildJobPayload();

      const jobRes = await fetch(`${API_BASE_URL}/api/jobs/scraped`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(jobData)
      });

      if (!jobRes.ok) throw new Error("Failed to sync job data");
      const savedJob = await jobRes.json();

      // 2. Call tailor API
      const res = await fetch(`${API_BASE_URL}/api/resumes/tailor/${savedJob.id}?userId=${user.id.replace("user_", "")}`, {
        method: "POST"
      });

      if (res.ok) {
        setHasUpgraded(true);
        toast.success("AI has tailored your resume for this role!");
      } else {
        const errorText = await res.text();
        toast.error(errorText || "Failed to upgrade resume.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error connecting to AI service.");
    } finally {
      setIsUpgrading(false);
    }
  };

  const handleApply = async () => {
    if (!user) {
      toast.error("Please login to apply for jobs.");
      return;
    }

    setIsApplying(true);
    try {
      // 1. First ensure the job exists in the backend
      const jobData = buildJobPayload();

      const jobRes = await fetch(`${API_BASE_URL}/api/jobs/scraped`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(jobData)
      });

      if (!jobRes.ok) throw new Error("Failed to sync job data");
      const savedJob = await jobRes.json();

      // 2. Create the application
      const appData = {
        user: { id: user.id.replace("user_", "") }, // Assuming the numeric part is the ID
        job: { id: savedJob.id },
        status: "APPLIED",
        matchScore: Math.round(matchScore.score * 20) // Convert 5.0 to 100
      };

      const appRes = await fetch(`${API_BASE_URL}/api/applications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(appData)
      });

      if (appRes.ok) {
        setIsApplied(true);
        toast.success(`Application sent to ${company}!`);
        // Refresh dashboard stats event could be dispatched here
        window.dispatchEvent(new Event("statsUpdated"));
      } else {
        throw new Error("Failed to create application");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong while applying.");
    } finally {
      setIsApplying(false);
    }
  };
  // Determine badge styling based on type
  const getBadgeClass = (style: string) => {
    switch (style) {
      case "remote":
        return "badge-remote";
      case "walkin":
        return "badge-walkin";
      case "offcampus":
        return "badge-offcampus";
      case "fresher":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "internship":
        return "bg-amber-50 text-amber-700 border-amber-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  // Determine score styling based on grade
  const getGradeClass = (grade: string) => {
    switch (grade) {
      case "A":
        return "grade-a bg-emerald-50";
      case "B":
        return "grade-b bg-amber-50";
      case "C":
        return "grade-c bg-orange-50";
      case "D":
        return "grade-d bg-red-50";
      default:
        return "text-slate-600 bg-slate-50";
    }
  };

  return (
    <div className="hp-card mb-4 relative flex flex-col md:flex-row gap-4">
      {/* Match Score Badge (Top Right) */}
      <div
        className={`absolute top-6 right-6 px-3 py-1.5 rounded-full text-sm flex items-center gap-1 ${getGradeClass(
          matchScore.grade
        )}`}
      >
        <span>{matchScore.grade}</span>
        <span className="font-medium opacity-80 text-xs">
          · {matchScore.score.toFixed(1)}/5 match
        </span>
      </div>

      <div className="flex-1 pr-32">
        {/* Title row */}
        <div className="flex items-center gap-2 mb-2">
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">{title}</h3>
        </div>

        {/* Company & Type */}
        <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mb-3">
          <span className="font-medium text-slate-800 dark:text-slate-200">{company}</span>
          <span>·</span>
          <span>{location}</span>
          <span>·</span>
          <span className={`badge ${getBadgeClass(typeBadge.style)}`}>
            {typeBadge.label}
          </span>
        </div>

        {/* Skills */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {skills.map((skill) => (
            <span key={skill} className="skill-tag">
              {skill}
            </span>
          ))}
        </div>

        {/* Meta info */}
        <div className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          {salary} · {experience} · {source} · {postedTime}
        </div>

        {/* Upgraded Status */}
        {hasUpgraded && (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 text-xs font-semibold mb-4 border border-emerald-100">
            <Check size={14} />
            Resume upgraded for this role
          </div>
        )}

        {/* Actions Row */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button 
            onClick={() => setIsDetailsOpen(true)}
            className="btn-secondary text-sm"
          >
            Details
          </button>
          <button 
            onClick={handleUpgrade}
            disabled={isUpgrading || hasUpgraded}
            className="btn-secondary text-sm font-bold text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUpgrading ? "Upgrading..." : hasUpgraded ? "✓ Upgraded" : "Upgrade Resume"}
          </button>
          <button 
            onClick={handlePreviewResume}
            disabled={isPreviewLoading || !hasUpgraded}
            className="btn-secondary p-2.5 disabled:opacity-50 disabled:cursor-not-allowed" 
            title={hasUpgraded ? "Preview Tailored Resume" : "Upgrade resume first to preview"}
          >
            {isPreviewLoading ? (
              <div className="w-4 h-4 border-2 border-slate-600 dark:border-slate-300 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Eye size={18} />
            )}
          </button>
          <button 
            onClick={handleDownloadPdf}
            disabled={isDownloading || !hasUpgraded}
            className="btn-secondary p-2.5 disabled:opacity-50 disabled:cursor-not-allowed" 
            title={hasUpgraded ? "Download Tailored PDF" : "Upgrade resume first to download"}
          >
            {isDownloading ? (
              <div className="w-4 h-4 border-2 border-slate-600 dark:border-slate-300 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Download size={18} />
            )}
          </button>
          <button 
            onClick={handleCoverLetter}
            disabled={isCoverLetterLoading}
            className="btn-secondary text-sm flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCoverLetterLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-600 dark:border-slate-300 border-t-transparent rounded-full animate-spin" />
                Generating...
              </>
            ) : (
              <>
                Cover Letter
              </>
            )}
          </button>
          <button
            onClick={handleApply}
            disabled={isApplying || isApplied}
            className={`px-5 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed
            ${
              isApplied
                ? "bg-emerald-600 text-white"
                : hasUpgraded
                ? "bg-slate-900 text-white hover:bg-slate-800"
                : "bg-white text-slate-900 border border-slate-300 hover:bg-slate-50"
            }`}
          >
            {isApplying ? (
              <>
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Applying...
              </>
            ) : isApplied ? (
              <>
                <Check size={16} />
                Applied
              </>
            ) : (
              <>
                {hasUpgraded ? "Apply" : "Prepare + Apply"}
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Details Modal */}
      {isDetailsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity duration-300">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl animate-slide-up">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">{company} · {location}</p>
              </div>
              <button
                onClick={() => setIsDetailsOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <span className="text-xl font-bold">&times;</span>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50 dark:bg-slate-950/40">
              <div className="bg-white dark:bg-slate-950 p-6 rounded-xl border border-slate-200 dark:border-slate-800/80 shadow-inner flex flex-col gap-4 text-slate-800 dark:text-slate-200">
                <div>
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Salary Range</h4>
                  <p className="text-sm font-medium">{salary}</p>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Experience Required</h4>
                  <p className="text-sm font-medium">{experience}</p>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Skills Required</h4>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {skills.map((skill) => (
                      <span key={skill} className="skill-tag">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="border-t border-slate-200 dark:border-slate-800 pt-4 mt-2">
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Job Description</h4>
                  <div className="text-sm leading-relaxed whitespace-pre-wrap font-sans">
                    {description || "No description provided."}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setIsDetailsOpen(false)}
                className="btn-secondary text-sm py-2 px-4"
              >
                Close
              </button>
              {!hasUpgraded && (
                <button
                  onClick={() => {
                    setIsDetailsOpen(false);
                    handleUpgrade();
                  }}
                  disabled={isUpgrading}
                  className="btn-secondary text-sm py-2 px-4 font-bold text-slate-900"
                >
                  {isUpgrading ? "Upgrading..." : "Upgrade Resume"}
                </button>
              )}
              <button
                onClick={() => {
                  setIsDetailsOpen(false);
                  handleApply();
                }}
                disabled={isApplying || isApplied}
                className="btn-primary text-sm py-2 px-4 font-bold"
              >
                {isApplying ? "Applying..." : isApplied ? "Applied" : "Apply Now"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Resume Preview Modal */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity duration-300">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl animate-slide-up">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{title} Resume</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Tailored specifically for {company}</p>
              </div>
              <button
                onClick={() => setIsPreviewOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <span className="text-xl font-bold">&times;</span>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50 dark:bg-slate-950/40">
              <div className="font-sans text-sm text-slate-800 dark:text-slate-200 leading-relaxed bg-white dark:bg-slate-950 p-6 rounded-xl border border-slate-200 dark:border-slate-800/80 shadow-inner max-w-3xl mx-auto">
                <ResumePreview text={previewText} />
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setIsPreviewOpen(false)}
                className="btn-secondary text-sm py-2 px-4"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setIsPreviewOpen(false);
                  handleDownloadPdf();
                }}
                className="btn-primary text-sm py-2 px-4 flex items-center gap-1.5"
              >
                <Download size={16} />
                Download PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cover Letter Modal */}
      {isCoverLetterOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity duration-300">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl animate-slide-up">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Cover Letter - {title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Written for {company}</p>
              </div>
              <button
                onClick={() => setIsCoverLetterOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <span className="text-xl font-bold">&times;</span>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50 dark:bg-slate-950/40">
              <div className="whitespace-pre-wrap font-serif text-slate-800 dark:text-slate-200 leading-relaxed bg-white dark:bg-slate-955 p-6 rounded-xl border border-slate-200 dark:border-slate-800/80 shadow-inner">
                {coverLetterText}
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setIsCoverLetterOpen(false)}
                className="btn-secondary text-sm py-2 px-4"
              >
                Close
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(coverLetterText);
                  toast.success("Cover letter copied to clipboard!");
                }}
                className="btn-primary text-sm py-2 px-4 flex items-center gap-1.5"
              >
                <Check size={16} />
                Copy to Clipboard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}