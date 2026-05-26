"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { MoreHorizontal, LogOut, User, Bell, Settings, ChevronRight, Crown, Sun, Moon } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import toast from "react-hot-toast";

const tabs = [
  { label: "Dashboard", href: "/" },
  { label: "Search Jobs", href: "/search" },
  { label: "Applied & Status", href: "/status" },
  { label: "Resume Hub", href: "/resume-hub" },
  { label: "Interview Prep", href: "/interview-prep" },
  { label: "Upgrade Plan", href: "/pricing" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const darkMode = theme === "dark";

  // Close menu when clicking outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const planColors: Record<string, string> = {
    Free: "bg-slate-100 text-slate-600",
    Pro: "bg-blue-100 text-blue-700",
    Elite: "bg-yellow-100 text-yellow-700",
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <HirePathLogo />
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                Hire<span className="text-hirepath-blue">Path</span>
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500 font-medium hidden sm:inline">
                AI Job Copilot
              </span>
            </div>
          </Link>

          {/* Navigation Tabs */}
          <div className="hidden md:flex items-center gap-1">
            {tabs.map((tab) => {
              const isActive =
                tab.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(tab.href);
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={`
                    px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200
                    ${
                      isActive
                        ? "text-hirepath-blue bg-blue-50 dark:bg-blue-900/30 border-b-2 border-hirepath-blue"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                    }
                  `}
                >
                  {tab.label}
                </Link>
              );
            })}
          </div>

          {/* Right side — Theme Toggle & Three Dots Menu */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle theme"
              title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {darkMode ? <Sun size={20} className="text-amber-500 animate-pulse" /> : <Moon size={20} />}
            </button>

            <div className="relative" ref={menuRef}>
              <button
                id="navbar-menu-btn"
                onClick={() => setMenuOpen(!menuOpen)}
                className={`p-2 rounded-lg transition-colors ${menuOpen ? "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200" : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"}`}
                aria-label="Open menu"
              >
                <MoreHorizontal size={20} />
              </button>

            {/* Dropdown Menu */}
            {menuOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden z-50 animate-fade-in">
                {/* User Info */}
                {user && (
                  <div className="px-4 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 dark:text-slate-100 text-sm truncate">{user.name}</p>
                        <p className="text-slate-500 dark:text-slate-400 text-xs truncate">{user.email}</p>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 ${planColors[user.plan] || planColors.Free}`}>
                        {user.plan === "Elite" && <Crown size={10} />}
                        {user.plan} Plan
                      </span>
                      {user.plan === "Free" && (
                        <Link
                          href="/pricing"
                          onClick={() => setMenuOpen(false)}
                          className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition"
                        >
                          Upgrade →
                        </Link>
                      )}
                    </div>
                  </div>
                )}

                {/* Menu Items */}
                <div className="py-1">
                  <div className="dark:bg-slate-900">
                    <MenuItem
                      icon={<User size={15} />}
                      label="My Profile"
                      onClick={() => {
                        setMenuOpen(false);
                        toast.success("Profile page coming soon!", { icon: "👤" });
                      }}
                    />
                    <MenuItem
                      icon={<Bell size={15} />}
                      label="Notifications"
                      badge="3"
                      onClick={() => {
                        setMenuOpen(false);
                        toast.success("You have 3 new notifications!", { icon: "🔔" });
                      }}
                    />
                    <MenuItem
                      icon={<Settings size={15} />}
                      label="Settings"
                      onClick={() => {
                        setMenuOpen(false);
                        toast.success("Settings page coming soon!", { icon: "⚙️" });
                      }}
                    />
                  </div>
                </div>

                <div className="border-t border-slate-100 dark:border-slate-700 py-1 dark:bg-slate-900">
                  <button
                    id="navbar-logout-btn"
                    onClick={() => {
                      setMenuOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-sm font-medium"
                  >
                    <LogOut size={15} />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

        {/* Mobile Navigation */}
        <div className="md:hidden flex items-center gap-1 pb-2 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => {
            const isActive =
              tab.href === "/"
                ? pathname === "/"
                : pathname.startsWith(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`
                  shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all
                  ${
                    isActive
                      ? "text-white bg-hirepath-blue"
                      : "text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700"
                  }
                `}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

function MenuItem({
  icon,
  label,
  badge,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  badge?: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-2.5 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-sm font-medium"
    >
      <span className="text-slate-400 dark:text-slate-500">{icon}</span>
      <span className="flex-1 text-left">{label}</span>
      {badge && (
        <span className="bg-blue-600 dark:bg-blue-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
          {badge}
        </span>
      )}
      {!badge && <ChevronRight size={14} className="text-slate-300 dark:text-slate-600" />}
    </button>
  );
}

function HirePathLogo() {
  return (
    <svg
      width="36"
      height="36"
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0"
    >
      <circle cx="18" cy="18" r="18" fill="#EFF6FF" />
      <path
        d="M10 24L18 10L26 24"
        stroke="#2563EB"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <line
        x1="12"
        y1="19"
        x2="24"
        y2="19"
        stroke="#22C55E"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle cx="18" cy="8" r="2" fill="#2563EB" />
    </svg>
  );
}
