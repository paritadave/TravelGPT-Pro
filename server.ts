import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

export const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Enable CORS for Vercel and local client
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// Clean JSON response from Gemini markdown wraps
function cleanJson(text: string): string {
  if (!text) return "{}";
  let cleaned = text.trim();
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.replace(/^```json\s*/i, "").replace(/\s*```$/, "");
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```\s*/, "").replace(/\s*```$/, "");
  }
  return cleaned.trim();
}

// Helper for Gemini AI calls with robust multi-model fallback and auto-retry on 503/429
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function callGemini(prompt: string, systemInstruction?: string, isJson: boolean = false) {
  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing in environment variables. Please add GEMINI_API_KEY in Vercel project settings under Environment Variables.");
  }
  
  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });

  const modelsToTry = [
    "gemini-3.7-flash",
    "gemini-flash-latest",
    "gemini-3.1-flash-lite",
  ];

  let lastError: any = null;

  for (const model of modelsToTry) {
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            systemInstruction,
            responseMimeType: isJson ? "application/json" : undefined,
            temperature: 0.7,
          },
        });
        const text = response.text || "";
        return isJson ? cleanJson(text) : text;
      } catch (err: any) {
        lastError = err;
        const status = err?.status || err?.code || "";
        const errMsg = err?.message || "";
        
        // If 503 (high demand) or 429 (rate limit), wait briefly before retrying
        if (attempt < 3 && (status === 503 || status === 429 || errMsg.includes("503") || errMsg.includes("quota") || errMsg.includes("demand") || errMsg.includes("UNAVAILABLE"))) {
          await delay(1000 * attempt);
          continue;
        }
        
        console.warn(`Model ${model} failed after ${attempt} attempt(s) [${status}]: ${errMsg}`);
        break;
      }
    }
  }

  throw lastError || new Error("Failed to generate AI response from Gemini models.");
}

// AI Express Router
const aiRouter = express.Router();

// 1. Multi-Agent Copilot Chat Endpoint
aiRouter.post("/chat", async (req, res) => {
  try {
    const { message, activeAgent = "Coordinator", context } = req.body;

    const systemInstruction = `You are TravelGPT Pro's ${activeAgent} AI Agent.
You are part of a multi-agent AI travel orchestration engine (Agents: Coordinator, Planner, Flight, Hotel, Restaurant, Budget, Weather, Navigation, Packing, Visa, Memory).
Current Active Role: ${activeAgent}
Context of trip/user: ${JSON.stringify(context || {})}

FORMATTING & RESPONSE GUIDELINES:
- Write in clean, beautiful, highly readable markdown with section headings (using ###), bold highlights (**text**), and bullet points (•).
- When the user asks for trip suggestions or recommendations for any destination, region, or travel style, provide 4 to 5 specific, high-quality choices.
- For each recommendation, include: Best Duration, Estimated Budget (in USD), Highlights & Top Attractions, Visa Requirements, and Best Season to visit.
- End your response with actionable suggestions or next steps.
- Provide a highly structured, engaging, friendly, and expert travel response.`;

    const aiResponse = await callGemini(message, systemInstruction, false);
    res.json({ success: true, agent: activeAgent, response: aiResponse });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || "Failed to generate AI response",
    });
  }
});

// 2. Structured Itinerary Generator
aiRouter.post("/plan-trip", async (req, res) => {
  try {
    const { destination, days = 3, budget, persona, interests, startingCity } = req.body;

    const prompt = `Generate a comprehensive ${days}-day travel itinerary for ${destination}.
Details:
- Starting from: ${startingCity || "Home City"}
- Total Budget: ${budget || "$1500 USD"}
- Traveler Persona: ${persona || "Balanced Explorer"}
- Key Interests: ${interests ? interests.join(", ") : "Sightseeing, Local Food, Culture"}

Return a JSON object with this exact structure:
{
  "title": "${destination} ${days}-Day Adventure",
  "destination": "${destination}",
  "estimatedTotalCost": 1200,
  "currency": "USD",
  "summary": "Short inspiring summary of the trip concept.",
  "weatherForecast": "Warm and sunny, high 24°C, low 16°C",
  "days": [
    {
      "dayNumber": 1,
      "date": "Day 1",
      "theme": "Arrival & City Highlights",
      "dailyBudgetSpent": 250,
      "activities": [
        {
          "title": "Activity Name",
          "time": "09:00 AM",
          "location": "Specific Spot Name",
          "category": "sightseeing",
          "cost": 25,
          "rating": 4.8,
          "notes": "Practical tip or description",
          "coordinates": { "lat": 35.6762, "lng": 139.6503 }
        }
      ]
    }
  ],
  "budgetBreakdown": {
    "flights": 400,
    "accommodation": 450,
    "food": 200,
    "activities": 100,
    "transit": 50
  },
  "packingHighlights": ["Comfortable walking shoes", "Power adapter", "Light jacket"],
  "visaRequirement": "Visa Free / Electronic Travel Authorization required for most passports"
}`;

    const jsonText = await callGemini(
      prompt,
      "You are the TravelGPT Pro Master Itinerary Planner Agent. Return ONLY raw valid JSON.",
      true
    );

    const data = JSON.parse(jsonText || "{}");
    res.json({ success: true, itinerary: data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to generate itinerary" });
  }
});

// 3. Dynamic Replanning Scenario Engine
aiRouter.post("/replan", async (req, res) => {
  try {
    const { scenario, currentItinerary, tripDetails } = req.body;

    const prompt = `Trip: ${tripDetails?.destination || "Destination"}.
Unexpected Distruption Scenario: "${scenario}" (e.g. Flight delay, heavy rain, budget emergency, sore feet).
Current Plan Summary: ${JSON.stringify(currentItinerary || {})}

Analyze the disruption and recalculate a revised, optimized plan.
Return valid JSON with:
{
  "impactAnalysis": "Explanation of how the scenario affects current plans.",
  "adjustmentsMade": ["List of specific changes made to activities/times"],
  "recalculatedCostDifference": -40,
  "revisedActivities": [
    {
      "title": "Indoor activity or revised timing",
      "time": "02:00 PM",
      "location": "Spot Name",
      "category": "relaxation",
      "cost": 15,
      "notes": "Why this replaces previous plan"
    }
  ],
  "agentNotes": "Advice from Coordinator Agent regarding the change"
}`;

    const jsonText = await callGemini(
      prompt,
      "You are the TravelGPT Pro Replanning & Disruption Agent. Output valid JSON.",
      true
    );

    const data = JSON.parse(jsonText || "{}");
    res.json({ success: true, plan: data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 4. Visa & Safety Assistant
aiRouter.post("/visa-check", async (req, res) => {
  try {
    const { passportCountry = "United States", destination = "Japan" } = req.body;

    const prompt = `Passport Holder: ${passportCountry}.
Destination: ${destination}.

Provide visa requirements and safety advisory information as valid JSON:
{
  "status": "Visa Free" | "e-Visa Required" | "Visa on Arrival" | "Visa Required in Advance",
  "allowedStay": "Up to 90 days",
  "passportValidityRequired": "6 months minimum beyond stay",
  "requiredDocuments": ["Valid Passport", "Return Ticket", "Proof of Accommodations", "Digital Custom Declaration"],
  "safetyRating": "4.9 / 5 (Very Safe)",
  "advisoryLevel": "Level 1: Exercise Normal Precautions",
  "keyTips": ["Emergency number is 110", "Tipping is not customary", "Keep cash handy for small vendors"],
  "scamAlerts": ["Beware of unofficial taxi touts at airport", "Overpriced bar cover charges in nightlife districts"]
}`;

    const jsonText = await callGemini(
      prompt,
      "You are TravelGPT Pro Visa & Safety Agent. Output valid JSON.",
      true
    );

    res.json({ success: true, visaInfo: JSON.parse(jsonText || "{}") });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 5. Smart Packing List Generator
aiRouter.post("/packing", async (req, res) => {
  try {
    const { destination, days, weather = "Sunny", activities = [] } = req.body;

    const prompt = `Generate a smart packing list for a ${days}-day trip to ${destination}.
Weather: ${weather}.
Activities: ${activities.join(", ") || "General sightseeing, dining"}.

Return JSON:
{
  "categories": [
    {
      "category": "Clothing & Outerwear",
      "items": [
        { "name": "5x Breathable T-Shirts", "essential": true },
        { "name": "Comfortable Walking Shoes", "essential": true }
      ]
    },
    {
      "category": "Electronics & Gear",
      "items": [
        { "name": "Universal Power Adapter", "essential": true },
        { "name": "Portable Power Bank (10,000mAh)", "essential": true }
      ]
    },
    {
      "category": "Toiletries & Health",
      "items": [
        { "name": "Travel-size Sunscreen SPF 50+", "essential": true },
        { "name": "Personal Meds & First Aid", "essential": true }
      ]
    },
    {
      "category": "Documents & Money",
      "items": [
        { "name": "Passport & Copies", "essential": true },
        { "name": "Travel Insurance Card", "essential": true }
      ]
    }
  ]
}`;

    const jsonText = await callGemini(
      prompt,
      "You are TravelGPT Pro Packing Agent. Output valid JSON.",
      true
    );

    res.json({ success: true, packingList: JSON.parse(jsonText || "{}") });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 6. AI Travel Journal Story Generator
aiRouter.post("/journal", async (req, res) => {
  try {
    const { location, date, bulletNotes, mood } = req.body;

    const prompt = `Location: ${location}. Date: ${date}. Mood: ${mood || "Inspired"}.
Raw notes: "${bulletNotes}"

Write an engaging, atmospheric 2-paragraph travel journal narrative entry and extract 3 key highlights.`;

    const aiText = await callGemini(
      prompt,
      "You are TravelGPT Pro Travel Writer & Memory Agent. Expressive and evocative style."
    );

    res.json({ success: true, story: aiText });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 7. Live & AI Weather Forecast Assistant
aiRouter.post("/weather-forecast", async (req, res) => {
  try {
    const { destination = "Tokyo", startDate = "2026-08-15", endDate = "2026-08-20", days = 5 } = req.body;

    const prompt = `Generate a realistic detailed weather forecast for travel to ${destination} between ${startDate} and ${endDate} (${days} days).

Return valid JSON with this structure:
{
  "destination": "${destination}",
  "dates": "${startDate} to ${endDate}",
  "overallSummary": "Sunny with comfortable afternoon breezes, ideal for sightseeing.",
  "averageHigh": "25°C",
  "averageLow": "17°C",
  "humidity": "54%",
  "uvIndex": "Moderate (5)",
  "precipitationChance": "10%",
  "windSpeed": "12 km/h",
  "clothingTip": "Light cotton clothing for daytime, lightweight layer for cool evenings.",
  "daily": [
    {
      "day": "Day 1",
      "date": "${startDate}",
      "condition": "Sunny",
      "tempHigh": "26°C",
      "tempLow": "18°C",
      "humidity": "50%",
      "pop": "5%",
      "icon": "Sun",
      "tip": "Great weather for outdoor city exploration."
    },
    {
      "day": "Day 2",
      "condition": "Partly Cloudy",
      "tempHigh": "24°C",
      "tempLow": "17°C",
      "humidity": "55%",
      "pop": "15%",
      "icon": "CloudSun",
      "tip": "Comfortable for museum hopping & markets."
    },
    {
      "day": "Day 3",
      "condition": "Passing Showers",
      "tempHigh": "22°C",
      "tempLow": "16°C",
      "humidity": "68%",
      "pop": "45%",
      "icon": "CloudRain",
      "tip": "Carry a compact umbrella for scattered afternoon rain."
    },
    {
      "day": "Day 4",
      "condition": "Clear & Breezy",
      "tempHigh": "25°C",
      "tempLow": "17°C",
      "humidity": "52%",
      "pop": "10%",
      "icon": "Wind",
      "tip": "Ideal evening for scenic waterfront dining."
    },
    {
      "day": "Day 5",
      "date": "${endDate}",
      "condition": "Sunny",
      "tempHigh": "27°C",
      "tempLow": "19°C",
      "humidity": "48%",
      "pop": "0%",
      "icon": "Sun",
      "tip": "Warm and pleasant day for departure or final shopping."
    }
  ]
}`;

    const jsonText = await callGemini(
      prompt,
      "You are TravelGPT Pro Weather Radar Agent. Return ONLY valid JSON.",
      true
    );

    res.json({ success: true, weather: JSON.parse(jsonText || "{}") });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Mount router on multiple path variations for Vercel rewrite compatibility
app.use("/api/ai", aiRouter);
app.use("/ai", aiRouter);
app.use("/api/index/ai", aiRouter);
app.use("/api", aiRouter);

export default app;

// Start Express Server with Vite Middleware in Development
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`TravelGPT Pro server running on http://localhost:${PORT}`);
  });
}

if (!process.env.VERCEL) {
  startServer();
}

