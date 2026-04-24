"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useParams } from "next/navigation";
import { Loader2, ArrowLeft, ArrowRight, CheckCircle2, Clock } from "lucide-react";
import confetti from "canvas-confetti";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface Question {
  id: string;
  question_text: string;
  options: string[];
  points: number;
  correct_answer: string;
}

interface Quiz {
  id: string;
  title: string;
  questions: Question[];
}

export default function QuizPage() {
  const { user, session, loading: authLoading } = useAuth();
  const router = useRouter();
  const { id } = useParams();
  
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [startTime] = useState(Date.now());
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }
    if (user) {
      fetchQuiz();
    }
  }, [id, user, authLoading]);

  const fetchQuiz = async () => {
    try {
      const { data, error } = await supabase
        .from("quizzes")
        .select(`
          *,
          questions (*)
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      setQuiz(data);
    } catch (err) {
      console.error(err);
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (option: string) => {
    const questionId = quiz!.questions[currentQuestionIndex].id;
    setAnswers({ ...answers, [questionId]: option });
  };

  const handleSubmit = async () => {
    if (!quiz || !user) return;
    setSubmitting(true);
    const endTime = Date.now();
    const timeTaken = Math.floor((endTime - startTime) / 1000);

    try {
      // Calculate results on client side for static export compatibility
      let score = 0;
      let totalPoints = 0;
      const reviewQuestions = quiz.questions.map((q) => {
        const isCorrect = answers[q.id] === q.correct_answer;
        if (isCorrect) score += q.points;
        totalPoints += q.points;
        return {
          ...q,
          isCorrect,
          userAnswer: answers[q.id],
          questionText: q.question_text,
          correctAnswer: q.correct_answer
        };
      });

      // Save attempt to Supabase
      const { error } = await supabase
        .from("attempts")
        .insert([{
          user_id: user.id,
          quiz_id: id,
          score: score,
          time_taken: timeTaken,
        }]);

      if (error) throw error;

      setResult({
        score,
        totalPoints,
        questions: reviewQuestions
      });
      
      toast.success("Quiz submitted successfully!");
      
      if (score > (totalPoints / 2)) {
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#2563eb", "#9333ea", "#10b981"]
        });
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to submit quiz");
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (result) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 transition-colors duration-300">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 text-center shadow-xl dark:shadow-2xl">

          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/10 mb-6">
            <CheckCircle2 className="h-10 w-10 text-green-500" />
          </div>
          <h2 className="text-3xl font-bold mb-2 text-slate-900 dark:text-white">Quiz Completed!</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-8">Great job finishing the quiz.</p>

          
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
              <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">Your Score</div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{result.score} / {result.totalPoints}</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
              <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">Accuracy</div>
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {Math.round((result.score / result.totalPoints) * 100)}%
              </div>
            </div>
          </div>

          <div className="space-y-4 mb-8 text-left max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Detailed Review</h3>
            {result.questions.map((q: any, i: number) => (
              <div key={q.id} className={`p-4 rounded-xl border ${q.isCorrect ? "bg-green-500/5 border-green-500/20" : "bg-red-500/5 border-red-500/20"}`}>
                <div className="flex items-start gap-3">
                  <span className="text-xs font-bold text-slate-400 mt-1">{i + 1}.</span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white mb-2">{q.questionText}</p>
                    <div className="space-y-1">
                      <div className="text-xs flex items-center gap-2">
                        <span className="text-slate-500">Your answer:</span>
                        <span className={q.isCorrect ? "text-green-600 dark:text-green-400 font-medium" : "text-red-600 dark:text-red-400 font-medium"}>
                          {q.userAnswer || "Skipped"}
                        </span>
                      </div>
                      {!q.isCorrect && (
                        <div className="text-xs flex items-center gap-2">
                          <span className="text-slate-500">Correct answer:</span>
                          <span className="text-green-600 dark:text-green-400 font-medium">{q.correctAnswer}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>


          <button
            onClick={() => router.push("/dashboard")}
            className="w-full bg-blue-600 hover:bg-blue-500 py-3 rounded-xl font-bold transition-all text-white"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = quiz!.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz!.questions.length) * 100;

  return (
    <div className="min-h-screen p-4 sm:p-8 transition-colors duration-300">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.push("/dashboard")}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-500 dark:text-slate-400 transition-colors"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
            <Clock className="h-4 w-4" />
            <span className="text-sm font-mono">
              {Math.floor((Date.now() - startTime) / 1000)}s
            </span>
          </div>
        </div>


        {/* Progress Bar */}
        <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full mb-12 overflow-hidden">
          <div 
            className="h-full bg-blue-600 dark:bg-blue-500 transition-all duration-300" 
            style={{ width: `${progress}%` }}
          />
        </div>


        <div className="space-y-8">
          <div className="space-y-2">
            <span className="text-blue-600 dark:text-blue-400 font-semibold text-sm uppercase tracking-wider">
              Question {currentQuestionIndex + 1} of {quiz!.questions.length}
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold leading-tight text-slate-900 dark:text-white">
              {currentQuestion.question_text}
            </h2>
          </div>


          <div className="grid grid-cols-1 gap-4">
            {currentQuestion.options.map((option, i) => (
              <button
                key={i}
                onClick={() => handleAnswerSelect(option)}
                className={`w-full p-5 rounded-2xl text-left border-2 transition-all duration-200 flex items-center justify-between group ${
                  answers[currentQuestion.id] === option
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-500/10 ring-1 ring-blue-500"
                    : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-900 dark:text-white"

                }`}
              >
                <span className="text-lg font-medium">{option}</span>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                  answers[currentQuestion.id] === option 
                    ? "border-blue-600 dark:border-blue-500 bg-blue-600 dark:bg-blue-500" 
                    : "border-slate-300 dark:border-slate-700 group-hover:border-slate-400 dark:group-hover:border-slate-500"
                }`}>

                  {answers[currentQuestion.id] === option && (
                    <div className="w-2 h-2 rounded-full bg-white" />
                  )}
                </div>
              </button>
            ))}
          </div>

          <div className="flex justify-between items-center pt-8">
            <button
              disabled={currentQuestionIndex === 0}
              onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
              className="px-6 py-3 rounded-xl font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-0 transition-all"
            >
              Previous
            </button>

            
            {currentQuestionIndex === quiz!.questions.length - 1 ? (
              <button
                disabled={submitting || !answers[currentQuestion.id]}
                onClick={handleSubmit}
                className="px-8 py-3 bg-green-600 hover:bg-green-500 disabled:opacity-50 rounded-xl font-bold transition-all flex items-center gap-2"
              >
                {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "Finish Quiz"}
              </button>
            ) : (
              <button
                disabled={!answers[currentQuestion.id]}
                onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-xl font-bold transition-all flex items-center gap-2"
              >
                Next <ArrowRight className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
