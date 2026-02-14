# Aetheria - Next-Gen AI Travel Planner 🌌

Aetheria is a premium, high-tech travel synthesis engine that crafts highly detailed, destination-agnostic itineraries. It moves beyond generic travel advice, leveraging deep neural synthesis to provide specific landmarks, real hotel recommendations, and contextual travel tips.

![Aetheria Hero](/assets/homepage.png)

## ✨ Features

- **Neural Synthesis**: Destination-agnostic AI that generates deep, human-like itineraries for any location on Earth.
- **Glassmorphic UI**: A modern, sleek interface with glowing accents, dark theme gradients, and premium typography.
- **Rich Data Integration**:
  - **Daily Real Hotels**: Hand-picked hotel recommendations with star ratings.
  - **Procedural Tips**: Contextual advice on transport, culture, and timing for every day.
  - **Neural Gastronomy**: Destination-specific culinary guides.
- **Dynamic Imagery**: Unique, per-day visuals that match your specific itinerary activities.
- **Shareable Links**: Share your synthesized journeys instantly.

![Aetheria Itinerary](/assets/planpageheader.png)

## 🛠️ Technical Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Intelligence**: [Google Gemini Pro API](https://ai.google.dev/)
- **Visuals**: [Unsplash API](https://unsplash.com/developers)
- **Database**: [MongoDB Atlas](https://www.mongodb.com/atlas) with Mongoose
- **Styling**: Tailwind CSS with custom Glassmorphism & Mesh Gradient systems
- **Icons**: Lucide React

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 18+ 
- MongoDB Atlas account
- Gemini API Key
- Unsplash Access Key

### 2. Environment Setup
Create a `.env` file in the root directory:
```env
MONGODB_URI=your_mongodb_uri
GEMINI_API_KEY=your_gemini_key
UNSPLASH_ACCESS_KEY=your_unsplash_key
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 3. Installation & Run
```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to enter the Aetheria Matrix.

## 📸 Interface Showcase

| Core Experience | Procedural Synthesis |
| :--- | :--- |
| ![Main Body](/assets/mainbody.png) | ![Plan Section](/assets/plansection.png) |

---
© 2026 Aetheria Intelligent Labs. Synthesized for the modern explorer.
