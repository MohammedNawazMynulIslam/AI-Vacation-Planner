"use client";

import { useState } from "react";
import { Bot, ArrowRight, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

export default function PromptInput() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt || loading) return;

    setLoading(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      let data;
      try {
        data = await res.json();
      } catch (jsonError) {
        console.error("Failed to parse JSON response:", jsonError);
        throw new Error("The server returned an invalid response. Please try again.");
      }

      if (res.ok && data.slug) {
        router.push(`/plan/${data.slug}`);
      } else {
        alert(data.error || data.details || "Something went wrong");
      }
    } catch (error) {
      console.error(error);
      alert(error.message || "Failed to generate plan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full relative group">
      {/* Background Glow */}
      <div className="absolute -inset-2 bg-gradient-to-r from-emerald-500/10 via-indigo-500/10 to-emerald-500/10 rounded-3xl blur-2xl opacity-50 group-hover:opacity-100 transition duration-1000"></div>

      <form onSubmit={handleSubmit} className="relative glass-panel rounded-3xl border-white/10 flex flex-col p-2 transition-all duration-500 focus-within:glow-border focus-within:bg-white/[0.07]">
        <div className="flex items-start px-4">
          <div className="pt-6 mr-4">
            <Sparkles className="w-6 h-6 text-emerald-400 opacity-70" />
          </div>
          <textarea
            className="w-full bg-transparent border-none focus:ring-0 focus:outline-none text-xl text-white placeholder:text-slate-500 py-6 px-0 resize-none h-[120px] font-light leading-relaxed"
            placeholder="Describe your vision (e.g. 10 days in Iceland, focused on photography and glaciers)"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={loading}
          ></textarea>
        </div>

        <div className="flex justify-between items-center p-3 border-t border-white/5 mt-2">
          <div className="flex gap-2 text-[10px] items-center text-slate-500 uppercase tracking-widest pl-2">
            <Bot className="w-3 h-3" />
            <span>Neural Processor Active</span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-emerald-500 text-slate-900 px-6 py-3 rounded-2xl font-bold text-sm tracking-tight hover:bg-emerald-400 hover:scale-[1.02] active:scale-95 transition-all duration-300 flex items-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.2)] disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <span>Synthesize</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Suggested Prompts */}
      <div className="flex flex-wrap justify-center gap-4 mt-8 px-4">
        {[
          { label: "Tokyo Synthwave", prompt: "3 days in Tokyo, focus on neon photography and futuristic vibe" },
          { label: "Vatican Treasures", prompt: "5 days in Rome and Vatican City, deep dive into history and art" },
          { label: "Alpine Escape", prompt: "7 days in the Swiss Alps, focus on luxury and scenic train routes" }
        ].map((item, i) => (
          <button
            key={i}
            onClick={() => setPrompt(item.prompt)}
            className="px-4 py-2 rounded-full glass-panel border-white/5 text-[11px] font-semibold text-slate-400 hover:text-emerald-300 hover:border-emerald-500/20 transition-all duration-300"
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}
