"use client";

import { Share2 } from "lucide-react";

export default function ShareButton() {
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: document.title,
        url: window.location.href,
      }).catch(console.error);
    } else {
      const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`;
      window.open(facebookShareUrl, '_blank', 'width=600,height=400');
    }
  };

  return (
    <button
      onClick={handleShare}
      className="flex items-center gap-2.5 px-6 py-2.5 rounded-full glass-panel border-white/10 text-white hover:bg-white/10 hover:glow-border transition-all duration-300 group"
    >
      <Share2 className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
      <span className="text-xs font-bold uppercase tracking-widest">Share Synthesis</span>
    </button>
  );
}
