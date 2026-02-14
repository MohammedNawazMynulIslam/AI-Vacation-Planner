import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Generate travel plan
export async function generateTravelPlan(destination, days) {
  try {
    // Try using gemini-1.5-flash as it might have different rate limits or be more stable
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    //     const prompt = `
    // Create a ${days}-day travel plan for ${destination}.
    // Return ONLY valid JSON in this format:

    // {
    //   "description": "A deep, enticing intro about the destination and the trip",
    //   "highlights": [
    //     { "title": "Specific Landmark Name", "rating": "4.8 ★" },
    //     { "title": "Unique Activity Name", "rating": "4.9 ★" },
    //     { "title": "Hidden Gem Name", "rating": "4.7 ★" }
    //   ],
    //   "gastronomy": "Specific must-try dishes and famous food districts.",
    //   "smartTravel": "Specific local tips, transport hacks, and cultural etiquette.",
    //   "budget": {
    //     "min": 500,
    //     "max": 800
    //   },
    //   "itinerary": [
    //     {
    //       "day": 1,
    //       "title": "Specific focus of the day",
    //       "dayImageQuery": "A specific search term for an image of this day's highlight (e.g. 'Colosseum Rome')",
    //       "activities": [
    //         {
    //           "time": "09:00 AM",
    //           "task": "Specific activity",
    //           "description": "Unique detail about this activity"
    //         }
    //       ]
    //     }
    //   ]
    // }

    // CRITICAL RULES:
    // 1. DO NOT use generic terms like 'City Center', 'Local Cuisine', or 'Historic Landmarks' as highlight titles. Be specific.
    // 2. The 'dayImageQuery' should be a search term and MUST include the destination name for better image matching.
    // 3. Ensure all content is tailored specifically to ${destination}.
    // 4. Return EXACTLY 3 highlights.
    // Do not include any explanation or markdown.
    // `;
    const prompt = `
Create a highly detailed, professional, and non-generic ${days}-day travel itinerary for ${destination}.

STRICT RULES:
- Do NOT use generic phrases like "City Center", "Local Cuisine", "Explore the Area", or "Visit Popular Attractions".
- Every highlight and activity MUST include specific real landmark names.
- Include a mix of iconic landmarks and lesser-known hidden gems.
- Mention specific neighborhoods, temples, streets, or districts.
- Include a real hotel recommendation with its star rating.
- Include practical travel tips (transport pass, best time to visit, reservation advice).
- Each day must feel unique and distinct.
- Tailor everything specifically to ${destination}.

Return ONLY valid JSON in this exact format:

{
  "description": "A deep, enticing 2-sentence introduction about the destination and the trip.",
  "highlights": [
    { "title": "Specific Landmark Name", "rating": "4.8 ★" },
    { "title": "Unique Activity Name", "rating": "4.9 ★" },
    { "title": "Hidden Gem Name", "rating": "4.7 ★" }
  ],
  "gastronomy": "Specific must-try dishes and famous food districts in ${destination}.",
  "smartTravel": "Specific local tips, transport hacks, and cultural etiquette for ${destination}.",
  "budget": {
    "min": 500,
    "max": 800
  },
  "itinerary": [
    {
      "day": 1,
      "title": "Specific and unique title (e.g., 'Sunset at the Rialto Bridge')",
      "imageQuery": "Highly specific Unsplash search query (e.g., 'Rialto Bridge Venice')",
      "hotel": {
        "name": "Real hotel name",
        "starRating": "4-star"
      },
      "activities": [
        {
          "time": "09:00 AM",
          "task": "Specific landmark or activity",
          "description": "Unique detail about this activity."
        },
        {
          "time": "01:00 PM",
          "task": "Specific dining area or activity",
          "description": "Helpful tip or detail."
        },
        {
          "time": "07:00 PM",
          "task": "Evening experience",
          "description": "Specific recommendation."
        }
      ],
      "travelTips": [
        "Specific transportation advice",
        "Booking or timing tip",
        "Local cultural etiquette tip"
      ]
    }
  ]
}

CRITICAL RULES:
1. All landmark and hotel names MUST be real and specific to ${destination}.
2. The 'imageQuery' MUST include ${destination} and a specific landmark for better image matching.
3. Return EXACTLY 3 highlights.
4. No markdown. No explanation outside JSON.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    text = text.replace(/```json|```/g, "").trim();

    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini generateTravelPlan error:", error);

    // 🚨 FALLBACK: If API fails (Quota Exceeded), return valid mock data
    // This ensures the user ALWAYS sees a result.
    console.warn("Generating fallback plan due to API error.");

    const fallbackPlan = {
      description: `Experience the magic of ${destination}. Although our AI travel agent is currently busy, we've outlined a standard itinerary for you to enjoy the best of this location.`,
      highlights: [
        { title: "City Center", rating: "4.8 ★" },
        { title: "Local Cuisine", rating: "4.7 ★" },
        { title: "Historic Landmarks", rating: "4.9 ★" }
      ],
      gastronomy: `Try the famous local dishes of ${destination} at a nearby restaurant in the heart of the city.`,
      smartTravel: `Start your day exploring the main landmarks of ${destination} and use local transport for an authentic experience.`,
      budget: {
        min: days * 100,
        max: days * 200
      },
      itinerary: Array.from({ length: days }, (_, i) => ({
        day: i + 1,
        title: `Exploring the Best of ${destination} - Day ${i + 1}`,
        dayImageQuery: `${destination} landmark`,
        activities: [
          { time: "09:00 AM", task: `${destination} City Tour`, description: "Start your day exploring the main landmarks." },
          { time: "01:00 PM", task: "Local Lunch", description: `Try the famous local dishes of ${destination} at a nearby restaurant.` },
          { time: "06:00 PM", task: "Sunset Walk", description: "Enjoy a relaxing walk and soak in the atmosphere." },
        ]
      }))
    };

    return fallbackPlan;
  }
}

// Extract travel details
export async function extractTravelDetails(promptText) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const systemPrompt = `
Extract ONLY the destination and number of days from:

"${promptText}"

Check if this is a travel-related request.

Return absolutely valid JSON:

{
  "destination": "City or Country",
  "days": Number,
  "isTravelRelated": Boolean
}

If it is NOT travel related, set isTravelRelated to false and destination to null.
Do NOT include any extra text or markdown.
`;

    const genResult = await model.generateContent(systemPrompt);
    const response = await genResult.response;
    let text = response.text();
    text = text.replace(/```json|```/g, "").trim();

    const result = JSON.parse(text);

    if (!result.isTravelRelated) {
      return { isTravelRelated: false };
    }

    if (!result.destination) throw new Error("No destination found");

    return {
      destination: result.destination.trim(),
      days: result.days || 3,
      isTravelRelated: true,
    };
  } catch (error) {
    console.error("Gemini extractTravelDetails error:", error);

    // 🔥 SMART FALLBACK (no AI required)

    // Extract number of days
    const daysMatch = promptText.match(/(\d+)\s*day/i);
    const days = daysMatch ? parseInt(daysMatch[1]) : 3;

    // Extract destination after "in" or "to"
    const locationMatch = promptText.match(
      /(?:in|to)\s+([A-Za-z\s]+?)(?:\s+for|\s+\d+|\.$|$)/i
    );

    const destination = locationMatch
      ? locationMatch[1].trim()
      : promptText.replace(/^\d+\s*days?\s*/i, "").trim();

    return {
      destination,
      days,
      isTravelRelated: !!destination,
    };
  }
}

