"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import ResumeUpload from "@/components/ResumeUpload";
import JobSearchPanel from "@/components/JobSearchPanel";
import JobFilterTabs from "@/components/JobFilterTabs";
import JobCard from "@/components/JobCard";
import type { JobCardProps } from "@/components/JobCard";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";

// ✅ Comprehensive mock job data covering ALL filter tabs
const ALL_MOCK_JOBS: JobCardProps[] = [
  // Remote Jobs
  {
    id: 1,
    title: "Full Stack Developer",
    typeBadge: { label: "Remote", style: "remote" },
    company: "Razorpay",
    location: "Bengaluru (Remote)",
    skills: ["React", "Node.js", "PostgreSQL", "AWS"],
    salary: "₹18-26 LPA",
    experience: "2+ yrs",
    source: "Wellfound",
    postedTime: "Posted 3h ago",
    matchScore: { grade: "A", score: 4.7 },
    resumeUpgraded: true,
  },
  {
    id: 2,
    title: "React Developer",
    typeBadge: { label: "Remote", style: "remote" },
    company: "Meta",
    location: "Remote (India)",
    skills: ["React", "TypeScript", "GraphQL"],
    salary: "₹22-32 LPA",
    experience: "3+ yrs",
    source: "LinkedIn",
    postedTime: "Posted 1d ago",
    matchScore: { grade: "A", score: 4.5 },
    resumeUpgraded: false,
  },
  {
    id: 3,
    title: "DevOps Engineer",
    typeBadge: { label: "Remote", style: "remote" },
    company: "CloudNative",
    location: "Pan India (Remote)",
    skills: ["Docker", "Kubernetes", "AWS", "CI/CD"],
    salary: "₹20-28 LPA",
    experience: "2+ yrs",
    source: "Naukri.com",
    postedTime: "Posted 6h ago",
    matchScore: { grade: "B", score: 3.9 },
    resumeUpgraded: false,
  },
  // Walk-in Jobs
  {
    id: 4,
    title: "Backend Engineer — Walk-in Drive",
    typeBadge: { label: "Walk-in Apr 28", style: "walkin" },
    company: "Infosys",
    location: "Chennai",
    skills: ["Java", "Spring Boot", "MySQL"],
    salary: "₹8-14 LPA",
    experience: "Freshers OK",
    source: "Naukri.com",
    postedTime: "Walk-in 10AM-4PM",
    matchScore: { grade: "B", score: 3.9 },
    resumeUpgraded: false,
  },
  {
    id: 5,
    title: "Java Developer — Walk-in",
    typeBadge: { label: "Walk-in May 2", style: "walkin" },
    company: "TCS",
    location: "Hyderabad",
    skills: ["Java", "SQL", "Hibernate"],
    salary: "₹6-10 LPA",
    experience: "0-2 yrs",
    source: "Naukri.com",
    postedTime: "Walk-in 9AM-3PM",
    matchScore: { grade: "B", score: 3.7 },
    resumeUpgraded: false,
  },
  // Off-Campus Jobs
  {
    id: 6,
    title: "Software Engineer",
    typeBadge: { label: "Off-Campus", style: "offcampus" },
    company: "Google",
    location: "Hyderabad",
    skills: ["Python", "Algorithms", "System Design"],
    salary: "₹35-55 LPA",
    experience: "1+ yr",
    source: "Google Careers",
    postedTime: "Posted 2d ago",
    matchScore: { grade: "A", score: 4.8 },
    resumeUpgraded: true,
  },
  {
    id: 7,
    title: "Product Engineer",
    typeBadge: { label: "Off-Campus", style: "offcampus" },
    company: "Swiggy",
    location: "Bengaluru",
    skills: ["React", "Node.js", "MongoDB"],
    salary: "₹14-20 LPA",
    experience: "1-3 yrs",
    source: "Swiggy Careers",
    postedTime: "Posted 4h ago",
    matchScore: { grade: "A", score: 4.2 },
    resumeUpgraded: true,
  },
  // Freshers
  {
    id: 8,
    title: "Associate Engineer (Fresher)",
    typeBadge: { label: "Fresher", style: "fresher" },
    company: "Wipro",
    location: "Multiple Cities",
    skills: ["Java", "Python", "SQL"],
    salary: "₹3.5-5 LPA",
    experience: "Freshers Only",
    source: "Wipro Careers",
    postedTime: "Posted 1d ago",
    matchScore: { grade: "B", score: 3.6 },
    resumeUpgraded: false,
  },
  {
    id: 9,
    title: "Graduate Trainee Engineer",
    typeBadge: { label: "Fresher", style: "fresher" },
    company: "L&T Technology",
    location: "Pune",
    skills: ["C++", "Embedded C", "MATLAB"],
    salary: "₹4-6 LPA",
    experience: "0 yrs (2024/2025 batch)",
    source: "Campus Drive",
    postedTime: "Posted 3d ago",
    matchScore: { grade: "B", score: 3.4 },
    resumeUpgraded: false,
  },
  // Internships
  {
    id: 10,
    title: "Frontend Intern",
    typeBadge: { label: "Internship", style: "internship" },
    company: "Zomato",
    location: "Gurugram",
    skills: ["React", "HTML/CSS", "JavaScript"],
    salary: "₹25k-40k/mo",
    experience: "Students & Freshers",
    source: "Internshala",
    postedTime: "Posted 12h ago",
    matchScore: { grade: "A", score: 4.3 },
    resumeUpgraded: true,
  },
  {
    id: 11,
    title: "Full Stack Intern",
    typeBadge: { label: "Internship", style: "internship" },
    company: "CloudNative",
    location: "Remote",
    skills: ["React", "Spring Boot", "PostgreSQL"],
    salary: "₹20k-35k/mo",
    experience: "3rd/4th year students",
    source: "LinkedIn",
    postedTime: "Posted 2d ago",
    matchScore: { grade: "A", score: 4.1 },
    resumeUpgraded: false,
  },
  {
    id: 12,
    title: "ML Research Intern",
    typeBadge: { label: "Internship", style: "internship" },
    company: "Microsoft",
    location: "Hyderabad",
    skills: ["Python", "TensorFlow", "PyTorch"],
    salary: "₹50k/mo",
    experience: "MTech/PhD students",
    source: "Microsoft Careers",
    postedTime: "Posted 5h ago",
    matchScore: { grade: "A", score: 4.6 },
    resumeUpgraded: true,
  },
];

function SearchPageContent() {
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("all");
  const [isSearching, setIsSearching] = useState(false);
  const [allJobs, setAllJobs] = useState<JobCardProps[]>(ALL_MOCK_JOBS);
  const [jobs, setJobs] = useState<JobCardProps[]>(ALL_MOCK_JOBS);
  const [searchQuery, setSearchQuery] = useState("");

  const filterJobs = (tab: string, query: string, allJobs: JobCardProps[]) => {
    let filtered = [...allJobs];

    // Filter by tab
    if (tab === "remote") filtered = filtered.filter((j) => j.typeBadge.style === "remote");
    else if (tab === "walkin") filtered = filtered.filter((j) => j.typeBadge.style === "walkin");
    else if (tab === "offcampus") filtered = filtered.filter((j) => j.typeBadge.style === "offcampus");
    else if (tab === "fresher") filtered = filtered.filter((j) => j.typeBadge.style === "fresher");
    else if (tab === "internship") filtered = filtered.filter((j) => j.typeBadge.style === "internship");

    // Filter by search query
    if (query.trim()) {
      const q = query.toLowerCase();
      filtered = filtered.filter(
        (j) =>
          j.title.toLowerCase().includes(q) ||
          j.company.toLowerCase().includes(q) ||
          j.skills.some((s) => s.toLowerCase().includes(q))
      );
    }

    return filtered;
  };

  const normalizeJob = (job: any): JobCardProps => {
    const category = job.category ? String(job.category) : "REMOTE";
    const typeStyle = category === "REMOTE"
      ? "remote"
      : category === "WALK_IN"
      ? "walkin"
      : category === "OFF_CAMPUS"
      ? "offcampus"
      : category === "FRESHERS"
      ? "fresher"
      : category === "INTERNSHIP"
      ? "internship"
      : "default";

    const skills = job.skillsRequired
      ? String(job.skillsRequired)
          .split(",")
          .map((skill) => skill.trim())
          .filter(Boolean)
      : [];

    const score = job.matchScore?.matchOutOf5 ?? 3.5;
    const grade = score >= 4.5 ? "A" : score >= 3.5 ? "B" : score >= 2.5 ? "C" : "D";

    return {
      id: job.id ?? Date.now(),
      title: job.title || "Untitled Role",
      typeBadge: {
        label: category.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
        style: typeStyle as JobCardProps["typeBadge"]["style"],
      },
      company: job.company || "Unknown Company",
      location: job.location || "India",
      skills,
      salary: job.salaryRange && String(job.salaryRange).trim() !== "" ? String(job.salaryRange) : "Not specified",
      experience: job.experienceRequired && String(job.experienceRequired).trim() !== "" ? String(job.experienceRequired) : "Not specified",
      source: job.sourcePlatform || job.postedSource || "AI Source",
      postedTime: job.postedAt
        ? `Posted ${new Date(job.postedAt).toLocaleDateString()}`
        : "Posted recently",
      matchScore: {
        grade: grade as "A" | "B" | "C" | "D",
        score: Number(score),
      },
      resumeUpgraded: false,
      description: job.description || "No description provided.",
    };
  };

  const router = useRouter();

  useEffect(() => {
    const q = searchParams.get("q") || "";
    setSearchQuery(q);

    if (!q) {
      setJobs(filterJobs(activeTab, q, allJobs));
      return;
    }

    performSearch(q);
  }, [activeTab, searchParams]);

  const performSearch = async (query: string) => {
    setSearchQuery(query);
    setIsSearching(true);
    try {
      const res = await fetch(`http://localhost:8080/api/jobs/search?role=${encodeURIComponent(query)}&location=India`);
      if (res.ok) {
        const data = await res.json();
        const mappedJobs = Array.isArray(data) ? data.map(normalizeJob) : [];
        
        // Remove duplicates based on title + company (case-insensitive)
        const seen = new Set<string>();
        const uniqueJobs = mappedJobs.filter((job) => {
          const key = `${job.title.toLowerCase()}|${job.company.toLowerCase()}`;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
        
        if (uniqueJobs.length > 0) {
          setAllJobs(uniqueJobs);
          setJobs(filterJobs(activeTab, query, uniqueJobs));
          toast.success(`Found ${uniqueJobs.length} fresh jobs for ${query}!`);
        } else {
          toast("No new jobs found right now. Try again later.", { icon: "🔍" });
          setJobs(filterJobs(activeTab, query, allJobs));
        }
      } else {
        toast.error("Failed to connect to scraping service.");
        setJobs(filterJobs(activeTab, query, allJobs));
      }
    } catch (err) {
      toast.error("Failed to connect to scraping service.");
      setJobs(filterJobs(activeTab, query, allJobs));
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = async (params: { query: string }) => {
    const query = params.query.trim();
    if (!query) return;
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  const tabCounts: Record<string, number> = {
    all: allJobs.length,
    remote: allJobs.filter((j) => j.typeBadge.style === "remote").length,
    walkin: allJobs.filter((j) => j.typeBadge.style === "walkin").length,
    offcampus: allJobs.filter((j) => j.typeBadge.style === "offcampus").length,
    fresher: allJobs.filter((j) => j.typeBadge.style === "fresher").length,
    internship: allJobs.filter((j) => j.typeBadge.style === "internship").length,
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* 1. Resume Upload */}
      <section className="animate-fade-in" style={{ animationDelay: "0ms" }}>
        <ResumeUpload
          userId={user?.id}
          onUploadComplete={(text) => {
            toast.success("Resume parsed! Refreshing job matches...");
            setIsSearching(true);
            setTimeout(() => {
              setJobs(filterJobs(activeTab, searchQuery, allJobs));
              setIsSearching(false);
            }, 900);
          }}
        />
      </section>

      {/* 2. Search Panel */}
      <section className="animate-fade-in" style={{ animationDelay: "100ms" }}>
        <JobSearchPanel onSearch={handleSearch} initialQuery={searchParams.get("q") || ""} />
      </section>

      {/* 3. Results Section */}
      <section className="animate-fade-in" style={{ animationDelay: "200ms" }}>
        <JobFilterTabs activeTab={activeTab} onTabChange={(tabId) => setActiveTab(tabId)} counts={tabCounts} />

        <div className="space-y-4 relative min-h-[300px] mt-4">
          {isSearching && (
            <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px] z-10 flex items-center justify-center rounded-2xl">
              <div className="flex flex-col items-center gap-3 bg-white p-4 rounded-xl shadow-lg border border-slate-200">
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm font-semibold text-slate-700">AI is scoring matches...</p>
              </div>
            </div>
          )}

          {!isSearching && jobs.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
              <div className="text-4xl mb-4">🔍</div>
              <p className="text-slate-700 font-semibold text-lg mb-2">No matching jobs found</p>
              <p className="text-slate-500 text-sm">Try adjusting your search or switching to a different filter tab.</p>
            </div>
          ) : null}

          {jobs.map((job) => (
            <JobCard key={job.id} {...job} />
          ))}
        </div>
      </section>
    </div>
  );
}

export default function SearchJobsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400">Loading...</div>}>
      <SearchPageContent />
    </Suspense>
  );
}
