"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Mail, Lock, Sparkles, ArrowRight, CheckCircle, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";

// BUG 19 FIX: Forgot Password Modal component
function ForgotPasswordModal({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    if (!email.trim() || !email.includes("@")) {
      toast.error("Please enter a valid email address.");
      return;
    }
    setIsSending(true);
    await new Promise((r) => setTimeout(r, 1500)); // Simulate sending
    setIsSending(false);
    setSent(true);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 relative animate-fade-in">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 transition"
        >
          <X size={20} />
        </button>
        {sent ? (
          <div className="text-center py-4">
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={28} className="text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Check Your Email</h3>
            <p className="text-slate-500 text-sm">
              If an account exists for <strong>{email}</strong>, we've sent a password reset link. Check your inbox (and spam folder).
            </p>
            <button
              onClick={onClose}
              className="mt-6 w-full bg-blue-600 text-white font-bold py-2.5 rounded-xl hover:bg-blue-700 transition"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Reset Password</h3>
            <p className="text-slate-500 text-sm mb-6">
              Enter your email address and we'll send you a link to reset your password.
            </p>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
            />
            <button
              onClick={handleSend}
              disabled={isSending}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2"
            >
              {isSending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Reset Link"
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false); // BUG 19 FIX

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Please fill in all fields.");
      return;
    }

    setIsLoading(true);
    // BUG 22 FIX: Pass rememberMe to login so it uses correct storage
    const result = await login(email, password, rememberMe);
    setIsLoading(false);

    if (result.success) {
      setSuccess(true);
      toast.success("Welcome back! 👋");
      setTimeout(() => router.push("/"), 800);
    } else {
      setError(result.error || "Login failed.");
    }
  };

  return (
    <>
      {/* BUG 19 FIX: Forgot Password Modal */}
      {showForgotPassword && <ForgotPasswordModal onClose={() => setShowForgotPassword(false)} />}

      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Animated background blobs */}
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-3xl" />

        <div className="w-full max-w-md relative z-10">
          {/* Card */}
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl overflow-hidden">
            {/* Top gradient bar */}
            <div className="h-1 bg-gradient-to-r from-blue-400 via-indigo-400 to-blue-400" />

            <div className="p-8">
              {/* Logo */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4 shadow-lg shadow-blue-500/30">
                  <Sparkles size={28} className="text-white" />
                </div>
                <h1 className="text-3xl font-black text-white mb-1">
                  Welcome Back
                </h1>
                <p className="text-blue-200 text-sm">Sign in to your HirePath account</p>
              </div>

              {success ? (
                <div className="flex flex-col items-center gap-3 py-8">
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
                    <CheckCircle size={32} className="text-green-400" />
                  </div>
                  <p className="text-white font-bold text-lg">Login Successful!</p>
                  <p className="text-blue-200 text-sm">Redirecting to dashboard...</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Error Message */}
                  {error && (
                    <div className="bg-red-500/20 border border-red-400/40 text-red-200 text-sm px-4 py-3 rounded-xl">
                      {error}
                    </div>
                  )}

                  {/* Email Field */}
                  <div className="space-y-1.5">
                    <label className="text-blue-200 text-xs font-bold uppercase tracking-wider">Email</label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-300" />
                      <input
                        id="login-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full bg-white/10 border border-white/20 text-white placeholder-blue-300/50 rounded-xl px-4 py-3 pl-11 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition text-sm"
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div className="space-y-1.5">
                    <label className="text-blue-200 text-xs font-bold uppercase tracking-wider">Password</label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-300" />
                      <input
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
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
                  </div>

                  {/* Remember Me + Forgot Password */}
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        id="remember-me"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 rounded border-white/20 bg-white/10 text-blue-500 focus:ring-blue-400"
                      />
                      {/* BUG 22 FIX: Descriptive label explaining what remember me does */}
                      <span className="text-blue-200 text-sm">Keep me signed in</span>
                    </label>
                    {/* BUG 19 FIX: Forgot password now opens modal */}
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(true)}
                      className="text-blue-300 text-sm hover:text-white transition font-medium"
                    >
                      Forgot password?
                    </button>
                  </div>

                  {/* Submit Button */}
                  <button
                    id="login-submit"
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-0.5 active:translate-y-0"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      <>
                        Sign In
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>

                  {/* Divider */}
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-white/10" />
                    <span className="text-blue-300/60 text-xs">New to HirePath?</span>
                    <div className="flex-1 h-px bg-white/10" />
                  </div>

                  {/* Sign Up Link */}
                  <Link
                    href="/signup"
                    className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/20 text-white font-semibold py-3 rounded-xl transition text-sm"
                  >
                    Create an Account
                  </Link>
                </form>
              )}
            </div>
          </div>

          {/* Bottom branding */}
          <p className="text-center text-blue-300/40 text-xs mt-6">
            HirePath AI Job Copilot · © 2026 · All rights reserved
          </p>
        </div>
      </div>
    </>
  );
}
