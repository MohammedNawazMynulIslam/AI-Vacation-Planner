// app/lib/places.ts
import axios from "axios";

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;

interface PlaceResult {
  name: string;
  formatted_address: string;
  place_id: string;
  rating?: number;
  lat: number;
  lng: number;
  photoReference?: string;
  verified: boolean;
}

// Simple in-memory cache (resets on deploy, good enough for MVP)
const cache = new Map<string, PlaceResult>();

export async function geocodeDestination(destination: string): Promise<{ lat: number; lng: number } | null> {
  if (!OPENWEATHER_API_KEY) return null;
  try {
    const { data } = await axios.get("https://api.openweathermap.org/geo/1.0/direct", {
      params: { q: destination, limit: 1, appid: OPENWEATHER_API_KEY },
      timeout: 5000,
    });
    if (data?.length > 0) {
      return { lat: data[0].lat, lng: data[0].lon };
    }
  } catch (err) {
    console.warn("Fallback geocode failed for destination:", destination, err);
  }
  return null;
}

export async function verifyPlace(
  placeName: string,
  destination: string
): Promise<PlaceResult | null> {
  if (!GOOGLE_PLACES_API_KEY) {
    console.warn("No GOOGLE_PLACES_API_KEY — skipping validation");
    return null;
  }

  const cacheKey = `${placeName}::${destination}`;
  if (cache.has(cacheKey)) return cache.get(cacheKey)!;

  try {
    // Text Search: "Eiffel Tower Paris"
    const query = `${placeName} ${destination}`;
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json`;
    
    const { data } = await axios.get(url, {
      params: { query, key: GOOGLE_PLACES_API_KEY },
      timeout: 5000,
    });

    if (data.status !== "OK" || data.results.length === 0) {
      cache.set(cacheKey, null as any);
      return null;
    }

    const result = data.results[0];
    const verified: PlaceResult = {
      name: result.name,
      formatted_address: result.formatted_address,
      place_id: result.place_id,
      rating: result.rating,
      lat: result.geometry.location.lat,
      lng: result.geometry.location.lng,
      photoReference: result.photos?.[0]?.photo_reference,
      verified: true,
    };

    cache.set(cacheKey, verified);
    return verified;
  } catch (err) {
    console.error(`Place validation failed for "${placeName}":`, err);
    return null;
  }
}

// Batch validate all activities in an itinerary
export async function validateItinerary(
  destination: string,
  itinerary: any[]
) {
  const unverified: any[] = [];
  let verifiedCount = 0;
  let destCoords: { lat: number; lng: number } | null = null;

  const enrichedItinerary = await Promise.all(
    itinerary.map(async (day) => {
      const enrichedActivities = await Promise.all(
        day.activities.map(async (activity: any) => {
          const isVerifiable =
            activity.task.length > 3 &&
            !activity.task.toLowerCase().includes("check-in") &&
            !activity.task.toLowerCase().includes("free time");

          if (!isVerifiable) {
            return { ...activity, placeVerified: false, placeData: null };
          }

          let place = await verifyPlace(activity.task, destination);

          if (!place && !destCoords) {
            destCoords = await geocodeDestination(destination);
          }

          if (place) {
            verifiedCount++;
            return {
              ...activity,
              placeVerified: true,
              placeData: {
                address: place.formatted_address,
                rating: place.rating,
                lat: place.lat,
                lng: place.lng,
                placeId: place.place_id,
              },
            };
          } else if (destCoords) {
            unverified.push({ day: day.day, task: activity.task });
            return {
              ...activity,
              placeVerified: false,
              placeData: {
                lat: destCoords.lat,
                lng: destCoords.lng,
                address: destination,
              },
            };
          } else {
            unverified.push({ day: day.day, task: activity.task });
            return { ...activity, placeVerified: false, placeData: null };
          }
        })
      );

      return { ...day, activities: enrichedActivities };
    })
  );

  return {
    itinerary: enrichedItinerary,
    stats: {
      totalActivities: itinerary.reduce(
        (sum, d) => sum + d.activities.length,
        0
      ),
      verifiedCount,
      unverified,
      checkedAt: new Date(),
    },
  };
}