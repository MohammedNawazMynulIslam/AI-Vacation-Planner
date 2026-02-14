import TravelPlan from "@/models/TravelPlan";
import { connectDB } from "@/lib/db";
import Link from "next/link";
import Image from "next/image";
import PromptInput from "./components/PromptInput";
import { Map, Sparkles, Clock } from "lucide-react";

export default async function Home() {
  try {
    await connectDB();
    const plans = await TravelPlan.find().sort({ createdAt: -1 }).limit(3);

    return (
      <div className="bg-[#030712] text-slate-200 min-h-screen relative overflow-hidden bg-mesh">
        {/* Animated Background Gradients */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full"></div>

        {/* Minimal Navbar */}
        <nav className="absolute top-0 left-0 right-0 z-50 w-full py-8 px-8 lg:px-16 flex justify-between items-center">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="relative">
              <Sparkles className="w-7 h-7 text-emerald-400 relative z-10" />
              <div className="absolute inset-0 bg-emerald-400/30 blur-md rounded-full scale-110 group-hover:scale-150 transition-transform"></div>
            </div>
            <span className="text-xl font-bold tracking-tight text-white glow-text italic">Aetheria</span>
          </div>
        </nav>

        {/* Main Container */}
        <main className="min-h-screen flex flex-col items-center justify-center px-6 pt-32 pb-24 relative z-10 w-full max-w-7xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16 space-y-6 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full glass-panel border-white/5 text-emerald-300 text-xs font-semibold tracking-wider uppercase mb-4 animate-pulse">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Next-Gen Intelligence</span>
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white tracking-tighter leading-[0.9] mb-6">
              Dream Specific. <br />
              <span className="text-gradient">Travel Smarter.</span>
            </h1>

            <p className="text-xl text-slate-400 font-light max-w-xl mx-auto leading-relaxed">
              Aetheria synthesizes the world&apos;s knowledge to craft itineraries that feel genuinely human, yet powered by machine precision.
            </p>
          </div>

          {/* AI Prompt Field */}
          <div className="w-full max-w-2xl mb-24">
            <PromptInput />
          </div>

          {/* Recent Explorations */}
          <div className="w-full space-y-8">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-500">Recent Syntheses</h2>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent mx-8"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {plans.map((plan) => (
                <Link key={plan.slug} href={`/plan/${plan.slug}`}>
                  <div className="group relative aspect-[4/5] rounded-[2rem] overflow-hidden glass-panel hover:glow-border transition-all duration-500">
                    <Image
                      src={plan.image}
                      alt={plan.destination}
                      fill
                      className="absolute inset-0 w-full h-full object-cover opacity-60 grayscale-[20%] group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-[#030712] via-[#030712]/40 to-transparent"></div>

                    <div className="absolute top-6 right-6 glass-panel px-4 py-2 rounded-2xl text-[10px] uppercase font-bold tracking-widest text-emerald-300">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3" />
                        {plan.days} Days
                      </div>
                    </div>

                    <div className="absolute bottom-0 left-0 p-8 w-full text-left">
                      <p className="text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em] mb-3">Verified Experience</p>
                      <h3 className="text-3xl font-bold text-white tracking-tight leading-tight mb-2 group-hover:text-emerald-300 transition-colors">
                        {plan.destination}
                      </h3>
                      <p className="text-slate-400 text-sm line-clamp-2 font-light leading-relaxed">
                        {plan.description}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </main>

        {/* Global Footer */}
        <footer className="w-full py-12 text-center relative z-10 border-t border-white/5">
          <p className="text-slate-500 text-xs font-light tracking-widest uppercase">
            Powered by Aetheria Neural Engine 2.0
          </p>
        </footer>
      </div>
    );
  } catch (error) {
    console.error("Database connection error:", error);
    return (
      <div className="p-8 text-center min-h-screen flex flex-col items-center justify-center bg-[#030712]">
        <h1 className="text-2xl font-bold text-emerald-400 glow-text mb-4">Neural Link Offline</h1>
        <p className="text-slate-500 font-light">Unable to synchronize with the knowledge base. Please try again soon.</p>
      </div>
    );
  }
}
