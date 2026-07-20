// app/components/ValidationBadge.tsx
"use client";

import { ShieldCheck, ShieldAlert, MapPin } from "lucide-react";

export default function ValidationBadge({ stats }: { stats: any }) {
  if (!stats) return null;

  const { verifiedCount, totalActivities, unverified } = stats;
  const percent =
    totalActivities > 0
      ? Math.round((verifiedCount / totalActivities) * 100)
      : 0;

  return (
    <div className="glass-panel rounded-[2rem] p-8 border-white/5 h-full flex flex-col justify-center">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
          <ShieldCheck className="w-6 h-6 text-emerald-400" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white tracking-tight">
            Verified Places
          </h3>
          <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">
            Cross-checked with Google Maps
          </p>
        </div>
      </div>

      <div className="flex items-end gap-3 mb-6">
        <span className="text-5xl font-black text-white tracking-tighter">
          {percent}%
        </span>
        <span className="text-sm text-slate-400 mb-2">
          {verifiedCount}/{totalActivities} confirmed real
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden mb-6">
        <div
          className="h-full bg-emerald-500 rounded-full transition-all duration-1000"
          style={{ width: `${percent}%` }}
        />
      </div>

      {unverified?.length > 0 && (
        <div className="pt-4 border-t border-white/5">
          <div className="flex items-center gap-2 mb-3">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              Verify Before Visiting
            </span>
          </div>
          <ul className="space-y-2">
            {unverified.slice(0, 3).map((item: any, i: number) => (
              <li
                key={i}
                className="flex items-center gap-2 text-xs text-slate-400"
              >
                <MapPin className="w-3 h-3 text-slate-600 shrink-0" />
                <span className="truncate">
                  Day {item.day}: {item.task}
                </span>
              </li>
            ))}
            {unverified.length > 3 && (
              <li className="text-[10px] text-slate-600 pl-5">
                +{unverified.length - 3} more
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}