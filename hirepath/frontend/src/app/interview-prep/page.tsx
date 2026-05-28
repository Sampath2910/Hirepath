"use client";
import { API_BASE_URL } from "@/config";
import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Play, Pause, Clock, HelpCircle, Code, Briefcase, ChevronDown, CheckCircle2, RotateCcw, Sparkles } from "lucide-react";
import toast from "react-hot-toast";

interface Question {
  id?: number;
  topic: string;
  difficulty: string;
  question: string;
  answer: string;
  alternatives?: string[];
}

function InterviewPrepContent() {
  const searchParams = useSearchParams();
  const appId = searchParams.get("appId");
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(!!appId);
  const [activeJob, setActiveJob] = useState(searchParams.get("job") || "Select a job to start");

  // Timer & State
  const [currentIdx, setCurrentIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (appId) {
      fetchQuestions();
    }
  }, [appId]);

  async function fetchQuestions() {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/applications/${appId}/prep`);
      if (res.ok) {
        const data = await res.json();
        setQuestions(data);
      } else {
        toast.error("Failed to load AI questions.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error connecting to AI service.");
    } finally {
      setIsLoading(false);
    }
  }

  // Timer Logic
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isTimerRunning && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [isTimerRunning, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
      setShowAnswer(false);
    } else {
      setCompleted(true);
      setIsTimerRunning(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-600 font-medium animate-pulse">AI is generating interview questions...</p>
      </div>
    );
  }

  if (!appId) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center">
        <div className="bg-white p-12 rounded-3xl border-2 border-dashed border-slate-200">
          <HelpCircle size={48} className="mx-auto text-slate-300 mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Ready to Practice?</h2>
          <p className="text-slate-500 mb-6">Go to your Applied Jobs and click "Prepare" to generate AI questions for a specific role.</p>
          <button 
            onClick={() => window.location.href = "/status"}
            className="btn-primary"
          >
            View Applied Jobs
          </button>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center">
        <div className="bg-white p-12 rounded-3xl border-2 border-dashed border-slate-200">
          <HelpCircle size={48} className="mx-auto text-slate-300 mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">No Interview Questions Available</h2>
          <p className="text-slate-500 mb-6">We couldn't generate AI questions for this application right now. Please try again later or apply to a different job.</p>
          <button 
            onClick={() => window.location.href = "/status"}
            className="btn-primary"
          >
            Back to Applied Jobs
          </button>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIdx];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wider">AI Practice Mode</span>
            <span className="text-slate-400">·</span>
            <span className="text-sm text-slate-500 font-medium flex items-center gap-1.5">
              <Briefcase size={14} /> {activeJob}
            </span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Technical Interview Prep</h1>
        </div>

        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl border border-slate-200 shadow-sm">
          <Clock size={18} className={timeLeft < 300 ? "text-red-500 animate-pulse" : "text-slate-400"} />
          <span className={`text-xl font-mono font-bold ${timeLeft < 300 ? "text-red-600" : "text-slate-700"}`}>
            {formatTime(timeLeft)}
          </span>
          <button 
            onClick={() => setIsTimerRunning(!isTimerRunning)}
            className="p-1.5 hover:bg-slate-50 rounded-lg transition"
          >
            {isTimerRunning ? <Pause size={18} /> : <Play size={18} className="text-green-600" />}
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-10">
        <div className="flex justify-between text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">
          <span>Question {currentIdx + 1} of {questions.length}</span>
          <span>{Math.round(((currentIdx + 1) / questions.length) * 100)}% Complete</span>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-600 transition-all duration-500 ease-out"
            style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {completed ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 shadow-xl text-center animate-scale-in">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-3">Session Complete!</h2>
          <p className="text-slate-500 mb-8 max-w-md mx-auto">You've finished the AI practice session for {activeJob}. Great job staying consistent!</p>
          <div className="flex gap-4 justify-center">
            <button 
              onClick={() => {
                setCompleted(false);
                setCurrentIdx(0);
                setTimeLeft(25 * 60);
              }}
              className="btn-secondary flex items-center gap-2"
            >
              <RotateCcw size={18} /> Restart
            </button>
            <button onClick={() => window.location.href = "/"} className="btn-primary">Back to Dashboard</button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Question Card */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-600" />
            
            <div className="flex items-center gap-3 mb-6">
              <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-full uppercase">{currentQ.topic}</span>
              <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase ${
                currentQ.difficulty === "Easy" ? "bg-green-50 text-green-700" : 
                currentQ.difficulty === "Medium" ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-700"
              }`}>
                {currentQ.difficulty}
              </span>
            </div>

            <h2 className="text-2xl font-bold text-slate-900 leading-tight mb-8">
              {currentQ.question}
            </h2>

            <div className="flex flex-col gap-4">
              {!showAnswer ? (
                <button 
                  onClick={() => setShowAnswer(true)}
                  className="w-full py-4 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl text-slate-500 font-bold hover:bg-slate-100 hover:border-slate-300 transition flex items-center justify-center gap-2 group"
                >
                  <Sparkles size={20} className="text-blue-500 group-hover:scale-110 transition" />
                  Show AI Model Answer
                </button>
              ) : (
                <div className="animate-fade-in">
                  <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100 mb-6">
                    <p className="text-xs font-bold text-blue-600 uppercase mb-3 flex items-center gap-2">
                      <Sparkles size={14} /> AI Model Answer
                    </p>
                    <p className="text-slate-800 leading-relaxed font-medium">
                      {currentQ.answer}
                    </p>
                  </div>
                  
                  <button 
                    onClick={handleNext}
                    className="btn-primary w-full py-4 text-lg"
                  >
                    {currentIdx === questions.length - 1 ? "Finish Session" : "Next Question →"}
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 text-slate-400 px-4">
            <Code size={14} />
            <p className="text-xs font-medium italic">Tip: Speak your answer out loud to build confidence.</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function InterviewPrepPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400">Loading AI Coach...</div>}>
      <InterviewPrepContent />
    </Suspense>
  );
}