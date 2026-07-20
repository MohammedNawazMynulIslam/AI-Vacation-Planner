// app/components/TripMap.tsx
"use client";

import { useState, useMemo, useCallback } from "react";
import Map, { Marker, Popup, Source, Layer } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { MapPin, Navigation, Route, RotateCcw } from "lucide-react";

interface Activity {
  time: string;
  task: string;
  description: string;
  placeVerified?: boolean;
  placeData?: {
    lat: number;
    lng: number;
    address?: string;
    rating?: number;
  };
}

interface DayPlan {
  day: number;
  title: string;
  image?: string;
  hotel?: { name: string; starRating: string };
  activities: Activity[];
  travelTips?: string[];
}

interface TripMapProps {
  destination: string;
  itinerary: DayPlan[];
}

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

const COLORS = [
  "#10b981", // emerald
  "#6366f1", // indigo
  "#f59e0b", // amber
  "#ec4899", // pink
  "#06b6d4", // cyan
  "#8b5cf6", // violet
];

export default function TripMap({ destination, itinerary }: TripMapProps) {
  const [selectedDay, setSelectedDay] = useState(0);
  const [selectedMarker, setSelectedMarker] = useState<{
    activity: Activity;
    dayIndex: number;
    actIndex: number;
  } | null>(null);
  const [optimizedOrder, setOptimizedOrder] = useState<number[] | null>(null);

  // Filter activities that have real coordinates
  const dayActivities = useMemo(() => {
    const day = itinerary[selectedDay];
    if (!day) return [];
    return day.activities
      .map((a, i) => ({ ...a, originalIndex: i }))
      .filter((a) => a.placeData?.lat && a.placeData?.lng);
  }, [itinerary, selectedDay]);

  // Calculate route line coordinates
  const routeCoordinates = useMemo(() => {
    const order = optimizedOrder ?? dayActivities.map((_, i) => i);
    return order
      .map((idx) => dayActivities[idx])
      .filter(Boolean)
      .map((a) => [a.placeData!.lng, a.placeData!.lat]);
  }, [dayActivities, optimizedOrder]);

  // Greedy nearest-neighbor TSP solver
  const optimizeRoute = useCallback(() => {
    if (dayActivities.length < 3) return;

    const unvisited = new Set(dayActivities.map((_, i) => i));
    const order: number[] = [0];
    unvisited.delete(0);

    let current = 0;

    while (unvisited.size > 0) {
      let nearest = -1;
      let minDist = Infinity;

      const currAct = dayActivities[current];
      unvisited.forEach((idx) => {
        const act = dayActivities[idx];
        const d = haversine(
          currAct.placeData!.lat,
          currAct.placeData!.lng,
          act.placeData!.lat,
          act.placeData!.lng
        );
        if (d < minDist) {
          minDist = d;
          nearest = idx;
        }
      });

      if (nearest !== -1) {
        order.push(nearest);
        unvisited.delete(nearest);
        current = nearest;
      }
    }

    setOptimizedOrder(order);
  }, [dayActivities]);

  const resetRoute = () => setOptimizedOrder(null);

  // Map center on first activity of selected day
  const center = useMemo(() => {
    if (dayActivities.length > 0) {
      return {
        lat: dayActivities[0].placeData!.lat,
        lng: dayActivities[0].placeData!.lng,
      };
    }
    return { lat: 48.8566, lng: 2.3522 }; // fallback Paris
  }, [dayActivities]);

  if (!MAPBOX_TOKEN) {
    return (
      <div className="glass-panel rounded-3xl p-8 text-center text-slate-400">
        <MapPin className="w-8 h-8 mx-auto mb-3 text-slate-600" />
        <p>Mapbox token not configured. Add NEXT_PUBLIC_MAPBOX_TOKEN to your .env</p>
      </div>
    );
  }

  const dayColor = COLORS[selectedDay % COLORS.length];

  return (
    <div className="glass-panel rounded-[2.5rem] border-white/5 overflow-hidden">
      {/* Day Selector + Controls */}
      <div className="p-6 lg:p-8 border-b border-white/5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3 overflow-x-auto pb-2 lg:pb-0">
          <Route className="w-5 h-5 text-indigo-400 shrink-0" />
          <span className="text-xs font-black uppercase tracking-[0.2em] text-indigo-400 shrink-0">
            Route Map
          </span>
          <div className="h-4 w-px bg-white/10 mx-2 shrink-0" />
          {itinerary.map((day, i) => (
            <button
              key={i}
              onClick={() => {
                setSelectedDay(i);
                setOptimizedOrder(null);
                setSelectedMarker(null);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shrink-0 ${
                selectedDay === i
                  ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                  : "bg-white/5 text-slate-400 border border-white/5 hover:bg-white/10"
              }`}
            >
              Day {day.day}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {optimizedOrder ? (
            <button
              onClick={resetRoute}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-slate-300 hover:bg-white/10 transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Order
            </button>
          ) : (
            <button
              onClick={optimizeRoute}
              disabled={dayActivities.length < 3}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-400 hover:bg-emerald-500/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Navigation className="w-3.5 h-3.5" />
              Optimize Route
            </button>
          )}
          {optimizedOrder && (
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
              Optimized
            </span>
          )}
        </div>
      </div>

      {/* Map */}
      <div className="relative h-[500px] lg:h-[600px]">
        <Map
          mapboxAccessToken={MAPBOX_TOKEN}
          initialViewState={{
            latitude: center.lat,
            longitude: center.lng,
            zoom: 13,
          }}
          latitude={center.lat}
          longitude={center.lng}
          style={{ width: "100%", height: "100%" }}
          mapStyle="mapbox://styles/mapbox/dark-v11"
          attributionControl={false}
        >
          {/* Route Line */}
          {routeCoordinates.length > 1 && (
            <Source
              id="route"
              type="geojson"
              data={{
                type: "Feature",
                properties: {},
                geometry: {
                  type: "LineString",
                  coordinates: routeCoordinates,
                },
              }}
            >
              <Layer
                id="route-line"
                type="line"
                paint={{
                  "line-color": dayColor,
                  "line-width": 3,
                  "line-opacity": 0.8,
                  "line-dasharray": optimizedOrder ? [1, 0] : [2, 1],
                }}
              />
            </Source>
          )}

          {/* Activity Markers */}
          {(optimizedOrder ?? dayActivities.map((_, i) => i)).map(
            (idx, displayIdx) => {
              const activity = dayActivities[idx];
              if (!activity?.placeData) return null;

              const isSelected =
                selectedMarker?.activity.task === activity.task;

              return (
                <Marker
                  key={`${selectedDay}-${idx}`}
                  latitude={activity.placeData.lat}
                  longitude={activity.placeData.lng}
                  anchor="bottom"
                  onClick={(e) => {
                    e.originalEvent.stopPropagation();
                    setSelectedMarker({
                      activity,
                      dayIndex: selectedDay,
                      actIndex: idx,
                    });
                  }}
                >
                  <div
                    className={`flex flex-col items-center cursor-pointer transition-transform ${
                      isSelected ? "scale-125" : "hover:scale-110"
                    }`}
                  >
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black text-white shadow-lg border-2"
                      style={{
                        backgroundColor: dayColor,
                        borderColor: "rgba(255,255,255,0.2)",
                      }}
                    >
                      {displayIdx + 1}
                    </div>
                    <div
                      className="w-0.5 h-3"
                      style={{ backgroundColor: dayColor }}
                    />
                  </div>
                </Marker>
              );
            }
          )}

          {/* Popup */}
          {selectedMarker && (
            <Popup
              latitude={selectedMarker.activity.placeData!.lat}
              longitude={selectedMarker.activity.placeData!.lng}
              anchor="top"
              onClose={() => setSelectedMarker(null)}
              closeButton={false}
              className="z-50"
            >
              <div className="bg-[#0f172a] border border-white/10 rounded-xl p-4 min-w-[220px] text-slate-200">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-emerald-400" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
                    Stop {selectedMarker.actIndex + 1}
                  </span>
                </div>
                <h4 className="font-bold text-white mb-1">
                  {selectedMarker.activity.task}
                </h4>
                <p className="text-xs text-slate-400 mb-2">
                  {selectedMarker.activity.description}
                </p>
                <div className="flex items-center justify-between text-[10px] text-slate-500">
                  <span>{selectedMarker.activity.time}</span>
                  {selectedMarker.activity.placeData?.rating && (
                    <span className="text-amber-400">
                      ★ {selectedMarker.activity.placeData.rating}
                    </span>
                  )}
                </div>
              </div>
            </Popup>
          )}
        </Map>

        {/* Stats Overlay */}
        <div className="absolute bottom-6 left-6 glass-panel px-4 py-3 rounded-2xl border-white/10">
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: dayColor }}
              />
              <span className="text-slate-400">
                {dayActivities.length} verified stops
              </span>
            </div>
            {optimizedOrder && (
              <div className="flex items-center gap-2">
                <Navigation className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-400 font-bold">Optimized</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Helpers ──

function haversine(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}