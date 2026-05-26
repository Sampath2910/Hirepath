"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Mail, Lock, User, Sparkles, ArrowRight, CheckCircle, Shield, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: "8+ characters", ok: password.length >= 8 },
    { label: "Uppercase letter", ok: /[A-Z]/.test(password) },
    { label: "Number", ok: /[0-9]/.test(password) },
    { label: "Special character", ok: /[^A-Za-z0-9]/.test(password) },
  ];
  const score = checks.filter((c) => c.ok).length;
  const colors = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-green-500"];
  const labels = ["Weak", "Fair", "Good", "Strong"];

  if (!password) return null;

  return (
    <div className="mt-2 space-y-2">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${i < score ? colors[score - 1] : "bg-white/10"}`}
          />
        ))}
      </div>
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          {checks.map((c) => (
            <span key={c.label} className={`text-xs flex items-center gap-1 ${c.ok ? "text-green-300" : "text-blue-300/50"}`}>
              <span>{c.ok ? "✓" : "·"}</span> {c.label}
            </span>
          ))}
        </div>
        {score > 0 && (
          <span className={`text-xs font-bold ${score < 2 ? "text-red-400" : score < 3 ? "text-yellow-400" : "text-green-400"}`}>
            {labels[score - 1]}
          </span>
        )}
      </div>
    </div>
  );
}

// BUG 20 FIX: Terms of Service Modal
function TermsModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto p-8 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 transition">
          <X size={20} />
        </button>
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Terms of Service</h2>
        <div className="text-slate-600 text-sm space-y-4 leading-relaxed">
          <p>By using HirePath, you agree to these terms.</p>
          <h3 className="font-bold text-slate-900">1. Service Description</h3>
          <p>HirePath is an AI-powered job search and career coaching platform. We provide job matching, resume tailoring, and interview preparation tools.</p>
          <h3 className="font-bold text-slate-900">2. User Accounts</h3>
          <p>You are responsible for maintaining the security of your account. You must not share your credentials with others.</p>
          <h3 className="font-bold text-slate-900">3. Acceptable Use</h3>
          <p>You agree not to misuse the platform, attempt to scrape data, or use the service for any illegal purposes.</p>
          <h3 className="font-bold text-slate-900">4. AI Disclaimer</h3>
          <p>AI-generated content (resumes, cover letters, interview questions) is provided as a starting point. Always review and verify before submission.</p>
          <h3 className="font-bold text-slate-900">5. Limitation of Liability</h3>
          <p>HirePath is not responsible for job placement outcomes. We are a tool to assist — final decisions rest with employers.</p>
        </div>
        <button onClick={onClose} className="mt-6 w-full bg-blue-600 text-white font-bold py-2.5 rounded-xl hover:bg-blue-700 transition">
          I Understand
        </button>
      </div>
    </div>
  );
}

// BUG 20 FIX: Privacy Policy Modal
function PrivacyModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto p-8 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 transition">
          <X size={20} />
        </button>
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Privacy Policy</h2>
        <div className="text-slate-600 text-sm space-y-4 leading-relaxed">
          <p>Your privacy is important to us. This policy explains how we handle your data.</p>
          <h3 className="font-bold text-slate-900">1. Data We Collect</h3>
          <p>We collect your name, email, and resume data. Job search activity and application history are stored to provide personalized recommendations.</p>
          <h3 className="font-bold text-slate-900">2. How We Use Data</h3>
          <p>Your data is used exclusively to provide HirePath services — job matching, resume tailoring, and interview preparation. We do not sell your data.</p>
          <h3 className="font-bold text-slate-900">3. Local Storage</h3>
          <p>Authentication data is stored in your browser&apos;s localStorage for session management. You can clear this at any time via browser settings.</p>
          <h3 className="font-bold text-slate-900">4. Third-Party APIs</h3>
          <p>Resume content may be sent to AI providers (Google Gemini, Anthropic Claude) for processing. These providers have their own privacy policies.</p>
          <h3 className="font-bold text-slate-900">5. Your Rights</h3>
          <p>You can request deletion of your data at any time by contacting us or clearing your browser&apos;s local storage.</p>
        </div>
        <button onClick={onClose} className="mt-6 w-full bg-blue-600 text-white font-bold py-2.5 rounded-xl hover:bg-blue-700 transition">
          Got It
        </button>
      </div>
    </div>
  );
}

export default function SignupPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showTerms, setShowTerms] = useState(false);   // BUG 20 FIX
  const [showPrivacy, setShowPrivacy] = useState(false); // BUG 20 FIX

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("Please fill in all fields.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!agreedToTerms) {
      setError("Please accept the terms and conditions.");
      return;
    }

    setIsLoading(true);
    const result = await register(name, email, password);
    setIsLoading(false);

    if (result.success) {
      setSuccess(true);
      setTimeout(() => router.push("/"), 1000);
    } else {
      setError(result.error || "Registration failed.");
    }
  };

  return (
    <>
      {/* BUG 20 FIX: Render modals outside the main div */}
      {showTerms && <TermsModal onClose={() => setShowTerms(false)} />}
      {showPrivacy && <PrivacyModal onClose={() => setShowPrivacy(false)} />}

      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background blobs */}
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-blue-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1.5s" }} />

        <div className="w-full max-w-md relative z-10">
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl overflow-hidden">
            {/* Top gradient bar */}
            <div className="h-1 bg-gradient-to-r from-indigo-400 via-blue-400 to-green-400" />

            <div className="p-8">
              {/* Logo */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mb-4 shadow-lg shadow-blue-500/30">
                  <Sparkles size={28} className="text-white" />
                </div>
                <h1 className="text-3xl font-black text-white mb-1">Create Account</h1>
                <p className="text-blue-200 text-sm">Start your AI-powered job hunt today</p>
              </div>

              {success ? (
                <div className="flex flex-col items-center gap-3 py-8">
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
                    <CheckCircle size={32} className="text-green-400" />
                  </div>
                  <p className="text-white font-bold text-lg">Account Created!</p>
                  <p className="text-blue-200 text-sm">Welcome to HirePath! Redirecting...</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div className="bg-red-500/20 border border-red-400/40 text-red-200 text-sm px-4 py-3 rounded-xl">
                      {error}
                    </div>
                  )}

                  {/* Name */}
                  <div className="space-y-1.5">
                    <label className="text-blue-200 text-xs font-bold uppercase tracking-wider">Full Name</label>
                    <div className="relative">
                      <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-300" />
                      <input
                        id="signup-name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your full name"
                        className="w-full bg-white/10 border border-white/20 text-white placeholder-blue-300/50 rounded-xl px-4 py-3 pl-11 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition text-sm"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5">
                    <label className="text-blue-200 text-xs font-bold uppercase tracking-wider">Email</label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-300" />
                      <input
                        id="signup-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full bg-white/10 border border-white/20 text-white placeholder-blue-300/50 rounded-xl px-4 py-3 pl-11 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition text-sm"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="space-y-1.5">
                    <label className="text-blue-200 text-xs font-bold uppercase tracking-wider">Password</label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-300" />
                      <input
                        id="signup-password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Create a strong password"
                        className="w-full bg-white/10 border border-white/20 text-white placeholder-blue-300/50 rounded-xl px-4 py-3 pl-11 pr-11 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-300 hover:text-white transition"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    <PasswordStrength password={password} />
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-1.5">
                    <label className="text-blue-200 text-xs font-bold uppercase tracking-wider">Confirm Password</label>
                    <div className="relative">
                      <Shield size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-300" />
                      <input
                        id="signup-confirm"
                        type={showConfirm ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Repeat your password"
                        className={`w-full bg-white/10 border text-white placeholder-blue-300/50 rounded-xl px-4 py-3 pl-11 pr-11 focus:outline-none focus:ring-2 focus:border-transparent transition text-sm ${
                          confirmPassword && confirmPassword !== password
                            ? "border-red-400/60 focus:ring-red-400"
                            : confirmPassword && confirmPassword === password
                            ? "border-green-400/60 focus:ring-green-400"
                            : "border-white/20 focus:ring-blue-400"
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-300 hover:text-white transition"
                      >
                        {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {confirmPassword && confirmPassword !== password && (
                      <p className="text-red-400 text-xs mt-1">Passwords do not match</p>
                    )}
                  </div>

                  {/* Terms — BUG 20 FIX: proper clickable buttons */}
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded border-white/20 bg-white/10 text-blue-500 focus:ring-blue-400 shrink-0"
                    />
                    <span className="text-blue-200 text-sm leading-relaxed group-hover:text-white transition">
                      I agree to the{" "}
                      <button
                        type="button"
                        onClick={() => setShowTerms(true)}
                        className="text-blue-300 underline underline-offset-2 hover:text-white transition"
                      >
                        Terms of Service
                      </button>{" "}
                      and{" "}
                      <button
                        type="button"
                        onClick={() => setShowPrivacy(true)}
                        className="text-blue-300 underline underline-offset-2 hover:text-white transition"
                      >
                        Privacy Policy
                      </button>
                    </span>
                  </label>

                  {/* Submit */}
                  <button
                    id="signup-submit"
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30 hover:-translate-y-0.5 active:translate-y-0 mt-2"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      <>
                        Create Account
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>

                  {/* Login Link */}
                  <div className="text-center pt-1">
                    <span className="text-blue-300/60 text-sm">Already have an account? </span>
                    <Link href="/login" className="text-blue-300 font-semibold hover:text-white transition text-sm">
                      Sign In
                    </Link>
                  </div>
                </form>
              )}
            </div>
          </div>

          <p className="text-center text-blue-300/40 text-xs mt-6">
            HirePath AI Job Copilot · © 2026 · All rights reserved
          </p>
        </div>
      </div>
    </>
  );
}
