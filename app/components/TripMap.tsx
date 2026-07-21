"use client";

import { useState, useMemo, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin, Navigation, Route, RotateCcw } from "lucide-react";
import L from "leaflet";

// ── Fix Leaflet default icons in Next.js ──
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: icon.src,
  shadowUrl: iconShadow.src,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

// ── Custom numbered marker ──
function createNumberedMarker(number: number, color: string) {
  return L.divIcon({
    className: "custom-marker",
    html: `
      <div style="
        width: 32px;
        height: 32px;
        background: ${color};
        border: 2px solid rgba(255,255,255,0.3);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 12px;
        font-weight: 900;
        box-shadow: 0 4px 12px rgba(0,0,0,0.5);
      ">${number}</div>
      <div style="
        width: 2px;
        height: 8px;
        background: ${color};
        margin: -2px auto 0;
      "></div>
    `,
    iconSize: [32, 42],
    iconAnchor: [16, 42],
    popupAnchor: [0, -42],
  });
}

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

const COLORS = [
  "#10b981", // emerald
  "#6366f1", // indigo
  "#f59e0b", // amber
  "#ec4899", // pink
  "#06b6d4", // cyan
  "#8b5cf6", // violet
];

// ── Map recenter helper ──
function MapRecenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  map.setView([lat, lng], 14);
  return null;
}

export default function TripMap({ destination, itinerary }: TripMapProps) {
  const [selectedDay, setSelectedDay] = useState(0);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [optimizedOrder, setOptimizedOrder] = useState<number[] | null>(null);

  const dayActivities = useMemo(() => {
    const day = itinerary[selectedDay];
    if (!day) return [];
    return day.activities
      .map((a, i) => ({ ...a, originalIndex: i }))
      .filter((a) => a.placeData?.lat && a.placeData?.lng);
  }, [itinerary, selectedDay]);

  const routePositions = useMemo(() => {
    const order = optimizedOrder ?? dayActivities.map((_, i) => i);
    return order
      .map((idx) => dayActivities[idx])
      .filter(Boolean)
      .map((a) => [a.placeData!.lat, a.placeData!.lng] as [number, number]);
  }, [dayActivities, optimizedOrder]);

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

  const resetRoute = () => {
    setOptimizedOrder(null);
    setSelectedActivity(null);
  };

  const center = useMemo(() => {
    if (dayActivities.length > 0) {
      return {
        lat: dayActivities[0].placeData!.lat,
        lng: dayActivities[0].placeData!.lng,
      };
    }
    return { lat: 48.8566, lng: 2.3522 }; // fallback Paris
  }, [dayActivities]);

  const dayColor = COLORS[selectedDay % COLORS.length];

  if (dayActivities.length === 0) {
    return (
      <div className="glass-panel rounded-[2.5rem] p-12 text-center text-slate-400 border-white/5">
        <MapPin className="w-10 h-10 mx-auto mb-4 text-slate-600" />
        <p className="text-lg font-light mb-2">No verified locations for this day</p>
        <p className="text-sm text-slate-600">
          Places couldn't be cross-referenced with Google Maps for mapping.
        </p>
      </div>
    );
  }

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
                setSelectedActivity(null);
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

      {/* Leaflet Map */}
      <div className="relative h-[500px] lg:h-[600px] bg-[#0f172a]">
        <MapContainer
          center={[center.lat, center.lng]}
          zoom={14}
          scrollWheelZoom={true}
          style={{ width: "100%", height: "100%", background: "#0f172a" }}
          zoomControl={false}
        >
          <MapRecenter lat={center.lat} lng={center.lng} />

          {/* Dark theme tiles — FREE, no API key */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            subdomains="abcd"
            maxZoom={20}
          />

          {/* Route Line */}
          {routePositions.length > 1 && (
            <Polyline
              positions={routePositions}
              pathOptions={{
                color: dayColor,
                weight: 3,
                opacity: 0.8,
                dashArray: optimizedOrder ? undefined : "6, 8",
              }}
            />
          )}

          {/* Activity Markers */}
          {(optimizedOrder ?? dayActivities.map((_, i) => i)).map(
            (idx, displayIdx) => {
              const activity = dayActivities[idx];
              if (!activity?.placeData) return null;

              return (
                <Marker
                  key={`${selectedDay}-${idx}`}
                  position={[activity.placeData.lat, activity.placeData.lng]}
                  icon={createNumberedMarker(displayIdx + 1, dayColor)}
                  eventHandlers={{
                    click: () => setSelectedActivity(activity),
                  }}
                >
                  <Popup className="custom-popup">
                    <div className="min-w-[200px]">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="w-4 h-4 text-emerald-400" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
                          Stop {displayIdx + 1}
                        </span>
                      </div>
                      <h4 className="font-bold text-white mb-1 text-sm">
                        {activity.task}
                      </h4>
                      <p className="text-xs text-slate-400 mb-2 leading-relaxed">
                        {activity.description}
                      </p>
                      <div className="flex items-center justify-between text-[10px] text-slate-500">
                        <span>{activity.time}</span>
                        {activity.placeData?.rating && (
                          <span className="text-amber-400 font-bold">
                            ★ {activity.placeData.rating}
                          </span>
                        )}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            }
          )}
        </MapContainer>

        {/* Stats Overlay */}
        <div className="absolute bottom-6 left-6 glass-panel px-4 py-3 rounded-2xl border-white/10 z-[400]">
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

function haversine(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
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