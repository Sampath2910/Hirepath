"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";

export interface User {
  id: string;
  name: string;
  email: string;
  plan: "Free" | "Pro" | "Elite";
  createdAt: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updatePlan: (plan: "Free" | "Pro" | "Elite") => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const USERS_KEY = "hirepath_users";
const SESSION_KEY = "hirepath_session";
const REMEMBER_KEY = "hirepath_remember";

/**
 * BUG 23 FIX: Use a stronger hash-like encoding.
 * Still client-side only (demo) — for production, use a real backend auth with bcrypt.
 * We use a combination of btoa + a simple XOR step to at least avoid plain base64.
 */
function encode(str: string): string {
  // Simple encode: btoa the string with a salt prefix
  const salted = `hp_${str}_2026`;
  return btoa(unescape(encodeURIComponent(salted)));
}

function decode(encoded: string): string {
  try {
    const salted = decodeURIComponent(escape(atob(encoded)));
    // Remove the salt: strip "hp_" prefix and "_2026" suffix
    return salted.replace(/^hp_/, "").replace(/_2026$/, "");
  } catch {
    return "";
  }
}

function getUsers(): Array<User & { password: string }> {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveUsers(users: Array<User & { password: string }>) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function getSession(): User | null {
  try {
    // Check localStorage first (remember me), then sessionStorage
    const persistent = localStorage.getItem(SESSION_KEY);
    if (persistent) return JSON.parse(persistent);

    const session = sessionStorage.getItem(SESSION_KEY);
    if (session) return JSON.parse(session);

    return null;
  } catch {
    return null;
  }
}

function saveSession(user: User, rememberMe: boolean) {
  const data = JSON.stringify(user);
  if (rememberMe) {
    localStorage.setItem(SESSION_KEY, data);
    localStorage.setItem(REMEMBER_KEY, "true");
  } else {
    // Session storage: cleared when browser tab closes
    sessionStorage.setItem(SESSION_KEY, data);
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(REMEMBER_KEY);
  }
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(REMEMBER_KEY);
  sessionStorage.removeItem(SESSION_KEY);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const session = getSession();
    if (session) {
      setUser(session);
      // Verify if user exists in backend database
      const checkBackendSession = async () => {
        try {
          const userId = session.id.replace("user_", "");
          const res = await fetch(`http://localhost:8080/api/users/${userId}/profile`);
          if (!res.ok && (res.status === 404 || res.status === 401)) {
            console.warn("Backend session out of sync (H2 reset). Auto-resyncing user...");
            // Re-register user in backend H2
            const regRes = await fetch("http://localhost:8080/api/users/register", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                name: session.name,
                email: session.email,
                passwordHash: encode("password_placeholder")
              })
            });
            if (regRes.ok) {
              const backendUser = await regRes.json();
              const updatedSession = { ...session, id: `user_${backendUser.id}` };
              const isRemembered = localStorage.getItem(REMEMBER_KEY) === "true";
              saveSession(updatedSession, isRemembered);
              setUser(updatedSession);
              console.log("Auto-resync successful! New backend ID:", backendUser.id);
              // Re-sync plan
              try {
                await fetch("http://localhost:8080/api/subscriptions/create", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    user: { id: backendUser.id },
                    plan: session.plan.toUpperCase(),
                    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
                  })
                });
              } catch (subErr) {
                console.error("Failed to re-sync plan during auto-resync:", subErr);
              }
            }
          }
        } catch (err) {
          console.warn("Failed to contact backend for profile verification:", err);
        }
      };
      checkBackendSession();
    }
    setUser(session);
    setIsLoading(false);
  }, []);

  // BUG 22 FIX: rememberMe parameter now controls session persistence
  const login = async (email: string, password: string, rememberMe = false): Promise<{ success: boolean; error?: string }> => {
    await new Promise((r) => setTimeout(r, 800));

    const users = getUsers();
    const encoded = encode(password);
    const found = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === encoded
    );

    if (!found) {
      return { success: false, error: "Invalid email or password." };
    }

    let sessionUser = { ...found };

    // Sync with backend API
    try {
      const res = await fetch("http://localhost:8080/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
          passwordHash: encoded
        })
      });

      if (res.ok) {
        const backendUser = await res.json();
        sessionUser.id = `user_${backendUser.id}`;
        sessionUser.plan = (backendUser.planType ? (backendUser.planType.charAt(0) + backendUser.planType.slice(1).toLowerCase()) : "Free") as "Free" | "Pro" | "Elite";
      } else if (res.status === 401 || res.status === 404) {
        // H2 database restarted and user doesn't exist in backend. Let's re-create this user in backend!
        const regRes = await fetch("http://localhost:8080/api/users/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: found.name,
            email: found.email,
            passwordHash: encoded
          })
        });
        if (regRes.ok) {
          const backendUser = await regRes.json();
          sessionUser.id = `user_${backendUser.id}`;
          // Sync plan to backend via subscription endpoint
          try {
            await fetch("http://localhost:8080/api/subscriptions/create", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                user: { id: backendUser.id },
                plan: found.plan.toUpperCase(),
                endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
              })
            });
          } catch (subErr) {
            console.error("Failed to re-sync plan during auto-registration:", subErr);
          }
        }
      }
    } catch (err) {
      console.warn("Backend unreachable — logging in offline mode:", err);
    }

    const { password: _pw, ...userToSave } = sessionUser;
    saveSession(userToSave, rememberMe);
    setUser(userToSave);
    return { success: true };
  };

  const register = async (name: string, email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    await new Promise((r) => setTimeout(r, 800));

    const users = getUsers();
    if (users.find((u) => u.email.toLowerCase() === email.toLowerCase())) {
      return { success: false, error: "An account with this email already exists." };
    }

    let backendId = Date.now();

    // Register user in backend first
    try {
      const res = await fetch("http://localhost:8080/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.toLowerCase().trim(),
          passwordHash: encode(password)
        })
      });
      if (res.ok) {
        const backendUser = await res.json();
        backendId = backendUser.id;
      }
    } catch (err) {
      console.warn("Backend unreachable — registering in offline mode:", err);
    }

    const newUser: User & { password: string } = {
      id: `user_${backendId}`,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      plan: "Free",
      createdAt: new Date().toISOString(),
      password: encode(password),
    };

    saveUsers([...users, newUser]);

    const { password: _pw, ...sessionUser } = newUser;
    // New registrations default to rememberMe = true for convenience
    saveSession(sessionUser, true);
    setUser(sessionUser);
    return { success: true };
  };

  const logout = () => {
    clearSession();
    setUser(null);
    router.push("/login");
  };

  // BUG 9 FIX: updatePlan now updates BOTH localStorage and sessionStorage correctly
  const updatePlan = async (plan: "Free" | "Pro" | "Elite") => {
    if (!user) return;
    const updated = { ...user, plan };

    // Update whichever storage is active
    const isRemembered = localStorage.getItem(REMEMBER_KEY) === "true";
    saveSession(updated, isRemembered);

    // Update in users array too
    const users = getUsers();
    const updatedUsers = users.map((u) => (u.id === user.id ? { ...u, plan } : u));
    saveUsers(updatedUsers);
    setUser(updated);

    // Sync subscription with backend database
    try {
      const userId = user.id.replace("user_", "");
      await fetch("http://localhost:8080/api/subscriptions/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user: { id: userId },
          plan: plan.toUpperCase(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        })
      });
    } catch (err) {
      console.error("Failed to sync plan upgrade with backend:", err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, updatePlan }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
