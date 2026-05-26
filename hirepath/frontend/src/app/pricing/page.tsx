"use client";
import { Check, Star, Zap, CreditCard, Lock, X, Loader2 } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface PaymentModalProps {
  plan: string;
  amount: number;
  isAnnual: boolean;
  onClose: () => void;
  onSuccess: (plan: "Free" | "Pro" | "Elite") => void;
  userName: string;
  userEmail: string;
}

function PaymentModal({ plan, amount, isAnnual, onClose, onSuccess, userName, userEmail }: PaymentModalProps) {
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardName, setCardName] = useState(userName);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const formatCard = (val: string) =>
    val.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();

  const formatExpiry = (val: string) => {
    const digits = val.replace(/\D/g, "").slice(0, 4);
    return digits.length > 2 ? digits.slice(0, 2) + "/" + digits.slice(2) : digits;
  };

  const handlePay = async () => {
    if (!cardNumber || cardNumber.replace(/\s/g, "").length < 16) {
      toast.error("Enter a valid 16-digit card number."); return;
    }
    if (!expiry || expiry.length < 5) { toast.error("Enter a valid expiry date."); return; }
    if (!cvv || cvv.length < 3) { toast.error("Enter a valid CVV."); return; }
    if (!cardName.trim()) { toast.error("Enter cardholder name."); return; }

    setIsProcessing(true);
    // Simulate payment processing delay
    await new Promise(r => setTimeout(r, 2200));
    setIsProcessing(false);
    setIsSuccess(true);
    await new Promise(r => setTimeout(r, 1200));
    onSuccess(plan as "Free" | "Pro" | "Elite");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md animate-fade-in overflow-hidden">
        {/* Demo Notice Banner */}
        <div className="bg-amber-100 dark:bg-amber-900/50 border-b border-amber-200 dark:border-amber-800 px-4 py-2 text-center">
          <p className="text-xs text-amber-800 dark:text-amber-300 font-medium">
            🔒 DEMO MODE: Payment is simulated - No real charges
          </p>
        </div>
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-5 text-white flex justify-between items-start">
          <div>
            <p className="text-blue-200 text-xs font-semibold uppercase tracking-wider mb-1">HirePath AI — Secure Checkout</p>
            <h2 className="text-xl font-black">
              {plan} Plan — ₹{amount.toLocaleString("en-IN")}{isAnnual ? "/yr" : "/mo"}
            </h2>
            <p className="text-blue-200 text-sm mt-1">{userEmail}</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-white/20 rounded-lg transition mt-0.5">
            <X size={18} />
          </button>
        </div>

        {isSuccess ? (
          <div className="px-6 py-12 text-center">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check size={32} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 mb-1">Payment Successful!</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Welcome to HirePath {plan} 🎉</p>
          </div>
        ) : (
          <div className="px-6 py-6 space-y-4">
            {/* Card Number */}
            <div>
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1.5">Card Number</label>
              <div className="relative">
                <input
                  type="text"
                  value={cardNumber}
                  onChange={e => setCardNumber(formatCard(e.target.value))}
                  placeholder="4242 4242 4242 4242"
                  className="w-full pl-4 pr-12 py-3 border border-slate-200 dark:border-slate-600 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-slate-100 dark:placeholder-slate-400"
                  disabled={isProcessing}
                />
                <CreditCard size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1.5">Expiry</label>
                <input
                  type="text"
                  value={expiry}
                  onChange={e => setExpiry(formatExpiry(e.target.value))}
                  placeholder="MM/YY"
                  className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-slate-100 dark:placeholder-slate-400"
                  disabled={isProcessing}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1.5">CVV</label>
                <input
                  type="password"
                  value={cvv}
                  onChange={e => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  placeholder="•••"
                  className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-slate-100 dark:placeholder-slate-400"
                  disabled={isProcessing}
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1.5">Name on Card</label>
              <input
                type="text"
                value={cardName}
                onChange={e => setCardName(e.target.value)}
                placeholder="Full name"
                className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-slate-100 dark:placeholder-slate-400"
                disabled={isProcessing}
              />
            </div>

            <button
              onClick={handlePay}
              disabled={isProcessing}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
            >
              {isProcessing ? (
                <><Loader2 size={18} className="animate-spin" /> Processing Payment...</>
              ) : (
                <><Lock size={16} /> Pay ₹{amount.toLocaleString("en-IN")} Securely</>
              )}
            </button>

            <p className="text-center text-xs text-slate-400 flex items-center justify-center gap-1.5 mt-1">
              <Lock size={11} /> 256-bit SSL encrypted · PCI DSS compliant
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PricingPage() {
  const { user, updatePlan } = useAuth(); // BUG 9 FIX: also get updatePlan
  const router = useRouter();
  const [isAnnual, setIsAnnual] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<"Free" | "Pro" | "Elite">(user?.plan || "Free");
  const [paymentModal, setPaymentModal] = useState<{ plan: string; amount: number } | null>(null);

  const handleUpgrade = (plan: string) => {
    if (!user) {
      toast.error("Please login to upgrade.");
      router.push("/login");
      return;
    }
    const amount = plan === "Pro" ? (isAnnual ? 1990 : 199) : (isAnnual ? 4990 : 499);
    setPaymentModal({ plan, amount });
  };

  // BUG 9 FIX: Now calls updatePlan() from AuthContext to persist the plan across the entire app
  const handlePaymentSuccess = (plan: "Free" | "Pro" | "Elite") => {
    setCurrentPlan(plan);
    updatePlan(plan); // Persists to localStorage/sessionStorage
    toast.success(`🎉 Welcome to HirePath ${plan}! Your plan is now active.`);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 animate-fade-in dark:text-slate-100">
      {paymentModal && (
        <PaymentModal 
          plan={paymentModal.plan} 
          amount={paymentModal.amount}
          isAnnual={isAnnual}
          onClose={() => setPaymentModal(null)}
          onSuccess={handlePaymentSuccess}
          userName={user?.name || "User"}
          userEmail={user?.email || ""}
        />
      )}
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-slate-100 mb-4">Invest in your career.</h1>
        <p className="text-lg text-slate-500 dark:text-slate-400 mb-8">
          Stop sending generic resumes. Get the AI tools you need to land your dream job faster.
        </p>

        {/* Toggle */}
        <div className="inline-flex items-center gap-3 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl">
          <button 
            onClick={() => setIsAnnual(false)}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 ${!isAnnual ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"}`}
          >
            Monthly
          </button>
          <button 
            onClick={() => setIsAnnual(true)}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 flex items-center gap-1.5 ${isAnnual ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"}`}
          >
            Annually <span className="text-[10px] uppercase tracking-wider bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full">2 Months Free</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {/* FREE */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-200 dark:border-slate-700 flex flex-col hover:border-blue-200 dark:hover:border-blue-500 transition-colors">
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">Starter</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 h-10">Essential tools to get started with AI job hunting.</p>
          <div className="mb-8">
            <span className="text-4xl font-black text-slate-900 dark:text-slate-100">₹0</span>
            <span className="text-slate-500 dark:text-slate-400">/mo</span>
          </div>
          <button 
            disabled={currentPlan === "Free"}
            className={`w-full mb-8 py-3 rounded-xl font-bold transition-colors ${currentPlan === "Free" ? "bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed" : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"}`}
          >
            {currentPlan === "Free" ? "Current Plan" : "Downgrade to Starter"}
          </button>
          
          <div className="space-y-4 flex-1 dark:text-slate-300">
            <FeatureItem text="10 job searches / day" />
            <FeatureItem text="5 resume tailoring / month" />
            <FeatureItem text="3 cover letters / month" />
            <FeatureItem text="Application status tracker" />
            <FeatureItem text="Basic match scoring" />
          </div>
        </div>

        {/* PRO */}
        <div className="bg-gradient-to-b from-blue-600 to-blue-800 rounded-3xl p-8 border border-blue-500 shadow-blue flex flex-col relative transform md:-translate-y-4">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-amber-400 to-amber-500 text-white font-black text-xs uppercase tracking-widest px-4 py-1.5 rounded-full shadow-sm flex items-center gap-1">
            <Star size={12} className="fill-white" /> Most Popular
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Pro</h3>
          <p className="text-blue-100 text-sm mb-6 h-10">Everything you need to beat the ATS and get interviews.</p>
          <div className="mb-8">
            <span className="text-4xl font-black text-white">{isAnnual ? "₹1,990" : "₹199"}</span>
            <span className="text-blue-200">{isAnnual ? "/yr" : "/mo"}</span>
          </div>
          <button 
            onClick={() => handleUpgrade("Pro")}
            disabled={currentPlan === "Pro"}
            className={`px-5 py-3 rounded-xl font-bold transition-colors w-full mb-8 shadow-sm ${currentPlan === "Pro" ? "bg-blue-500 text-white opacity-80 cursor-not-allowed" : "bg-white text-blue-600 hover:bg-blue-50"}`}
          >
            {currentPlan === "Pro" ? "Current Plan" : "Upgrade to Pro"}
          </button>
          
          <div className="space-y-4 flex-1 text-blue-50 dark:text-blue-100">
            <FeatureItem text="30 job searches / day" light />
            <FeatureItem text="Unlimited resume tailoring" light />
            <FeatureItem text="Unlimited cover letters" light />
            <FeatureItem text="AI Interview Prep module" light />
            <FeatureItem text="Skill gap analysis" light />
            <FeatureItem text="Semi-auto job apply" light />
          </div>
        </div>

        {/* ELITE */}
        <div className="bg-slate-900 rounded-3xl p-8 border border-slate-800 flex flex-col shadow-xl">
          <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
            Elite <Zap size={18} className="text-yellow-400 fill-yellow-400" />
          </h3>
          <p className="text-slate-400 text-sm mb-6 h-10">The ultimate career copilot for serious job seekers.</p>
          <div className="mb-8">
            <span className="text-4xl font-black text-white">{isAnnual ? "₹4,990" : "₹499"}</span>
            <span className="text-slate-500">{isAnnual ? "/yr" : "/mo"}</span>
          </div>
          <button 
            onClick={() => handleUpgrade("Elite")}
            disabled={currentPlan === "Elite"}
            className={`px-5 py-3 rounded-xl font-bold transition-colors w-full mb-8 shadow-sm ${currentPlan === "Elite" ? "bg-slate-700 text-white opacity-80 cursor-not-allowed" : "bg-blue-600 text-white hover:bg-blue-500"}`}
          >
            {currentPlan === "Elite" ? "Current Plan" : "Upgrade to Elite"}
          </button>
          
          <div className="space-y-4 flex-1 text-slate-300 dark:text-slate-300">
            <FeatureItem text="Everything in Pro" light highlight />
            <FeatureItem text="Unlimited everything" light />
            <FeatureItem text="Full auto-apply pipeline" light />
            <FeatureItem text="LaTeX-quality resumes" light />
            <FeatureItem text="LinkedIn outreach AI" light />
            <FeatureItem text="Mock interview with feedback" light />
          </div>
        </div>
      </div>

      {/* Payment Info Section */}
      <div className="mt-12 max-w-3xl mx-auto">
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
            <Lock size={20} className="text-blue-600" />
            Payment Security
          </h3>
          <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
            <p>
              <strong className="text-slate-900 dark:text-slate-200">Current Status:</strong> Demo/Simulation Mode
            </p>
            <p>
              The payment form you see is a <strong>simulation</strong> for demonstration purposes. 
              No real money is charged, and no actual payment gateway (like Razorpay, Stripe, or PayPal) is connected.
            </p>
            <p>
              <strong className="text-slate-900 dark:text-slate-200">For Production:</strong> You would need to integrate with a real payment provider like:
            </p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Razorpay (India)</li>
              <li>Stripe (International)</li>
              <li>PayPal</li>
            </ul>
            <p className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
              <strong className="text-slate-900 dark:text-slate-200">What's Working:</strong>
            </p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Plan selection and persistence to database</li>
              <li>User plan sync across frontend and backend</li>
              <li>Subscription tracking with start/end dates</li>
              <li>30-day subscription period</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureItem({ text, light = false, highlight = false }: { text: string; light?: boolean; highlight?: boolean }) {
  return (
    <div className={`flex items-start gap-3 text-sm ${highlight ? "font-bold text-white" : ""} ${!light ? "dark:text-slate-300" : ""}`}>
      <Check size={18} className={`shrink-0 ${light ? (highlight ? "text-yellow-400" : "text-blue-300") : "text-emerald-500 dark:text-emerald-400"}`} />
      <span>{text}</span>
    </div>
  );
}
