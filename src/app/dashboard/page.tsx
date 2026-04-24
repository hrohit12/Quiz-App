"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Trophy, Clock, BookOpen, LogOut, Search } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { QuizCardSkeleton, SidebarItemSkeleton, Skeleton } from "@/components/Skeleton";
import { BorderBeam } from "@/components/magicui/BorderBeam";


interface Quiz {
  id: string;
  title: string;
  description: string;
  _count: { questions: number };
}

interface LeaderboardEntry {
  name: string;
  score: number;
  time: number;
  attempts: number;
}

export default function Dashboard() {
  const { user, session, logout, loading: authLoading } = useAuth();
  const router = useRouter();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [attempts, setAttempts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [topic, setTopic] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }

    if (user) {
      fetchData();
    }
  }, [user, authLoading]);

  const fetchData = async () => {
    try {
      // Fetch Quizzes with question counts
      const { data: quizData, error: quizError } = await supabase
        .from("quizzes")
        .select(`
          *,
          questions (count)
        `)
        .order("created_at", { ascending: false });

      if (quizError) throw quizError;

      // Map count from questions array to the expected format
      const formattedQuizzes = quizData.map((q: any) => ({
        ...q,
        _count: { questions: q.questions[0].count }
      }));
      setQuizzes(formattedQuizzes);

      // Fetch Leaderboard (Simplified for now)
      const { data: lbData, error: lbError } = await supabase
        .from("attempts")
        .select(`
          score,
          time_taken,
          profiles (full_name)
        `)
        .order("score", { ascending: false })
        .limit(5);

      if (lbError) throw lbError;

      const formattedLB = lbData.map((entry: any) => ({
        name: entry.profiles?.full_name || "Unknown",
        score: entry.score,
        time: entry.time_taken,
        attempts: 1
      }));
      setLeaderboard(formattedLB);

      // Fetch Personal Attempts
      const { data: attData, error: attError } = await supabase
        .from("attempts")
        .select(`
          *,
          quizzes (title)
        `)
        .eq("user_id", user?.id)
        .order("completed_at", { ascending: false })
        .limit(5);

      if (attError) throw attError;

      const formattedAtt = attData.map((att: any) => ({
        ...att,
        quiz: { title: att.quizzes?.title || "Deleted Quiz" }
      }));
      setAttempts(formattedAtt);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic || !user) return;
    setGenerating(true);

    const generateAction = async () => {
      const OPENROUTER_API_KEY = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY || "";
      if (!OPENROUTER_API_KEY) throw new Error("OpenRouter API key not configured");

      const prompt = `Generate a quiz about "${topic}" with 5 multiple choice questions. 
      Return the response ONLY as a JSON object with the following structure:
      {
        "title": "Quiz Title",
        "description": "Quiz Description",
        "questions": [
          {
            "questionText": "Question text here?",
            "options": ["Option A", "Option B", "Option C", "Option D"],
            "correctAnswer": "Option A",
            "points": 1
          }
        ]
      }`;

      const aiRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.0-flash-001",
          messages: [{ role: "user", content: prompt }],
          response_format: { type: "json_object" }
        }),
      });

      const aiData = await aiRes.json();
      const quizData = JSON.parse(aiData.choices[0].message.content);

      // Save to Supabase
      const { data: quiz, error: quizError } = await supabase
        .from("quizzes")
        .insert([{
          title: quizData.title,
          description: quizData.description,
          creator_id: user.id,
          status: "published"
        }])
        .select()
        .single();

      if (quizError) throw quizError;

      const { error: qError } = await supabase
        .from("questions")
        .insert(quizData.questions.map((q: any) => ({
          quiz_id: quiz.id,
          question_text: q.questionText,
          options: q.options,
          correct_answer: q.correctAnswer,
          points: q.points || 1
        })));

      if (qError) throw qError;

      setTopic("");
      fetchData();
    };

    toast.promise(generateAction(), {
      loading: "AI is thinking and generating your quiz...",
      success: "Quiz generated successfully!",
      error: (err) => `Failed: ${err.message}`,
    });

    try {
      await generateAction();
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  const filteredQuizzes = quizzes.filter(q => 
    q.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    q.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-12 transition-colors duration-300">
      <Navbar />


      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 md:mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6 md:space-y-8">
            
            {/* Admin: Generate Quiz */}
            {user?.role === "ADMIN" && (
              <section className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 md:p-6 shadow-sm dark:shadow-xl">
                <div className="flex items-center space-x-2 mb-4">
                  <Plus className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <h3 className="text-lg md:text-xl font-semibold text-slate-900 dark:text-white">Generate New Quiz with AI</h3>
                </div>
                <form onSubmit={handleGenerate} className="flex flex-col sm:flex-row gap-3 md:gap-4">
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Enter topic (e.g. JavaScript...)"
                    className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white"
                  />
                  <button
                    disabled={generating}
                    className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 px-6 py-2.5 rounded-xl font-medium text-white transition-colors flex items-center justify-center gap-2"
                  >
                    {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Generate"}
                  </button>
                </form>
              </section>
            )}


            {/* Quizzes List */}
            <section>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <h3 className="text-2xl font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                  <BookOpen className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  Available Quizzes
                </h3>
                
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search quizzes..."
                    className="w-full sm:w-64 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {loading ? (
                  Array(4).fill(0).map((_, i) => <QuizCardSkeleton key={i} />)
                ) : (
                  filteredQuizzes.map((quiz) => (
                    <div
                      key={quiz.id}
                      className="group relative bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 hover:border-blue-500/50 rounded-2xl p-6 transition-all hover:shadow-xl dark:hover:shadow-blue-500/10 overflow-hidden"
                    >
                      <BorderBeam size={250} duration={12} delay={9} />
                      <h4 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{quiz.title}</h4>
                      <p className="text-slate-600 dark:text-slate-400 text-sm mt-2 line-clamp-2">{quiz.description}</p>
                      <div className="mt-4 flex items-center justify-between">
                        <span className="text-xs text-slate-500">{quiz._count.questions} Questions</span>
                        <button
                          onClick={() => router.push(`/quiz/${quiz.id}`)}
                          className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 flex items-center gap-1"
                        >
                          Start Quiz →
                        </button>
                      </div>
                    </div>
                  ))
                )}
                
                {!loading && filteredQuizzes.length === 0 && (
                  <div className="col-span-full py-12 text-center bg-slate-50 dark:bg-slate-900/20 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
                    <BookOpen className="h-10 w-10 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                    <p className="text-slate-500 dark:text-slate-400">No quizzes found matching your search</p>
                  </div>
                )}
              </div>
            </section>

          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Leaderboard */}
            <section className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm dark:shadow-xl">
              <div className="flex items-center space-x-2 mb-6">
                <Trophy className="h-6 w-6 text-yellow-600 dark:text-yellow-500" />
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Leaderboard</h3>
              </div>
              <div className="space-y-4">
                {loading ? (
                  Array(3).fill(0).map((_, i) => <SidebarItemSkeleton key={i} />)
                ) : (
                  leaderboard.map((entry, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-800/30 border border-slate-100 dark:border-transparent">
                      <div className="flex items-center space-x-3">
                        <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${
                          i === 0 ? "bg-yellow-500 text-slate-950" : 
                          i === 1 ? "bg-slate-200 dark:bg-slate-300 text-slate-950" :
                          i === 2 ? "bg-amber-700 text-white" : "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
                        }`}>
                          {i + 1}
                        </span>
                        <span className="font-medium text-slate-700 dark:text-slate-200">{entry.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-blue-600 dark:text-blue-400">{entry.score} pts</div>
                        <div className="text-[10px] text-slate-500 flex items-center justify-end gap-1">
                          <Clock className="h-3 w-3" /> {entry.time}s
                        </div>
                      </div>
                    </div>
                  ))
                )}
                {!loading && leaderboard.length === 0 && (
                  <p className="text-center text-slate-500 text-sm py-4">No data yet this week</p>
                )}
              </div>
            </section>

            {/* Quiz History */}
            <section className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm dark:shadow-xl">
              <div className="flex items-center space-x-2 mb-6">
                <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Recent Activity</h3>
              </div>
              <div className="space-y-4">
                {loading ? (
                  Array(2).fill(0).map((_, i) => <SidebarItemSkeleton key={i} />)
                ) : (
                  attempts.map((attempt, i) => (
                    <div key={i} className="p-3 rounded-xl bg-white dark:bg-slate-800/30 border border-slate-100 dark:border-transparent">
                      <div className="text-sm font-bold text-slate-900 dark:text-white truncate">{attempt.quiz.title}</div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="text-xs font-semibold text-blue-600 dark:text-blue-400">{attempt.score} points</div>
                        <div className="text-[10px] text-slate-500 italic">
                          {new Date(attempt.completedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))
                )}
                {!loading && attempts.length === 0 && (
                  <div className="text-center py-6">
                    <p className="text-slate-500 text-sm">No quizzes completed yet.</p>
                  </div>
                )}
              </div>
            </section>

          </div>

        </div>
      </main>
    </div>
  );
}
