// app/components/WeatherWidget.tsx
"use client";

import { CloudSun, Droplets, Wind } from "lucide-react";

export default function WeatherWidget({ weather }: { weather: any }) {
  if (!weather) return null;

  return (
    <div className="glass-panel rounded-[2rem] p-8 border-white/5 h-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center">
            <CloudSun className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">
              Forecast
            </h3>
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">
              Live Weather Data
            </p>
          </div>
        </div>
        <p className="text-sm text-slate-400 max-w-xs text-right hidden lg:block">
          {weather.summary}
        </p>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2">
        {weather.forecast.map((day: any, i: number) => (
          <div
            key={i}
            className="flex-shrink-0 bg-white/[0.03] border border-white/5 rounded-2xl p-4 text-center min-w-[100px] hover:bg-white/[0.06] transition-colors"
          >
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">
              {new Date(day.date).toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}
            </p>
            <img
              src={`https://openweathermap.org/img/wn/${day.icon}@2x.png`}
              alt={day.condition}
              className="w-12 h-12 mx-auto"
            />
            <p className="text-2xl font-black text-white tracking-tighter mb-1">
              {day.temp}°
            </p>
            <p className="text-[10px] text-slate-500 capitalize mb-3">
              {day.description}
            </p>
            <div className="flex items-center justify-center gap-3 text-[10px] text-slate-600">
              <span className="flex items-center gap-1">
                <Droplets className="w-3 h-3" />
                {day.humidity}%
              </span>
              <span className="flex items-center gap-1">
                <Wind className="w-3 h-3" />
                {Math.round(day.windSpeed)}m/s
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}