import mongoose from "mongoose";

const TravelPlanSchema = new mongoose.Schema(
  {
    destination: String,
    days: Number,
    slug: { type: String, unique: true },
    highlights: Array,
    gastronomy: String,
    smartTravel: String,
    budget: {
      min: Number,
      max: Number,
    },
    itinerary: Array, // Stores objects with { day, title, image, hotel, activities, travelTips }
    image: String,
    description: String,
  },
  { timestamps: true }
);

export default mongoose.models.TravelPlan ||
  mongoose.model("TravelPlan", TravelPlanSchema);
