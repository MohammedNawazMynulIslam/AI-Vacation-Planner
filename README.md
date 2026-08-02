# Aetheria - Next-Gen AI Travel Planner 🌌

Aetheria is a premium, high-tech travel synthesis engine that crafts highly detailed, destination-agnostic itineraries. It moves beyond generic travel advice, leveraging deep neural synthesis to provide specific landmarks, real hotel recommendations, contextual travel tips, live weather, verified places, and interactive route maps.

![Aetheria Home](/assets/newHomePage.png)

## ✨ Features

- **Neural Synthesis**: Destination-agnostic AI that generates deep, human-like itineraries for any location on Earth.
- **Glassmorphic UI**: A modern, sleek interface with glowing accents, dark theme gradients, and premium typography.
- **Rich Data Integration**:
  - **Daily Real Hotels**: Hand-picked hotel recommendations with star ratings.
  - **Procedural Tips**: Contextual advice on transport, culture, and timing for every day.
  - **Neural Gastronomy**: Destination-specific culinary guides.
- **Place Verification**: Every activity is cross-checked against the Google Places API, with a live "Verified Places" scoreboard flagging anything worth double-checking.
- **Live Weather Forecast**: Per-day weather forecasts and a human-readable travel summary powered by OpenWeatherMap.
- **Interactive Route Map**: Dark-themed Leaflet map with numbered activity markers, popups, and a built-in route optimizer (nearest-neighbor) to plan the most efficient order for each day.
- **Dynamic Imagery**: Unique, per-day visuals that match your specific itinerary activities.
- **PDF Export**: Download any synthesized itinerary as a beautifully formatted PDF.
- **Shareable Links**: Share your synthesized journeys instantly via Web Share API (or Facebook fallback).

## 🛠️ Technical Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router) with React 19
- **Intelligence**: [Google Gemini](https://ai.google.dev/) (`gemini-flash-latest` + `gemini-2.0-flash`) with Zod schema validation
- **Validation**: [Google Places API](https://developers.google.com/maps/documentation/places/web-service) for real-world place verification & geocoding
- **Weather**: [OpenWeatherMap API](https://openweathermap.org/)
- **Visuals**: [Unsplash API](https://unsplash.com/developers)
- **Maps**: [Leaflet](https://leafletjs.com/) + [react-leaflet](https://react-leaflet.js.org/) with CARTO dark tiles
- **PDF**: [@react-pdf/renderer](https://react-pdf.org/)
- **Database**: [MongoDB Atlas](https://www.mongodb.com/atlas) with Mongoose
- **Styling**: Tailwind CSS with custom Glassmorphism & Mesh Gradient systems
- **Icons**: Lucide React

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 18+
- MongoDB Atlas account
- Gemini API Key
- Google Places API Key
- OpenWeatherMap API Key
- Unsplash Access Key

### 2. Environment Setup
Create a `.env` file in the root directory:
```env
MONGODB_URI=your_mongodb_uri
GEMINI_API_KEY=your_gemini_key
UNSPLASH_ACCESS_KEY=your_unsplash_key
GOOGLE_PLACES_API_KEY=your_google_places_key
OPENWEATHER_API_KEY=your_openweather_key
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 3. Installation & Run
```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to enter the Aetheria Matrix.

## 📸 Interface Showcase

### Landing & Prompt
| Landing Page | AI Prompt Input |
| :--- | :--- |
| ![Homepage](/assets/homepage.png) | ![New Homepage](/assets/newHomePage.png) |

| Main Body |
| :--- |
| ![Main Body](/assets/mainbody.png) |

### Plan Details
| Plan Header | Procedural Synthesis |
| :--- | :--- |
| ![Plan Header](/assets/planpageheader.png) | ![Plan Section](/assets/plansection.png) |

| Activities Timeline |
| :--- |
| ![List of Activities](/assets/listofactivities.png) |

### Interactive Map & Weather
| Real-Time Route Map | Location List |
| :--- | :--- |
| ![Real-Time Map](/assets/realtimemap.png) | ![Location List](/assets/locationlist.png) |

| Location Details | Weather on the Day |
| :--- | :--- |
| ![Location Details](/assets/locationDetails.png) | ![Weather](/assets/weatherontheday.png) |

---
© 2026 Aetheria Intelligent Labs. Synthesized for the modern explorer.
