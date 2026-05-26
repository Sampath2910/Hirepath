"use client";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import ChatbotFAB from "@/components/ChatbotFAB";
import { useAuth } from "@/context/AuthContext";
import { Sparkles } from "lucide-react";

const PUBLIC_PATHS = ["/login", "/signup"];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const isPublic = PUBLIC_PATHS.includes(pathname);

  useEffect(() => {
    // BUG 12 FIX: Removed redundant check (pathname !== "/login" is already covered by isPublic)
    if (!isLoading && !user && !isPublic) {
      router.replace("/login"); // Use replace() to avoid back-button going back to protected page
    }
    if (!isLoading && user && isPublic) {
      router.replace("/");
    }
  }, [user, isLoading, pathname, isPublic, router]);

  // Full-screen loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 animate-pulse">
            <Sparkles size={28} className="text-white" />
          </div>
          <p className="text-blue-200 font-semibold animate-pulse">Loading HirePath...</p>
        </div>
      </div>
    );
  }

  // Show public pages (login/signup) without navbar/chatbot
  if (isPublic) {
    return <>{children}</>;
  }

  // Redirect in progress (user not logged in)
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Authenticated app shell
  return (
    <div className="min-h-screen bg-hirepath-bg dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      <Navbar />
      <main className="page-enter">{children}</main>
      <ChatbotFAB />
    </div>
  );
}
