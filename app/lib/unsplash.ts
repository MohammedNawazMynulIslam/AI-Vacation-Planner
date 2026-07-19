import axios from "axios";

const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;

interface ImageFetchInput {
  destination: string;
  queries: string[];
}

export async function fetchUnsplashImages({ destination, queries }: ImageFetchInput) {
  if (!UNSPLASH_ACCESS_KEY) {
    throw new Error("UNSPLASH_ACCESS_KEY not set");
  }

  // Fetch hero image
  const heroRes = await axios.get("https://api.unsplash.com/search/photos", {
    params: { query: destination, per_page: 1, orientation: "landscape" },
    headers: { Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}` },
  });
  const hero = heroRes.data.results[0]?.urls?.regular || null;

  // Fetch per-day images (batch with Promise.all)
  const dayImages = await Promise.all(
    queries.map(async (q) => {
      try {
        const res = await axios.get("https://api.unsplash.com/search/photos", {
          params: { query: q, per_page: 1 },
          headers: { Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}` },
        });
        return res.data.results[0]?.urls?.regular || hero;
      } catch {
        return hero;
      }
    })
  );

  return { hero, days: dayImages };
}