import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import AppShell from "@/components/AppShell";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "HirePath | AI Job Copilot — Your AI-powered path to the right job",
  description:
    "HirePath is an AI-powered job search assistant for students and tech professionals. Find jobs, tailor resumes, track applications, and prepare for interviews.",
  keywords: [
    "AI job search",
    "resume builder",
    "job application tracker",
    "interview prep",
    "HirePath",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <AuthProvider>
            <AppShell>{children}</AppShell>
            <Toaster position="bottom-center" toastOptions={{ duration: 3000 }} />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
