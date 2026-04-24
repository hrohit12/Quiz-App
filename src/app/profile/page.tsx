"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";
import { Navbar } from "@/components/Navbar";
import { User, Mail, Shield, Calendar } from "lucide-react";

export default function ProfilePage() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="min-h-screen transition-colors duration-300 pb-12">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-4 mt-8 md:mt-12">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          {/* Header/Banner */}
          <div className="h-32 bg-gradient-to-r from-blue-600 to-purple-600" />
          
          <div className="px-6 pb-8">
            {/* Avatar */}
            <div className="relative -mt-16 mb-6">
              <div className="w-32 h-32 rounded-3xl bg-white dark:bg-slate-800 p-2 shadow-lg">
                <div className="w-full h-full rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <User className="h-16 w-16" />
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{user.fullName}</h1>
                <p className="text-slate-500 dark:text-slate-400">QuizFlow Member</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-transparent">
                  <Mail className="h-5 w-5 text-slate-400" />
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Email</div>
                    <div className="text-sm font-medium text-slate-900 dark:text-white">{user.email}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-transparent">
                  <Shield className="h-5 w-5 text-slate-400" />
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Role</div>
                    <div className="text-sm font-medium text-slate-900 dark:text-white capitalize">{user.role.toLowerCase()}</div>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-blue-500/5 border border-blue-500/10">
                <h3 className="text-sm font-bold text-blue-600 dark:text-blue-400 mb-2">Account Statistics</h3>
                <div className="flex gap-8">
                  <div>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">--</div>
                    <div className="text-xs text-slate-500">Quizzes Completed</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">--%</div>
                    <div className="text-xs text-slate-500">Avg. Accuracy</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
