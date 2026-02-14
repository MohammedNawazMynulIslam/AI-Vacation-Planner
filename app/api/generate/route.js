import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import slugify from "slugify";
import TravelPlan from "@/models/TravelPlan";
import { connectDB } from "@/lib/db";
import { generateTravelPlan, extractTravelDetails } from "@/lib/gemini";
import { getDestinationImage } from "@/lib/unsplash";

export async function POST(req) {


  try {
    await connectDB();

    const { prompt } = await req.json();
    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }



    const extractionResult = await extractTravelDetails(prompt);


    if (!extractionResult.isTravelRelated) {
      return NextResponse.json({ error: "I can only help with travel planning! Please ask me about a trip." }, { status: 400 });
    }

    const { destination, days } = extractionResult;

    if (!destination || destination === "Unknown") {
      return NextResponse.json({ error: "Could not find destination in your prompt. Please try something like 'Trip to Paris for 3 days'" }, { status: 400 });
    }

    // Check if already exists
    const slug = slugify(`${destination}-tour-${days}-days`, { lower: true });

    const existing = await TravelPlan.findOne({ slug });
    if (existing) {

      return NextResponse.json({ slug });
    }

    // Generate using Gemini

    let plan;
    try {
      plan = await generateTravelPlan(destination, days);

    } catch (geminiError) {
      console.error("Gemini Generation Error:", geminiError);
      return NextResponse.json(
        { error: "AI failed to generate plan. Please try again.", details: geminiError.message },
        { status: 500 }
      );
    }

    const image = await getDestinationImage(destination);

    // Fetch images for each day
    const itineraryWithImages = await Promise.all(
      plan.itinerary.map(async (day) => {
        const dayImage = await getDestinationImage(day.imageQuery || `${destination} ${day.title}`);
        return { ...day, image: dayImage || image };
      })
    );

    await TravelPlan.create({
      destination,
      days,
      slug,
      ...plan,
      itinerary: itineraryWithImages,
      image,
    });

    revalidatePath("/");

    return NextResponse.json({ slug });
  } catch (error) {
    console.error("Error in /api/generate:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}
