import TravelPlan from "@/models/TravelPlan";
import { connectDB } from "@/lib/db";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Sparkles, Clock, TowerControl, Frame, Crown,
  Croissant, Lightbulb, Wallet, Hotel, Compass,
  MapPin, CheckCircle2, ChevronRight, Zap
} from "lucide-react";
import ShareButton from "@/components/ShareButton";

export async function generateMetadata({ params }) {
  await connectDB();
  const plan = await TravelPlan.findOne({ slug: params.slug });

  if (!plan) {
    return {
      title: "Plan Not Found - Aetheria",
    };
  }

  return {
    title: `${plan.destination} Itinerary - Aetheria`,
    description: `AI-Synthesized ${plan.days}-day travel plan for ${plan.destination}.`,
    openGraph: {
      title: `${plan.days} Days in ${plan.destination}`,
      description: plan.description,
      images: [{ url: plan.image }],
      type: "article",
    },
  };
}

export default async function PlanPage({ params }) {
  await connectDB();
  const plan = await TravelPlan.findOne({ slug: params.slug });

  if (!plan) return notFound();

  const budgetMin = plan.budget?.min || plan.days * 100;
  const budgetMax = plan.budget?.max || plan.days * 200;

  return (
    <div className="bg-[#030712] text-slate-200 min-h-screen relative overflow-hidden bg-mesh selection:bg-emerald-500/30">
      {/* Background Gradients */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-500/5 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/5 blur-[120px] rounded-full"></div>
      </div>

      {/* Navbar Overlay */}
      <nav className="absolute top-0 left-0 right-0 z-50 w-full py-8 px-8 lg:px-16 flex justify-between items-center transition-all">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative">
            <Sparkles className="w-7 h-7 text-emerald-400 relative z-10" />
            <div className="absolute inset-0 bg-emerald-400/30 blur-md rounded-full scale-110 group-hover:scale-150 transition-transform"></div>
          </div>
          <span className="text-xl font-bold tracking-tight text-white glow-text italic">Aetheria</span>
        </Link>
        <div className="glass-panel px-1 py-1 rounded-full border-white/5 flex items-center gap-2">
          <ShareButton />
        </div>
      </nav>

      {/* Hero Header */}
      <header className="relative w-full h-[90vh] min-h-[700px] flex items-end pb-24 px-8 lg:px-16 z-10 overflow-hidden">
        <Image
          src={plan.image}
          alt={plan.destination}
          fill
          priority
          className="absolute inset-0 w-full h-full object-cover transform scale-105 opacity-40 brightness-75"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#030712] via-[#030712]/40 to-transparent"></div>

        <div className="relative max-w-5xl space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full glass-panel border-white/10 text-emerald-300 text-[10px] font-bold tracking-[0.2em] uppercase">
            <Clock className="w-3.5 h-3.5" />
            <span>Neural Synthesis: {plan.days} Days in {plan.destination}</span>
          </div>

          <h1 className="text-6xl md:text-8xl lg:text-9xl font-black text-white tracking-tighter leading-[0.85]">
            {plan.destination} <br />
            <span className="text-gradient">Redefined.</span>
          </h1>

          <p className="text-xl text-slate-300 font-light max-w-2xl leading-relaxed">
            {plan.description}
          </p>
        </div>
      </header>

      {/* Meta Features Section */}
      <section className="relative z-10 py-32 px-8 lg:px-16 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-24">
          <div className="lg:col-span-12">
            <div className="flex items-center gap-4 mb-8">
              <div className="h-px w-12 bg-emerald-500/50"></div>
              <span className="text-xs font-bold uppercase tracking-[0.3em] text-emerald-400">Essential Intelligence</span>
            </div>
            <h2 className="text-4xl lg:text-6xl font-black text-white tracking-tight mb-8">
              Optimized for Your <br />Experience
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Dynamic Highlights */}
          {plan.highlights?.map((highlight, index) => (
            <div key={index} className="glass-panel p-8 rounded-[2rem] border-white/5 hover:glow-border transition-all duration-500 group">
              <div className={`w-14 h-14 flex items-center justify-center rounded-2xl mb-8 ${index % 3 === 0 ? 'bg-emerald-500/10 text-emerald-400' : index % 3 === 1 ? 'bg-indigo-500/10 text-indigo-400' : 'bg-amber-500/10 text-amber-400'}`}>
                {index % 3 === 0 ? <TowerControl className="w-7 h-7" /> : index % 3 === 1 ? <Frame className="w-7 h-7" /> : <Crown className="w-7 h-7" />}
              </div>
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-2xl font-bold text-white tracking-tight group-hover:text-emerald-300 transition-colors">
                  {highlight.title || highlight}
                </h3>
                {highlight.rating && (
                  <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-white/5 text-emerald-400 border border-emerald-500/20">
                    {highlight.rating}
                  </span>
                )}
              </div>
              <p className="text-slate-400 font-light leading-relaxed">
                Experience the magic and architectural grandeur of {highlight.title || highlight} through our curated perspective.
              </p>
            </div>
          ))}

          {/* Gastronomy */}
          <div className="glass-panel p-8 rounded-[2rem] border-white/5 group hover:glow-border transition-all duration-500">
            <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-rose-500/10 text-rose-400 mb-8">
              <Croissant className="w-7 h-7" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4 tracking-tight group-hover:text-rose-300 transition-colors">Gastronomy</h3>
            <p className="text-slate-400 font-light leading-relaxed">
              {plan.gastronomy || `Discover the sensory landscape of ${plan.destination} through its unique culinary identity.`}
            </p>
          </div>

          {/* Smart Travel */}
          <div className="glass-panel p-8 rounded-[2rem] border-white/5 group hover:glow-border transition-all duration-500">
            <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400 mb-8">
              <Lightbulb className="w-7 h-7" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4 tracking-tight group-hover:text-cyan-300 transition-colors">Neural Tips</h3>
            <p className="text-slate-400 font-light leading-relaxed">
              {plan.smartTravel || `Leverage local behavioral data and transport logistics to navigate ${plan.destination} flawlessly.`}
            </p>
          </div>

          {/* Budget */}
          <div className="glass-panel p-8 rounded-[2rem] border-white/5 group hover:glow-border transition-all duration-500">
            <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-violet-500/10 text-violet-400 mb-8">
              <Wallet className="w-7 h-7" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4 tracking-tight group-hover:text-violet-300 transition-colors">Budget Analysis</h3>
            <div className="space-y-2">
              <p className="text-3xl font-black text-white tracking-widest">
                ${budgetMin} - ${budgetMax}
              </p>
              <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Estimated USD / Person</p>
            </div>
          </div>
        </div>
      </section>

      {/* Dark Section: Procedural Itinerary */}
      <section className="relative z-10 bg-[#020617] py-32 px-8 lg:px-16 border-y border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-px w-12 bg-indigo-500/50"></div>
                <span className="text-xs font-bold uppercase tracking-[0.3em] text-indigo-400">Procedural Synthesis</span>
              </div>
              <h2 className="text-5xl lg:text-7xl font-black text-white tracking-tighter">
                Chronicle of <br />{plan.destination}
              </h2>
            </div>
            <div className="text-right">
              <span className="text-3xl font-black text-white/10 uppercase tracking-[0.5em]">{plan.days} Cycle</span>
            </div>
          </div>

          <div className="space-y-24">
            {plan.itinerary?.map((day, index) => (
              <div key={index} className="grid grid-cols-1 lg:grid-cols-2 gap-16 group">
                {/* Visual Anchor */}
                <div className="relative aspect-[16/10] rounded-[2.5rem] overflow-hidden glass-panel border-white/5 shadow-2xl">
                  <Image
                    src={day.image || plan.image}
                    alt={day.title}
                    fill
                    className="object-cover opacity-80 group-hover:scale-110 transition-transform duration-1000 grayscale-[30%] group-hover:grayscale-0"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#020617]/80 via-transparent to-transparent"></div>
                  <div className="absolute top-8 left-8 glass-panel px-6 py-3 rounded-2xl border-white/10">
                    <span className="text-3xl font-black text-emerald-400">{index + 1}</span>
                    <span className="text-xs text-slate-400 ml-2 uppercase font-bold tracking-widest">Day</span>
                  </div>
                </div>

                {/* Content Synthesis */}
                <div className="flex flex-col justify-center space-y-10">
                  <div className="space-y-4">
                    <h3 className="text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight group-hover:text-emerald-300 transition-colors">
                      {day.title}
                    </h3>

                    {day.hotel && (
                      <div className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
                        <Hotel className="w-4 h-4" />
                        <span>Anchor Point: {day.hotel.name} ({day.hotel.starRating})</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-8">
                    {day.activities?.map((activity, actIndex) => (
                      <div key={actIndex} className="flex gap-8 group/item">
                        <div className="flex flex-col items-center pt-1.5">
                          <div className={`w-3 h-3 rounded-full ${actIndex === 0 ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-white/10'} transition-all group-hover/item:scale-125`}></div>
                          {actIndex !== day.activities.length - 1 && (
                            <div className="w-px flex-1 bg-white/10 my-2"></div>
                          )}
                        </div>
                        <div className="space-y-1 pb-4">
                          <span className="text-[10px] uppercase font-black tracking-widest text-slate-500">{activity.time}</span>
                          <h4 className="text-xl font-bold text-white tracking-tight group-hover/item:text-emerald-300 transition-colors">{activity.task}</h4>
                          <p className="text-slate-400 font-light leading-relaxed max-w-lg">{activity.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {day.travelTips && day.travelTips.length > 0 && (
                    <div className="glass-panel p-6 rounded-3xl border-emerald-500/10 bg-emerald-500/[0.02]">
                      <div className="flex items-center gap-2 mb-4">
                        <Zap className="w-4 h-4 text-emerald-400" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">Contextual Advice</span>
                      </div>
                      <ul className="space-y-3">
                        {day.travelTips.map((tip, tipIdx) => (
                          <li key={tipIdx} className="flex items-start gap-3 text-sm text-slate-400 font-light italic">
                            <ChevronRight className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer Meta */}
      <footer className="relative z-10 bg-[#030712] py-32 px-8 lg:px-16 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-24">
            <div className="lg:col-span-2 space-y-8">
              <Link href="/" className="flex items-center gap-3 group">
                <div className="relative">
                  <Sparkles className="w-7 h-7 text-emerald-400 relative z-10" />
                  <div className="absolute inset-0 bg-emerald-400/30 blur-md rounded-full scale-110 group-hover:scale-150 transition-transform"></div>
                </div>
                <span className="text-xl font-bold tracking-tight text-white glow-text italic">Aetheria</span>
              </Link>
              <p className="text-xl text-slate-500 font-light max-w-xs leading-relaxed">
                Pioneering the synthesis of global intelligence for the modern explorer.
              </p>
            </div>

            <div className="space-y-6">
              <h4 className="text-xs font-bold uppercase tracking-widest text-white">Syntheses</h4>
              <ul className="space-y-4 text-slate-500 font-light">
                <li className="hover:text-emerald-400 transition-colors"><Link href="#">Personal Itineraries</Link></li>
                <li className="hover:text-emerald-400 transition-colors"><Link href="#">Dynamic Guides</Link></li>
                <li className="hover:text-emerald-400 transition-colors"><Link href="#">Neural Map Engine</Link></li>
              </ul>
            </div>

            <div className="space-y-6">
              <h4 className="text-xs font-bold uppercase tracking-widest text-white">Platform</h4>
              <ul className="space-y-4 text-slate-500 font-light">
                <li className="hover:text-emerald-400 transition-colors"><Link href="#">Documentation</Link></li>
                <li className="hover:text-emerald-400 transition-colors"><Link href="#">API Access</Link></li>
                <li className="hover:text-emerald-400 transition-colors"><Link href="#">Neural Updates</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
              © 2026 Aetheria Intelligent Labs. Synthesized in the Matrix.
            </p>
            <div className="flex gap-8 text-[10px] font-bold text-slate-600 uppercase tracking-widest">
              <Link href="#" className="hover:text-emerald-400 transition-colors">Privacy Neural Ethics</Link>
              <Link href="#" className="hover:text-emerald-400 transition-colors">Terms of Existence</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
