# TravelGPT Pro ✈️🌏

An **AI-Native Multi-Agent Travel Copilot** that creates personalized trip itineraries, manages travel budgets, reorders schedules with drag-and-drop, converts live currencies, and provides real-time travel intelligence.

---

## ✨ Key Features

- **🤖 AI Multi-Agent Itinerary Generation**: Powered by Gemini AI models to generate tailored, day-by-day travel schedules with precise time slots, locations, cost estimations, and activity categories.
- **⚡ Interactive Drag & Drop Reordering**: Reorder activities seamlessly within your daily itinerary using `@dnd-kit`.
- **⏰ Direct Time Editing**: Edit activity time slots directly from the schedule list.
- **💱 Live Global Currency Converter**: Dashboard and itinerary integration for real-time exchange rates across global currencies (USD, EUR, GBP, JPY, AUD, CAD, SGD, THB, INR, etc.).
- **🌱 Advanced Personalization & Special Dietary Options**: Customize trip generation with specific tags like Veg/Vegan Diet, Baby & Toddler Friendly, Wheelchair Accessible, Halal Food, Pet Friendly, Eco-Friendly, and custom user requirements.
- **☀️ Live Weather Intelligence Agent**: Real-time forecasts, temperature unit toggles (°C/°F), humidity, wind, and smart activity recommendations.
- **✈️ Flight & Hotel Intelligence**: Explore flight options, hotel recommendations, and cost breakdown.
- **🧳 Visa & Packing Assistant**: Automated packing checklist generator tailored to trip length, weather, and destination.
- **📝 Interactive Travel Journal**: Document memories, upload logs, and track daily spend against your overall budget.

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v18.0.0 or higher
- **npm** or **yarn** / **pnpm**
- **Gemini API Key** (for server-side AI generation)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/travelgpt-pro.git
   cd travelgpt-pro
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root directory (or rename `.env.example`):
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Start the Development Server:**
   ```bash
   npm run dev
   ```
   Open your browser and navigate to `http://localhost:3000`.

---

## 🌐 Deploying to Vercel

1. **Push your code to GitHub / GitLab / Bitbucket.**
2. **Import project into Vercel:**
   - Framework Preset: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
3. **Set Environment Variables on Vercel:**
   - Navigate to **Project Settings** > **Environment Variables** in Vercel.
   - Add Key: `GEMINI_API_KEY`
   - Add Value: `[Your Gemini API Key]`
4. **Deploy & Enjoy!**
   - Vercel automatically detects `/api/index.ts` and `vercel.json` to route all backend AI endpoints (`/api/ai/*`) through Vercel Serverless Functions.
   - The browser tab will display **TravelGPT Pro - AI Travel Planner & Itinerary Copilot**.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide Icons, `@dnd-kit`
- **Backend / API**: Express.js, `@google/genai` SDK
- **Build Tooling**: Vite, esbuild, tsx
