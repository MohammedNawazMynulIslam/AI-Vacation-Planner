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

const TravelPlanSchema = new mongoose.Schema<ITravelPlan>(
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
    itinerary: Array,
    image: String,
    description: String,
  },
  { timestamps: true }
);

const TravelPlan: Model<ITravelPlan> =
  (mongoose.models.TravelPlan as Model<ITravelPlan>) ||
  mongoose.model<ITravelPlan>("TravelPlan", TravelPlanSchema);

export default TravelPlan;
