"use client";

import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { Sparkles, Trophy, ShieldCheck } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import RetroGrid from "@/components/magicui/RetroGrid";
import { ShineBorder } from "@/components/magicui/ShineBorder";

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col min-h-screen transition-colors duration-300 overflow-x-hidden relative">

      {/* Magic UI Retro Grid Background */}
      <RetroGrid />

      <Navbar />

      {/* Hero Section */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 py-16 md:py-24">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider mb-8">
          <Sparkles className="h-3 w-3" /> Powered by OpenRouter AI
        </div>
        
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-gradient-to-b from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 bg-clip-text text-transparent leading-[1.1]">
          Master Any Subject <br className="hidden sm:block" /> with AI-Powered Quizzes
        </h1>

        
        <p className="max-w-2xl text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-10 md:mb-12">
          QuizFlow uses state-of-the-art AI to generate personalized quizzes in seconds. 
          Compete with students worldwide and climb the leaderboard.
        </p>


        <div className="flex flex-col sm:flex-row gap-4">
          {!user ? (
            <>
              <ShineBorder color={["#2563eb", "#9333ea"]} borderRadius={16} className="!w-full sm:!w-fit">
                <Link 
                  href="/signup" 
                  className="px-8 py-4 bg-white dark:bg-slate-950 text-slate-900 dark:text-white rounded-[14px] text-lg font-bold transition-all block text-center"
                >
                  Start Learning Now
                </Link>
              </ShineBorder>
              <Link 
                href="/login" 
                className="px-8 py-4 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl text-lg font-bold transition-all text-slate-900 dark:text-white"
              >
                Log In
              </Link>
            </>
          ) : (
            <ShineBorder color={["#2563eb", "#9333ea"]} borderRadius={16} className="!w-full sm:!w-fit">
              <Link 
                href="/dashboard" 
                className="px-8 py-4 bg-white dark:bg-slate-950 text-slate-900 dark:text-white rounded-[14px] text-lg font-bold transition-all block text-center"
              >
                {user.role === "ADMIN" ? "Admin Dashboard" : "Go to Dashboard"}
              </Link>
            </ShineBorder>
          )}
        </div>

        {/* Features */}
        <div className="mt-16 md:mt-32 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-6xl w-full">
          {[
            {
              icon: <Sparkles className="h-6 w-6 text-blue-400" />,
              title: "AI Generation",
              desc: "Admins can generate comprehensive quizzes on any topic instantly using AI."
            },
            {
              icon: <Trophy className="h-6 w-6 text-yellow-400" />,
              title: "Global Leaderboard",
              desc: "Compete for the top spot. Rankings based on score and completion time."
            },
            {
              icon: <ShieldCheck className="h-6 w-6 text-green-400" />,
              title: "Instant Grading",
              desc: "Get your results immediately with detailed performance breakdown."
            }
          ].map((feature, i) => (
            <div key={i} className="p-6 md:p-8 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-3xl hover:border-blue-500/20 transition-all text-left shadow-sm dark:shadow-none">
              <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl w-fit mb-6 text-slate-900 dark:text-white">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">{feature.title}</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm md:text-base">{feature.desc}</p>
            </div>
          ))}

        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-900 py-12 px-4 text-center text-slate-500 text-sm">
        <p>© 2026 QuizFlow. Built with Next.js, Prisma, and OpenRouter.</p>
      </footer>
    </div>
  );
}
