// app/actions/generateItinerary.ts
"use server";

import { after } from "next/server";
import { z } from "zod";
import slugify from "slugify";
import { connectDB } from "@/lib/db";
import { geminiModel } from "@/lib/gemini";
import { validateItinerary } from "@/lib/places";
import { fetchWeatherForecast } from "@/lib/weather";
import TravelPlan from "@/models/TravelPlan";
import { fetchUnsplashImages } from "@/lib/unsplash";


const ActivitySchema = z.object({
  time: z.string(),
  task: z.string(),
  description: z.string(),
});

const HotelSchema = z.object({
  name: z.string(),
  starRating: z.string(),
});

const DayPlanSchema = z.object({
  day: z.number().min(1),
  title: z.string().min(1),
  imageQuery: z.string().min(1),
  hotel: HotelSchema,
  activities: z.array(ActivitySchema).min(1),
  travelTips: z.array(z.string()),
});

const GeminiResponseSchema = z.object({
  description: z.string().min(1),
  highlights: z
    .array(z.object({ title: z.string(), rating: z.string() }))
    .length(3),
  gastronomy: z.string(),
  smartTravel: z.string(),
  budget: z.object({ min: z.number(), max: z.number() }),
  itinerary: z.array(DayPlanSchema).min(1),
});

export async function extractTravelDetails(promptText: string) {
  try {
    const systemPrompt = `
Extract the destination and number of days from this travel request.
Check if it is travel-related.

Return JSON only:
{
  "destination": "City or Country name",
  "days": number,
  "isTravelRelated": boolean
}

If NOT travel-related, return:
{ "destination": null, "days": 0, "isTravelRelated": false }

User request: "${promptText}"
`;

    const result = await geminiExtractModel.generateContent(systemPrompt);
    const parsed = JSON.parse(result.response.text());

    const validated = z
      .object({
        destination: z.string().nullable(),
        days: z.number(),
        isTravelRelated: z.boolean(),
      })
      .parse(parsed);

    return validated;
  } catch (error) {
    console.error("Extract error:", error);
    const daysMatch = promptText.match(/(\d+)\s*day/i);
    const days = daysMatch ? parseInt(daysMatch[1]) : 3;
    const locationMatch = promptText.match(
      /(?:in|to)\s+([A-Za-z\s]+?)(?:\s+for|\s+\d+|\.$|$)/i
    );
    const destination = locationMatch
      ? locationMatch[1].trim()
      : promptText.replace(/^\d+\s*days?\s*/i, "").trim();

    return { destination, days, isTravelRelated: !!destination };
  }
}

export async function createItinerary(userPrompt: string) {
  try {
    await connectDB();

    const details = await extractTravelDetails(userPrompt);

    if (!details.isTravelRelated || !details.destination) {
      throw new Error("That doesn't look like a travel request. Try: '5 days in Tokyo'");
    }

    const { destination, days } = details;

    // ── GENERATE AI ITINERARY ──
    const prompt = `
Create a highly detailed, professional ${days}-day travel itinerary for ${destination}.

STRICT RULES:
- Do NOT use generic phrases like "City Center", "Local Cuisine", "Explore the Area".
- Every highlight and activity MUST include specific real landmark names.
- Include a mix of iconic landmarks and hidden gems.
- Mention specific neighborhoods, streets, or districts.
- Include a real hotel recommendation with its star rating.
- Each day must feel unique and distinct.

Return ONLY valid JSON in this exact format:

{
  "description": "A deep, enticing 2-sentence introduction.",
  "highlights": [
    { "title": "Specific Landmark Name", "rating": "4.8 ★" },
    { "title": "Unique Activity Name", "rating": "4.9 ★" },
    { "title": "Hidden Gem Name", "rating": "4.7 ★" }
  ],
  "gastronomy": "Specific must-try dishes and famous food districts in ${destination}.",
  "smartTravel": "Specific local tips, transport hacks, and cultural etiquette.",
  "budget": { "min": 500, "max": 800 },
  "itinerary": [
    {
      "day": 1,
      "title": "Specific unique title",
      "imageQuery": "Highly specific Unsplash search query including ${destination}",
      "hotel": { "name": "Real hotel name", "starRating": "4-star" },
      "activities": [
        { "time": "09:00 AM", "task": "Specific landmark", "description": "Unique detail." },
        { "time": "01:00 PM", "task": "Specific dining", "description": "Helpful tip." },
        { "time": "07:00 PM", "task": "Evening experience", "description": "Specific recommendation." }
      ],
      "travelTips": [
        "Transportation advice",
        "Booking tip",
        "Cultural etiquette"
      ]
    }
  ]
}
`;

    const result = await geminiModel.generateContent(prompt);
    const parsed = JSON.parse(result.response.text());
    const validated = GeminiResponseSchema.parse(parsed);

    // ── VALIDATE PLACES AGAINST GOOGLE PLACES ──
    const { itinerary: validatedItinerary, stats } = await validateItinerary(
      destination,
      validated.itinerary
    );

    // ── FETCH WEATHER ──
    const weather = await fetchWeatherForecast(destination, days);

    // ── GENERATE SLUG ──
    const baseSlug = slugify(`${destination}-${days}-days`, { lower: true });
    let slug = baseSlug;
    let counter = 1;
    while (await TravelPlan.exists({ slug })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // ── SAVE TO MONGODB ──
    const plan = await TravelPlan.create({
      destination,
      days,
      slug,
      description: validated.description,
      highlights: validated.highlights,
      gastronomy: validated.gastronomy,
      smartTravel: validated.smartTravel,
      budget: validated.budget,
      itinerary: validatedItinerary.map((day: any) => ({
        day: day.day,
        title: day.title,
        image: day.imageQuery,
        hotel: day.hotel,
        activities: day.activities,
        travelTips: day.travelTips,
      })),
      image: null,
      weather,
      validationStatus: stats,
    });

    // ── BACKGROUND: UNSPLASH IMAGES ──
    after(async () => {
      try {
        const images = await fetchUnsplashImages({
          destination,
          queries: validated.itinerary.map((d) => d.imageQuery),
        });

        await TravelPlan.findByIdAndUpdate(plan._id, {
          image: images.hero,
          itinerary: validatedItinerary.map((day: any, idx: number) => ({
            day: day.day,
            title: day.title,
            image: images.days[idx] || images.hero,
            hotel: day.hotel,
            activities: day.activities,
            travelTips: day.travelTips,
          })),
        });
      } catch (err) {
        console.error(`[after] Image fetch failed:`, err);
      }
    });

    return { success: true, slug: plan.slug };
  } catch (error: any) {
    console.error("createItinerary error:", error);
    return {
      success: false,
      error: error.message || "Failed to generate itinerary",
    };
  }
}