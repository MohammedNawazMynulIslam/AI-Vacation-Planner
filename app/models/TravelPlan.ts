import mongoose, { Model } from "mongoose";

interface ITravelPlan {
  destination: string;
  days: number;
  slug: string;
  highlights: any[];
  gastronomy: string;
  smartTravel: string;
  budget: { min: number; max: number };
  itinerary: any[];
  image: string;
  description: string;
}

const TravelPlanSchema = new mongoose.Schema(
  {
    destination: String,
    days: Number,
    slug: { type: String, unique: true },
    highlights: Array,
    gastronomy: String,
    smartTravel: String,
    budget: { min: Number, max: Number },
    itinerary: Array,
    image: String,
    description: String,
    // ── NEW FIELDS ──
    weather: {
      summary: String,       // "Rainy first 3 days, sunny after"
      forecast: [{
        date: String,        // "2026-07-20"
        temp: Number,        // 24
        condition: String,   // "light rain"
        icon: String,        // "10d"
      }]
    },
    validationStatus: {
      checkedAt: Date,
      totalActivities: Number,
      verifiedCount: Number,
      unverified: Array,     // [{ day, task, reason }]
    }
  },
  { timestamps: true }
);

const TravelPlan: Model<ITravelPlan> =
  (mongoose.models.TravelPlan as Model<ITravelPlan>) ||
  mongoose.model<ITravelPlan>("TravelPlan", TravelPlanSchema);

export default TravelPlan;
